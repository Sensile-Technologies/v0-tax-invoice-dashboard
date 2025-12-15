import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const itemType = searchParams.get("item_type")
    const excludeType = searchParams.get("exclude_type")
    const status = searchParams.get("status")

    if (!branchId) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    let query = "SELECT * FROM items WHERE branch_id = $1"
    const params: any[] = [branchId]
    let paramIndex = 2

    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (itemType) {
      query += ` AND item_type = $${paramIndex}`
      params.push(itemType)
      paramIndex++
    }

    if (excludeType) {
      query += ` AND item_type != $${paramIndex}`
      params.push(excludeType)
      paramIndex++
    }

    query += " ORDER BY item_name"

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 })
  }
}
