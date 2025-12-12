import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const limit = parseInt(searchParams.get("limit") || "100")

    const client = await pool.connect()
    try {
      let sql = `
        SELECT 
          id,
          invoice_number,
          customer_name,
          sale_date,
          fuel_type,
          quantity,
          unit_price,
          total_amount,
          payment_method,
          CASE 
            WHEN payment_method = 'credit' THEN 'pending'
            ELSE 'paid'
          END as status
        FROM sales
        WHERE 1=1
      `
      const params: any[] = []
      let paramIndex = 1

      if (branchId) {
        sql += ` AND branch_id = $${paramIndex}`
        params.push(branchId)
        paramIndex++
      }

      if (dateFrom) {
        sql += ` AND DATE(sale_date) >= $${paramIndex}`
        params.push(dateFrom)
        paramIndex++
      }

      if (dateTo) {
        sql += ` AND DATE(sale_date) <= $${paramIndex}`
        params.push(dateTo)
        paramIndex++
      }

      sql += ` ORDER BY sale_date DESC LIMIT $${paramIndex}`
      params.push(limit)

      const result = await client.query(sql, params)
      
      return NextResponse.json({
        sales: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching mobile invoices:", error)
    return NextResponse.json({ sales: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_phone,
      items,
      subtotal,
      tax,
      total,
      user_id,
      branch_id
    } = body

    const client = await pool.connect()
    try {
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

      const result = await client.query(`
        INSERT INTO invoices (
          invoice_number,
          customer_name,
          customer_phone,
          branch_id,
          subtotal,
          tax_amount,
          total_amount,
          status,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
        RETURNING *
      `, [
        invoiceNumber,
        customer_name || 'Walk-in Customer',
        customer_phone,
        branch_id || null,
        subtotal,
        tax,
        total,
        user_id || null
      ])

      const invoice = result.rows[0]

      if (items && items.length > 0 && invoice) {
        for (const item of items) {
          await client.query(`
            INSERT INTO invoice_line_items (
              invoice_id,
              product_id,
              product_name,
              quantity,
              unit_price,
              discount,
              total
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            invoice.id,
            item.product_id,
            item.product_name,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.total
          ])
        }
      }

      return NextResponse.json(invoice)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating mobile invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
