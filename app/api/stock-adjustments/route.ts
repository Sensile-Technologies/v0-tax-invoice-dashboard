import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const tankId = searchParams.get("tank_id")

    let query = "SELECT * FROM stock_adjustments WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      query += ` AND branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (tankId) {
      query += ` AND tank_id = $${paramIndex}`
      params.push(tankId)
      paramIndex++
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching stock adjustments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stock adjustments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tank_id, 
      branch_id, 
      adjustment_type, 
      quantity, 
      previous_stock, 
      new_stock, 
      reason, 
      requested_by, 
      approval_status 
    } = body

    if (!tank_id || !branch_id || !adjustment_type) {
      return NextResponse.json({ success: false, error: "tank_id, branch_id, and adjustment_type are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO stock_adjustments (tank_id, branch_id, adjustment_type, quantity, previous_stock, new_stock, reason, requested_by, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [tank_id, branch_id, adjustment_type, quantity || 0, previous_stock || 0, new_stock || 0, reason, requested_by, approval_status || "pending"]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    return NextResponse.json({ success: false, error: "Failed to create stock adjustment" }, { status: 500 })
  }
}
