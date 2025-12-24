import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendor_id")
    const partnerType = searchParams.get("partner_type")

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "vendor_id is required" }, { status: 400 })
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
    const body = await request.json()
    const { vendor_id, partner_type, name, tin, physical_address, contact_person, phone } = body

    if (!vendor_id || !partner_type || !name) {
      return NextResponse.json({ 
        success: false, 
        error: "vendor_id, partner_type, and name are required" 
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
      [vendor_id, partner_type, name, tin || null, physical_address || null, contact_person || null, phone || null]
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
