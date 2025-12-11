import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(`
      SELECT id, bhf_id, bhf_nm, address, status
      FROM branches
      WHERE vendor_id = $1
      ORDER BY bhf_id
    `, [id])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching vendor branches:", error)
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
  }
}
