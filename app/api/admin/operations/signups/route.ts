import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        l.id as lead_id,
        l.company_name,
        l.contact_name,
        l.email,
        l.phone,
        l.status,
        l.created_at,
        sp.name as sales_person_name
      FROM leads l
      LEFT JOIN sales_people sp ON l.assigned_to = sp.id
      WHERE l.status = 'onboarding'
      ORDER BY l.created_at DESC
    `)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching signup requests:", error)
    return NextResponse.json([])
  }
}
