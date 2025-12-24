import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

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

  const branchVendor = await query(
    `SELECT DISTINCT vendor_id FROM branches WHERE user_id = $1 AND vendor_id IS NOT NULL`,
    [userId]
  )
  if (branchVendor && branchVendor.length > 0) {
    return branchVendor[0].vendor_id
  }

  return null
}

async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    return session.id || null
  } catch {
    return null
  }
}

async function verifyPartnerOwnership(partnerId: string, vendorId: string): Promise<boolean> {
  const partner = await query(
    `SELECT id FROM vendor_partners WHERE id = $1 AND vendor_id = $2`,
    [partnerId, vendorId]
  )
  return partner && partner.length > 0
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { id } = await params
    const partner = await query(
      `SELECT * FROM vendor_partners WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
    )
    
    if (!partner || partner.length === 0) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: partner[0] })
  } catch (error) {
    console.error("Error fetching partner:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch partner" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { id } = await params
    
    if (!(await verifyPartnerOwnership(id, vendorId))) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, tin, physical_address, contact_person, phone, status } = body

    const result = await query(
      `UPDATE vendor_partners 
       SET name = COALESCE($1, name),
           tin = COALESCE($2, tin),
           physical_address = COALESCE($3, physical_address),
           contact_person = COALESCE($4, contact_person),
           phone = COALESCE($5, phone),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7 AND vendor_id = $8
       RETURNING *`,
      [name, tin, physical_address, contact_person, phone, status, id, vendorId]
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error: any) {
    console.error("Error updating partner:", error)
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: false, 
        error: "A partner with this TIN already exists" 
      }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to update partner" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { id } = await params
    const result = await query(
      `DELETE FROM vendor_partners WHERE id = $1 AND vendor_id = $2 RETURNING id`,
      [id, vendorId]
    )
    
    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: "Partner deleted successfully" })
  } catch (error) {
    console.error("Error deleting partner:", error)
    return NextResponse.json({ success: false, error: "Failed to delete partner" }, { status: 500 })
  }
}
