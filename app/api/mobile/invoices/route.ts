import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    let sql = `
      SELECT 
        id,
        invoice_number,
        customer_name,
        branch_id,
        subtotal,
        tax_amount as tax,
        total_amount as total,
        status,
        created_at,
        created_by
      FROM invoices
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status && status !== "all") {
      sql += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await query(sql, params)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching mobile invoices:", error)
    return NextResponse.json([])
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

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

    const result = await query(`
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

    const invoice = result[0]

    if (items && items.length > 0 && invoice) {
      for (const item of items) {
        await query(`
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
  } catch (error) {
    console.error("Error creating mobile invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
