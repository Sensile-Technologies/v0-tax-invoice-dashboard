import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { branchId, status } = await request.json()

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const newStatus = status === "active" ? "inactive" : "active"

    const client = await pool.connect()

    try {
      await client.query(
        "UPDATE branches SET status = $1, updated_at = NOW() WHERE id = $2",
        [newStatus, branchId]
      )
      return NextResponse.json({ success: true, status: newStatus })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Branch Deactivate Error]:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
