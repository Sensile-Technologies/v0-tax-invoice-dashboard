import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get branches that need onboarding (no device_token configured yet)
    // These are new branches from signups that need device configuration
    const result = await query(`
      SELECT 
        b.id,
        'branch' as type,
        b.vendor_id as merchant_id,
        b.id as branch_id,
        b.name as merchant_name,
        b.trading_name,
        b.kra_pin,
        b.name as branch_name,
        'pending_onboarding' as status,
        b.manager as contact_name,
        b.email as contact_email,
        b.phone as contact_phone,
        b.location,
        b.county,
        b.address,
        b.created_at
      FROM branches b
      WHERE (b.device_token IS NULL OR b.device_token = '')
        AND b.status = 'active'
      ORDER BY b.created_at DESC
    `)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching onboarding requests:", error)
    return NextResponse.json([])
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, device_token, bhf_id, server_address, server_port } = await request.json()

    // Update the branch with onboarding configuration (device token, bhf_id, etc.)
    const result = await query(`
      UPDATE branches 
      SET device_token = $2, bhf_id = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, device_token, bhf_id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating onboarding request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
