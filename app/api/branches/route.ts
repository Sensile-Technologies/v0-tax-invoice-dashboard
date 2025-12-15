import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")

    let query = "SELECT * FROM branches WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += " ORDER BY name"

    if (limit) {
      query += ` LIMIT $${paramIndex}`
      params.push(parseInt(limit))
    }

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch branches" }, { status: 500 })
  }
}
