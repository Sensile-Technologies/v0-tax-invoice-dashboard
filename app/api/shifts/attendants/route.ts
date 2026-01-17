import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const shiftId = searchParams.get("shift_id")
    const branchId = searchParams.get("branch_id")

    if (!shiftId || !branchId) {
      return NextResponse.json(
        { error: "shift_id and branch_id are required" },
        { status: 400 }
      )
    }

    const accessCheck = await pool.query(
      `SELECT 1 FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1 AND s.branch_id = $2
       AND (b.vendor_id = $3 OR s.branch_id = $4)`,
      [shiftId, branchId, session.vendor_id, session.branch_id]
    )
    
    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get attendants from shift_readings (staff assigned to nozzles during this shift)
    // NOT from sales - reconciliation should be independent of sales records
    const attendantsResult = await pool.query(
      `SELECT DISTINCT sr.staff_id, st.id, st.full_name, st.username
       FROM shift_readings sr
       JOIN staff st ON sr.staff_id = st.id
       WHERE sr.shift_id = $1 AND sr.staff_id IS NOT NULL
       UNION
       SELECT DISTINCT s.staff_id, st.id, st.full_name, st.username
       FROM shifts s
       JOIN staff st ON s.staff_id = st.id
       WHERE s.id = $1 AND s.staff_id IS NOT NULL
       ORDER BY full_name`,
      [shiftId]
    )

    const attendants = attendantsResult.rows.map((row) => ({
      id: row.id,
      name: row.full_name || row.username || "Unknown"
    }))

    // No auto-population of payments from sales - reconciliation is manual entry only
    const appPayments: Record<string, number> = {}

    return NextResponse.json({
      success: true,
      attendants,
      appPayments
    })
  } catch (error: any) {
    console.error("Error fetching shift attendants:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendants", details: error.message },
      { status: 500 }
    )
  }
}
