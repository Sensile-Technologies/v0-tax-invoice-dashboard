import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get("branch_id")
    const endpoint = searchParams.get("endpoint")
    const limit = parseInt(searchParams.get("limit") || "500")

    let sql = `SELECT * FROM api_logs`
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

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ")
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`
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
      await query(`DELETE FROM api_logs WHERE branch_id = $1`, [branchId])
    } else {
      await query(`DELETE FROM api_logs WHERE id IS NOT NULL`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Logs API] Error clearing logs:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
