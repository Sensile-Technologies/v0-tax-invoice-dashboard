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
