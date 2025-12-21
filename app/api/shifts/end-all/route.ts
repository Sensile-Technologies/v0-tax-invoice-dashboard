import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor_id')
    const userId = searchParams.get('user_id')

    let resolvedVendorId: string | null = vendorId

    // Resolve vendor_id from user_id if not provided
    if (!resolvedVendorId && userId) {
      // First try: match user email to vendor email
      const userVendorResult = await pool.query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      )
      if (userVendorResult.rows.length > 0) {
        resolvedVendorId = userVendorResult.rows[0].vendor_id
      } else {
        // Second try: get vendor_id from user's staff record → branch → vendor
        const staffResult = await pool.query(
          `SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
          [userId]
        )
        if (staffResult.rows.length > 0) {
          resolvedVendorId = staffResult.rows[0].vendor_id
        }
      }
    }

    let branchFilter = ''
    const params: any[] = []

    if (resolvedVendorId) {
      params.push(resolvedVendorId)
      branchFilter = `AND b.vendor_id = $${params.length}`
    }

    const result = await pool.query(`
      SELECT 
        s.id,
        s.branch_id,
        s.start_time,
        s.opening_cash,
        s.status,
        b.name as branch_name,
        b.location as branch_location,
        COALESCE(st.full_name, st.username, 'Unknown') as cashier_name,
        (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE branch_id = s.branch_id AND shift_id = s.id) as total_sales
      FROM shifts s
      JOIN branches b ON s.branch_id = b.id
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE s.status = 'active'
      ${branchFilter}
      ORDER BY b.name
    `, params)

    const shifts = result.rows

    const shiftsWithDetails = await Promise.all(shifts.map(async (shift) => {
      const nozzlesResult = await pool.query(`
        SELECT n.id, n.nozzle_number, n.fuel_type, n.initial_meter_reading,
               COALESCE(
                 (SELECT sr.closing_reading FROM shift_readings sr 
                  WHERE sr.nozzle_id = n.id AND sr.reading_type = 'nozzle'
                  ORDER BY sr.created_at DESC LIMIT 1),
                 n.initial_meter_reading
               ) as current_reading,
               d.dispenser_number
        FROM nozzles n
        LEFT JOIN dispensers d ON n.dispenser_id = d.id
        WHERE n.branch_id = $1 AND n.status = 'active'
        ORDER BY d.dispenser_number, n.nozzle_number
      `, [shift.branch_id])

      const tanksResult = await pool.query(`
        SELECT id, tank_name, fuel_type, capacity, current_stock
        FROM tanks
        WHERE branch_id = $1 AND status = 'active'
        ORDER BY tank_name
      `, [shift.branch_id])

      return {
        ...shift,
        nozzles: nozzlesResult.rows,
        tanks: tanksResult.rows
      }
    }))

    return NextResponse.json({
      success: true,
      data: shiftsWithDetails
    })

  } catch (error: any) {
    console.error("Error fetching active shifts:", error)
    return NextResponse.json(
      { error: "Failed to fetch active shifts", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const { shifts: shiftsToEnd } = body

    if (!shiftsToEnd || !Array.isArray(shiftsToEnd) || shiftsToEnd.length === 0) {
      return NextResponse.json(
        { error: "No shifts provided to end" },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const results: any[] = []
    const errors: any[] = []

    for (const shiftData of shiftsToEnd) {
      const { id, closing_cash, nozzle_readings, tank_stocks } = shiftData

      try {
        const shiftCheck = await client.query(
          `SELECT * FROM shifts WHERE id = $1 AND status = 'active'`,
          [id]
        )

        if (shiftCheck.rows.length === 0) {
          errors.push({ id, error: "Shift not found or already closed" })
          continue
        }

        const currentShift = shiftCheck.rows[0]
        const branchId = currentShift.branch_id
        const endTimeValue = new Date().toISOString()

        const nozzlesResult = await client.query(
          `SELECT id, initial_meter_reading FROM nozzles WHERE branch_id = $1`,
          [branchId]
        )
        const nozzleBaseReadings: Record<string, number> = {}
        for (const n of nozzlesResult.rows) {
          nozzleBaseReadings[n.id] = parseFloat(n.initial_meter_reading) || 0
        }

        const prevNozzleReadings = await client.query(
          `SELECT nozzle_id, closing_reading FROM shift_readings 
           WHERE branch_id = $1 AND reading_type = 'nozzle' AND nozzle_id IS NOT NULL
           ORDER BY created_at DESC`,
          [branchId]
        )
        for (const r of prevNozzleReadings.rows) {
          if (!nozzleBaseReadings[r.nozzle_id] || parseFloat(r.closing_reading) > nozzleBaseReadings[r.nozzle_id]) {
            nozzleBaseReadings[r.nozzle_id] = parseFloat(r.closing_reading)
          }
        }

        const tanksResult = await client.query(
          `SELECT id, current_stock FROM tanks WHERE branch_id = $1`,
          [branchId]
        )
        const tankBaseStocks: Record<string, number> = {}
        for (const t of tanksResult.rows) {
          tankBaseStocks[t.id] = parseFloat(t.current_stock) || 0
        }

        let hasValidationError = false
        
        if (nozzle_readings && nozzle_readings.length > 0) {
          for (const reading of nozzle_readings) {
            if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
              if (!nozzleBaseReadings.hasOwnProperty(reading.nozzle_id)) {
                errors.push({ 
                  id, 
                  error: `Nozzle ${reading.nozzle_id} does not belong to this branch` 
                })
                hasValidationError = true
                break
              }
              const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0
              if (reading.closing_reading < openingReading) {
                errors.push({ 
                  id, 
                  error: `Nozzle closing reading (${reading.closing_reading}) cannot be less than opening reading (${openingReading})` 
                })
                hasValidationError = true
                break
              }
            }
          }
        }

        if (tank_stocks && tank_stocks.length > 0) {
          for (const stock of tank_stocks) {
            if (stock.tank_id && !isNaN(stock.closing_reading)) {
              if (!tankBaseStocks.hasOwnProperty(stock.tank_id)) {
                errors.push({ 
                  id, 
                  error: `Tank ${stock.tank_id} does not belong to this branch` 
                })
                hasValidationError = true
                break
              }
            }
          }
        }

        if (hasValidationError) {
          continue
        }

        const salesResult = await client.query(
          `SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM sales WHERE branch_id = $1 AND shift_id = $2`,
          [branchId, id]
        )
        const totalSales = parseFloat(salesResult.rows[0].total_sales) || 0

        const result = await client.query(
          `UPDATE shifts 
           SET end_time = $1, closing_cash = $2, total_sales = $3, status = 'completed', updated_at = NOW()
           WHERE id = $4
           RETURNING *`,
          [endTimeValue, closing_cash || 0, totalSales, id]
        )

        const shift = result.rows[0]

        await client.query(
          `DELETE FROM shift_readings WHERE shift_id = $1`,
          [id]
        )

        if (nozzle_readings && nozzle_readings.length > 0) {
          for (const reading of nozzle_readings) {
            if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
              const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0
              await client.query(
                `INSERT INTO shift_readings (shift_id, branch_id, reading_type, nozzle_id, opening_reading, closing_reading)
                 VALUES ($1, $2, 'nozzle', $3, $4, $5)`,
                [id, branchId, reading.nozzle_id, openingReading, reading.closing_reading]
              )
            }
          }
        }

        if (tank_stocks && tank_stocks.length > 0) {
          for (const stock of tank_stocks) {
            if (stock.tank_id && !isNaN(stock.closing_reading)) {
              const openingStock = tankBaseStocks[stock.tank_id] || 0
              const stockReceived = stock.stock_received || 0

              await client.query(
                `INSERT INTO shift_readings (shift_id, branch_id, reading_type, tank_id, opening_reading, closing_reading, stock_received)
                 VALUES ($1, $2, 'tank', $3, $4, $5, $6)`,
                [id, branchId, stock.tank_id, openingStock, stock.closing_reading, stockReceived]
              )

              await client.query(
                `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
                [stock.closing_reading, stock.tank_id]
              )
            }
          }
        }

        const newShiftResult = await client.query(
          `INSERT INTO shifts (branch_id, start_time, status, opening_cash, notes, created_at)
           VALUES ($1, $2, 'active', $3, NULL, NOW())
           RETURNING *`,
          [branchId, endTimeValue, closing_cash || 0]
        )

        results.push({
          closedShift: shift,
          newShift: newShiftResult.rows[0]
        })

      } catch (shiftError: any) {
        errors.push({ id, error: shiftError.message })
      }
    }

    if (errors.length > 0 && results.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: "Failed to end shifts", errors },
        { status: 400 }
      )
    }

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      data: {
        closed: results,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("Error ending shifts:", error)
    return NextResponse.json(
      { error: "Failed to end shifts", details: error.message },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
