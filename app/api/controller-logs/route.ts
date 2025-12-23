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
      whereClause += ` AND pt.pts_id = $${paramIndex++}`
      params.push(ptsId)
    }

    if (startDate) {
      whereClause += ` AND pt.created_at >= $${paramIndex++}`
      params.push(startDate)
    }

    if (endDate) {
      whereClause += ` AND pt.created_at <= $${paramIndex++}`
      params.push(endDate + " 23:59:59")
    }

    const logsResult: any = await query(`
      SELECT 
        pt.id, pt.packet_id, pt.pts_id, pt.pump_number, pt.nozzle_number,
        pt.fuel_grade_id, pt.fuel_grade_name, pt.transaction_id,
        pt.volume, pt.tc_volume, pt.price, pt.amount,
        pt.total_volume, pt.total_amount, pt.tag, pt.user_id,
        pt.configuration_id, pt.transaction_start, pt.transaction_end,
        pt.processed, pt.sale_id, pt.created_at,
        pt.raw_packet,
        pce.raw_request,
        pce.raw_response
      FROM pump_transactions pt
      LEFT JOIN pump_callback_events pce ON pt.callback_event_id = pce.id
      WHERE 1=1 ${whereClause}
      ORDER BY pt.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, limit, offset])

    const countResult: any = await query(`
      SELECT COUNT(*) as total FROM pump_transactions pt WHERE 1=1 ${whereClause}
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
      FROM pump_transactions pt
      WHERE 1=1 ${whereClause}
    `, params)

    const logs = logsResult.rows || logsResult
    const count = countResult.rows || countResult
    const summary = summaryResult.rows || summaryResult

    return NextResponse.json({
      logs: logs,
      total: parseInt(count[0]?.total || "0"),
      summary: summary[0] || {},
      limit,
      offset
    })
  } catch (error: any) {
    console.error("[Controller Logs API] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
