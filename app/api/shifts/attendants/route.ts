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

    const attendantsResult = await pool.query(
      `SELECT DISTINCT s.staff_id, st.id, st.full_name, st.username
       FROM sales s
       JOIN staff st ON s.staff_id = st.id
       WHERE s.shift_id = $1 AND s.branch_id = $2 AND s.staff_id IS NOT NULL
       ORDER BY st.full_name`,
      [shiftId, branchId]
    )

    const attendants = attendantsResult.rows.map((row) => ({
      id: row.id,
      name: row.full_name || row.username || "Unknown"
    }))

    const appPaymentsResult = await pool.query(
      `SELECT staff_id, SUM(total_amount) as total
       FROM sales
       WHERE shift_id = $1 AND branch_id = $2 
         AND staff_id IS NOT NULL
         AND payment_method IN ('mpesa', 'card', 'mobile_money')
       GROUP BY staff_id`,
      [shiftId, branchId]
    )

    const appPayments: Record<string, number> = {}
    for (const row of appPaymentsResult.rows) {
      appPayments[row.staff_id] = parseFloat(row.total) || 0
    }

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
