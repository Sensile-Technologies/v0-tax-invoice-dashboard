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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vendor_id,
      name,
      address,
      phone,
      email,
      kra_pin,
      bhf_id,
      status = "active"
    } = body

    if (!vendor_id || !name) {
      return NextResponse.json(
        { success: false, error: "Vendor ID and branch name are required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO branches (
        vendor_id, name, address, phone, email, kra_pin, bhf_id, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        vendor_id,
        name,
        address || null,
        phone || null,
        email || null,
        kra_pin || null,
        bhf_id || '00',
        status
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error("Error creating branch:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create branch" },
      { status: 500 }
    )
  }
}
