import { NextRequest, NextResponse } from "next/server"
import { Pool, PoolClient } from "pg"
import { callKraSaveSales } from "@/lib/kra-sales-api"

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

interface SaleForKra {
  id: string
  branch_id: string
  invoice_number: string
  receipt_number: string
  fuel_type: string
  quantity: number
  unit_price: number
  total_amount: number
}

async function generateBulkSalesFromMeterDiff(
  client: PoolClient,
  shiftId: string,
  branchId: string,
  staffId: string | null,
  branchName: string,
  nozzleReadings: Array<{ nozzle_id: string; opening_reading: number; closing_reading: number }>
): Promise<{ invoicesCreated: number; totalVolume: number; totalAmount: number; salesForKra: SaleForKra[] }> {
  
  const branchCode = branchName.substring(0, 3).toUpperCase().replace(/\s/g, '')
  let invoicesCreated = 0
  let totalVolume = 0
  let totalAmount = 0
  let invoiceIndex = 1
  const salesForKra: SaleForKra[] = []

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

      const saleResult = await client.query(
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
        ) RETURNING id`,
        [branchId, shiftId, staffId, reading.nozzle_id, invoiceNumber, receiptNumber,
         fuel_type, parseFloat(quantity.toFixed(2)), unitPrice, invoiceAmount]
      )

      salesForKra.push({
        id: saleResult.rows[0]?.id,
        branch_id: branchId,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
        fuel_type,
        quantity: parseFloat(quantity.toFixed(2)),
        unit_price: unitPrice,
        total_amount: invoiceAmount
      })

      invoicesCreated++
      totalVolume += quantity
      totalAmount += invoiceAmount
      invoiceIndex++
    }
  }

  console.log(`[BULK SALES] Generated ${invoicesCreated} invoices, ${totalVolume.toFixed(2)}L, KES ${totalAmount}`)
  return { invoicesCreated, totalVolume, totalAmount, salesForKra }
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

    // Check if this is an active shift being ended
    const shiftStatusCheck = await client.query(
      `SELECT status FROM shifts WHERE id = $1`,
      [id]
    )
    
    if (shiftStatusCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      )
    }

    const currentStatus = shiftStatusCheck.rows[0].status
    const targetStatus = status || 'completed'
    
    // Require nozzle readings when ending an active shift (transitioning to completed)
    if (currentStatus === 'active' && targetStatus === 'completed') {
      if (!nozzle_readings || !Array.isArray(nozzle_readings) || nozzle_readings.length === 0) {
        await client.query('ROLLBACK')
        client.release()
        return NextResponse.json(
          { error: "Nozzle meter readings are required to end a shift. Please enter closing readings for all nozzles." },
          { status: 400 }
        )
      }
    }

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

    let bulkSalesResult = { invoicesCreated: 0, totalVolume: 0, totalAmount: 0, salesForKra: [] as SaleForKra[] }
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

    // Submit bulk sales to KRA AFTER the transaction is committed
    // This ensures database records exist before external API calls
    if (bulkSalesResult.salesForKra.length > 0) {
      console.log(`[BULK SALES] Submitting ${bulkSalesResult.salesForKra.length} sales to KRA...`)
      for (const sale of bulkSalesResult.salesForKra) {
        try {
          const kraResult = await callKraSaveSales({
            branch_id: sale.branch_id,
            invoice_number: sale.invoice_number,
            receipt_number: sale.receipt_number,
            fuel_type: sale.fuel_type,
            quantity: sale.quantity,
            unit_price: sale.unit_price,
            total_amount: sale.total_amount,
            payment_method: 'cash',
            customer_name: 'Walk-in Customer',
            customer_pin: '',
            sale_date: new Date().toISOString()
          })

          const kraData = kraResult.kraResponse?.data || {}
          const kraStatus = kraResult.success ? 'success' : 'failed'
          const transmissionStatus = kraResult.success ? 'transmitted' : 'failed'

          await pool.query(
            `UPDATE sales SET 
              kra_status = $1,
              kra_rcpt_sign = $2,
              kra_scu_id = $3,
              kra_cu_inv = $4,
              kra_internal_data = $5,
              transmission_status = $6,
              updated_at = NOW()
            WHERE id = $7`,
            [
              kraStatus,
              kraData.rcptSign || null,
              kraData.sdcId || null,
              kraData.rcptNo ? `${kraData.sdcId || ''}/${kraData.rcptNo}` : null,
              kraData.intrlData || null,
              transmissionStatus,
              sale.id
            ]
          )

          console.log(`[BULK SALES] Invoice ${sale.invoice_number} - KRA ${kraResult.success ? 'SUCCESS' : 'FAILED'}`)
        } catch (kraError: any) {
          console.error(`[BULK SALES] KRA submission error for ${sale.invoice_number}:`, kraError.message)
          await pool.query(
            `UPDATE sales SET 
              kra_status = 'failed',
              kra_error = $1,
              transmission_status = 'failed',
              updated_at = NOW()
            WHERE id = $2`,
            [kraError.message || 'KRA submission error', sale.id]
          )
        }
      }
    }

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
