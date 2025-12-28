import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    const authInfo = await getUserAuthInfo(session.id)

    const body = await request.json()
    const { branch_id } = body

    if (!branch_id) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const branchOwnerCheck = await query<any>(
      `SELECT vendor_id FROM branches WHERE id = $1`,
      [branch_id]
    )
    if (branchOwnerCheck.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }
    if (authInfo.vendorId && branchOwnerCheck[0].vendor_id !== authInfo.vendorId) {
      return NextResponse.json({ error: "Access denied to this branch" }, { status: 403 })
    }
    
    const restrictedRoles = ['supervisor', 'manager', 'cashier']
    if (authInfo.role && restrictedRoles.includes(authInfo.role.toLowerCase())) {
      if (authInfo.assignedBranchId !== branch_id) {
        return NextResponse.json({ error: "Access denied. You can only access your assigned branch." }, { status: 403 })
      }
    }

    const branchResult = await query<any>(`
      SELECT 
        b.id,
        b.bhf_id,
        b.device_serial_number,
        b.server_address,
        b.server_port,
        b.kra_pin,
        v.kra_pin as vendor_kra_pin
      FROM branches b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.id = $1
    `, [branch_id])

    const branch = branchResult[0]
    const tin = branch.kra_pin || branch.vendor_kra_pin
    const bhfId = branch.bhf_id
    const dvcSrlNo = branch.device_serial_number

    if (!tin) {
      return NextResponse.json({ error: "KRA PIN not configured for this branch" }, { status: 400 })
    }
    if (!bhfId) {
      return NextResponse.json({ error: "BHF ID not configured for this branch" }, { status: 400 })
    }
    if (!dvcSrlNo) {
      return NextResponse.json({ error: "Device Serial Number not configured for this branch" }, { status: 400 })
    }

    const kraBaseUrl = buildKraBaseUrl(branch.server_address, branch.server_port)
    const endpoint = `${kraBaseUrl}/initializer/selectInitInfo`

    const payload = {
      tin,
      bhfId,
      dvcSrlNo
    }

    let responseData: any
    let status = "success"

    try {
      const kraResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      responseData = await kraResponse.json()
      
      if (!kraResponse.ok) {
        status = "error"
      }
    } catch (fetchError: any) {
      status = "error"
      responseData = { error: fetchError.message || "Failed to connect to KRA server" }
    }

    await query(`
      INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [branch_id, "kra_initialize", endpoint, JSON.stringify(payload), JSON.stringify(responseData), status])

    return NextResponse.json({
      success: status === "success",
      endpoint,
      request: payload,
      response: responseData
    })
  } catch (error: any) {
    console.error("Error in KRA initialize:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize" }, { status: 500 })
  }
}
