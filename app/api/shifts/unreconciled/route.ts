import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json(
        { error: "branch_id is required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `SELECT s.*, 
        st.full_name as cashier_name,
        st.username as cashier_username
       FROM shifts s
       LEFT JOIN staff st ON s.staff_id = st.id
       WHERE s.branch_id = $1 
         AND s.status = 'completed' 
         AND s.reconciliation_status = 'pending'
       ORDER BY s.end_time DESC
       LIMIT 1`,
      [branchId]
    )

    if (result.rows.length > 0) {
      return NextResponse.json({
        has_unreconciled: true,
        shift: result.rows[0]
      })
    }

    return NextResponse.json({
      has_unreconciled: false,
      shift: null
    })

  } catch (error: any) {
    console.error("Error checking unreconciled shifts:", error)
    return NextResponse.json(
      { error: "Failed to check unreconciled shifts", details: error.message },
      { status: 500 }
    )
  }
}
