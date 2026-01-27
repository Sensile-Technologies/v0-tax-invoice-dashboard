import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { cookies } from "next/headers"

async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')
  
  console.log('[Vendor Settings] Session cookie:', sessionCookie ? 'present' : 'missing')
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie.value)
    console.log('[Vendor Settings] Session data id:', sessionData?.id)
    if (!sessionData.id) return null
    
    const users = await query(
      `SELECT u.id, u.email, u.username, 
       COALESCE(s.role, u.role) as role,
       COALESCE(v.id, b.vendor_id) as vendor_id
       FROM users u 
       LEFT JOIN vendors v ON v.email = u.email 
       LEFT JOIN staff s ON s.user_id = u.id
       LEFT JOIN branches b ON b.id = s.branch_id
       WHERE u.id = $1`,
      [sessionData.id]
    )
    
    console.log('[Vendor Settings] User found:', users[0]?.email, 'role:', users[0]?.role, 'vendor_id:', users[0]?.vendor_id)
    return users[0] || null
  } catch (err) {
    console.error('[Vendor Settings] Error:', err)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const role = (user.role || '').toLowerCase()
    if (!['vendor', 'director'].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    if (!user.vendor_id) {
      return NextResponse.json({ error: "No vendor associated with user" }, { status: 400 })
    }
    
    const vendor = await queryOne(
      `SELECT id, name, display_name, logo_url, primary_color, secondary_color, custom_domain
       FROM vendors 
       WHERE id = $1`,
      [user.vendor_id]
    )
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }
    
    return NextResponse.json({ vendor })
  } catch (error) {
    console.error("Error fetching vendor settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const role = (user.role || '').toLowerCase()
    if (!['vendor', 'director'].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    if (!user.vendor_id) {
      return NextResponse.json({ error: "No vendor associated with user" }, { status: 400 })
    }
    
    const body = await request.json()
    const { display_name, logo_url, primary_color, secondary_color, custom_domain } = body
    
    if (custom_domain) {
      const cleanDomain = custom_domain.replace(/^https?:\/\//, '').split(':')[0].toLowerCase()
      
      const existingVendor = await queryOne(
        `SELECT id FROM vendors WHERE custom_domain = $1 AND id != $2`,
        [cleanDomain, user.vendor_id]
      )
      
      if (existingVendor) {
        return NextResponse.json({ error: "This domain is already in use by another vendor" }, { status: 400 })
      }
    }
    
    await query(
      `UPDATE vendors 
       SET display_name = $1,
           logo_url = $2,
           primary_color = $3,
           secondary_color = $4,
           custom_domain = $5,
           updated_at = NOW()
       WHERE id = $6`,
      [
        display_name || null,
        logo_url || null,
        primary_color || '#3b82f6',
        secondary_color || '#1e40af',
        custom_domain ? custom_domain.replace(/^https?:\/\//, '').split(':')[0].toLowerCase() : null,
        user.vendor_id
      ]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating vendor settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
