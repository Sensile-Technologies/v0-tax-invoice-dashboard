import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface ShiftSaleItem {
  fuel_type: string
  claimed_quantity: number
  claimed_amount: number
  unclaimed_quantity: number
  unclaimed_amount: number
}

interface ShiftSummary {
  shift_id: string
  cashier_name: string
  start_time: string
  end_time: string | null
  status: string
  items: ShiftSaleItem[]
  totals: {
    claimed_quantity: number
    claimed_amount: number
    unclaimed_quantity: number
    unclaimed_amount: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const date = searchParams.get('date')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!branchId) {
      return NextResponse.json(
        { error: "branch_id is required" },
        { status: 400 }
      )
    }

    let startOfPeriod: string
    let endOfPeriod: string

    if (startDate && endDate) {
      startOfPeriod = `${startDate}T00:00:00`
      endOfPeriod = `${endDate}T23:59:59`
    } else if (date) {
      startOfPeriod = `${date}T00:00:00`
      endOfPeriod = `${date}T23:59:59`
    } else {
      return NextResponse.json(
        { error: "date or (start_date and end_date) are required" },
        { status: 400 }
      )
    }

    const shiftsQuery = `
      SELECT 
        s.id,
        s.start_time,
        s.end_time,
        s.status,
        COALESCE(st.full_name, 'Unknown') as cashier_name
      FROM shifts s
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE s.branch_id = $1
        AND s.start_time >= $2
        AND s.start_time <= $3
      ORDER BY s.start_time ASC
    `
    const shiftsResult = await pool.query(shiftsQuery, [branchId, startOfPeriod, endOfPeriod])

    const shiftSummaries: ShiftSummary[] = []

    for (const shift of shiftsResult.rows) {
      const nozzleReadingsQuery = `
        SELECT 
          sr.nozzle_id,
          sr.opening_reading,
          sr.closing_reading,
          n.fuel_type
        FROM shift_readings sr
        JOIN nozzles n ON sr.nozzle_id = n.id
        WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
      `
      const readingsResult = await pool.query(nozzleReadingsQuery, [shift.id])

      const invoicedSalesQuery = `
        SELECT 
          nozzle_id,
          fuel_type,
          SUM(quantity) as invoiced_quantity,
          SUM(total_amount) as invoiced_amount
        FROM sales
        WHERE shift_id = $1 AND nozzle_id IS NOT NULL
          AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
          AND is_automated = false
        GROUP BY nozzle_id, fuel_type
      `
      const invoicedResult = await pool.query(invoicedSalesQuery, [shift.id])
      const invoicedMap = new Map<string, { quantity: number, amount: number }>()
      
      for (const row of invoicedResult.rows) {
        const key = row.nozzle_id
        invoicedMap.set(key, {
          quantity: parseFloat(row.invoiced_quantity) || 0,
          amount: parseFloat(row.invoiced_amount) || 0
        })
      }

      const fuelTypeData = new Map<string, { claimed: { quantity: number, amount: number }, unclaimed: { quantity: number, amount: number }, unitPrice: number }>()

      for (const reading of readingsResult.rows) {
        const openingReading = parseFloat(reading.opening_reading) || 0
        const closingReading = parseFloat(reading.closing_reading) || 0
        const meterDifference = closingReading - openingReading

        const invoiced = invoicedMap.get(reading.nozzle_id)
        const claimedQty = invoiced?.quantity || 0
        const claimedAmt = invoiced?.amount || 0
        const unclaimedQty = Math.max(0, meterDifference - claimedQty)

        const rawFuelType = reading.fuel_type || "Other"
        const fuelType = rawFuelType.charAt(0).toUpperCase() + rawFuelType.slice(1).toLowerCase()

        const existing = fuelTypeData.get(fuelType) || { 
          claimed: { quantity: 0, amount: 0 }, 
          unclaimed: { quantity: 0, amount: 0 },
          unitPrice: 0
        }

        existing.claimed.quantity += claimedQty
        existing.claimed.amount += claimedAmt
        existing.unclaimed.quantity += unclaimedQty
        
        if (claimedQty > 0 && claimedAmt > 0) {
          existing.unitPrice = claimedAmt / claimedQty
        }

        fuelTypeData.set(fuelType, existing)
      }

      const items: ShiftSaleItem[] = []
      let totalClaimedQty = 0
      let totalClaimedAmt = 0
      let totalUnclaimedQty = 0
      let totalUnclaimedAmt = 0

      for (const [fuelType, data] of fuelTypeData) {
        const unitPrice = data.unitPrice || 180
        const unclaimedAmt = data.unclaimed.quantity * unitPrice

        items.push({
          fuel_type: fuelType,
          claimed_quantity: data.claimed.quantity,
          claimed_amount: data.claimed.amount,
          unclaimed_quantity: data.unclaimed.quantity,
          unclaimed_amount: unclaimedAmt
        })

        totalClaimedQty += data.claimed.quantity
        totalClaimedAmt += data.claimed.amount
        totalUnclaimedQty += data.unclaimed.quantity
        totalUnclaimedAmt += unclaimedAmt
      }

      items.sort((a, b) => a.fuel_type.localeCompare(b.fuel_type))

      shiftSummaries.push({
        shift_id: shift.id,
        cashier_name: shift.cashier_name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: shift.status,
        items,
        totals: {
          claimed_quantity: totalClaimedQty,
          claimed_amount: totalClaimedAmt,
          unclaimed_quantity: totalUnclaimedQty,
          unclaimed_amount: totalUnclaimedAmt
        }
      })
    }

    const grandTotals = {
      claimed_quantity: shiftSummaries.reduce((sum, s) => sum + s.totals.claimed_quantity, 0),
      claimed_amount: shiftSummaries.reduce((sum, s) => sum + s.totals.claimed_amount, 0),
      unclaimed_quantity: shiftSummaries.reduce((sum, s) => sum + s.totals.unclaimed_quantity, 0),
      unclaimed_amount: shiftSummaries.reduce((sum, s) => sum + s.totals.unclaimed_amount, 0)
    }

    const productSummary = new Map<string, ShiftSaleItem>()
    for (const shift of shiftSummaries) {
      for (const item of shift.items) {
        const existing = productSummary.get(item.fuel_type) || {
          fuel_type: item.fuel_type,
          claimed_quantity: 0,
          claimed_amount: 0,
          unclaimed_quantity: 0,
          unclaimed_amount: 0
        }
        existing.claimed_quantity += item.claimed_quantity
        existing.claimed_amount += item.claimed_amount
        existing.unclaimed_quantity += item.unclaimed_quantity
        existing.unclaimed_amount += item.unclaimed_amount
        productSummary.set(item.fuel_type, existing)
      }
    }
    const productTotals = Array.from(productSummary.values()).sort((a, b) => a.fuel_type.localeCompare(b.fuel_type))

    return NextResponse.json({
      success: true,
      data: {
        shifts: shiftSummaries,
        grandTotals,
        productTotals
      }
    })

  } catch (error: any) {
    console.error("Error fetching daily shift summary:", error)
    return NextResponse.json(
      { error: "Failed to fetch daily shift summary", details: error.message },
      { status: 500 }
    )
  }
}
