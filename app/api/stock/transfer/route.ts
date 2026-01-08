import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { syncStockWithKRA } from "@/lib/kra-stock-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branch_id,
      from_tank_id,
      to_tank_id,
      quantity,
      reason,
      approved_by,
      sync_to_kra = true
    } = body

    if (!branch_id || !from_tank_id || !to_tank_id || !quantity) {
      return NextResponse.json(
        { error: "branch_id, from_tank_id, to_tank_id, and quantity are required" },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be positive" },
        { status: 400 }
      )
    }

    if (from_tank_id === to_tank_id) {
      return NextResponse.json(
        { error: "Source and destination tanks must be different" },
        { status: 400 }
      )
    }

    const [fromTankResult, toTankResult] = await Promise.all([
      query(`SELECT t.*, i.item_name, i.item_code as kra_item_cd 
             FROM tanks t 
             LEFT JOIN items i ON t.item_id = i.id 
             WHERE t.id = $1`, [from_tank_id]),
      query(`SELECT t.*, i.item_name 
             FROM tanks t 
             LEFT JOIN items i ON t.item_id = i.id 
             WHERE t.id = $1`, [to_tank_id])
    ])

    if (fromTankResult.length === 0) {
      return NextResponse.json({ error: "Source tank not found" }, { status: 404 })
    }
    if (toTankResult.length === 0) {
      return NextResponse.json({ error: "Destination tank not found" }, { status: 404 })
    }

    const fromTank = fromTankResult[0]
    const toTank = toTankResult[0]

    if ((fromTank.current_stock || 0) < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock in source tank. Available: ${fromTank.current_stock}` },
        { status: 400 }
      )
    }

    const fromPreviousStock = fromTank.current_stock || 0
    const toPreviousStock = toTank.current_stock || 0
    const fromNewStock = fromPreviousStock - quantity
    const toNewStock = toPreviousStock + quantity

    await query(
      `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
      [fromNewStock, from_tank_id]
    )
    await query(
      `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
      [toNewStock, to_tank_id]
    )

    await query(
      `INSERT INTO stock_transfers (from_branch_id, to_branch_id, from_tank_id, to_tank_id, quantity, from_previous_stock, from_new_stock, to_previous_stock, to_new_stock, notes, approved_by, status, transfer_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [branch_id, branch_id, from_tank_id, to_tank_id, quantity, fromPreviousStock, fromNewStock, toPreviousStock, toNewStock, reason || 'Stock transfer', approved_by || 'System', 'completed']
    )

    let kraResult = null
    if (sync_to_kra) {
      console.log(`[Stock Transfer API] Syncing stock transfer of ${quantity} from tank ${from_tank_id} to ${to_tank_id} to KRA`)
      
      kraResult = await syncStockWithKRA(
        branch_id,
        "stock_transfer",
        [
          {
            tankId: from_tank_id,
            quantity: quantity,
            unitPrice: 0,
            itemCode: fromTank.kra_item_cd,
            itemName: fromTank.item_name
          }
        ],
        { remark: `Stock transfer: ${fromTank.tank_name} -> ${toTank.tank_name}` }
      )

      await query(
        `UPDATE tanks SET kra_sync_status = $1 WHERE id = $2`,
        [kraResult.success ? 'synced' : 'failed', from_tank_id]
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        fromTank: {
          id: from_tank_id,
          name: fromTank.tank_name,
          previousStock: fromPreviousStock,
          newStock: fromNewStock
        },
        toTank: {
          id: to_tank_id,
          name: toTank.tank_name,
          previousStock: toPreviousStock,
          newStock: toNewStock
        },
        transferredQuantity: quantity
      },
      kraSync: kraResult ? {
        synced: kraResult.success,
        movementId: kraResult.movementId,
        error: kraResult.error
      } : null
    })

  } catch (error: any) {
    console.error("[Stock Transfer API] Error:", error)
    return NextResponse.json(
      { error: "Failed to transfer stock", details: error.message },
      { status: 500 }
    )
  }
}
