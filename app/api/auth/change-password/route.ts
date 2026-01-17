import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("user_session")
  if (!sessionCookie) return null
  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword, userId } = await request.json()

    // Use userId from request if provided (for forced password change), otherwise use session
    const targetUserId = userId || session.id

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Get user's current password hash
    const userResult = await query(
      `SELECT id, password_hash, must_change_password FROM users WHERE id = $1`,
      [targetUserId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // If not a forced password change, verify current password
    if (!user.must_change_password && currentPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        )
      }
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await query(
      `UPDATE users SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, targetUserId]
    )

    return NextResponse.json({ 
      success: true, 
      message: "Password changed successfully" 
    })
  } catch (error: any) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password", details: error.message },
      { status: 500 }
    )
  }
}
