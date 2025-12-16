import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const tankId = searchParams.get("tank_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      whereClause += ` AND sa.branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (tankId) {
      whereClause += ` AND sa.tank_id = $${paramIndex}`
      params.push(tankId)
      paramIndex++
    }

    if (startDate) {
      whereClause += ` AND sa.created_at >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereClause += ` AND sa.created_at <= $${paramIndex}`
      params.push(endDate + 'T23:59:59')
      paramIndex++
    }

    const summaryQuery = `
      SELECT 
        t.id as tank_id,
        t.tank_name,
        t.fuel_type,
        t.capacity,
        t.current_stock,
        b.name as branch_name,
        b.id as branch_id,
        COALESCE(SUM(CASE WHEN sa.adjustment_type IN ('receive', 'addition') THEN sa.quantity ELSE 0 END), 0) as total_received,
        COALESCE(SUM(CASE WHEN sa.adjustment_type = 'manual_adjustment' AND sa.quantity > 0 THEN sa.quantity ELSE 0 END), 0) as total_adjusted_in,
        COALESCE(SUM(CASE WHEN sa.adjustment_type = 'manual_adjustment' AND sa.quantity < 0 THEN ABS(sa.quantity) ELSE 0 END), 0) as total_adjusted_out,
        COALESCE(SUM(CASE WHEN sa.adjustment_type IN ('sale', 'deduction') THEN ABS(sa.quantity) ELSE 0 END), 0) as total_sold,
        COALESCE(SUM(CASE WHEN sa.adjustment_type = 'transfer_out' THEN ABS(sa.quantity) ELSE 0 END), 0) as total_transferred_out,
        COALESCE(SUM(CASE WHEN sa.adjustment_type = 'transfer_in' THEN sa.quantity ELSE 0 END), 0) as total_transferred_in,
        COUNT(sa.id) as movement_count
      FROM tanks t
      LEFT JOIN branches b ON t.branch_id = b.id
      LEFT JOIN stock_adjustments sa ON t.id = sa.tank_id ${branchId ? 'AND sa.branch_id = $1' : ''}
        ${startDate ? `AND sa.created_at >= $${branchId ? 2 : 1}` : ''}
        ${endDate ? `AND sa.created_at <= $${branchId ? (startDate ? 3 : 2) : (startDate ? 2 : 1)}` : ''}
      ${branchId ? 'WHERE t.branch_id = $1' : ''}
      GROUP BY t.id, t.tank_name, t.fuel_type, t.capacity, t.current_stock, b.name, b.id
      ORDER BY b.name, t.tank_name
    `

    const movementsQuery = `
      SELECT 
        sa.id,
        sa.tank_id,
        t.tank_name,
        t.fuel_type,
        b.name as branch_name,
        sa.adjustment_type,
        sa.quantity,
        sa.previous_stock,
        sa.new_stock,
        sa.reason,
        sa.requested_by,
        sa.approval_status,
        sa.kra_sync_status,
        sa.created_at
      FROM stock_adjustments sa
      LEFT JOIN tanks t ON sa.tank_id = t.id
      LEFT JOIN branches b ON sa.branch_id = b.id
      ${whereClause}
      ORDER BY sa.created_at DESC
      LIMIT 100
    `

    const [summaryResult, movementsResult] = await Promise.all([
      pool.query(summaryQuery, branchId ? [branchId, ...(startDate ? [startDate] : []), ...(endDate ? [endDate + 'T23:59:59'] : [])] : [...(startDate ? [startDate] : []), ...(endDate ? [endDate + 'T23:59:59'] : [])]),
      pool.query(movementsQuery, params)
    ])

    const totals = summaryResult.rows.reduce((acc, row) => ({
      total_received: acc.total_received + parseFloat(row.total_received || 0),
      total_adjusted_in: acc.total_adjusted_in + parseFloat(row.total_adjusted_in || 0),
      total_adjusted_out: acc.total_adjusted_out + parseFloat(row.total_adjusted_out || 0),
      total_sold: acc.total_sold + parseFloat(row.total_sold || 0),
      total_transferred_out: acc.total_transferred_out + parseFloat(row.total_transferred_out || 0),
      total_transferred_in: acc.total_transferred_in + parseFloat(row.total_transferred_in || 0),
      current_stock: acc.current_stock + parseFloat(row.current_stock || 0),
      capacity: acc.capacity + parseFloat(row.capacity || 0),
    }), {
      total_received: 0,
      total_adjusted_in: 0,
      total_adjusted_out: 0,
      total_sold: 0,
      total_transferred_out: 0,
      total_transferred_in: 0,
      current_stock: 0,
      capacity: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryResult.rows,
        movements: movementsResult.rows,
        totals
      }
    })
  } catch (error) {
    console.error("Error fetching stock report:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock report" }, { status: 500 })
  }
}
