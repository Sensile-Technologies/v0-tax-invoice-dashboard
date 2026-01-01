import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get("branch_id")
    const endpoint = searchParams.get("endpoint")
    const logType = searchParams.get("log_type")
    const limit = parseInt(searchParams.get("limit") || "500")

    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      conditions.push(`branch_id = $${paramIndex}`)
      params.push(branchId)
      paramIndex++
    }

    if (endpoint) {
      conditions.push(`endpoint ILIKE $${paramIndex}`)
      params.push(`%${endpoint}%`)
      paramIndex++
    }

    if (logType) {
      conditions.push(`log_type = $${paramIndex}`)
      params.push(logType)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(" AND ") : ""

    const sql = `
      SELECT 
        id,
        branch_id,
        log_type,
        endpoint,
        request_payload as payload,
        response_payload as response,
        status,
        CASE WHEN status = 'success' THEN 200 ELSE 500 END as status_code,
        created_at
      FROM branch_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex}
    `
    params.push(limit)

    const logs = await query(sql, params)

    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error("[Logs API] Error fetching logs:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get("branch_id")

    if (branchId) {
      await query(`DELETE FROM branch_logs WHERE branch_id = $1`, [branchId])
    } else {
      await query(`DELETE FROM branch_logs WHERE id IS NOT NULL`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Logs API] Error clearing logs:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
