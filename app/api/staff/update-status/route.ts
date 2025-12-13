import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { staffId, status } = await request.json()

    if (!staffId || !status) {
      return NextResponse.json(
        { error: "Staff ID and status are required" },
        { status: 400 }
      )
    }

    const result = await query(
      `UPDATE staff SET status = $1 WHERE id = $2 RETURNING id`,
      [status, staffId]
    )

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating staff status:", error)
    return NextResponse.json(
      { error: "Failed to update status", details: error.message },
      { status: 500 }
    )
  }
}
