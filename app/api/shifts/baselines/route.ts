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

    // Only include nozzles that have a tank assigned
    const nozzlesResult = await pool.query(
      `SELECT id, initial_meter_reading FROM nozzles WHERE branch_id = $1 AND tank_id IS NOT NULL`,
      [branchId]
    )
    const nozzleBaselines: Record<string, number> = {}
    for (const n of nozzlesResult.rows) {
      nozzleBaselines[n.id] = parseFloat(n.initial_meter_reading) || 0
    }

    // Get closing readings only from completed shifts (not from sales or other sources)
    const prevNozzleReadings = await pool.query(
      `SELECT DISTINCT ON (sr.nozzle_id) sr.nozzle_id, sr.closing_reading 
       FROM shift_readings sr
       JOIN shifts s ON sr.shift_id = s.id
       WHERE sr.branch_id = $1 
         AND sr.reading_type = 'nozzle' 
         AND sr.nozzle_id IS NOT NULL
         AND s.status = 'completed'
       ORDER BY sr.nozzle_id, s.end_time DESC NULLS LAST`,
      [branchId]
    )
    for (const r of prevNozzleReadings.rows) {
      // Only update baselines for nozzles that have a tank assigned (already in nozzleBaselines)
      if (nozzleBaselines.hasOwnProperty(r.nozzle_id)) {
        const closingVal = parseFloat(r.closing_reading) || 0
        if (closingVal > (nozzleBaselines[r.nozzle_id] || 0)) {
          nozzleBaselines[r.nozzle_id] = closingVal
        }
      }
    }

    // Get tanks for this branch
    const tanksResult = await pool.query(
      `SELECT id FROM tanks WHERE branch_id = $1`,
      [branchId]
    )
    
    // CRITICAL: Tank opening reading = previous shift's CLOSING reading ONLY
    // This ensures tank continuity: Shift A closing = Shift B opening
    // NO fallback to tanks.current_stock - it must come from shift_readings
    const tankBaselines: Record<string, number> = {}
    
    // Get the most recent completed shift's closing readings for each tank
    const prevTankReadings = await pool.query(
      `SELECT DISTINCT ON (sr.tank_id) sr.tank_id, sr.closing_reading
       FROM shift_readings sr
       JOIN shifts s ON sr.shift_id = s.id
       WHERE sr.branch_id = $1 
         AND sr.reading_type = 'tank' 
         AND sr.tank_id IS NOT NULL
         AND sr.closing_reading IS NOT NULL
         AND s.status = 'completed'
       ORDER BY sr.tank_id, s.end_time DESC NULLS LAST`,
      [branchId]
    )
    
    // Build map of previous closing readings
    const prevClosings: Record<string, number> = {}
    for (const r of prevTankReadings.rows) {
      prevClosings[r.tank_id] = parseFloat(r.closing_reading) || 0
    }
    
    // For each tank, use previous closing reading; default to 0 if no prior readings exist
    for (const t of tanksResult.rows) {
      tankBaselines[t.id] = prevClosings[t.id] ?? 0
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
