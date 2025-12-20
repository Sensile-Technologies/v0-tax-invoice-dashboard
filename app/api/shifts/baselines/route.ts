import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')

    if (!branchId) {
      return NextResponse.json(
        { error: "branch_id is required" },
        { status: 400 }
      )
    }

    const nozzlesResult = await pool.query(
      `SELECT id, initial_meter_reading FROM nozzles WHERE branch_id = $1`,
      [branchId]
    )
    const nozzleBaselines: Record<string, number> = {}
    for (const n of nozzlesResult.rows) {
      nozzleBaselines[n.id] = parseFloat(n.initial_meter_reading) || 0
    }

    const prevNozzleReadings = await pool.query(
      `SELECT DISTINCT ON (nozzle_id) nozzle_id, closing_reading 
       FROM shift_readings 
       WHERE branch_id = $1 AND reading_type = 'nozzle' AND nozzle_id IS NOT NULL
       ORDER BY nozzle_id, created_at DESC`,
      [branchId]
    )
    for (const r of prevNozzleReadings.rows) {
      const closingVal = parseFloat(r.closing_reading) || 0
      if (closingVal > (nozzleBaselines[r.nozzle_id] || 0)) {
        nozzleBaselines[r.nozzle_id] = closingVal
      }
    }

    const tanksResult = await pool.query(
      `SELECT id, current_stock FROM tanks WHERE branch_id = $1`,
      [branchId]
    )
    const tankBaselines: Record<string, number> = {}
    for (const t of tanksResult.rows) {
      tankBaselines[t.id] = parseFloat(t.current_stock) || 0
    }

    return NextResponse.json({
      success: true,
      nozzleBaselines,
      tankBaselines
    })

  } catch (error: any) {
    console.error("Error fetching baselines:", error)
    return NextResponse.json(
      { error: "Failed to fetch baselines", details: error.message },
      { status: 500 }
    )
  }
}
