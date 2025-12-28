import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(`
      SELECT id, bhf_id, name, address, status, device_token, server_address, server_port, kra_pin, trading_name, device_serial_number, sr_number
      FROM branches
      WHERE vendor_id = $1
      ORDER BY name
    `, [id])

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching vendor branches:", error)
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params
    const body = await request.json()
    const { branch_id, bhf_id, device_token, server_address, server_port, kra_pin, device_serial_number, sr_number } = body

    if (!branch_id) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    // Verify branch belongs to this vendor
    const branchCheck = await query(
      `SELECT id FROM branches WHERE id = $1 AND vendor_id = $2`,
      [branch_id, vendorId]
    )

    if (branchCheck.length === 0) {
      return NextResponse.json({ error: "Branch not found or does not belong to this vendor" }, { status: 404 })
    }

    // Update branch KRA configuration
    await query(`
      UPDATE branches 
      SET 
        bhf_id = COALESCE($1, bhf_id),
        device_token = COALESCE($2, device_token),
        server_address = COALESCE($3, server_address),
        server_port = COALESCE($4, server_port),
        kra_pin = COALESCE($5, kra_pin),
        device_serial_number = COALESCE($6, device_serial_number),
        sr_number = COALESCE($7, sr_number),
        updated_at = NOW()
      WHERE id = $8
    `, [bhf_id, device_token, server_address, server_port, kra_pin, device_serial_number || null, sr_number ? parseInt(sr_number) : null, branch_id])

    return NextResponse.json({ success: true, message: "Branch KRA configuration updated" })
  } catch (error) {
    console.error("Error updating branch KRA config:", error)
    return NextResponse.json({ error: "Failed to update branch configuration" }, { status: 500 })
  }
}
