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

    // Get the most recent completed shift for this branch
    const prevShiftResult = await pool.query(
      `SELECT id FROM shifts 
       WHERE branch_id = $1 AND status = 'completed'
       ORDER BY end_time DESC NULLS LAST
       LIMIT 1`,
      [branchId]
    )

    if (prevShiftResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        incoming_attendant_ids: []
      })
    }

    const prevShiftId = prevShiftResult.rows[0].id

    // Get incoming attendants from that shift's shift_readings
    const attendantsResult = await pool.query(
      `SELECT DISTINCT incoming_attendant_id 
       FROM shift_readings 
       WHERE shift_id = $1 
         AND incoming_attendant_id IS NOT NULL`,
      [prevShiftId]
    )

    const incoming_attendant_ids = attendantsResult.rows.map(r => r.incoming_attendant_id)

    return NextResponse.json({
      success: true,
      incoming_attendant_ids
    })

  } catch (error: any) {
    console.error("Error fetching incoming attendants:", error)
    return NextResponse.json(
      { error: "Failed to fetch incoming attendants", details: error.message },
      { status: 500 }
    )
  }
}
