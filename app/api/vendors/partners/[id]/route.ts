import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const partner = await query(`SELECT * FROM vendor_partners WHERE id = $1`, [id])
    
    if (!partner || partner.length === 0) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: partner[0] })
  } catch (error) {
    console.error("Error fetching partner:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch partner" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, tin, physical_address, contact_person, phone, status } = body

    const result = await query(
      `UPDATE vendor_partners 
       SET name = COALESCE($1, name),
           tin = COALESCE($2, tin),
           physical_address = COALESCE($3, physical_address),
           contact_person = COALESCE($4, contact_person),
           phone = COALESCE($5, phone),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, tin, physical_address, contact_person, phone, status, id]
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error: any) {
    console.error("Error updating partner:", error)
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: false, 
        error: "A partner with this TIN already exists" 
      }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to update partner" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await query(`DELETE FROM vendor_partners WHERE id = $1 RETURNING id`, [id])
    
    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: "Partner deleted successfully" })
  } catch (error) {
    console.error("Error deleting partner:", error)
    return NextResponse.json({ success: false, error: "Failed to delete partner" }, { status: 500 })
  }
}
