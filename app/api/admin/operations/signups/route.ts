import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        l.id as lead_id,
        l.company_name,
        l.contact_name,
        l.contact_email as email,
        l.contact_phone as phone,
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
    const { lead_id } = await request.json()

    const result = await query(`
      UPDATE leads 
      SET stage = 'signed_up', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [lead_id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating signup:", error)
    return NextResponse.json({ error: "Failed to mark as signed up" }, { status: 500 })
  }
}
