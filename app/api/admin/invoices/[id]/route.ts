import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoiceResult = await query(`
      SELECT 
        i.*,
        v.name as merchant_name,
        b.bhf_nm as branch_name
      FROM invoices i
      LEFT JOIN vendors v ON i.vendor_id = v.id
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.id = $1
    `, [id])

    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const lineItemsResult = await query(`
      SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY created_at
    `, [id])

    return NextResponse.json({
      ...invoiceResult[0],
      line_items: lineItemsResult
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { billed_to_contact, due_date, notes, include_vat, line_items } = body

    const invoiceResult = await query(`SELECT * FROM invoices WHERE id = $1`, [id])
    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = invoiceResult[0]
    if (invoice.status !== "draft") {
      return NextResponse.json({ error: "Only draft invoices can be edited" }, { status: 400 })
    }

    let subtotal = 0
    if (line_items && Array.isArray(line_items)) {
      subtotal = line_items.reduce((sum: number, item: any) => {
        const lineSubtotal = item.quantity * item.unit_price
        const discountAmount = lineSubtotal * ((item.discount || 0) / 100)
        return sum + (lineSubtotal - discountAmount)
      }, 0)
    }
    const taxAmount = include_vat !== false ? subtotal * 0.16 : 0
    const totalAmount = subtotal + taxAmount

    await query(`
      UPDATE invoices 
      SET billed_to_contact = $1, due_date = $2, notes = $3, subtotal = $4, tax_amount = $5, total_amount = $6
      WHERE id = $7
    `, [billed_to_contact, due_date, notes, subtotal, taxAmount, totalAmount, id])

    await query(`DELETE FROM invoice_line_items WHERE invoice_id = $1`, [id])

    if (line_items && Array.isArray(line_items)) {
      for (const item of line_items) {
        const lineSubtotal = item.quantity * item.unit_price
        const discountAmount = lineSubtotal * ((item.discount || 0) / 100)
        const lineAmount = lineSubtotal - discountAmount
        await query(
          `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate, amount, discount)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, item.description, item.quantity, item.unit_price, item.tax_rate || 0, lineAmount, item.discount || 0]
        )
      }
    }

    const updatedInvoice = await query(`SELECT * FROM invoices WHERE id = $1`, [id])
    return NextResponse.json(updatedInvoice[0])
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}
