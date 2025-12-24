import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

async function getSessionUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

async function getUserVendorId(userId: string): Promise<string | null> {
  const userVendor = await query(
    `SELECT v.id FROM users u 
     JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  )
  if (userVendor && userVendor.length > 0) {
    return userVendor[0].id
  }

  const staffVendor = await query(
    `SELECT DISTINCT b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
    [userId]
  )
  if (staffVendor && staffVendor.length > 0) {
    return staffVendor[0].vendor_id
  }

  return null
}

async function getUserRoleAndHQAccess(userId: string, vendorId: string): Promise<{ role: string | null, hasHQAccess: boolean }> {
  const userResult = await query(
    `SELECT u.role, v.id as vendor_id 
     FROM users u 
     LEFT JOIN vendors v ON v.email = u.email
     WHERE u.id = $1`,
    [userId]
  )
  
  if (userResult && userResult.length > 0) {
    if (userResult[0].vendor_id === vendorId) {
      return { role: userResult[0].role, hasHQAccess: true }
    }
    return { role: userResult[0].role, hasHQAccess: false }
  }
  return { role: null, hasHQAccess: false }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(user.id)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { role: userRole, hasHQAccess } = await getUserRoleAndHQAccess(user.id, vendorId)
    const allowedRoles = ['vendor', 'manager', 'director', 'admin', 'owner']
    
    if (!hasHQAccess) {
      return NextResponse.json({ 
        success: false, 
        error: "Only headquarters staff can approve purchase orders" 
      }, { status: 403 })
    }
    
    if (!userRole || !allowedRoles.includes(userRole.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        error: "You don't have permission to approve purchase orders" 
      }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, rejection_comments } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    const existing = await query(
      `SELECT id, approval_status FROM purchase_orders WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: "Purchase order not found" }, { status: 404 })
    }

    if (existing[0].approval_status !== 'pending_approval') {
      return NextResponse.json({ 
        success: false, 
        error: "This purchase order has already been processed" 
      }, { status: 400 })
    }

    if (action === 'approve') {
      await query(
        `UPDATE purchase_orders 
         SET approval_status = 'approved', 
             status = 'pending',
             approved_by = $1, 
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [user.id, id]
      )

      return NextResponse.json({ 
        success: true, 
        message: "Purchase order approved successfully" 
      })
    } else {
      if (!rejection_comments) {
        return NextResponse.json({ 
          success: false, 
          error: "Rejection comments are required" 
        }, { status: 400 })
      }

      await query(
        `UPDATE purchase_orders 
         SET approval_status = 'rejected', 
             status = 'cancelled',
             approved_by = $1, 
             approved_at = NOW(),
             rejection_comments = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [user.id, rejection_comments, id]
      )

      return NextResponse.json({ 
        success: true, 
        message: "Purchase order rejected" 
      })
    }
  } catch (error) {
    console.error("Error processing approval:", error)
    return NextResponse.json({ success: false, error: "Failed to process approval" }, { status: 500 })
  }
}
