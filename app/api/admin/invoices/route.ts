import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const vendorId = searchParams.get("vendor_id")

    let sql = `
      SELECT 
        i.*,
        v.name as vendor_name,
        b.name as branch_name,
        u.username as created_by_username
      FROM invoices i
      LEFT JOIN vendors v ON v.id = i.vendor_id
      LEFT JOIN branches b ON b.id = i.branch_id
      LEFT JOIN users u ON u.id = i.created_by
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      sql += ` AND i.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (vendorId) {
      sql += ` AND i.vendor_id = $${paramIndex}`
      params.push(vendorId)
      paramIndex++
    }

    sql += " ORDER BY i.created_at DESC"

    const invoices = await query(sql, params)

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error("[Admin] Error fetching invoices:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendor_id, branch_id, issue_date, due_date, notes, line_items, created_by } = body

    if (!vendor_id) {
      return NextResponse.json({ error: "Vendor is required" }, { status: 400 })
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    
    let subtotal = 0
    if (line_items && Array.isArray(line_items)) {
      subtotal = line_items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    }
    const taxAmount = subtotal * 0.16
    const totalAmount = subtotal + taxAmount

    const result = await query(
      `INSERT INTO invoices (invoice_number, vendor_id, branch_id, issue_date, due_date, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [invoiceNumber, vendor_id, branch_id, issue_date || new Date(), due_date, subtotal, taxAmount, totalAmount, notes, created_by]
    )

    const invoice = result[0]

    if (line_items && Array.isArray(line_items)) {
      for (const item of line_items) {
        await query(
          `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate, amount)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [invoice.id, item.description, item.quantity, item.unit_price, item.tax_rate || 16, item.quantity * item.unit_price]
        )
      }
    }

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error("[Admin] Error creating invoice:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
