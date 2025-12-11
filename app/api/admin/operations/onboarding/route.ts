import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        o.id, o.type, o.merchant_id, o.branch_id, o.status, o.created_at,
        v.name as merchant_name,
        b.bhf_nm as branch_name
      FROM onboarding_requests o
      LEFT JOIN vendors v ON o.merchant_id = v.id
      LEFT JOIN branches b ON o.branch_id = b.id
      ORDER BY 
        CASE WHEN o.status = 'pending' THEN 0 ELSE 1 END,
        o.created_at DESC
    `)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching onboarding requests:", error)
    return NextResponse.json([])
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, branch_id, device_token, bhf_id, server_address, server_port } = await request.json()

    if (branch_id) {
      await query(`
        UPDATE branches 
        SET device_token = $1, bhf_id = $2, server_address = $3, server_port = $4
        WHERE id = $5
      `, [device_token, bhf_id, server_address, server_port, branch_id])
    }

    const result = await query(`
      UPDATE onboarding_requests 
      SET status = 'completed', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating onboarding request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
