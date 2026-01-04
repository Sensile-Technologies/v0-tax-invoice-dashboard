import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    let query = "SELECT * FROM stock_transfers WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      query += ` AND (from_branch_id = $${paramIndex} OR to_branch_id = $${paramIndex})`
      params.push(branchId)
      paramIndex++
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching stock transfers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock transfers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      from_tank_id, 
      to_tank_id, 
      from_branch_id, 
      to_branch_id, 
      quantity, 
      requested_by, 
      notes, 
      approval_status 
    } = body

    if (!from_tank_id || !to_tank_id || !from_branch_id) {
      return NextResponse.json({ success: false, error: "from_tank_id, to_tank_id, and from_branch_id are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO stock_transfers (from_tank_id, to_tank_id, from_branch_id, to_branch_id, quantity, requested_by, notes, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [from_tank_id, to_tank_id, from_branch_id, to_branch_id || from_branch_id, quantity || 0, requested_by, notes, approval_status || "pending"]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("Error creating stock transfer:", error)
    return NextResponse.json({ success: false, error: "Failed to create stock transfer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const { transfer_id, action, approved_by, to_previous_stock, to_new_stock } = body

    if (!transfer_id || !action) {
      return NextResponse.json({ success: false, error: "transfer_id and action are required" }, { status: 400 })
    }

    const transferResult = await client.query(
      "SELECT * FROM stock_transfers WHERE id = $1",
      [transfer_id]
    )

    if (transferResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Transfer not found" }, { status: 404 })
    }

    const transfer = transferResult.rows[0]

    if (transfer.status === 'completed') {
      return NextResponse.json({ success: false, error: "Transfer already completed" }, { status: 400 })
    }

    await client.query('BEGIN')

    if (action === 'accept') {
      // Get source tank
      const fromTank = await client.query("SELECT * FROM tanks WHERE id = $1", [transfer.from_tank_id])
      if (fromTank.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ success: false, error: "Source tank not found" }, { status: 404 })
      }

      // Get destination tank
      const toTank = await client.query("SELECT * FROM tanks WHERE id = $1", [transfer.to_tank_id])
      if (toTank.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ success: false, error: "Destination tank not found" }, { status: 404 })
      }

      const transferQty = parseFloat(transfer.quantity)
      
      // Source tank calculations
      const fromPreviousStock = parseFloat(fromTank.rows[0].current_stock) || 0
      
      // Check if source tank has sufficient stock
      if (fromPreviousStock < transferQty) {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient stock in source tank. Available: ${fromPreviousStock.toFixed(2)}L. Transfer quantity: ${transferQty}L.` 
        }, { status: 400 })
      }
      
      const fromNewStock = fromPreviousStock - transferQty
      
      // Destination tank calculations
      const toPreviousStock = parseFloat(toTank.rows[0].current_stock) || 0
      const tankCapacity = parseFloat(toTank.rows[0].capacity) || 0
      const toNewStock = toPreviousStock + transferQty

      // Check if transfer would exceed destination tank capacity (100%)
      if (tankCapacity > 0 && toNewStock > tankCapacity) {
        await client.query('ROLLBACK')
        const availableSpace = tankCapacity - toPreviousStock
        return NextResponse.json({ 
          success: false, 
          error: `Cannot accept transfer. Tank capacity is ${tankCapacity}L. Current stock: ${toPreviousStock}L. Available space: ${availableSpace.toFixed(2)}L. Transfer quantity: ${transfer.quantity}L would exceed capacity.` 
        }, { status: 400 })
      }

      // Update source tank (deduct stock)
      await client.query(
        "UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2",
        [fromNewStock, transfer.from_tank_id]
      )

      // Update destination tank (add stock)
      await client.query(
        "UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2",
        [toNewStock, transfer.to_tank_id]
      )

      // Insert stock_adjustments for source tank (transfer_out)
      await client.query(
        `INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status)
         VALUES ($1, $2, 'transfer_out', $3, $4, $5, $6, $7, 'approved')`,
        [transfer.from_branch_id, transfer.from_tank_id, transferQty, fromPreviousStock, fromNewStock, 
         `Transfer to ${toTank.rows[0].tank_name || 'another tank'}: ${transfer.notes || ''}`, approved_by]
      )

      // Insert stock_adjustments for destination tank (transfer_in)
      await client.query(
        `INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status)
         VALUES ($1, $2, 'transfer_in', $3, $4, $5, $6, $7, 'approved')`,
        [transfer.to_branch_id, transfer.to_tank_id, transferQty, toPreviousStock, toNewStock,
         `Transfer from ${fromTank.rows[0].tank_name || 'another tank'}: ${transfer.notes || ''}`, approved_by]
      )

      // Update the transfer record
      await client.query(
        `UPDATE stock_transfers 
         SET status = 'completed', 
             approval_status = 'approved',
             approved_by = $1, 
             approved_at = NOW(),
             from_previous_stock = $2,
             from_new_stock = $3,
             to_previous_stock = $4,
             to_new_stock = $5,
             updated_at = NOW()
         WHERE id = $6`,
        [approved_by, fromPreviousStock, fromNewStock, toPreviousStock, toNewStock, transfer_id]
      )

      await client.query('COMMIT')

      return NextResponse.json({ 
        success: true, 
        data: { 
          transfer_id, 
          fromPreviousStock,
          fromNewStock,
          toPreviousStock, 
          toNewStock, 
          quantity: transfer.quantity 
        } 
      })
    } else if (action === 'reject') {
      await client.query(
        `UPDATE stock_transfers 
         SET status = 'rejected', 
             approval_status = 'rejected',
             approved_by = $1, 
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [approved_by, transfer_id]
      )

      await client.query('COMMIT')

      return NextResponse.json({ success: true, message: "Transfer rejected" })
    } else {
      await client.query('ROLLBACK')
      return NextResponse.json({ success: false, error: "Invalid action. Use 'accept' or 'reject'" }, { status: 400 })
    }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error("Error updating stock transfer:", error)
    return NextResponse.json({ success: false, error: "Failed to update stock transfer" }, { status: 500 })
  } finally {
    client.release()
  }
}
