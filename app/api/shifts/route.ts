import { NextRequest, NextResponse } from "next/server"
import { Pool, PoolClient } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

function splitIntoAmountDenominations(totalAmount: number): number[] {
  const denominations: number[] = []
  let remaining = totalAmount

  const validDenoms = [2500, 2000, 1500, 1000, 500, 300, 200, 100]

  while (remaining >= 100) {
    const maxDenom = validDenoms.find(d => d <= remaining) || 100
    const availableDenoms = validDenoms.filter(d => d >= 100 && d <= maxDenom && d <= remaining)
    
    if (availableDenoms.length === 0) break
    
    const randomDenom = availableDenoms[Math.floor(Math.random() * availableDenoms.length)]
    denominations.push(randomDenom)
    remaining -= randomDenom
  }

  if (remaining > 0 && remaining < 100 && denominations.length > 0) {
    denominations[denominations.length - 1] += remaining
  }

  return denominations
}

async function generateBulkSalesFromMeterDiff(
  client: PoolClient,
  shiftId: string,
  branchId: string,
  staffId: string | null,
  branchName: string,
  nozzleReadings: Array<{ nozzle_id: string; opening_reading: number; closing_reading: number }>
): Promise<{ invoicesCreated: number; totalVolume: number; totalAmount: number }> {
  
  const branchCode = branchName.substring(0, 3).toUpperCase().replace(/\s/g, '')
  let invoicesCreated = 0
  let totalVolume = 0
  let totalAmount = 0
  let invoiceIndex = 1

  for (const reading of nozzleReadings) {
    const openingReading = parseFloat(String(reading.opening_reading)) || 0
    const closingReading = parseFloat(String(reading.closing_reading)) || 0
    const meterDifference = closingReading - openingReading

    if (meterDifference <= 0) continue

    const nozzleInfo = await client.query(
      `SELECT n.fuel_type, n.item_id, COALESCE(bi.sale_price, i.sale_price, 0) as sale_price
       FROM nozzles n
       LEFT JOIN items i ON n.item_id = i.id
       LEFT JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = $1
       WHERE n.id = $2`,
      [branchId, reading.nozzle_id]
    )

    if (nozzleInfo.rows.length === 0) continue

    const { fuel_type, sale_price } = nozzleInfo.rows[0]
    const unitPrice = parseFloat(sale_price) || 0

    if (unitPrice <= 0) {
      console.log(`[BULK SALES] Skipping nozzle ${reading.nozzle_id} - no price configured`)
      continue
    }

    const nozzleTotalAmount = meterDifference * unitPrice
    const amountDenominations = splitIntoAmountDenominations(Math.floor(nozzleTotalAmount))

    for (const invoiceAmount of amountDenominations) {
      const quantity = invoiceAmount / unitPrice
      const timestamp = Date.now().toString(36).toUpperCase()
      const invoiceNumber = `BLK-${branchCode}-${timestamp}-${String(invoiceIndex).padStart(4, '0')}`
      const receiptNumber = `RCP-${timestamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      await client.query(
        `INSERT INTO sales (
          branch_id, shift_id, staff_id, nozzle_id,
          invoice_number, receipt_number, sale_date,
          fuel_type, quantity, unit_price, total_amount,
          payment_method, is_automated, source_system,
          transmission_status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(),
          $7, $8, $9, $10,
          'cash', true, 'meter_diff_bulk',
          'pending', NOW()
        )`,
        [branchId, shiftId, staffId, reading.nozzle_id, invoiceNumber, receiptNumber,
         fuel_type, parseFloat(quantity.toFixed(2)), unitPrice, invoiceAmount]
      )

      invoicesCreated++
      totalVolume += quantity
      totalAmount += invoiceAmount
      invoiceIndex++
    }
  }

  console.log(`[BULK SALES] Generated ${invoicesCreated} invoices, ${totalVolume.toFixed(2)}L, KES ${totalAmount}`)
  return { invoicesCreated, totalVolume, totalAmount }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch_id, start_time, opening_cash, notes } = body

    if (!branch_id) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      )
    }

    const existingShift = await pool.query(
      `SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active'`,
      [branch_id]
    )

    if (existingShift.rows.length > 0) {
      return NextResponse.json(
        { error: "An active shift already exists for this branch" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO shifts (branch_id, start_time, status, opening_cash, notes, created_at)
       VALUES ($1, $2, 'active', $3, $4, NOW())
       RETURNING *`,
      [branch_id, start_time || new Date().toISOString(), opening_cash || 0, notes || null]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error starting shift:", error)
    return NextResponse.json(
      { error: "Failed to start shift", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const status = searchParams.get('status')

    let query = 'SELECT * FROM shifts WHERE 1=1'
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND branch_id = $${params.length}`
    }

    if (status) {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    query += ' ORDER BY created_at DESC LIMIT 1'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    })

  } catch (error: any) {
    console.error("Error fetching shift:", error)
    return NextResponse.json(
      { error: "Failed to fetch shift", details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const { id, end_time, closing_cash, total_sales, notes, status, nozzle_readings, tank_stocks } = body

    if (!id) {
      client.release()
      return NextResponse.json(
        { error: "Shift ID is required" },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const shiftCheck = await client.query(
      `SELECT s.*, b.name as branch_name FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1`,
      [id]
    )

    if (shiftCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      )
    }

    const currentShift = shiftCheck.rows[0]
    const branchId = currentShift.branch_id
    const branchName = currentShift.branch_name || 'BRN'
    const staffId = currentShift.staff_id
    const endTimeValue = end_time || new Date().toISOString()

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

    if (nozzle_readings && nozzle_readings.length > 0) {
      for (const reading of nozzle_readings) {
        if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
          const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0
          if (reading.closing_reading < openingReading) {
            await client.query('ROLLBACK')
            client.release()
            return NextResponse.json(
              { error: `Nozzle closing reading (${reading.closing_reading}) cannot be less than opening reading (${openingReading})` },
              { status: 400 }
            )
          }
        }
      }
    }

    const result = await client.query(
      `UPDATE shifts 
       SET end_time = $1, closing_cash = $2, total_sales = $3, notes = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [endTimeValue, closing_cash || 0, total_sales || 0, notes || null, status || 'completed', id]
    )

    const shift = result.rows[0]

    await client.query(
      `DELETE FROM shift_readings WHERE shift_id = $1`,
      [id]
    )

    const savedNozzleReadings: Array<{ nozzle_id: string; opening_reading: number; closing_reading: number }> = []
    
    if (nozzle_readings && nozzle_readings.length > 0) {
      for (const reading of nozzle_readings) {
        if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
          const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0
          await client.query(
            `INSERT INTO shift_readings (shift_id, branch_id, reading_type, nozzle_id, opening_reading, closing_reading)
             VALUES ($1, $2, 'nozzle', $3, $4, $5)`,
            [id, branchId, reading.nozzle_id, openingReading, reading.closing_reading]
          )
          savedNozzleReadings.push({
            nozzle_id: reading.nozzle_id,
            opening_reading: openingReading,
            closing_reading: reading.closing_reading
          })
        }
      }
    }

    let bulkSalesResult = { invoicesCreated: 0, totalVolume: 0, totalAmount: 0 }
    if (savedNozzleReadings.length > 0) {
      bulkSalesResult = await generateBulkSalesFromMeterDiff(
        client, id, branchId, staffId, branchName, savedNozzleReadings
      )
      
      if (bulkSalesResult.totalAmount > 0) {
        await client.query(
          `UPDATE shifts SET total_sales = $1 WHERE id = $2`,
          [bulkSalesResult.totalAmount, id]
        )
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
    const newShift = newShiftResult.rows[0]

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      data: shift,
      newShift: newShift,
      bulkSales: {
        invoicesCreated: bulkSalesResult.invoicesCreated,
        totalVolume: bulkSalesResult.totalVolume,
        totalAmount: bulkSalesResult.totalAmount
      }
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("Error updating shift:", error)
    return NextResponse.json(
      { error: "Failed to update shift", details: error.message },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
