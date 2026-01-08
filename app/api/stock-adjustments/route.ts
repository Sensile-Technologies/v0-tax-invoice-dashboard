import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { syncStockWithKRA, StockMovementType } from "@/lib/kra-stock-service"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const tankId = searchParams.get("tank_id")

    let query = "SELECT * FROM stock_adjustments WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      query += ` AND branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (tankId) {
      query += ` AND tank_id = $${paramIndex}`
      params.push(tankId)
      paramIndex++
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching stock adjustments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock adjustments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tank_id, 
      branch_id, 
      adjustment_type, 
      quantity, 
      previous_stock, 
      new_stock, 
      reason, 
      requested_by, 
      approval_status,
      sync_to_kra = true
    } = body

    if (!tank_id || !branch_id || !adjustment_type) {
      return NextResponse.json({ success: false, error: "tank_id, branch_id, and adjustment_type are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO stock_adjustments (tank_id, branch_id, adjustment_type, quantity, previous_stock, new_stock, reason, requested_by, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [tank_id, branch_id, adjustment_type, quantity || 0, previous_stock || 0, new_stock || 0, reason, requested_by, approval_status || "pending"]
    )

    const adjustment = result.rows[0]

    if (sync_to_kra && quantity && quantity !== 0) {
      try {
        const tankResult = await pool.query(
          `SELECT t.*, i.item_code as item_cd, i.item_name as product_name, bi.sale_price as unit_price
           FROM tanks t
           LEFT JOIN items i ON t.item_id = i.id
           LEFT JOIN branch_items bi ON bi.item_id = i.id AND bi.branch_id = t.branch_id
           WHERE t.id = $1`,
          [tank_id]
        )

        if (tankResult.rows.length > 0) {
          const tank = tankResult.rows[0]
          
          let movementType: StockMovementType
          if (adjustment_type === 'receive' || adjustment_type === 'addition') {
            movementType = 'stock_receive'
          } else if (adjustment_type === 'sale' || adjustment_type === 'deduction') {
            movementType = 'sale'
          } else {
            movementType = 'stock_adjustment'
          }

          const kraSync = await syncStockWithKRA(
            branch_id,
            movementType,
            [{
              tankId: tank_id,
              itemCode: tank.item_cd || 'FUEL',
              itemName: tank.product_name || tank.name || 'Fuel',
              quantity: Math.abs(quantity),
              unitPrice: tank.unit_price || 0
            }],
            { remark: reason || `Stock adjustment: ${adjustment_type}` }
          )

          await pool.query(
            `UPDATE stock_adjustments SET 
              kra_sync_status = $1,
              kra_response = $2
            WHERE id = $3`,
            [
              kraSync.success ? 'synced' : 'failed',
              JSON.stringify(kraSync.kraResponse),
              adjustment.id
            ]
          )
        }
      } catch (kraError) {
        console.error("KRA sync error:", kraError)
      }
    }

    return NextResponse.json({ success: true, data: adjustment })
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    return NextResponse.json({ success: false, error: "Failed to create stock adjustment" }, { status: 500 })
  }
}
