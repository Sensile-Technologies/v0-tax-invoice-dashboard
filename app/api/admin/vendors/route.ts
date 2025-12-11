import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const vendors = await query(`
      SELECT 
        v.*,
        COUNT(DISTINCT b.id) as branch_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'open') as open_tickets
      FROM vendors v
      LEFT JOIN branches b ON b.vendor_id = v.id
      LEFT JOIN support_tickets t ON t.vendor_id = v.id
      GROUP BY v.id
      ORDER BY v.name
    `)

    return NextResponse.json(vendors)
  } catch (error: any) {
    console.error("[Admin] Error fetching vendors:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, billing_email, subscription_plan } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO vendors (name, email, phone, address, billing_email, subscription_plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, address, billing_email || email, subscription_plan || 'basic']
    )

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("[Admin] Error creating vendor:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
