import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, branch_id, shift_id, opening_cash, closing_cash } = body

    const client = await pool.connect()
    try {
      if (action === "start") {
        if (!branch_id) {
          return NextResponse.json({ error: "Branch ID required" }, { status: 400 })
        }

        const existingShift = await client.query(
          `SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active'`,
          [branch_id]
        )

        if (existingShift.rows.length > 0) {
          return NextResponse.json(
            { error: "An active shift already exists" },
            { status: 400 }
          )
        }

        const result = await client.query(
          `INSERT INTO shifts (branch_id, start_time, status, opening_cash)
           VALUES ($1, NOW(), 'active', $2)
           RETURNING *`,
          [branch_id, opening_cash || 0]
        )

        return NextResponse.json({
          success: true,
          shift: result.rows[0],
        })
      } else if (action === "end") {
        if (!shift_id) {
          return NextResponse.json({ error: "Shift ID required" }, { status: 400 })
        }

        const result = await client.query(
          `UPDATE shifts 
           SET status = 'completed', end_time = NOW(), closing_cash = $2
           WHERE id = $1
           RETURNING *`,
          [shift_id, closing_cash || 0]
        )

        return NextResponse.json({
          success: true,
          shift: result.rows[0],
        })
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Shift API Error]:", error)
    return NextResponse.json({ error: "Failed to manage shift" }, { status: 500 })
  }
}
