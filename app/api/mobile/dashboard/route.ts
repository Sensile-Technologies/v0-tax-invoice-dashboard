import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const salesResult = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices
      FROM invoices
      WHERE DATE(created_at) = CURRENT_DATE
    `)

    const stats = salesResult[0] || {
      total_sales: 0,
      total_invoices: 0,
      pending_invoices: 0,
      paid_invoices: 0
    }

    return NextResponse.json({
      total_sales: Number(stats.total_sales) || 0,
      total_invoices: Number(stats.total_invoices) || 0,
      pending_invoices: Number(stats.pending_invoices) || 0,
      paid_invoices: Number(stats.paid_invoices) || 0
    })
  } catch (error) {
    console.error("Error fetching mobile dashboard:", error)
    return NextResponse.json({
      total_sales: 0,
      total_invoices: 0,
      pending_invoices: 0,
      paid_invoices: 0
    })
  }
}
