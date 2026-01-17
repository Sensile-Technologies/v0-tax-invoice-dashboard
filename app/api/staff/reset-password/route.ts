import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { staffId, email } = await request.json()

    if (!staffId && !email) {
      return NextResponse.json(
        { error: "Staff ID or email is required" },
        { status: 400 }
      )
    }

    const defaultPassword = "flow360123"
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Get the staff member and their user_id
    let staffResult
    if (staffId) {
      staffResult = await query(
        `SELECT id, user_id, email FROM staff WHERE id = $1`,
        [staffId]
      )
    } else {
      staffResult = await query(
        `SELECT id, user_id, email FROM staff WHERE email = $1`,
        [email]
      )
    }

    if (staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    const staff = staffResult[0]

    // Update password in users table and set must_change_password flag
    if (staff.user_id) {
      await query(
        `UPDATE users SET password_hash = $1, must_change_password = true, updated_at = NOW() WHERE id = $2`,
        [hashedPassword, staff.user_id]
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Password reset to default. User must change password on next login." 
    })
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password", details: error.message },
      { status: 500 }
    )
  }
}
