import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

async function getUserVendorId(userId: string): Promise<string | null> {
  // Check if user belongs to this vendor via email match
  const userVendor = await query(
    `SELECT v.id FROM users u 
     JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  )
  if (userVendor && userVendor.length > 0) {
    return userVendor[0].id
  }

  // Check via staff/branch association
  const staffVendor = await query(
    `SELECT DISTINCT b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
    [userId]
  )
  if (staffVendor && staffVendor.length > 0) {
    return staffVendor[0].vendor_id
  }

  // Check via branch ownership
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerType = searchParams.get("partner_type")

    // Get user from session and derive vendor_id server-side
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    let sql = `
      SELECT * FROM vendor_partners 
      WHERE vendor_id = $1
    `
    const params: any[] = [vendorId]

    if (partnerType && (partnerType === 'supplier' || partnerType === 'transporter')) {
      sql += ` AND partner_type = $2`
      params.push(partnerType)
    }

    sql += ` ORDER BY name`

    const partners = await query(sql, params)
    return NextResponse.json({ success: true, data: partners })
  } catch (error) {
    console.error("Error fetching partners:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch partners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session and derive vendor_id server-side
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const body = await request.json()
    const { partner_type, name, tin, physical_address, contact_person, phone } = body

    if (!partner_type || !name) {
      return NextResponse.json({ 
        success: false, 
        error: "partner_type and name are required" 
      }, { status: 400 })
    }

    if (!['supplier', 'transporter'].includes(partner_type)) {
      return NextResponse.json({ 
        success: false, 
        error: "partner_type must be 'supplier' or 'transporter'" 
      }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO vendor_partners (vendor_id, partner_type, name, tin, physical_address, contact_person, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [vendorId, partner_type, name, tin || null, physical_address || null, contact_person || null, phone || null]
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error: any) {
    console.error("Error creating partner:", error)
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: false, 
        error: "A partner with this TIN already exists for this vendor" 
      }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create partner" }, { status: 500 })
  }
}
