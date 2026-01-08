import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { syncStockWithKRA } from "@/lib/kra-stock-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    const tanks = await query(
      `SELECT t.id, t.branch_id, t.tank_name, t.capacity, t.current_stock, t.status, 
              t.kra_item_cd, t.item_id, t.kra_sync_status, t.last_kra_synced_stock, 
              t.created_at, t.updated_at, i.item_name, i.item_name as fuel_type
       FROM tanks t 
       JOIN items i ON t.item_id = i.id 
       WHERE t.branch_id = $1 
       ORDER BY t.tank_name`,
      [branchId]
    )

    return NextResponse.json({ success: true, data: tanks })
  } catch (error) {
    console.error("Error fetching tanks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tanks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branch_id, 
      tank_name, 
      capacity, 
      current_stock, 
      status,
      kra_item_cd,
      sync_to_kra,
      unit_price,
      item_id
    } = body

    if (!branch_id || !tank_name || !item_id) {
      return NextResponse.json({ success: false, error: "branch_id, tank_name, and item_id are required" }, { status: 400 })
    }

    // Get item_name for KRA sync
    const itemResult = await query("SELECT item_name FROM items WHERE id = $1", [item_id])
    const itemName = itemResult.length > 0 ? itemResult[0].item_name : 'Unknown'

    const result = await query(
      `INSERT INTO tanks (branch_id, tank_name, capacity, current_stock, status, kra_item_cd, item_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [branch_id, tank_name, capacity || 0, current_stock || 0, status || "active", kra_item_cd || null, item_id]
    )

    const tank = result[0]
    let kraResult = null

    if (sync_to_kra && current_stock > 0) {
      console.log(`[Tanks API] Syncing initial stock of ${current_stock} for tank ${tank.id} to KRA`)
      
      kraResult = await syncStockWithKRA(
        branch_id,
        "initial_stock",
        [{
          tankId: tank.id,
          quantity: current_stock,
          unitPrice: unit_price || 0,
          itemCode: kra_item_cd,
          itemName: itemName
        }],
        { remark: `Initial stock for tank: ${tank_name}` }
      )

      if (kraResult.success) {
        await query(
          `UPDATE tanks SET kra_sync_status = 'synced', last_kra_synced_stock = $1 WHERE id = $2`,
          [current_stock, tank.id]
        )
      } else {
        await query(
          `UPDATE tanks SET kra_sync_status = 'failed' WHERE id = $1`,
          [tank.id]
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: tank,
      kraSync: kraResult ? {
        synced: kraResult.success,
        movementId: kraResult.movementId,
        error: kraResult.error
      } : null
    })
  } catch (error) {
    console.error("Error creating tank:", error)
    return NextResponse.json({ success: false, error: "Failed to create tank" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, current_stock, status, sync_to_kra, adjustment_type, unit_price, item_id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Tank id is required" }, { status: 400 })
    }

    const existingTank = await query("SELECT * FROM tanks WHERE id = $1", [id])
    if (existingTank.length === 0) {
      return NextResponse.json({ success: false, error: "Tank not found" }, { status: 404 })
    }

    const tank = existingTank[0]
    const previousStock = tank.current_stock || 0

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (current_stock !== undefined) {
      updates.push(`current_stock = $${paramIndex}`)
      values.push(current_stock)
      paramIndex++
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (item_id !== undefined) {
      updates.push(`item_id = $${paramIndex}`)
      values.push(item_id || null)
      paramIndex++
      
      // When item_id is assigned, also sync the kra_item_cd from the item
      if (item_id) {
        const itemResult = await query("SELECT item_code FROM items WHERE id = $1", [item_id])
        if (itemResult.length > 0 && itemResult[0].item_code) {
          updates.push(`kra_item_cd = $${paramIndex}`)
          values.push(itemResult[0].item_code)
          paramIndex++
        }
      } else {
        // If item_id is being cleared, also clear kra_item_cd
        updates.push(`kra_item_cd = $${paramIndex}`)
        values.push(null)
        paramIndex++
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)

    values.push(id)
    const result = await query(
      `UPDATE tanks SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    const updatedTank = result[0]
    let kraResult = null

    if (sync_to_kra && current_stock !== undefined && current_stock !== previousStock) {
      const stockDiff = current_stock - previousStock
      const movementType = adjustment_type || (stockDiff > 0 ? "stock_receive" : "stock_adjustment")
      
      console.log(`[Tanks API] Syncing stock ${movementType} of ${Math.abs(stockDiff)} for tank ${id} to KRA`)
      
      kraResult = await syncStockWithKRA(
        tank.branch_id,
        movementType,
        [{
          tankId: id,
          quantity: Math.abs(stockDiff),
          unitPrice: unit_price || 0,
          itemCode: tank.kra_item_cd,
          itemName: tank.item_name || 'Fuel'
        }],
        { remark: `Stock ${movementType}: ${previousStock} -> ${current_stock}` }
      )

      if (kraResult.success) {
        await query(
          `UPDATE tanks SET kra_sync_status = 'synced', last_kra_synced_stock = $1 WHERE id = $2`,
          [current_stock, id]
        )
      } else {
        await query(
          `UPDATE tanks SET kra_sync_status = 'failed' WHERE id = $1`,
          [id]
        )
      }

      await query(
        `INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tank.branch_id, id, movementType, Math.abs(stockDiff), previousStock, current_stock, `API adjustment`, 'approved']
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedTank,
      kraSync: kraResult ? {
        synced: kraResult.success,
        movementId: kraResult.movementId,
        error: kraResult.error
      } : null
    })
  } catch (error) {
    console.error("Error updating tank:", error)
    return NextResponse.json({ success: false, error: "Failed to update tank" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Tank id is required" }, { status: 400 })
    }

    await query("DELETE FROM tanks WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tank:", error)
    return NextResponse.json({ success: false, error: "Failed to delete tank" }, { status: 500 })
  }
}
