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
      const priceResult = await client.query(
        `SELECT price FROM fuel_prices 
         WHERE branch_id = $1 AND fuel_type = $2 
         ORDER BY effective_date DESC 
         LIMIT 1`,
        [branch_id, fuel_type]
      )

      if (priceResult.rows.length === 0) {
        return NextResponse.json(
          { error: `No price configured for ${fuel_type}` },
          { status: 400 }
        )
      }

      const unitPrice = parseFloat(priceResult.rows[0].price)
      const totalAmount = parseFloat(amount)
      const quantity = totalAmount / unitPrice

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

      return NextResponse.json({ 
        success: true, 
        sale: result.rows[0] 
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Sales API Error]:", error)
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 })
  }
}
