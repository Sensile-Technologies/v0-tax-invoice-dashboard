import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoiceResult = await query(`
      SELECT * FROM invoices WHERE id = $1
    `, [id])

    if (invoiceResult.rows.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const original = invoiceResult.rows[0]

    const countResult = await query(`
      SELECT COUNT(*) as count FROM invoices WHERE vendor_id = $1
    `, [original.vendor_id])
    const count = parseInt(countResult.rows[0].count) + 1
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`

    const newInvoiceResult = await query(`
      INSERT INTO invoices (
        invoice_number, vendor_id, branch_id, issue_date, due_date,
        subtotal, tax_amount, total_amount, paid_amount, status, notes,
        is_recurring, recurring_interval, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 0, 'draft', $9, $10, $11, $12
      )
      RETURNING *
    `, [
      invoiceNumber,
      original.vendor_id,
      original.branch_id,
      new Date().toISOString().split('T')[0],
      original.due_date,
      original.subtotal,
      original.tax_amount,
      original.total_amount,
      original.notes,
      original.is_recurring,
      original.recurring_interval,
      original.created_by
    ])

    const lineItemsResult = await query(`
      SELECT * FROM invoice_line_items WHERE invoice_id = $1
    `, [id])

    for (const item of lineItemsResult.rows) {
      await query(`
        INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        newInvoiceResult.rows[0].id,
        item.description,
        item.quantity,
        item.unit_price,
        item.tax_rate,
        item.amount
      ])
    }

    return NextResponse.json(newInvoiceResult.rows[0])
  } catch (error) {
    console.error("Error duplicating invoice:", error)
    return NextResponse.json({ error: "Failed to duplicate invoice" }, { status: 500 })
  }
}
