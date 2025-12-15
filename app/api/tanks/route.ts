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
      "SELECT * FROM tanks WHERE branch_id = $1 ORDER BY tank_name",
      [branchId]
    )

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching tanks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tanks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch_id, tank_name, fuel_type, capacity, current_stock, status } = body

    if (!branch_id || !tank_name || !fuel_type) {
      return NextResponse.json({ success: false, error: "branch_id, tank_name, and fuel_type are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO tanks (branch_id, tank_name, fuel_type, capacity, current_stock, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [branch_id, tank_name, fuel_type, capacity || 0, current_stock || 0, status || "active"]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("Error creating tank:", error)
    return NextResponse.json({ success: false, error: "Failed to create tank" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, current_stock, status } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Tank id is required" }, { status: 400 })
    }

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

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const result = await pool.query(
      `UPDATE tanks SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("Error updating tank:", error)
    return NextResponse.json({ success: false, error: "Failed to update tank" }, { status: 500 })
  }
}
