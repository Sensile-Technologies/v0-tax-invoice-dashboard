import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser()
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    
    const branchId = searchParams.get('branch_id')
    const userId = searchParams.get('user_id')
    const action = searchParams.get('action')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let userVendorId: string | null = null
    let userRole = 'vendor'
    
    const vendorResult = await pool.query(
      `SELECT v.id as vendor_id FROM users u 
       JOIN vendors v ON v.email = u.email 
       WHERE u.id = $1`,
      [session.id]
    )
    if (vendorResult.rows.length > 0) {
      userVendorId = vendorResult.rows[0].vendor_id
    } else {
      const staffResult = await pool.query(
        `SELECT s.role, b.vendor_id FROM staff s
         JOIN branches b ON s.branch_id = b.id
         WHERE s.user_id = $1`,
        [session.id]
      )
      if (staffResult.rows.length > 0) {
        userVendorId = staffResult.rows[0].vendor_id
        userRole = staffResult.rows[0].role
      }
    }
    
    const restrictedRoles = ['cashier', 'supervisor', 'manager']
    if (restrictedRoles.includes(userRole?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Access denied. Only directors and vendors can view activity logs.' }, { status: 403 })
    }
    
    if (!userVendorId) {
      return NextResponse.json({ error: 'Unable to determine vendor access' }, { status: 403 })
    }
    
    let query = `
      SELECT 
        id, user_id, user_email, user_name, branch_id, branch_name, 
        vendor_id, action, resource_type, resource_id, details, 
        ip_address, user_agent, created_at
      FROM activity_logs
      WHERE 1=1
    `
    const params: any[] = []
    
    if (userVendorId) {
      params.push(userVendorId)
      query += ` AND vendor_id = $${params.length}`
    }
    
    if (branchId) {
      params.push(branchId)
      query += ` AND branch_id = $${params.length}`
    }
    
    if (userId) {
      params.push(userId)
      query += ` AND user_id = $${params.length}`
    }
    
    if (action) {
      params.push(action)
      query += ` AND action = $${params.length}`
    }
    
    if (dateFrom) {
      params.push(dateFrom)
      query += ` AND created_at >= $${params.length}::timestamp`
    }
    
    if (dateTo) {
      params.push(dateTo + ' 23:59:59')
      query += ` AND created_at <= $${params.length}::timestamp`
    }
    
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || '0')
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)
    
    const result = await pool.query(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + result.rows.length < total
      }
    })
    
  } catch (error: any) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity logs", details: error.message },
      { status: 500 }
    )
  }
}
