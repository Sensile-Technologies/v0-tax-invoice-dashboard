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
