import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const nozzleId = searchParams.get('nozzle_id')
    const limit = searchParams.get('limit') || '50'

    let query = 'SELECT * FROM sales WHERE 1=1'
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND branch_id = $${params.length}`
    }

    if (nozzleId) {
      params.push(nozzleId)
      query += ` AND nozzle_id = $${params.length}`
    }

    query += ' ORDER BY sale_date DESC'
    params.push(parseInt(limit))
    query += ` LIMIT $${params.length}`

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
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
      loyalty_customer_pin
    } = body

    if (!branch_id || !nozzle_id || !fuel_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await pool.query(
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

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Failed to create sale", details: error.message },
      { status: 500 }
    )
  }
}
