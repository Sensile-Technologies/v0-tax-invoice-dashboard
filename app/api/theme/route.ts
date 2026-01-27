import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ 
        vendor: null,
        theme: getDefaultTheme()
      })
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').split(':')[0]

    const vendors = await query(
      `SELECT id, name, display_name, logo_url, primary_color, secondary_color, custom_domain
       FROM vendors 
       WHERE custom_domain = $1 AND status = 'active'
       LIMIT 1`,
      [cleanDomain]
    )

    if (vendors.length === 0) {
      return NextResponse.json({ 
        vendor: null,
        theme: getDefaultTheme()
      })
    }

    const vendor = vendors[0]
    
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
