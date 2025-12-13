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

    const defaultPassword = "flow360"
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    let result
    if (staffId) {
      result = await query(
        `UPDATE staff SET password_hash = $1 WHERE id = $2 RETURNING id, email`,
        [hashedPassword, staffId]
      )
    } else {
      result = await query(
        `UPDATE staff SET password_hash = $1 WHERE email = $2 RETURNING id, email`,
        [hashedPassword, email]
      )
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Password reset to default (flow360)" 
    })
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password", details: error.message },
      { status: 500 }
    )
  }
}
