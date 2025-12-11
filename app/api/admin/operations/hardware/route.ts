import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        h.id, h.serial_number, h.hardware_type as device_type, h.branch_id, h.status,
        h.assigned_to, h.assigned_date as assigned_at, h.created_at,
        b.bhf_nm as branch_name,
        m.name as merchant_name,
        u.username as assigned_user_name
      FROM hardware h
      LEFT JOIN branches b ON h.branch_id = b.id
      LEFT JOIN merchants m ON b.vendor_id = m.id
      LEFT JOIN users u ON h.assigned_to = u.id
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
    const { serial_number, device_type, status, branch_id, assigned_to } = await request.json()

    const result = await query(`
      INSERT INTO hardware (serial_number, hardware_type, status, branch_id, assigned_to, assigned_date)
      VALUES ($1, $2, $3, $4, $5, CASE WHEN $4 IS NOT NULL THEN NOW() ELSE NULL END)
      RETURNING *
    `, [serial_number, device_type, status || 'active', branch_id || null, assigned_to || null])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error adding hardware:", error)
    return NextResponse.json({ error: "Failed to add hardware" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, branch_id, assigned_to, status, serial_number, device_type } = await request.json()

    // Build dynamic update query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (serial_number !== undefined) {
      updates.push(`serial_number = $${paramIndex++}`)
      values.push(serial_number)
    }
    if (device_type !== undefined) {
      updates.push(`hardware_type = $${paramIndex++}`)
      values.push(device_type)
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      values.push(status)
    }
    if (branch_id !== undefined) {
      updates.push(`branch_id = $${paramIndex++}`)
      values.push(branch_id)
      updates.push(`assigned_date = NOW()`)
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`)
      values.push(assigned_to)
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query(`
      UPDATE hardware 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values)

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating hardware:", error)
    return NextResponse.json({ error: "Failed to update hardware" }, { status: 500 })
  }
}
