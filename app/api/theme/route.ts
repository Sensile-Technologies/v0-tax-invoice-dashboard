import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { cookies } from "next/headers"

async function getSessionVendorId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    
    if (!sessionCookie?.value) return null
    
    const sessionData = JSON.parse(sessionCookie.value)
    if (!sessionData.id) return null
    
    const user = await queryOne<{ vendor_id: string }>(
      `SELECT COALESCE(v.id, b.vendor_id) as vendor_id
       FROM users u 
       LEFT JOIN vendors v ON v.email = u.email 
       LEFT JOIN staff s ON s.user_id = u.id
       LEFT JOIN branches b ON b.id = s.branch_id
       WHERE u.id = $1`,
      [sessionData.id]
    )
    
    return user?.vendor_id || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    let vendor = null

    const sessionVendorId = await getSessionVendorId()
    if (sessionVendorId) {
      const vendors = await query(
        `SELECT id, name, display_name, logo_url, primary_color, secondary_color, custom_domain
         FROM vendors 
         WHERE id = $1 AND status = 'active'
         LIMIT 1`,
        [sessionVendorId]
      )
      if (vendors.length > 0) {
        vendor = vendors[0]
      }
    }

    if (!vendor && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, '').split(':')[0]
      const vendors = await query(
        `SELECT id, name, display_name, logo_url, primary_color, secondary_color, custom_domain
         FROM vendors 
         WHERE custom_domain = $1 AND status = 'active'
         LIMIT 1`,
        [cleanDomain]
      )
      if (vendors.length > 0) {
        vendor = vendors[0]
      }
    }

    if (!vendor) {
      return NextResponse.json({ 
        vendor: null,
        theme: getDefaultTheme()
      })
    }
    
    return NextResponse.json({
      vendor: {
        id: vendor.id,
        name: vendor.display_name || vendor.name,
      },
      theme: {
        logoUrl: vendor.logo_url || '/flow360-logo.png',
        primaryColor: vendor.primary_color || '#3b82f6',
        secondaryColor: vendor.secondary_color || '#1e40af',
        companyName: vendor.display_name || vendor.name || 'Flow360',
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })
  } catch (error) {
    console.error("Error fetching theme:", error)
    return NextResponse.json({ 
      vendor: null,
      theme: getDefaultTheme()
    })
  }
}

function getDefaultTheme() {
  return {
    logoUrl: '/flow360-logo.png',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    companyName: 'Flow360',
  }
}
