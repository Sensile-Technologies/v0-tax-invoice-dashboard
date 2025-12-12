import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[Mobile Create Sale] Request body:", JSON.stringify(body, null, 2))
    
    const {
      branch_id,
      user_id,
      nozzle_id,
      fuel_type,
      quantity,
      unit_price,
      total_amount,
      payment_method,
      customer_name,
      kra_pin,
      vehicle_number,
      is_loyalty_customer,
    } = body

    if (!branch_id || !fuel_type || !total_amount) {
      console.log("[Mobile Create Sale] Missing required fields - branch_id:", branch_id, "fuel_type:", fuel_type, "total_amount:", total_amount)
      return NextResponse.json(
        { error: `Missing required fields: branch_id=${branch_id}, fuel_type=${fuel_type}, total_amount=${total_amount}` },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`

      let meterReadingAfter = null
      if (nozzle_id && quantity) {
        const nozzleResult = await client.query(
          `SELECT initial_meter_reading FROM nozzles WHERE id = $1`,
          [nozzle_id]
        )
        
        if (nozzleResult.rows.length > 0) {
          const currentReading = parseFloat(nozzleResult.rows[0].initial_meter_reading) || 0
          meterReadingAfter = currentReading + parseFloat(quantity)
          
          await client.query(
            `UPDATE nozzles SET initial_meter_reading = $1, updated_at = NOW() WHERE id = $2`,
            [meterReadingAfter, nozzle_id]
          )
        }
      }

      const saleResult = await client.query(
        `INSERT INTO sales (
          branch_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date,
          customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin,
          meter_reading_after
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          branch_id,
          nozzle_id || null,
          fuel_type,
          quantity || 0,
          unit_price || 0,
          total_amount,
          payment_method || 'cash',
          customer_name || 'Walk-in Customer',
          vehicle_number || null,
          invoiceNumber,
          receiptNumber,
          kra_pin || null,
          is_loyalty_customer || false,
          is_loyalty_customer ? customer_name : null,
          is_loyalty_customer ? kra_pin : null,
          meterReadingAfter,
        ]
      )

      const sale = saleResult.rows[0]

      if (is_loyalty_customer && customer_name && customer_name !== 'Walk-in Customer') {
        const existingCustomer = await client.query(
          `SELECT id FROM customers WHERE cust_nm = $1 AND branch_id = $2`,
          [customer_name, branch_id]
        )

        if (existingCustomer.rows.length === 0) {
          const custNo = `CUST-${Date.now().toString(36).toUpperCase()}`
          await client.query(
            `INSERT INTO customers (branch_id, cust_nm, cust_tin, cust_no, use_yn)
             VALUES ($1, $2, $3, $4, 'Y')
             ON CONFLICT DO NOTHING`,
            [branch_id, customer_name, kra_pin || null, custNo]
          )
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        sale: sale,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Mobile Create Sale API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to create sale" }, { status: 500 })
  }
}
