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
      user_id,
      name,
      location,
      address,
      county,
      local_tax_office,
      manager,
      phone,
      email,
      kra_pin,
      bhf_id,
      storage_indices,
      status = "active"
    } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Branch name is required" },
        { status: 400 }
      )
    }

    let resolvedVendorId = vendor_id

    if (!resolvedVendorId && user_id) {
      const userBranch = await pool.query(
        'SELECT b.vendor_id FROM branches b WHERE b.user_id = $1 AND b.vendor_id IS NOT NULL LIMIT 1',
        [user_id]
      )
      if (userBranch.rows.length > 0) {
        resolvedVendorId = userBranch.rows[0].vendor_id
      }
    }

    if (!resolvedVendorId) {
      return NextResponse.json(
        { success: false, error: "Could not find vendor for this user. Please ensure your account is properly set up." },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO branches (
        vendor_id, name, location, address, county, local_tax_office, manager,
        phone, email, kra_pin, bhf_id, storage_indices, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        resolvedVendorId || null,
        name,
        location || null,
        address || null,
        county || null,
        local_tax_office || null,
        manager || null,
        phone || null,
        email || null,
        kra_pin || null,
        bhf_id || '00',
        storage_indices ? JSON.stringify(storage_indices) : null,
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
