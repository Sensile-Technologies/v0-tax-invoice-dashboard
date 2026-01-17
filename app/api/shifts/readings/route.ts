import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shiftId = searchParams.get("shift_id")

    if (!shiftId) {
      return NextResponse.json(
        { error: "shift_id is required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `SELECT sr.*, st.full_name as attendant_name
       FROM shift_readings sr
       LEFT JOIN staff st ON sr.incoming_attendant_id = st.id
       WHERE sr.shift_id = $1
       ORDER BY sr.created_at ASC`,
      [shiftId]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    console.error("Error fetching shift readings:", error)
    return NextResponse.json(
      { error: "Failed to fetch shift readings", details: error.message },
      { status: 500 }
    )
  }
}
