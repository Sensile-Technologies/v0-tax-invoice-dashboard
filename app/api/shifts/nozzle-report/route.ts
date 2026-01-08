import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shiftId = searchParams.get('shift_id')
    const branchId = searchParams.get('branch_id')
    const date = searchParams.get('date')
    const userId = searchParams.get('user_id')

    let vendorId: string | null = null
    
    if (userId) {
      const userVendorResult = await pool.query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      )
      if (userVendorResult.rows.length > 0) {
        vendorId = userVendorResult.rows[0].vendor_id
      } else {
        const staffResult = await pool.query(
          `SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
          [userId]
        )
        if (staffResult.rows.length > 0) {
          vendorId = staffResult.rows[0].vendor_id
        }
      }
    }

    if (shiftId) {
      const report = await getShiftNozzleReport(shiftId, vendorId)
      return NextResponse.json({ success: true, data: report })
    }

    if (branchId && date) {
      const report = await getDailyNozzleReport(branchId, date, vendorId)
      return NextResponse.json({ success: true, data: report })
    }

    return NextResponse.json(
      { error: "Either shift_id or (branch_id and date) are required" },
      { status: 400 }
    )

  } catch (error: any) {
    console.error("Error fetching nozzle report:", error)
    return NextResponse.json(
      { error: "Failed to fetch nozzle report", details: error.message },
      { status: 500 }
    )
  }
}

async function getShiftNozzleReport(shiftId: string, vendorId: string | null) {
  const shiftQuery = `
    SELECT s.*, b.name as branch_name, st.full_name as cashier_name
    FROM shifts s
    LEFT JOIN branches b ON s.branch_id = b.id
    LEFT JOIN staff st ON s.staff_id = st.id
    WHERE s.id = $1
    ${vendorId ? 'AND b.vendor_id = $2' : ''}
  `
  const shiftParams = vendorId ? [shiftId, vendorId] : [shiftId]
  const shiftResult = await pool.query(shiftQuery, shiftParams)
  
  if (shiftResult.rows.length === 0) {
    return { shift: null, nozzles: [], totals: null }
  }

  const shift = shiftResult.rows[0]

  const nozzleReadingsQuery = `
    SELECT 
      sr.nozzle_id,
      sr.opening_reading,
      sr.closing_reading,
      n.nozzle_number,
      COALESCE(i.item_name, n.fuel_type, 'Unknown') as fuel_type,
      'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name
    FROM shift_readings sr
    JOIN nozzles n ON sr.nozzle_id = n.id
    LEFT JOIN items i ON n.item_id = i.id
    LEFT JOIN dispensers d ON n.dispenser_id = d.id
    WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
  `
  const readingsResult = await pool.query(nozzleReadingsQuery, [shiftId])

  const invoicedSalesQuery = `
    SELECT 
      nozzle_id,
      SUM(quantity) as invoiced_quantity,
      SUM(total_amount) as invoiced_amount
    FROM sales
    WHERE shift_id = $1 AND nozzle_id IS NOT NULL
      AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
    GROUP BY nozzle_id
  `
  const invoicedResult = await pool.query(invoicedSalesQuery, [shiftId])
  const invoicedMap = new Map(invoicedResult.rows.map(r => [r.nozzle_id, r]))

  const nozzles = readingsResult.rows.map(reading => {
    const openingReading = parseFloat(reading.opening_reading) || 0
    const closingReading = parseFloat(reading.closing_reading) || 0
    const meterDifference = closingReading - openingReading
    
    const invoiced = invoicedMap.get(reading.nozzle_id)
    const invoicedQuantity = parseFloat(invoiced?.invoiced_quantity) || 0
    const invoicedAmount = parseFloat(invoiced?.invoiced_amount) || 0
    
    const variance = meterDifference - invoicedQuantity

    return {
      nozzle_id: reading.nozzle_id,
      nozzle_name: reading.nozzle_name || `Nozzle ${reading.nozzle_number}`,
      fuel_type: reading.fuel_type,
      opening_reading: openingReading,
      closing_reading: closingReading,
      meter_difference: meterDifference,
      invoiced_quantity: invoicedQuantity,
      invoiced_amount: invoicedAmount,
      variance: variance
    }
  })

  const totals = {
    total_meter_difference: nozzles.reduce((sum, n) => sum + n.meter_difference, 0),
    total_invoiced_quantity: nozzles.reduce((sum, n) => sum + n.invoiced_quantity, 0),
    total_invoiced_amount: nozzles.reduce((sum, n) => sum + n.invoiced_amount, 0),
    total_variance: nozzles.reduce((sum, n) => sum + n.variance, 0)
  }

  return {
    shift: {
      id: shift.id,
      branch_name: shift.branch_name,
      cashier_name: shift.cashier_name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      status: shift.status,
      opening_cash: parseFloat(shift.opening_cash) || 0,
      closing_cash: parseFloat(shift.closing_cash) || 0
    },
    nozzles,
    totals
  }
}

async function getDailyNozzleReport(branchId: string, date: string, vendorId: string | null) {
  const branchCheckQuery = vendorId 
    ? `SELECT id, name FROM branches WHERE id = $1 AND vendor_id = $2`
    : `SELECT id, name FROM branches WHERE id = $1`
  const branchCheckParams = vendorId ? [branchId, vendorId] : [branchId]
  const branchResult = await pool.query(branchCheckQuery, branchCheckParams)
  
  if (branchResult.rows.length === 0) {
    return { branch: null, shifts: [], nozzles: [], totals: null }
  }

  const branch = branchResult.rows[0]

  const shiftsQuery = `
    SELECT s.id, s.start_time, s.end_time, s.status, st.full_name as cashier_name
    FROM shifts s
    LEFT JOIN staff st ON s.staff_id = st.id
    WHERE s.branch_id = $1 
    AND DATE(s.start_time) = $2
    ORDER BY s.start_time
  `
  const shiftsResult = await pool.query(shiftsQuery, [branchId, date])
  const shiftIds = shiftsResult.rows.map(s => s.id)

  if (shiftIds.length === 0) {
    const nozzlesQuery = `
      SELECT n.id, n.nozzle_number, COALESCE(i.item_name, n.fuel_type, 'Unknown') as fuel_type, n.initial_meter_reading,
        'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name
      FROM nozzles n
      LEFT JOIN dispensers d ON n.dispenser_id = d.id
      LEFT JOIN items i ON n.item_id = i.id
      WHERE n.branch_id = $1 AND n.status = 'active'
      ORDER BY n.nozzle_number
    `
    const nozzlesResult = await pool.query(nozzlesQuery, [branchId])
    
    return {
      branch: { id: branch.id, name: branch.name },
      date,
      shifts: [],
      nozzles: nozzlesResult.rows.map(n => ({
        nozzle_id: n.id,
        nozzle_name: n.nozzle_name,
        fuel_type: n.fuel_type,
        opening_reading: parseFloat(n.initial_meter_reading) || 0,
        closing_reading: parseFloat(n.initial_meter_reading) || 0,
        meter_difference: 0,
        invoiced_quantity: 0,
        invoiced_amount: 0,
        variance: 0
      })),
      totals: {
        total_meter_difference: 0,
        total_invoiced_quantity: 0,
        total_invoiced_amount: 0,
        total_variance: 0
      }
    }
  }

  const nozzleReadingsQuery = `
    SELECT 
      sr.nozzle_id,
      n.nozzle_number,
      COALESCE(i.item_name, n.fuel_type, 'Unknown') as fuel_type,
      'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name,
      MIN(sr.opening_reading) as day_opening,
      MAX(sr.closing_reading) as day_closing
    FROM shift_readings sr
    JOIN nozzles n ON sr.nozzle_id = n.id
    LEFT JOIN items i ON n.item_id = i.id
    LEFT JOIN dispensers d ON n.dispenser_id = d.id
    WHERE sr.shift_id = ANY($1) AND sr.reading_type = 'nozzle'
    GROUP BY sr.nozzle_id, n.nozzle_number, COALESCE(i.item_name, n.fuel_type, 'Unknown'), d.dispenser_number
  `
  const readingsResult = await pool.query(nozzleReadingsQuery, [shiftIds])

  const invoicedSalesQuery = `
    SELECT 
      nozzle_id,
      SUM(quantity) as invoiced_quantity,
      SUM(total_amount) as invoiced_amount
    FROM sales
    WHERE shift_id = ANY($1) AND nozzle_id IS NOT NULL
      AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
    GROUP BY nozzle_id
  `
  const invoicedResult = await pool.query(invoicedSalesQuery, [shiftIds])
  const invoicedMap = new Map(invoicedResult.rows.map(r => [r.nozzle_id, r]))

  const nozzles = readingsResult.rows.map(reading => {
    const openingReading = parseFloat(reading.day_opening) || 0
    const closingReading = parseFloat(reading.day_closing) || 0
    const meterDifference = closingReading - openingReading
    
    const invoiced = invoicedMap.get(reading.nozzle_id)
    const invoicedQuantity = parseFloat(invoiced?.invoiced_quantity) || 0
    const invoicedAmount = parseFloat(invoiced?.invoiced_amount) || 0
    
    const variance = meterDifference - invoicedQuantity

    return {
      nozzle_id: reading.nozzle_id,
      nozzle_name: reading.nozzle_name || `Nozzle ${reading.nozzle_number}`,
      fuel_type: reading.fuel_type,
      opening_reading: openingReading,
      closing_reading: closingReading,
      meter_difference: meterDifference,
      invoiced_quantity: invoicedQuantity,
      invoiced_amount: invoicedAmount,
      variance: variance
    }
  })

  const totals = {
    total_meter_difference: nozzles.reduce((sum, n) => sum + n.meter_difference, 0),
    total_invoiced_quantity: nozzles.reduce((sum, n) => sum + n.invoiced_quantity, 0),
    total_invoiced_amount: nozzles.reduce((sum, n) => sum + n.invoiced_amount, 0),
    total_variance: nozzles.reduce((sum, n) => sum + n.variance, 0)
  }

  return {
    branch: { id: branch.id, name: branch.name },
    date,
    shifts: shiftsResult.rows,
    nozzles,
    totals
  }
}
