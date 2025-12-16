import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json()

    if (!identifier) {
      return NextResponse.json({ error: 'Email or username is required' }, { status: 400 })
    }

    const userResult = await pool.query(
      `SELECT id, email, username FROM users 
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)`,
      [identifier]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists, a reset request has been submitted'
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Reset request submitted. Please contact your administrator for your reset code.'
    })
  } catch (error: any) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
