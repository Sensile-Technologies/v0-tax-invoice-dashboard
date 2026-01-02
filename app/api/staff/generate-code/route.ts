import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { staff_id } = await request.json()

    if (!staff_id) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      )
    }

    // Get staff member's branch_id
    const staffResult = await query(
      `SELECT id, branch_id, role FROM staff WHERE id = $1`,
      [staff_id]
    )

    if (!staffResult || staffResult.length === 0) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      )
    }

    const staff = staffResult[0]
    
    // Only generate codes for cashiers, supervisors, and managers
    if (!['Cashier', 'Supervisor', 'Manager', 'cashier', 'supervisor', 'manager'].includes(staff.role)) {
      return NextResponse.json(
        { error: "Attendant codes are only available for Cashiers, Supervisors, and Managers" },
        { status: 400 }
      )
    }

    if (!staff.branch_id) {
      return NextResponse.json(
        { error: "Staff member must be assigned to a branch" },
        { status: 400 }
      )
    }

    // Generate GLOBALLY unique 4-digit code (across all branches)
    // This prevents cross-branch collision and ensures single code maps to single staff
    let newCode: string
    let attempts = 0
    const maxAttempts = 100

    do {
      newCode = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
      
      // Check globally - not just within branch
      const existingCode = await query(
        `SELECT id FROM staff WHERE attendant_code = $1 AND id != $2`,
        [newCode, staff_id]
      )
      
      if (!existingCode || existingCode.length === 0) {
        break
      }
      
      attempts++
    } while (attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Unable to generate unique code. Please try again." },
        { status: 500 }
      )
    }

    // Update staff with new code
    await query(
      `UPDATE staff SET attendant_code = $1, code_generated_at = NOW() WHERE id = $2`,
      [newCode, staff_id]
    )

    return NextResponse.json({
      success: true,
      attendant_code: newCode,
      message: "Attendant code generated successfully"
    })

  } catch (error: any) {
    console.error("Error generating attendant code:", error)
    return NextResponse.json(
      { error: "Failed to generate attendant code", details: error.message },
      { status: 500 }
    )
  }
}
