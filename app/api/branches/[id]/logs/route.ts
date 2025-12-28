import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: branchId } = await params

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const logs = await query<any>(`
      SELECT 
        id,
        branch_id,
        log_type,
        endpoint,
        request_payload,
        response_payload,
        status,
        created_at
      FROM branch_logs
      WHERE branch_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [branchId])

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error("Error fetching branch logs:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 })
  }
}
