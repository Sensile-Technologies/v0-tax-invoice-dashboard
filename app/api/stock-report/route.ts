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

    const tanksParams: any[] = []
    let tankParamIndex = 1
    let tankWhereClause = "WHERE 1=1"
    
    if (branchId) {
      tankWhereClause += ` AND t.branch_id = $${tankParamIndex}`
      tanksParams.push(branchId)
      tankParamIndex++
    }

    if (tankId) {
      tankWhereClause += ` AND t.id = $${tankParamIndex}`
      tanksParams.push(tankId)
      tankParamIndex++
    }

    const tanksQuery = `
      SELECT 
        t.id as tank_id,
        t.tank_name,
        i.item_name as fuel_type,
        t.capacity,
        t.current_stock,
        b.name as branch_name,
        b.id as branch_id
      FROM tanks t
      LEFT JOIN branches b ON t.branch_id = b.id
      JOIN items i ON t.item_id = i.id
      ${tankWhereClause}
      ORDER BY b.name, t.tank_name
    `

    const tanksResult = await pool.query(tanksQuery, tanksParams)

    const summaryWithTotals = await Promise.all(
      tanksResult.rows.map(async (tank) => {
        const aggParams: any[] = [tank.tank_id]
        let aggParamIndex = 2
        let dateFilter = ""

        if (startDate) {
          dateFilter += ` AND created_at >= $${aggParamIndex}`
          aggParams.push(startDate)
          aggParamIndex++
        }
        if (endDate) {
          dateFilter += ` AND created_at <= $${aggParamIndex}`
          aggParams.push(endDate + 'T23:59:59')
          aggParamIndex++
        }

        const aggQuery = `
          SELECT 
            COALESCE(SUM(CASE WHEN adjustment_type IN ('receive', 'stock_receive', 'addition', 'purchase_receive') THEN quantity ELSE 0 END), 0) as total_received,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('manual_adjustment', 'increase') AND quantity > 0 THEN quantity ELSE 0 END), 0) as total_adjusted_in,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('manual_adjustment', 'decrease') OR (adjustment_type = 'increase' AND quantity < 0) THEN ABS(quantity) ELSE 0 END), 0) as total_adjusted_out,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('sale', 'deduction') THEN ABS(quantity) ELSE 0 END), 0) as total_sold,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('transfer_out', 'transfer') THEN ABS(quantity) ELSE 0 END), 0) as total_transferred_out,
            COALESCE(SUM(CASE WHEN adjustment_type = 'transfer_in' THEN quantity ELSE 0 END), 0) as total_transferred_in,
            COUNT(*) as movement_count
          FROM stock_adjustments
          WHERE tank_id = $1 ${dateFilter}
        `

        const aggResult = await pool.query(aggQuery, aggParams)
        const agg = aggResult.rows[0] || {}

        return {
          ...tank,
          total_received: parseFloat(agg.total_received || 0),
          total_adjusted_in: parseFloat(agg.total_adjusted_in || 0),
          total_adjusted_out: parseFloat(agg.total_adjusted_out || 0),
          total_sold: parseFloat(agg.total_sold || 0),
          total_transferred_out: parseFloat(agg.total_transferred_out || 0),
          total_transferred_in: parseFloat(agg.total_transferred_in || 0),
          movement_count: parseInt(agg.movement_count || 0),
        }
      })
    )

    const movementsParams: any[] = []
    let movementParamIndex = 1
    let movementWhereClause = "WHERE 1=1"

    if (branchId) {
      movementWhereClause += ` AND sa.branch_id = $${movementParamIndex}`
      movementsParams.push(branchId)
      movementParamIndex++
    }

    if (tankId) {
      movementWhereClause += ` AND sa.tank_id = $${movementParamIndex}`
      movementsParams.push(tankId)
      movementParamIndex++
    }

    if (startDate) {
      movementWhereClause += ` AND sa.created_at >= $${movementParamIndex}`
      movementsParams.push(startDate)
      movementParamIndex++
    }

    if (endDate) {
      movementWhereClause += ` AND sa.created_at <= $${movementParamIndex}`
      movementsParams.push(endDate + 'T23:59:59')
      movementParamIndex++
    }

    const movementsQuery = `
      SELECT 
        sa.id,
        sa.tank_id,
        t.tank_name,
        i.item_name as fuel_type,
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
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN branches b ON sa.branch_id = b.id
      ${movementWhereClause}
      ORDER BY sa.created_at DESC
      LIMIT 100
    `

    const movementsResult = await pool.query(movementsQuery, movementsParams)

    const totals = summaryWithTotals.reduce((acc, row) => ({
      total_received: acc.total_received + row.total_received,
      total_adjusted_in: acc.total_adjusted_in + row.total_adjusted_in,
      total_adjusted_out: acc.total_adjusted_out + row.total_adjusted_out,
      total_sold: acc.total_sold + row.total_sold,
      total_transferred_out: acc.total_transferred_out + row.total_transferred_out,
      total_transferred_in: acc.total_transferred_in + row.total_transferred_in,
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
        summary: summaryWithTotals,
        movements: movementsResult.rows,
        totals
      }
    })
  } catch (error) {
    console.error("Error fetching stock report:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock report" }, { status: 500 })
  }
}
