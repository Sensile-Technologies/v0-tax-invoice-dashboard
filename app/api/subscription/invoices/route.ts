import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      )
    }

    const invoices = await query(`
      SELECT 
        si.id,
        si.invoice_number,
        si.branch_id,
        b.name as branch_name,
        si.amount,
        si.due_date,
        si.status,
        si.period_start,
        si.period_end,
        si.created_at
      FROM subscription_invoices si
      LEFT JOIN branches b ON si.branch_id = b.id
      WHERE si.branch_id = $1
      ORDER BY si.due_date DESC
    `, [branchId])

    return NextResponse.json({
      success: true,
      invoices: invoices || []
    })
  } catch (error: any) {
    if (error.message?.includes('relation "subscription_invoices" does not exist')) {
      return NextResponse.json({
        success: true,
        invoices: []
      })
    }
    console.error("Error fetching subscription invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices", details: error.message },
      { status: 500 }
    )
  }
}
