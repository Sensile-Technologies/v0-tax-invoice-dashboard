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
