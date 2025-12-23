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
  console.log("[branches/POST] Starting branch creation request")
  
  let body: any
  try {
    body = await request.json()
    console.log("[branches/POST] Request body parsed successfully, name:", body?.name)
  } catch (parseError: any) {
    console.error("[branches/POST] Failed to parse request body:", parseError.message)
    return NextResponse.json(
      { success: false, error: "Invalid request body - could not parse JSON" },
      { status: 400 }
    )
  }

  try {
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
      status = "pending_onboarding"
    } = body

    if (!name) {
      console.log("[branches/POST] Missing branch name")
      return NextResponse.json(
        { success: false, error: "Branch name is required" },
        { status: 400 }
      )
    }

    let resolvedVendorId = vendor_id
    console.log("[branches/POST] Initial vendor_id:", vendor_id, "user_id:", user_id)

    if (!resolvedVendorId && user_id) {
      console.log("[branches/POST] Looking up vendor_id from existing branches for user:", user_id)
      const userBranch = await pool.query(
        'SELECT b.vendor_id FROM branches b WHERE b.user_id = $1 AND b.vendor_id IS NOT NULL LIMIT 1',
        [user_id]
      )
      if (userBranch.rows.length > 0) {
        resolvedVendorId = userBranch.rows[0].vendor_id
        console.log("[branches/POST] Found vendor_id from existing branch:", resolvedVendorId)
      } else {
        console.log("[branches/POST] No existing branches found for user")
      }
    }

    if (!resolvedVendorId && user_id) {
      console.log("[branches/POST] Looking up vendor by user email")
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [user_id])
      if (userResult.rows.length > 0) {
        const userEmail = userResult.rows[0].email
        console.log("[branches/POST] User email found:", userEmail)
        const vendorResult = await pool.query('SELECT id FROM vendors WHERE email = $1', [userEmail])
        if (vendorResult.rows.length > 0) {
          resolvedVendorId = vendorResult.rows[0].id
          console.log("[branches/POST] Found vendor_id from email match:", resolvedVendorId)
        } else {
          console.log("[branches/POST] No vendor found with matching email")
        }
      } else {
        console.log("[branches/POST] User not found in database")
      }
    }

    if (!resolvedVendorId) {
      console.log("[branches/POST] Could not resolve vendor_id - returning error")
      return NextResponse.json(
        { success: false, error: "Could not find vendor for this user. Please ensure your account is properly set up with a vendor." },
        { status: 400 }
      )
    }

    console.log("[branches/POST] Inserting branch with vendor_id:", resolvedVendorId)
    const result = await pool.query(
      `INSERT INTO branches (
        vendor_id, name, location, address, county, local_tax_office, manager,
        phone, email, kra_pin, bhf_id, storage_indices, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        resolvedVendorId,
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

    console.log("[branches/POST] Branch created successfully:", result.rows[0]?.id)
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error("[branches/POST] Error creating branch:", error.message, error.stack)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create branch" },
      { status: 500 }
    )
  }
}
