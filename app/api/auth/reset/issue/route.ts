import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'

function generateResetCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, admin_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const userResult = await pool.query(
      `SELECT id, email, username FROM users WHERE id = $1`,
      [user_id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    await pool.query(
      `UPDATE password_reset_tokens SET consumed_at = NOW() 
       WHERE user_id = $1 AND consumed_at IS NULL`,
      [user_id]
    )

    const resetCode = generateResetCode()
    const tokenHash = await bcrypt.hash(resetCode, 10)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_by)
       VALUES ($1, $2, $3, $4)`,
      [user_id, tokenHash, expiresAt, admin_id || null]
    )

    return NextResponse.json({ 
      success: true,
      code: resetCode,
      expires_in_minutes: 30,
      user: {
        username: user.username,
        email: user.email
      }
    })
  } catch (error: any) {
    console.error('Issue reset code error:', error)
    return NextResponse.json({ error: 'Failed to issue reset code' }, { status: 500 })
  }
}
