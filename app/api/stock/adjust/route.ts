import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { syncStockWithKRA } from "@/lib/kra-stock-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branch_id,
      tank_id,
      adjustment_type,
      quantity,
      reason,
      approved_by,
      sync_to_kra = true
    } = body

    if (!branch_id || !tank_id || !adjustment_type || quantity === undefined) {
      return NextResponse.json(
        { error: "branch_id, tank_id, adjustment_type, and quantity are required" },
        { status: 400 }
      )
    }

    if (!["increase", "decrease", "set"].includes(adjustment_type)) {
      return NextResponse.json(
        { error: "adjustment_type must be 'increase', 'decrease', or 'set'" },
        { status: 400 }
      )
    }

    const tankResult = await query("SELECT * FROM tanks WHERE id = $1", [tank_id])
    if (tankResult.length === 0) {
      return NextResponse.json(
        { error: "Tank not found" },
        { status: 404 }
      )
    }

    const tank = tankResult[0]
    const previousStock = tank.current_stock || 0
    let newStock: number

    if (adjustment_type === "increase") {
      newStock = previousStock + quantity
    } else if (adjustment_type === "decrease") {
      newStock = Math.max(0, previousStock - quantity)
    } else {
      newStock = quantity
    }

    const actualChange = Math.abs(newStock - previousStock)

    await query(
      `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
      [newStock, tank_id]
    )

    await query(
      `INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [branch_id, tank_id, adjustment_type, actualChange, previousStock, newStock, reason || 'Manual adjustment', approved_by || 'System', 'approved']
    )

    let kraResult = null
    if (sync_to_kra && actualChange > 0) {
      console.log(`[Stock Adjust API] Syncing stock adjustment of ${actualChange} for tank ${tank_id} to KRA`)
      
      kraResult = await syncStockWithKRA(
        branch_id,
        "stock_adjustment",
        [{
          tankId: tank_id,
          quantity: actualChange,
          unitPrice: 0,
          itemCode: tank.kra_item_cd,
          itemName: tank.fuel_type
        }],
        { remark: reason || `Stock adjustment: ${previousStock} -> ${newStock}` }
      )

      await query(
        `UPDATE tanks SET kra_sync_status = $1, last_kra_synced_stock = $2 WHERE id = $3`,
        [kraResult.success ? 'synced' : 'failed', kraResult.success ? newStock : tank.last_kra_synced_stock, tank_id]
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        tankId: tank_id,
        adjustmentType: adjustment_type,
        previousStock,
        adjustedQuantity: actualChange,
        newStock,
        fuelType: tank.fuel_type
      },
      kraSync: kraResult ? {
        synced: kraResult.success,
        movementId: kraResult.movementId,
        error: kraResult.error
      } : null
    })

  } catch (error: any) {
    console.error("[Stock Adjust API] Error:", error)
    return NextResponse.json(
      { error: "Failed to adjust stock", details: error.message },
      { status: 500 }
    )
  }
}
