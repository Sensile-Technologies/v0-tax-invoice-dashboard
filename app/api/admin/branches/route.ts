import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT 
        b.id,
        b.bhf_id,
        b.bhf_nm,
        b.status,
        v.id as vendor_id,
        v.name as vendor_name
      FROM branches b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      ORDER BY v.name, b.bhf_id
    `)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
  }
}
