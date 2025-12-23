import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")
    const ptsId = searchParams.get("pts_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    let whereClause = ""
    const params: any[] = []
    let paramIndex = 1

    if (ptsId) {
      whereClause += ` AND pts_id = $${paramIndex++}`
      params.push(ptsId)
    }

    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`
      params.push(startDate)
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`
      params.push(endDate + " 23:59:59")
    }

    const logsResult: any = await query(`
      SELECT 
        id, packet_id, pts_id, pump_number, nozzle_number,
        fuel_grade_id, fuel_grade_name, transaction_id,
        volume, tc_volume, price, amount,
        total_volume, total_amount, tag, user_id,
        configuration_id, transaction_start, transaction_end,
        processed, sale_id, created_at
      FROM pump_transactions
      WHERE 1=1 ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, limit, offset])

    const countResult: any = await query(`
      SELECT COUNT(*) as total FROM pump_transactions WHERE 1=1 ${whereClause}
    `, params)

    const summaryResult: any = await query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(volume) as total_volume,
        SUM(amount) as total_amount,
        COUNT(DISTINCT pts_id) as unique_controllers,
        COUNT(DISTINCT pump_number) as unique_pumps,
        COUNT(CASE WHEN processed = true THEN 1 END) as processed_count,
        COUNT(CASE WHEN processed = false THEN 1 END) as pending_count
      FROM pump_transactions
      WHERE 1=1 ${whereClause}
    `, params)

    return NextResponse.json({
      logs: logsResult.rows || logsResult,
      total: parseInt((logsResult.rows || logsResult)[0]?.total || countResult.rows?.[0]?.total || countResult[0]?.total || "0"),
      summary: (summaryResult.rows || summaryResult)[0] || {},
      limit,
      offset
    })
  } catch (error: any) {
    console.error("[Controller Logs API] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
