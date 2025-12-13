import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        s.id,
        s.full_name,
        s.username,
        s.email,
        s.phone_number,
        s.role,
        s.status,
        s.branch_id,
        b.name as branch_name
      FROM staff s
      LEFT JOIN branches b ON s.branch_id = b.id
      ORDER BY s.created_at DESC
    `)

    return NextResponse.json({ staff: result })
  } catch (error: any) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff", details: error.message },
      { status: 500 }
    )
  }
}
