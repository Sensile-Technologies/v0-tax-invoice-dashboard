import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { branch_id, hardware_type, serial_number } = body

    const client = await pool.connect()

    try {
      const id = crypto.randomUUID()
      const result = await client.query(
        `INSERT INTO hardware (id, branch_id, hardware_type, serial_number, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
         RETURNING *`,
        [id, branch_id, hardware_type, serial_number]
      )

      return NextResponse.json({ success: true, hardware: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[v0] Error in hardware creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
