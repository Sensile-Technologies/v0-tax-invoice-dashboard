import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'

async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    // SECURITY: Only trust the user ID from cookie, derive everything else from database
    return session.id || null
  } catch {
    return null
  }
}

async function getVendorIdFromUser(userId: string): Promise<string | null> {
  // Try to get vendor_id from user's vendor record
  const vendorResult = await pool.query(
    `SELECT v.id as vendor_id FROM users u 
     JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  )
  if (vendorResult.rows.length > 0) {
    return vendorResult.rows[0].vendor_id
  }
  
  // Try to get vendor_id from user's staff record
  const staffResult = await pool.query(
    `SELECT DISTINCT b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
    [userId]
  )
  if (staffResult.rows.length > 0) {
    return staffResult.rows[0].vendor_id
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from httpOnly cookie
    const userId = await getSessionUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    // SECURITY: Always derive vendor_id from database (never trust cookie values)
    const vendorId = await getVendorIdFromUser(userId)
    
    // SECURITY: Must have vendor_id to list users
    if (!vendorId) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const username = searchParams.get('username')
    const branch_id = searchParams.get('branch_id')
    const user_id = searchParams.get('user_id')

    // Base query: Only return users from the same vendor
    let sql = `
      SELECT DISTINCT u.id, u.email, u.username, u.phone_number, u.role, u.created_at
      FROM users u
      LEFT JOIN staff s ON s.user_id = u.id
      LEFT JOIN branches b ON b.id = s.branch_id
      LEFT JOIN vendors v ON v.email = u.email
      WHERE (b.vendor_id = $1 OR v.id = $1)
    `
    const params: any[] = [vendorId]
    let paramIndex = 2

    if (email) {
      sql += ` AND (LOWER(u.email) = LOWER($${paramIndex}) OR LOWER(u.username) = LOWER($${paramIndex}))`
      params.push(email)
      paramIndex++
    }

    if (username) {
      sql += ` AND LOWER(u.username) = LOWER($${paramIndex})`
      params.push(username)
      paramIndex++
    }

    if (user_id) {
      sql += ` AND u.id = $${paramIndex}`
      params.push(user_id)
      paramIndex++
    }

    if (branch_id) {
      sql += ` AND s.branch_id = $${paramIndex}`
      params.push(branch_id)
      paramIndex++
    }

    sql += ` ORDER BY u.created_at DESC LIMIT 50`

    const result = await pool.query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
