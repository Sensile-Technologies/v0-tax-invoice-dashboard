import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoiceResult = await query(`
      SELECT * FROM invoices WHERE id = $1
    `, [id])

    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const original = invoiceResult[0]

    const year = new Date().getFullYear()
    const lastInvoiceResult = await query(
      `SELECT invoice_number FROM invoices 
       WHERE invoice_number LIKE $1 
       ORDER BY invoice_number DESC LIMIT 1`,
      [`INV-${year}-%`]
    )
    
    let nextNumber = 1
    if (lastInvoiceResult.length > 0) {
      const lastNumber = lastInvoiceResult[0].invoice_number
      const parts = lastNumber.split('-')
      if (parts.length === 3) {
        nextNumber = parseInt(parts[2], 10) + 1
      }
    }
    const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(4, '0')}`

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

    for (const item of lineItemsResult) {
      await query(`
        INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        newInvoiceResult[0].id,
        item.description,
        item.quantity,
        item.unit_price,
        item.tax_rate,
        item.amount
      ])
    }

    return NextResponse.json(newInvoiceResult[0])
  } catch (error) {
    console.error("Error duplicating invoice:", error)
    return NextResponse.json({ error: "Failed to duplicate invoice" }, { status: 500 })
  }
}
