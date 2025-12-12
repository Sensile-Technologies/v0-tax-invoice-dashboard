import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
      return NextResponse.json(
        { error: "Branch ID, fuel type, and amount are required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`

      const saleResult = await client.query(
        `INSERT INTO sales (
          branch_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)
        RETURNING *`,
        [
          branch_id,
          nozzle_id || null,
          fuel_type,
          quantity,
          unit_price,
          total_amount,
          payment_method || 'cash',
          customer_name || 'Walk-in Customer',
          vehicle_number || null,
          invoiceNumber,
          receiptNumber,
          user_id || null,
        ]
      )

      const sale = saleResult.rows[0]

      const invoiceResult = await client.query(
        `INSERT INTO invoices (
          invoice_number,
          branch_id,
          customer_name,
          customer_phone,
          subtotal,
          tax_amount,
          total_amount,
          status,
          created_by,
          kra_pin,
          payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', $8, $9, $10)
        RETURNING *`,
        [
          invoiceNumber,
          branch_id,
          customer_name || 'Walk-in Customer',
          null,
          total_amount,
          total_amount * 0.16,
          total_amount * 1.16,
          user_id || null,
          kra_pin || null,
          payment_method || 'cash',
        ]
      )

      const invoice = invoiceResult.rows[0]

      if (invoice) {
        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount,
            total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            invoice.id,
            nozzle_id || fuel_type,
            fuel_type,
            quantity,
            unit_price,
            0,
            total_amount,
          ]
        )
      }

      if (is_loyalty_customer && customer_name) {
        const existingCustomer = await client.query(
          `SELECT id FROM customers WHERE name = $1 AND branch_id = $2`,
          [customer_name, branch_id]
        )

        if (existingCustomer.rows.length === 0) {
          await client.query(
            `INSERT INTO customers (branch_id, name, kra_pin, is_loyalty)
             VALUES ($1, $2, $3, true)
             ON CONFLICT DO NOTHING`,
            [branch_id, customer_name, kra_pin || null]
          )
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        sale: sale,
        invoice: invoice,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Create Sale API Error]:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
