import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const vendorId = searchParams.get("vendor_id")

    let sql = `
      SELECT 
        t.*,
        v.name as vendor_name,
        b.name as branch_name,
        c.name as category_name,
        c.color as category_color,
        u.username as assigned_username,
        creator.username as created_by_username
      FROM support_tickets t
      LEFT JOIN vendors v ON v.id = t.vendor_id
      LEFT JOIN branches b ON b.id = t.branch_id
      LEFT JOIN ticket_categories c ON c.id = t.category_id
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN users creator ON creator.id = t.created_by
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      sql += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (vendorId) {
      sql += ` AND t.vendor_id = $${paramIndex}`
      params.push(vendorId)
      paramIndex++
    }

    sql += " ORDER BY t.created_at DESC"

    const tickets = await query(sql, params)

    return NextResponse.json(tickets)
  } catch (error: any) {
    console.error("[Admin] Error fetching tickets:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendor_id, branch_id, category_id, subject, description, priority, created_by } = body

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-8)}`

    const result = await query(
      `INSERT INTO support_tickets (ticket_number, vendor_id, branch_id, category_id, subject, description, priority, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [ticketNumber, vendor_id, branch_id, category_id, subject, description, priority || 'medium', created_by]
    )

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("[Admin] Error creating ticket:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
