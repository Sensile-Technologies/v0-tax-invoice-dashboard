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

    let whereClause = "WHERE bs.branch_id = $1"
    const params: any[] = [branchId]
    let paramIndex = 2

    if (dateFrom) {
      whereClause += ` AND DATE(bs.created_at) >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      whereClause += ` AND DATE(bs.created_at) <= $${paramIndex}`
      params.push(dateTo)
      paramIndex++
    }

    const bulkSales = await query(`
      SELECT 
        bs.id,
        bs.shift_id,
        bs.nozzle_id,
        bs.item_id,
        bs.fuel_type,
        bs.opening_reading,
        bs.closing_reading,
        bs.meter_difference,
        bs.invoiced_quantity,
        bs.bulk_quantity,
        bs.unit_price,
        bs.total_amount,
        bs.generated_invoices,
        bs.status,
        bs.created_at,
        n.name AS nozzle_name,
        n.dispenser_number,
        n.nozzle_number,
        s.start_time AS shift_start,
        s.end_time AS shift_end,
        st.full_name AS cashier_name,
        i.name AS item_name
      FROM bulk_sales bs
      LEFT JOIN nozzles n ON bs.nozzle_id = n.id
      LEFT JOIN shifts s ON bs.shift_id = s.id
      LEFT JOIN staff st ON s.cashier_id = st.id
      LEFT JOIN items i ON bs.item_id = i.id
      ${whereClause}
      ORDER BY bs.created_at DESC
    `, params)

    const summary = await query(`
      SELECT 
        bs.fuel_type,
        COALESCE(i.name, bs.fuel_type) AS product_name,
        SUM(bs.meter_difference) AS total_meter_difference,
        SUM(bs.invoiced_quantity) AS total_invoiced,
        SUM(bs.bulk_quantity) AS total_bulk,
        SUM(bs.total_amount) AS total_amount,
        SUM(bs.generated_invoices) AS total_invoices,
        COUNT(bs.id) AS entry_count
      FROM bulk_sales bs
      LEFT JOIN items i ON bs.item_id = i.id
      ${whereClause}
      GROUP BY bs.fuel_type, i.name
      ORDER BY i.name
    `, params)

    const branch = await query(`
      SELECT name, bulk_sales_kra_percentage FROM branches WHERE id = $1
    `, [branchId])

    return NextResponse.json({
      success: true,
      data: {
        bulk_sales: bulkSales,
        summary,
        branch_name: branch[0]?.name || "Unknown Branch",
        kra_percentage: branch[0]?.bulk_sales_kra_percentage || 100,
        totals: {
          total_meter_difference: bulkSales.reduce((sum: number, bs: any) => sum + Number(bs.meter_difference || 0), 0),
          total_invoiced: bulkSales.reduce((sum: number, bs: any) => sum + Number(bs.invoiced_quantity || 0), 0),
          total_bulk: bulkSales.reduce((sum: number, bs: any) => sum + Number(bs.bulk_quantity || 0), 0),
          total_amount: bulkSales.reduce((sum: number, bs: any) => sum + Number(bs.total_amount || 0), 0),
          total_entries: bulkSales.length
        }
      }
    })
  } catch (error) {
    console.error("Error fetching bulk sales report:", error)
    return NextResponse.json({ error: "Failed to fetch bulk sales report" }, { status: 500 })
  }
}
