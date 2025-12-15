import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT u.id, u.email, u.username, u.role, 
       v.id as vendor_id, v.name as vendor_name,
       COALESCE(s.branch_id, vb.id) as branch_id, 
       COALESCE(b.name, vb.name) as branch_name,
       COALESCE(b.bhf_id, vb.bhf_id) as bhf_id
       FROM users u 
       LEFT JOIN vendors v ON v.email = u.email 
       LEFT JOIN staff s ON s.user_id = u.id
       LEFT JOIN branches b ON b.id = s.branch_id
       LEFT JOIN branches vb ON vb.vendor_id = v.id AND vb.is_main = true
       WHERE u.id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'vendor',
        vendor_id: user.vendor_id,
        vendor_name: user.vendor_name,
        branch_id: user.branch_id,
        branch_name: user.branch_name,
        bhf_id: user.bhf_id
      }
    })

  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}
