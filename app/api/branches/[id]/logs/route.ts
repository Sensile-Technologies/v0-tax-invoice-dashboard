import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

async function getSessionUser(): Promise<{ id: string; role?: string; vendor_id?: string; branch_id?: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    return session.id ? session : null
  } catch {
    return null
  }
}

async function getUserAuthInfo(userId: string): Promise<{ vendorId: string | null; role: string | null; assignedBranchId: string | null; isVendorOwner: boolean }> {
  const userResult = await query<any>(
    `SELECT u.role, v.id as vendor_id FROM users u 
     LEFT JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  )
  if (userResult && userResult.length > 0 && userResult[0].vendor_id) {
    return { vendorId: userResult[0].vendor_id, role: userResult[0].role || 'vendor', assignedBranchId: null, isVendorOwner: true }
  }
  
  const staffResult = await query<any>(
    `SELECT s.branch_id, s.role, b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
    [userId]
  )
  if (staffResult && staffResult.length > 0) {
    return { 
      vendorId: staffResult[0].vendor_id, 
      role: staffResult[0].role, 
      assignedBranchId: staffResult[0].branch_id,
      isVendorOwner: false 
    }
  }
  
  return { vendorId: null, role: null, assignedBranchId: null, isVendorOwner: false }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    const authInfo = await getUserAuthInfo(session.id)

    const { id: branchId } = await params

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const branchOwnerCheck = await query<any>(
      `SELECT vendor_id FROM branches WHERE id = $1`,
      [branchId]
    )
    if (branchOwnerCheck.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }
    if (authInfo.vendorId && branchOwnerCheck[0].vendor_id !== authInfo.vendorId) {
      return NextResponse.json({ error: "Access denied to this branch" }, { status: 403 })
    }
    
    const restrictedRoles = ['supervisor', 'manager', 'cashier']
    if (authInfo.role && restrictedRoles.includes(authInfo.role.toLowerCase())) {
      if (authInfo.assignedBranchId !== branchId) {
        return NextResponse.json({ error: "Access denied. You can only access your assigned branch." }, { status: 403 })
      }
    }

    const logs = await query<any>(`
      SELECT 
        id,
        branch_id,
        log_type,
        endpoint,
        request_payload,
        response_payload,
        status,
        created_at
      FROM branch_logs
      WHERE branch_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [branchId])

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error("Error fetching branch logs:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 })
  }
}
