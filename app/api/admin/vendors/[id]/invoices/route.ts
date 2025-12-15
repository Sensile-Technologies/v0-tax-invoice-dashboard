import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(`
      SELECT id, invoice_number, status, due_date, total_amount, paid_amount
      FROM invoices
      WHERE vendor_id = $1
      ORDER BY created_at DESC
    `, [id])

    const invoices = result.rows.map((row: any) => ({
      ...row,
      due_date: row.due_date ? row.due_date.toISOString() : null,
      total_amount: row.total_amount ? Number(row.total_amount) : 0,
      paid_amount: row.paid_amount ? Number(row.paid_amount) : 0,
    }))

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching vendor invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
