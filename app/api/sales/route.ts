import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { syncStockWithKRA } from "@/lib/kra-stock-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const nozzleId = searchParams.get('nozzle_id')
    const limit = searchParams.get('limit') || '50'

    let sql = 'SELECT * FROM sales WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      sql += ` AND branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (nozzleId) {
      sql += ` AND nozzle_id = $${paramIndex}`
      params.push(nozzleId)
      paramIndex++
    }

    sql += ' ORDER BY sale_date DESC'
    sql += ` LIMIT $${paramIndex}`
    params.push(parseInt(limit))

    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branch_id,
      shift_id,
      nozzle_id,
      fuel_type,
      quantity,
      unit_price,
      total_amount,
      payment_method,
      customer_name,
      vehicle_number,
      customer_pin,
      invoice_number,
      meter_reading_after,
      transmission_status,
      receipt_number,
      is_loyalty_sale,
      loyalty_customer_name,
      loyalty_customer_pin,
      sync_to_kra = true,
      deduct_from_tank = true
    } = body

    if (!branch_id || !nozzle_id || !fuel_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO sales (
        branch_id, shift_id, nozzle_id, fuel_type, quantity, unit_price, 
        total_amount, payment_method, customer_name, vehicle_number, customer_pin,
        invoice_number, meter_reading_after, transmission_status, receipt_number,
        is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin, sale_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      RETURNING *`,
      [
        branch_id, shift_id, nozzle_id, fuel_type, quantity, unit_price,
        total_amount, payment_method, customer_name, vehicle_number, customer_pin,
        invoice_number, meter_reading_after, transmission_status || 'pending', receipt_number,
        is_loyalty_sale || false, loyalty_customer_name, loyalty_customer_pin
      ]
    )

    const sale = result[0]
    let kraResult = null
    let tankUpdate = null

    if (quantity && quantity > 0) {
      const tankResult = await query(
        `SELECT * FROM tanks WHERE branch_id = $1 AND fuel_type ILIKE $2 AND status = 'active' ORDER BY current_stock DESC LIMIT 1`,
        [branch_id, `%${fuel_type}%`]
      )

      if (tankResult.length > 0) {
        const tank = tankResult[0]
        
        if (!tank.kra_item_cd) {
          return NextResponse.json(
            { error: `Tank "${tank.tank_name}" is not mapped to an item. Please map the tank to an item in the item list before selling.` },
            { status: 400 }
          )
        }
        const previousStock = tank.current_stock || 0
        const newStock = Math.max(0, previousStock - quantity)

        if (deduct_from_tank) {
          await query(
            `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
            [newStock, tank.id]
          )

          tankUpdate = {
            tankId: tank.id,
            tankName: tank.tank_name,
            previousStock,
            newStock,
            quantityDeducted: quantity
          }
        }

        if (sync_to_kra) {
          console.log(`[Sales API] Syncing sale of ${quantity} ${fuel_type} to KRA for branch ${branch_id}`)
          
          kraResult = await syncStockWithKRA(
            branch_id,
            "sale",
            [{
              tankId: tank.id,
              quantity: quantity,
              unitPrice: unit_price || 0,
              itemCode: tank.kra_item_cd,
              itemName: fuel_type
            }],
            { 
              customerId: customer_pin,
              customerName: customer_name,
              remark: `Sale: ${quantity}L ${fuel_type} - Invoice: ${invoice_number || 'N/A'}`
            }
          )

          await query(
            `UPDATE tanks SET kra_sync_status = $1 WHERE id = $2`,
            [kraResult.success ? 'synced' : 'failed', tank.id]
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: sale,
      tankUpdate,
      kraSync: kraResult ? {
        synced: kraResult.success,
        movementId: kraResult.movementId,
        error: kraResult.error
      } : null
    })

  } catch (error: any) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Failed to create sale", details: error.message },
      { status: 500 }
    )
  }
}
