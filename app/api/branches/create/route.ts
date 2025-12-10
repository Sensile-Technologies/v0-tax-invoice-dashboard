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

      let finalBhfId = bhf_id

      if (bhf_id) {
        const existingBhf = await client.query(
          "SELECT id FROM branches WHERE bhf_id = $1",
          [bhf_id]
        )
        if (existingBhf.rows.length > 0) {
          const maxBhf = await client.query(
            "SELECT bhf_id FROM branches ORDER BY bhf_id DESC LIMIT 1"
          )
          const maxNum = maxBhf.rows.length > 0 ? parseInt(maxBhf.rows[0].bhf_id, 10) : 0
          finalBhfId = String(maxNum + 1).padStart(2, '0')
        }
      } else {
        const maxBhf = await client.query(
          "SELECT bhf_id FROM branches ORDER BY bhf_id DESC LIMIT 1"
        )
        const maxNum = maxBhf.rows.length > 0 ? parseInt(maxBhf.rows[0].bhf_id, 10) : 0
        finalBhfId = String(maxNum + 1).padStart(2, '0')
      }

      const result = await client.query(
        `INSERT INTO branches (id, user_id, name, bhf_id, location, address, county, local_tax_office, manager, email, phone, status, device_token, storage_indices, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
         RETURNING *`,
        [
          id,
          user_id || null,
          name,
          finalBhfId,
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
