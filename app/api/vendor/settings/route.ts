import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { cookies } from "next/headers"

async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const session = JSON.parse(sessionCookie.value)
    return session.user || null
  } catch {
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
      `SELECT id, name, display_name, logo_url, primary_color, custom_domain
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
    const { display_name, logo_url, primary_color, custom_domain } = body
    
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
           custom_domain = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [
        display_name || null,
        logo_url || null,
        primary_color || '#3b82f6',
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
