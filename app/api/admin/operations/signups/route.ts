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

    // First get the lead to check company name
    const leadResult = await query(`
      SELECT company_name FROM leads WHERE id = $1
    `, [lead_id])

    if (leadResult.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const companyName = leadResult[0].company_name

    // Check if a branch exists with this company name (case-insensitive)
    const branchResult = await query(`
      SELECT b.id, b.name, v.name as merchant_name
      FROM branches b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE LOWER(b.name) = LOWER($1) OR LOWER(v.name) = LOWER($1)
      LIMIT 1
    `, [companyName])

    if (branchResult.length === 0) {
      return NextResponse.json({ 
        error: "No branch found", 
        message: `No branch or merchant found with the name "${companyName}". Please ensure the merchant has been created in the system first.`
      }, { status: 400 })
    }

    // Branch exists, move lead to signed_up stage
    const result = await query(`
      UPDATE leads 
      SET stage = 'signed_up', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [lead_id])

    return NextResponse.json({ 
      ...result[0], 
      branch_found: branchResult[0] 
    })
  } catch (error) {
    console.error("Error updating signup:", error)
    return NextResponse.json({ error: "Failed to mark as signed up" }, { status: 500 })
  }
}
