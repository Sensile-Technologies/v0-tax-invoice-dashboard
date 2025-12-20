import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const shiftId = searchParams.get("shift_id")

    const client = await pool.connect()
    try {
      let salesResult
      if (shiftId) {
        salesResult = await client.query(`
          SELECT 
            COALESCE(SUM(total_amount), 0) as total_sales,
            COUNT(*) as total_invoices
          FROM sales
          WHERE shift_id = $1
        `, [shiftId])
      } else if (branchId) {
        salesResult = await client.query(`
          SELECT 
            COALESCE(SUM(total_amount), 0) as total_sales,
            COUNT(*) as total_invoices
          FROM sales
          WHERE branch_id = $1 AND DATE(sale_date) = CURRENT_DATE
        `, [branchId])
      } else {
        salesResult = await client.query(`
          SELECT 
            COALESCE(SUM(total_amount), 0) as total_sales,
            COUNT(*) as total_invoices
          FROM sales
          WHERE DATE(sale_date) = CURRENT_DATE
        `)
      }

      let invoiceResult
      if (shiftId) {
        invoiceResult = await client.query(`
          SELECT 
            COUNT(CASE WHEN payment_method = 'credit' THEN 1 END) as pending_invoices,
            COUNT(CASE WHEN payment_method != 'credit' THEN 1 END) as paid_invoices
          FROM sales
          WHERE shift_id = $1
        `, [shiftId])
      } else if (branchId) {
        invoiceResult = await client.query(`
          SELECT 
            COUNT(CASE WHEN payment_method = 'credit' THEN 1 END) as pending_invoices,
            COUNT(CASE WHEN payment_method != 'credit' THEN 1 END) as paid_invoices
          FROM sales
          WHERE branch_id = $1 AND DATE(sale_date) = CURRENT_DATE
        `, [branchId])
      } else {
        invoiceResult = await client.query(`
          SELECT 
            COUNT(CASE WHEN payment_method = 'credit' THEN 1 END) as pending_invoices,
            COUNT(CASE WHEN payment_method != 'credit' THEN 1 END) as paid_invoices
          FROM sales
          WHERE DATE(sale_date) = CURRENT_DATE
        `)
      }

      const stats = salesResult.rows[0] || { total_sales: 0, total_invoices: 0 }
      const invoiceStats = invoiceResult.rows[0] || { pending_invoices: 0, paid_invoices: 0 }

      return NextResponse.json({
        total_sales: Number(stats.total_sales) || 0,
        total_invoices: Number(stats.total_invoices) || 0,
        pending_invoices: Number(invoiceStats.pending_invoices) || 0,
        paid_invoices: Number(invoiceStats.paid_invoices) || 0
      })
    } finally {
      client.release()
    }
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
