import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Pool } from "pg"
import { callKraSaveSales } from "@/lib/kra-sales-api"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

interface NozzleReading {
  nozzle_id: string
  opening_reading: number
  closing_reading: number
  fuel_type: string
  item_id: string | null
  sale_price: number
}

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

function generateInvoiceNumber(branchCode: string, index: number): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `BLK-${branchCode}-${timestamp}-${String(index).padStart(4, '0')}`
}

function generateReceiptNumber(): string {
  return `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const session = JSON.parse(sessionCookie.value)
    const { user_id, vendor_id, branch_id: userBranchId } = session

    const body = await request.json()
    const { shift_id, nozzle_ids, split_denominations = true } = body

    if (!shift_id) {
      return NextResponse.json({ error: "shift_id is required" }, { status: 400 })
    }

    const shiftResult = await client.query(
      `SELECT s.id, s.branch_id, s.staff_id, s.status, b.name as branch_name, b.vendor_id, b.controller_id
       FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1`,
      [shift_id]
    )

    if (shiftResult.rows.length === 0) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 })
    }

    const shift = shiftResult.rows[0]

    if (vendor_id && shift.vendor_id !== vendor_id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (shift.controller_id) {
      return NextResponse.json({ 
        error: "Bulk sales computation is not required for branches with a pump controller. Sales are captured automatically by the controller.",
        has_controller: true,
        controller_id: shift.controller_id
      }, { status: 400 })
    }

    const branchConfigResult = await client.query(
      `SELECT bulk_sales_kra_percentage FROM branches WHERE id = $1`,
      [shift.branch_id]
    )
    const intermittencyRate = branchConfigResult.rows[0]?.bulk_sales_kra_percentage ?? 100

    let nozzleQuery = `
      SELECT 
        sr.nozzle_id,
        sr.opening_reading,
        sr.closing_reading,
        i.item_name as fuel_type,
        n.item_id,
        COALESCE(bi.sale_price, 0) as sale_price
      FROM shift_readings sr
      JOIN nozzles n ON sr.nozzle_id = n.id
      JOIN items i ON n.item_id = i.id
      LEFT JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = $1
      WHERE sr.shift_id = $2 AND sr.reading_type = 'nozzle'
    `
    const params: any[] = [shift.branch_id, shift_id]

    if (nozzle_ids && nozzle_ids.length > 0) {
      nozzleQuery += ` AND sr.nozzle_id = ANY($3)`
      params.push(nozzle_ids)
    }

    const nozzleResult = await client.query(nozzleQuery, params)
    const nozzleReadings: NozzleReading[] = nozzleResult.rows

    if (nozzleReadings.length === 0) {
      return NextResponse.json({ error: "No nozzle readings found for this shift" }, { status: 400 })
    }

    const branchCode = shift.branch_name.substring(0, 3).toUpperCase().replace(/\s/g, '')
    
    await client.query('BEGIN')

    const salesCreated: any[] = []
    let invoiceIndex = 1

    for (const reading of nozzleReadings) {
      const openingReading = parseFloat(String(reading.opening_reading)) || 0
      const closingReading = parseFloat(String(reading.closing_reading)) || 0
      const meterDifference = closingReading - openingReading

      if (meterDifference <= 0) {
        continue
      }

      const unitPrice = parseFloat(String(reading.sale_price)) || 0
      if (unitPrice <= 0) {
        console.log(`Skipping nozzle ${reading.nozzle_id} - no price configured`)
        continue
      }

      const nozzleTotalAmount = meterDifference * unitPrice
      const amountDenominations = split_denominations 
        ? splitIntoAmountDenominations(Math.floor(nozzleTotalAmount))
        : [Math.floor(nozzleTotalAmount)]

      for (const invoiceAmount of amountDenominations) {
        const quantity = parseFloat((invoiceAmount / unitPrice).toFixed(2))
        const invoiceNumber = generateInvoiceNumber(branchCode, invoiceIndex)
        const receiptNumber = generateReceiptNumber()

        const insertResult = await client.query(
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
          ) RETURNING id, invoice_number, quantity, total_amount`,
          [
            shift.branch_id,
            shift_id,
            shift.staff_id,
            reading.nozzle_id,
            invoiceNumber,
            receiptNumber,
            reading.fuel_type,
            quantity,
            unitPrice,
            invoiceAmount
          ]
        )

        salesCreated.push({
          id: insertResult.rows[0].id,
          invoice_number: insertResult.rows[0].invoice_number,
          receipt_number: receiptNumber,
          fuel_type: reading.fuel_type,
          quantity: quantity,
          unit_price: unitPrice,
          total_amount: invoiceAmount,
          branch_id: shift.branch_id
        })

        invoiceIndex++
      }
    }

    // Commit the transaction FIRST before submitting to KRA
    // This ensures database records exist before external API calls
    await client.query('COMMIT')

    // Apply intermittency rate: determine which sales to send to KRA
    const totalSales = salesCreated.length
    const salesToTransmit = Math.round((intermittencyRate / 100) * totalSales)
    
    // Shuffle and select sales to transmit based on intermittency rate
    const shuffledSales = [...salesCreated].sort(() => Math.random() - 0.5)
    const kraTransmitSales = shuffledSales.slice(0, salesToTransmit)
    const kraSkipSales = shuffledSales.slice(salesToTransmit)
    
    const kraTransmitIds = kraTransmitSales.map(s => s.id)
    const kraSkipIds = kraSkipSales.map(s => s.id)

    console.log(`[BULK SALES] Created ${totalSales} invoices. Intermittency rate: ${intermittencyRate}%. Transmitting ${salesToTransmit} to KRA, skipping ${totalSales - salesToTransmit}.`)

    // Mark sales transmitted to KRA
    if (kraTransmitIds.length > 0) {
      await pool.query(
        `UPDATE sales SET 
          kra_status = 'transmitted',
          transmission_status = 'sent',
          updated_at = NOW()
        WHERE id = ANY($1)`,
        [kraTransmitIds]
      )
      
      // Submit to KRA asynchronously (fire and forget for performance)
      for (const sale of kraTransmitSales) {
        callKraSaveSales({
          branch_id: sale.branch_id,
          invoice_number: sale.invoice_number,
          receipt_number: sale.receipt_number,
          fuel_type: sale.fuel_type,
          quantity: sale.quantity,
          unit_price: sale.unit_price,
          total_amount: sale.total_amount,
          payment_method: 'cash',
          sale_date: new Date().toISOString()
        }).catch(err => {
          console.error(`[BULK SALES] KRA submission failed for sale ${sale.id}:`, err.message)
        })
      }
    }
    
    // Mark skipped sales as pending (not transmitted per intermittency rate)
    if (kraSkipIds.length > 0) {
      await pool.query(
        `UPDATE sales SET 
          kra_status = 'pending',
          transmission_status = 'not_sent',
          updated_at = NOW()
        WHERE id = ANY($1)`,
        [kraSkipIds]
      )
    }

    // Update local sales objects with their status
    for (const sale of kraTransmitSales) {
      sale.kra_status = 'transmitted'
      sale.transmission_status = 'sent'
    }
    for (const sale of kraSkipSales) {
      sale.kra_status = 'pending'
      sale.transmission_status = 'not_sent'
    }

    const totalQuantity = salesCreated.reduce((sum, s) => sum + s.quantity, 0)
    const totalAmount = salesCreated.reduce((sum, s) => sum + s.total_amount, 0)

    return NextResponse.json({
      success: true,
      message: `Generated ${salesCreated.length} invoices from meter difference. ${salesToTransmit} transmitted to KRA (${intermittencyRate}% rate).`,
      summary: {
        total_invoices: salesCreated.length,
        total_quantity: totalQuantity,
        total_amount: totalAmount,
        kra_transmitted: salesToTransmit,
        kra_skipped: totalSales - salesToTransmit,
        intermittency_rate: intermittencyRate
      },
      sales: salesCreated
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("Error generating bulk sales:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shift_id = searchParams.get("shift_id")

    if (!shift_id) {
      return NextResponse.json({ error: "shift_id is required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT 
        sr.nozzle_id,
        n.nozzle_number,
        i.item_name as fuel_type,
        sr.opening_reading,
        sr.closing_reading,
        (CAST(sr.closing_reading AS numeric) - CAST(sr.opening_reading AS numeric)) as meter_difference,
        COALESCE(bi.sale_price, 0) as sale_price,
        (CAST(sr.closing_reading AS numeric) - CAST(sr.opening_reading AS numeric)) * COALESCE(bi.sale_price, 0) as potential_sales_value
      FROM shift_readings sr
      JOIN nozzles n ON sr.nozzle_id = n.id
      JOIN items i ON n.item_id = i.id
      JOIN shifts s ON sr.shift_id = s.id
      LEFT JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = s.branch_id
      WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
      ORDER BY i.item_name, n.nozzle_number`,
      [shift_id]
    )

    return NextResponse.json({
      nozzles: result.rows,
      total_meter_difference: result.rows.reduce((sum: number, r: any) => sum + (parseFloat(r.meter_difference) || 0), 0),
      total_potential_value: result.rows.reduce((sum: number, r: any) => sum + (parseFloat(r.potential_sales_value) || 0), 0)
    })

  } catch (error: any) {
    console.error("Error fetching shift nozzle data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
