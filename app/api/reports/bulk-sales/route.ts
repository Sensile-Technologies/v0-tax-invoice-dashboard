import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID required" }, { status: 400 })
    }

    let whereClause = "WHERE s.branch_id = $1 AND s.source_system = 'meter_diff_bulk'"
    const params: any[] = [branchId]
    let paramIndex = 2

    if (dateFrom) {
      whereClause += ` AND DATE(s.created_at) >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      whereClause += ` AND DATE(s.created_at) <= $${paramIndex}`
      params.push(dateTo)
      paramIndex++
    }

    const bulkSales = await query(`
      SELECT 
        s.id,
        s.shift_id,
        s.nozzle_id,
        s.fuel_type,
        s.quantity,
        s.unit_price,
        s.total_amount,
        s.invoice_number,
        s.kra_status,
        s.transmission_status,
        s.created_at,
        CONCAT('D', d.dispenser_number, '-N', n.nozzle_number) AS nozzle_name,
        d.dispenser_number,
        n.nozzle_number,
        sh.start_time AS shift_start,
        sh.end_time AS shift_end,
        st.full_name AS cashier_name,
        i.item_name AS item_name
      FROM sales s
      LEFT JOIN nozzles n ON s.nozzle_id = n.id
      LEFT JOIN dispensers d ON n.dispenser_id = d.id
      LEFT JOIN shifts sh ON s.shift_id = sh.id
      LEFT JOIN staff st ON sh.staff_id = st.id
      LEFT JOIN items i ON n.item_id = i.id
      ${whereClause}
      ORDER BY s.created_at DESC
    `, params)

    const summary = await query(`
      SELECT 
        s.fuel_type,
        COALESCE(i.item_name, s.fuel_type) AS product_name,
        SUM(s.quantity) AS total_quantity,
        SUM(s.total_amount) AS total_amount,
        COUNT(s.id) AS invoice_count,
        COUNT(CASE WHEN s.kra_status = 'success' OR s.kra_status = 'transmitted' THEN 1 END) AS kra_transmitted,
        COUNT(CASE WHEN s.kra_status = 'pending' OR s.transmission_status = 'not_sent' THEN 1 END) AS kra_skipped
      FROM sales s
      LEFT JOIN nozzles n ON s.nozzle_id = n.id
      LEFT JOIN items i ON n.item_id = i.id
      ${whereClause}
      GROUP BY s.fuel_type, i.item_name
      ORDER BY i.item_name
    `, params)

    const branch = await query(`
      SELECT name, bulk_sales_kra_percentage, controller_id FROM branches WHERE id = $1
    `, [branchId])

    const branchData = branch[0] || {}
    const hasController = !!branchData.controller_id

    return NextResponse.json({
      success: true,
      data: {
        bulk_sales: bulkSales,
        summary,
        branch_name: branchData.name || "Unknown Branch",
        kra_percentage: branchData.bulk_sales_kra_percentage || 100,
        has_controller: hasController,
        controller_id: branchData.controller_id || null,
        totals: {
          total_quantity: bulkSales.reduce((sum: number, s: any) => sum + Number(s.quantity || 0), 0),
          total_amount: bulkSales.reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0),
          total_entries: bulkSales.length,
          kra_transmitted: bulkSales.filter((s: any) => s.kra_status === 'success' || s.kra_status === 'transmitted').length,
          kra_skipped: bulkSales.filter((s: any) => s.kra_status === 'pending' || s.transmission_status === 'not_sent').length
        }
      }
    })
  } catch (error) {
    console.error("Error fetching bulk sales report:", error)
    return NextResponse.json({ error: "Failed to fetch bulk sales report" }, { status: 500 })
  }
}
