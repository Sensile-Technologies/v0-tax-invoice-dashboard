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

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching vendor invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
