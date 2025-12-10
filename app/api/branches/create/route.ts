import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      location,
      manager,
      email,
      phone,
      status,
      bhf_id,
      address,
      county,
      local_tax_office,
      device_token,
      storage_indices,
      user_id,
    } = body

    const client = await pool.connect()

    try {
      const id = crypto.randomUUID()

      const result = await client.query(
        `INSERT INTO branches (id, user_id, name, bhf_id, location, address, county, local_tax_office, manager, email, phone, status, device_token, storage_indices, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
         RETURNING *`,
        [
          id,
          user_id || null,
          name,
          bhf_id || null,
          location || null,
          address || null,
          county || null,
          local_tax_office || null,
          manager || null,
          email || null,
          phone || null,
          status || "active",
          device_token || null,
          storage_indices ? JSON.stringify(storage_indices) : null,
        ]
      )

      const branch = result.rows[0]

      return NextResponse.json({ success: true, branch })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[v0] Error in branch creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
