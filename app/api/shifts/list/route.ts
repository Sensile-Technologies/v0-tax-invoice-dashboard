import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const search = searchParams.get('search')
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let vendorId: string | null = null
    
    if (userId) {
      const userVendorResult = await pool.query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      )
      if (userVendorResult.rows.length > 0) {
        vendorId = userVendorResult.rows[0].vendor_id
      } else {
        const staffResult = await pool.query(
          `SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
          [userId]
        )
        if (staffResult.rows.length > 0) {
          vendorId = staffResult.rows[0].vendor_id
        }
      }
    }

    let query = `
      SELECT 
        s.id,
        s.branch_id,
        s.staff_id,
        s.start_time,
        s.end_time,
        s.opening_cash,
        s.closing_cash,
        s.total_sales,
        s.status,
        s.notes,
        s.created_at,
        b.name as branch_name,
        st.full_name as staff_name,
        st.username as staff_username
      FROM shifts s
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE 1=1
    `
    const params: any[] = []

    if (vendorId) {
      params.push(vendorId)
      query += ` AND b.vendor_id = $${params.length}`
    }

    if (branchId) {
      params.push(branchId)
      query += ` AND s.branch_id = $${params.length}`
    }

    if (dateFrom) {
      params.push(dateFrom)
      query += ` AND s.start_time >= $${params.length}::timestamp`
    }

    if (dateTo) {
      params.push(dateTo + ' 23:59:59')
      query += ` AND s.start_time <= $${params.length}::timestamp`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (st.full_name ILIKE $${params.length} OR st.username ILIKE $${params.length} OR b.name ILIKE $${params.length})`
    }

    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || '0')

    query += ` ORDER BY s.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    const shifts = result.rows.map(shift => {
      const openingCash = parseFloat(shift.opening_cash) || 0
      const closingCash = parseFloat(shift.closing_cash) || 0
      const totalSales = parseFloat(shift.total_sales) || 0
      const expectedCash = openingCash + totalSales
      const variance = closingCash - expectedCash

      return {
        ...shift,
        opening_cash: openingCash,
        closing_cash: closingCash,
        total_sales: totalSales,
        variance: variance,
        cashier: shift.staff_name || shift.staff_username || 'Unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: shifts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + shifts.length < total
      }
    })

  } catch (error: any) {
    console.error("Error fetching shifts list:", error)
    return NextResponse.json(
      { error: "Failed to fetch shifts", details: error.message },
      { status: 500 }
    )
  }
}
