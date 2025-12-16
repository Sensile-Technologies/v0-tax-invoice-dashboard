import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const username = searchParams.get('username')
    const branch_id = searchParams.get('branch_id')
    const user_id = searchParams.get('user_id')

    let sql = `
      SELECT u.id, u.email, u.username, u.phone_number, u.role, u.created_at
      FROM users u
    `
    const params: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    if (email) {
      conditions.push(`(LOWER(u.email) = LOWER($${paramIndex}) OR LOWER(u.username) = LOWER($${paramIndex}))`)
      params.push(email)
      paramIndex++
    }

    if (username) {
      conditions.push(`LOWER(u.username) = LOWER($${paramIndex})`)
      params.push(username)
      paramIndex++
    }

    if (user_id) {
      conditions.push(`u.id = $${paramIndex}`)
      params.push(user_id)
      paramIndex++
    }

    if (branch_id) {
      sql = `
        SELECT u.id, u.email, u.username, u.phone_number, u.role, u.created_at, bu.branch_id
        FROM users u
        LEFT JOIN branch_users bu ON u.id = bu.user_id
      `
      conditions.push(`bu.branch_id = $${paramIndex}`)
      params.push(branch_id)
      paramIndex++
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`
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
