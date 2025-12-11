import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get leads at 'signed_up' stage - these are the leads that have signed up and need onboarding configuration
    const result = await query(`
      SELECT 
        l.id,
        'lead' as type,
        NULL as merchant_id,
        NULL as branch_id,
        l.company_name as merchant_name,
        l.trading_name,
        l.kra_pin,
        NULL as branch_name,
        l.stage as status,
        l.contact_name,
        l.contact_email,
        l.contact_phone,
        l.created_at,
        sp.name as sales_person_name
      FROM leads l
      LEFT JOIN sales_people sp ON l.assigned_to = sp.id
      WHERE l.stage = 'signed_up'
      ORDER BY l.created_at DESC
    `)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching onboarding requests:", error)
    return NextResponse.json([])
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, device_token, bhf_id, server_address, server_port, notes } = await request.json()

    // Mark the lead as onboarded (completed)
    const result = await query(`
      UPDATE leads 
      SET stage = 'onboarded', notes = COALESCE(notes, '') || $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, notes ? `\n\nOnboarding Configuration:\nDevice Token: ${device_token}\nBHF ID: ${bhf_id}\nServer: ${server_address}:${server_port}` : ''])

    if (result.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating onboarding request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
