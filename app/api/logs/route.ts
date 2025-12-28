import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get("branch_id")
    const endpoint = searchParams.get("endpoint")
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

    const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(" AND ") : ""

    let sql: string
    const queryParams: any[] = []

    if (branchId || endpoint) {
      const branchConditions: string[] = []
      let branchParamIndex = conditions.length + 1
      
      if (branchId) {
        branchConditions.push(`branch_id = $${branchParamIndex}`)
        branchParamIndex++
      }
      if (endpoint) {
        branchConditions.push(`endpoint ILIKE $${branchParamIndex}`)
        branchParamIndex++
      }
      const branchWhereClause = branchConditions.length > 0 ? ` WHERE ` + branchConditions.join(" AND ") : ""

      sql = `
        SELECT * FROM (
          SELECT 
            id,
            endpoint,
            method,
            payload,
            response,
            status_code,
            error,
            duration_ms,
            created_at,
            external_endpoint,
            branch_id,
            'api' as log_source
          FROM api_logs
          ${whereClause}
          UNION ALL
          SELECT 
            id,
            endpoint,
            'POST' as method,
            request_payload as payload,
            response_payload as response,
            CASE WHEN status = 'success' THEN 200 ELSE 500 END as status_code,
            CASE WHEN status = 'error' THEN response_payload::text ELSE NULL END as error,
            NULL as duration_ms,
            created_at,
            endpoint as external_endpoint,
            branch_id,
            'branch' as log_source
          FROM branch_logs
          ${branchWhereClause}
        ) combined
        ORDER BY created_at DESC
        LIMIT $${branchParamIndex}
      `
      queryParams.push(...params, ...params, limit)
    } else {
      sql = `
        SELECT * FROM (
          SELECT 
            id,
            endpoint,
            method,
            payload,
            response,
            status_code,
            error,
            duration_ms,
            created_at,
            external_endpoint,
            branch_id,
            'api' as log_source
          FROM api_logs
          UNION ALL
          SELECT 
            id,
            endpoint,
            'POST' as method,
            request_payload as payload,
            response_payload as response,
            CASE WHEN status = 'success' THEN 200 ELSE 500 END as status_code,
            CASE WHEN status = 'error' THEN response_payload::text ELSE NULL END as error,
            NULL as duration_ms,
            created_at,
            endpoint as external_endpoint,
            branch_id,
            'branch' as log_source
          FROM branch_logs
        ) combined
        ORDER BY created_at DESC
        LIMIT $1
      `
      queryParams.push(limit)
    }

    const logs = await query(sql, queryParams)

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
