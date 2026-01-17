import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const { vendor_id, branch_id, role } = session

    if (!vendor_id) {
      return NextResponse.json({ error: "Vendor ID required" }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const filterBranchId = searchParams.get("branchId")

    const effectiveBranchId = ["cashier", "supervisor", "manager"].includes(role)
      ? branch_id
      : filterBranchId || null

    let query = `
      SELECT 
        se.id,
        se.shift_id,
        se.branch_id,
        se.expense_account_id,
        se.amount,
        se.description,
        se.created_at,
        ea.account_name as category,
        b.name as branch_name,
        s.start_time as shift_start,
        s.end_time as shift_end,
        st.name as recorded_by
      FROM shift_expenses se
      JOIN expense_accounts ea ON se.expense_account_id = ea.id
      JOIN branches b ON se.branch_id = b.id
      JOIN shifts s ON se.shift_id = s.id
      LEFT JOIN staff st ON se.created_by = st.id
      WHERE b.vendor_id = $1
    `
    const params: any[] = [vendor_id]
    let paramIndex = 2

    if (effectiveBranchId) {
      query += ` AND se.branch_id = $${paramIndex}`
      params.push(effectiveBranchId)
      paramIndex++
    }

    if (dateFrom) {
      query += ` AND DATE(se.created_at) >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      query += ` AND DATE(se.created_at) <= $${paramIndex}`
      params.push(dateTo)
      paramIndex++
    }

    query += ` ORDER BY se.created_at DESC`

    const result = await pool.query(query, params)

    const totalExpense = result.rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0)

    const categoryTotals: Record<string, number> = {}
    result.rows.forEach(row => {
      const category = row.category || "Uncategorized"
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(row.amount || 0)
    })

    return NextResponse.json({
      expenses: result.rows,
      summary: {
        totalExpense,
        transactionCount: result.rows.length,
        averageExpense: result.rows.length > 0 ? totalExpense / result.rows.length : 0,
        categoryCount: Object.keys(categoryTotals).length,
        categoryTotals
      }
    })
  } catch (error) {
    console.error("Error fetching expense report:", error)
    return NextResponse.json(
      { error: "Failed to fetch expense report" },
      { status: 500 }
    )
  }
}
