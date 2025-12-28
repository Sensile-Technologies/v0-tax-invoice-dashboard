import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        l.id as lead_id,
        l.company_name,
        l.trading_name,
        l.kra_pin,
        l.contact_name,
        l.contact_email as email,
        l.contact_phone as phone,
        l.location,
        l.county,
        l.address,
        l.stage as status,
        l.created_at,
        sp.name as sales_person_name
      FROM leads l
      LEFT JOIN sales_people sp ON l.assigned_to = sp.id
      WHERE l.stage = 'onboarding'
      ORDER BY l.created_at DESC
    `)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching signup requests:", error)
    return NextResponse.json([])
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      lead_id, 
      company_name, 
      trading_name, 
      kra_pin, 
      contact_name, 
      email, 
      phone, 
      location, 
      county, 
      address
    } = await request.json()

    if (!lead_id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    // Update lead with editable fields (allows admin to correct input mistakes)
    const result = await query(`
      UPDATE leads 
      SET 
        company_name = COALESCE($2, company_name),
        trading_name = COALESCE($3, trading_name),
        kra_pin = COALESCE($4, kra_pin),
        contact_name = COALESCE($5, contact_name),
        contact_email = COALESCE($6, contact_email),
        contact_phone = COALESCE($7, contact_phone),
        location = COALESCE($8, location),
        county = COALESCE($9, county),
        address = COALESCE($10, address),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [lead_id, company_name, trading_name, kra_pin, contact_name, email, phone, location, county, address])

    if (result.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating signup request:", error)
    return NextResponse.json({ error: "Failed to save changes" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('id')

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    // Move lead back to 'contracting' stage instead of deleting
    // This allows sales to re-review and move back to onboarding if needed
    const result = await query(`
      UPDATE leads 
      SET stage = 'contracting', updated_at = NOW()
      WHERE id = $1 AND stage = 'onboarding'
      RETURNING *
    `, [leadId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Lead not found or not in onboarding stage" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Lead moved back to contracting stage" })
  } catch (error) {
    console.error("Error removing signup request:", error)
    return NextResponse.json({ error: "Failed to remove from signup requests" }, { status: 500 })
  }
}
