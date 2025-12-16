import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { identifier, code, newPassword } = await request.json()

    if (!identifier || !code || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const userResult = await pool.query(
      `SELECT id, email, username FROM users 
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)`,
      [identifier]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials or reset code' }, { status: 400 })
    }

    const user = userResult.rows[0]

    const tokenResult = await pool.query(
      `SELECT id, token_hash, expires_at FROM password_reset_tokens 
       WHERE user_id = $1 AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 })
    }

    const token = tokenResult.rows[0]
    const isValidCode = await bcrypt.compare(code.toUpperCase(), token.token_hash)

    if (!isValidCode) {
      return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await pool.query('BEGIN')
    
    try {
      await pool.query(
        `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [passwordHash, user.id]
      )

      await pool.query(
        `UPDATE password_reset_tokens SET consumed_at = NOW() WHERE id = $1`,
        [token.id]
      )

      await pool.query('COMMIT')

      return NextResponse.json({ 
        success: true,
        message: 'Password reset successfully'
      })
    } catch (err) {
      await pool.query('ROLLBACK')
      throw err
    }
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
