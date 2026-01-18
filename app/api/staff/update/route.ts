import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

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

    const body = await request.json()
    const { staffId, fullName, username, email, phone, role, branchId } = body

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
    }

    // Verify the requesting user has permission (vendor or director)
    const userCheck = await query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`,
      [session.id]
    )

    if (userCheck.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentUser = userCheck[0]
    if (!['vendor', 'director'].includes(currentUser.role?.toLowerCase()) && !currentUser.vendor_id) {
      return NextResponse.json({ error: "Only vendors and directors can update staff" }, { status: 403 })
    }

    // Get the vendor_id for the staff member to verify ownership
    const staffCheck = await query(
      `SELECT s.id, s.user_id, b.vendor_id 
       FROM staff s 
       LEFT JOIN branches b ON s.branch_id = b.id 
       WHERE s.id = $1`,
      [staffId]
    )

    if (staffCheck.length === 0) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    const staffMember = staffCheck[0]

    // Get vendor_id for current user
    let userVendorId = currentUser.vendor_id
    if (!userVendorId) {
      const vendorCheck = await query(
        `SELECT b.vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1`,
        [session.id]
      )
      userVendorId = vendorCheck[0]?.vendor_id
    }

    // Verify the staff belongs to the same vendor
    if (staffMember.vendor_id !== userVendorId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get vendor_id from new branch if branch is changing
    let vendorId = null
    if (branchId) {
      const branchResult = await query(
        `SELECT vendor_id FROM branches WHERE id = $1`,
        [branchId]
      )
      if (branchResult.length > 0) {
        vendorId = branchResult[0].vendor_id
      }
    }

    // Update staff table - only update branch_id if explicitly provided
    await query(
      `UPDATE staff 
       SET full_name = COALESCE($1, full_name),
           username = COALESCE($2, username),
           email = COALESCE($3, email),
           phone_number = COALESCE($4, phone_number),
           role = COALESCE($5, role),
           branch_id = CASE WHEN $6::text = '' OR $6 IS NULL THEN branch_id ELSE $6::uuid END,
           vendor_id = CASE WHEN $8::text = '' OR $8 IS NULL THEN vendor_id ELSE $8::uuid END,
           updated_at = NOW()
       WHERE id = $7`,
      [fullName, username, email, phone, role, branchId || '', staffId, vendorId || '']
    )

    // Update corresponding user record if exists
    if (staffMember.user_id) {
      await query(
        `UPDATE users 
         SET email = COALESCE($1, email),
             username = COALESCE($2, username),
             phone_number = COALESCE($3, phone_number),
             role = COALESCE($4, role),
             updated_at = NOW()
         WHERE id = $5`,
        [email, username, phone, role, staffMember.user_id]
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Staff member updated successfully" 
    })
  } catch (error: any) {
    console.error("Error updating staff:", error)
    return NextResponse.json(
      { error: "Failed to update staff member", details: error.message },
      { status: 500 }
    )
  }
}
