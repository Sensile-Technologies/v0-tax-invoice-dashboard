import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        h.id, h.serial_number, h.device_type, h.branch_id, h.status,
        h.assigned_at, h.created_at,
        b.bhf_nm as branch_name,
        v.name as merchant_name
      FROM hardware h
      LEFT JOIN branches b ON h.branch_id = b.id
      LEFT JOIN vendors v ON b.vendor_id = v.id
      ORDER BY h.created_at DESC
    `)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching hardware:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { serial_number, device_type } = await request.json()

    const result = await query(`
      INSERT INTO hardware (serial_number, device_type, status)
      VALUES ($1, $2, 'available')
      RETURNING *
    `, [serial_number, device_type])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error adding hardware:", error)
    return NextResponse.json({ error: "Failed to add hardware" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, branch_id } = await request.json()

    const result = await query(`
      UPDATE hardware 
      SET branch_id = $1, status = 'assigned', assigned_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [branch_id, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating hardware:", error)
    return NextResponse.json({ error: "Failed to update hardware" }, { status: 500 })
  }
}
