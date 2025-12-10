import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { branchId } = await request.json()

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query("DELETE FROM branches WHERE id = $1", [branchId])
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Branch Delete Error]:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
