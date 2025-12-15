import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    const result = await pool.query(
      "SELECT * FROM loyalty_transactions WHERE branch_id = $1 ORDER BY transaction_date DESC",
      [branchId]
    )

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching loyalty transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch loyalty transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branch_id, 
      customer_name, 
      customer_pin, 
      transaction_type, 
      points_earned, 
      points_redeemed, 
      transaction_amount 
    } = body

    if (!branch_id || !customer_name) {
      return NextResponse.json({ success: false, error: "branch_id and customer_name are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO loyalty_transactions (branch_id, customer_name, customer_pin, transaction_type, points_earned, points_redeemed, transaction_amount, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [branch_id, customer_name, customer_pin, transaction_type || "purchase", points_earned || 0, points_redeemed || 0, transaction_amount || 0]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("Error creating loyalty transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to create loyalty transaction" }, { status: 500 })
  }
}
