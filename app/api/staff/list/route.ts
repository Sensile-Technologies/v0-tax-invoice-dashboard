import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendor_id")
    const userId = searchParams.get("user_id")
    
    let vendorFilter = null
    
    if (vendorId) {
      vendorFilter = vendorId
    } else if (userId) {
      const userResult = await query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      )
      if (userResult && userResult.length > 0) {
        vendorFilter = userResult[0].vendor_id
      }
    }
    
    let result
    if (vendorFilter) {
      result = await query(`
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
        WHERE b.vendor_id = $1
        ORDER BY s.created_at DESC
      `, [vendorFilter])
    } else {
      result = await query(`
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
    }

    return NextResponse.json({ staff: result })
  } catch (error: any) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff", details: error.message },
      { status: 500 }
    )
  }
}
