import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { syncStockWithKRA } from "@/lib/kra-stock-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branch_id,
      tank_id,
      quantity,
      unit_price,
      supplier_name,
      delivery_note,
      sync_to_kra = true
    } = body

    if (!branch_id || !tank_id || !quantity) {
      return NextResponse.json(
        { error: "branch_id, tank_id, and quantity are required" },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be positive" },
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
    const previousStock = parseFloat(tank.current_stock) || 0
    const quantityNum = parseFloat(quantity)
    const newStock = previousStock + quantityNum

    console.log(`[Stock Receive] Tank ${tank_id}: previousStock=${previousStock}, quantity=${quantityNum}, newStock=${newStock}`)

    await query(
      `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
      [newStock, tank_id]
    )

    const adjustmentResult = await query(
      `INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approval_status, kra_sync_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [branch_id, tank_id, 'stock_receive', quantityNum, previousStock, newStock, supplier_name ? `Received from: ${supplier_name}` : 'Stock received', 'approved', 'pending']
    )
    const adjustmentId = adjustmentResult[0]?.id

    let kraResult = null
    if (sync_to_kra) {
      console.log(`[Stock Receive API] Syncing stock receive of ${quantity} for tank ${tank_id} to KRA`)
      
      kraResult = await syncStockWithKRA(
        branch_id,
        "stock_receive",
        [{
          tankId: tank_id,
          quantity: quantity,
          unitPrice: unit_price || 0,
          itemCode: tank.kra_item_cd,
          itemName: tank.fuel_type
        }],
        { 
          remark: delivery_note || `Stock received: ${quantity} liters`,
          customerName: supplier_name
        }
      )

      await query(
        `UPDATE tanks SET kra_sync_status = $1, last_kra_synced_stock = $2 WHERE id = $3`,
        [kraResult.success ? 'synced' : 'failed', kraResult.success ? newStock : tank.last_kra_synced_stock, tank_id]
      )

      if (adjustmentId) {
        await query(
          `UPDATE stock_adjustments SET kra_sync_status = $1 WHERE id = $2`,
          [kraResult.success ? 'synced' : 'failed', adjustmentId]
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tankId: tank_id,
        previousStock,
        quantityReceived: quantity,
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
    console.error("[Stock Receive API] Error:", error)
    return NextResponse.json(
      { error: "Failed to receive stock", details: error.message },
      { status: 500 }
    )
  }
}
