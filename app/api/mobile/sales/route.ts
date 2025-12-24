import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID required" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const today = new Date().toISOString().split('T')[0]

      const salesResult = await client.query(
        `SELECT * FROM sales 
         WHERE branch_id = $1 
         AND sale_date::date = $2::date
         ORDER BY sale_date DESC 
         LIMIT 50`,
        [branchId, today]
      )

      const shiftResult = await client.query(
        `SELECT * FROM shifts 
         WHERE branch_id = $1 AND status = 'active' 
         ORDER BY start_time DESC 
         LIMIT 1`,
        [branchId]
      )

      const nozzlesResult = await client.query(
        `SELECT n.id, CONCAT('D', d.id, 'N', n.nozzle_number) as name, n.fuel_type 
         FROM nozzles n
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         WHERE n.branch_id = $1 AND n.status = 'active'`,
        [branchId]
      )

      const fuelPricesResult = await client.query(
        `SELECT fuel_type, price FROM fuel_prices 
         WHERE branch_id = $1 
         ORDER BY effective_date DESC`,
        [branchId]
      )

      return NextResponse.json({
        sales: salesResult.rows || [],
        shift: shiftResult.rows[0] || null,
        nozzles: nozzlesResult.rows || [],
        fuel_prices: fuelPricesResult.rows || [],
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Sales API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      branch_id,
      shift_id,
      nozzle_id,
      fuel_type,
      amount,
      payment_method,
      customer_name,
      vehicle_number,
    } = body

    if (!branch_id || !fuel_type || !amount) {
      return NextResponse.json(
        { error: "Branch ID, fuel type, and amount are required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const priceResult = await client.query(
        `SELECT price FROM fuel_prices 
         WHERE branch_id = $1 AND fuel_type = $2 
         ORDER BY effective_date DESC 
         LIMIT 1`,
        [branch_id, fuel_type]
      )

      if (priceResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: `No price configured for ${fuel_type}` },
          { status: 400 }
        )
      }

      const unitPrice = parseFloat(priceResult.rows[0].price)
      const totalAmount = parseFloat(amount)
      const quantity = totalAmount / unitPrice

      // Find the tank to deduct from - first try via nozzle, then by fuel type
      let tankId = null
      let tankName = null
      let previousStock = 0
      let newStock = 0

      if (nozzle_id) {
        // Get tank via nozzle -> dispenser -> tank
        const nozzleTankResult = await client.query(
          `SELECT t.id, t.tank_name, t.current_stock 
           FROM nozzles n
           LEFT JOIN dispensers d ON n.dispenser_id = d.id
           LEFT JOIN tanks t ON d.tank_id = t.id
           WHERE n.id = $1 AND t.id IS NOT NULL`,
          [nozzle_id]
        )
        if (nozzleTankResult.rows.length > 0) {
          tankId = nozzleTankResult.rows[0].id
          tankName = nozzleTankResult.rows[0].tank_name
          previousStock = parseFloat(nozzleTankResult.rows[0].current_stock) || 0
        }
      }

      // Fallback: find tank by fuel type if not found via nozzle
      if (!tankId) {
        const tankResult = await client.query(
          `SELECT id, tank_name, current_stock 
           FROM tanks 
           WHERE branch_id = $1 AND fuel_type ILIKE $2 AND status = 'active'
           ORDER BY current_stock DESC 
           LIMIT 1`,
          [branch_id, `%${fuel_type}%`]
        )
        if (tankResult.rows.length > 0) {
          tankId = tankResult.rows[0].id
          tankName = tankResult.rows[0].tank_name
          previousStock = parseFloat(tankResult.rows[0].current_stock) || 0
        }
      }

      // Deduct from tank if found
      let tankUpdate = null
      if (tankId) {
        newStock = Math.max(0, previousStock - quantity)
        await client.query(
          `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
          [newStock, tankId]
        )
        tankUpdate = {
          tankId,
          tankName,
          previousStock,
          newStock,
          quantityDeducted: quantity
        }
      }

      const invoiceNumber = `INV-${Date.now()}`
      const receiptNumber = `RCP-${Date.now()}`

      const result = await client.query(
        `INSERT INTO sales (
          branch_id, shift_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *`,
        [
          branch_id,
          shift_id || null,
          nozzle_id || null,
          fuel_type,
          quantity,
          unitPrice,
          totalAmount,
          payment_method || 'cash',
          customer_name || null,
          vehicle_number || null,
          invoiceNumber,
          receiptNumber,
        ]
      )

      await client.query('COMMIT')

      return NextResponse.json({ 
        success: true, 
        sale: result.rows[0],
        tankUpdate
      })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Sales API Error]:", error)
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 })
  }
}
