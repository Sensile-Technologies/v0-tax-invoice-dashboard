import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const session = JSON.parse(sessionCookie.value)
    const { vendor_id } = session
    const { id: branchId } = await params

    const result = await pool.query(
      `SELECT id, name, bulk_sales_kra_percentage 
       FROM branches 
       WHERE id = $1 AND ($2::uuid IS NULL OR vendor_id = $2)`,
      [branchId, vendor_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        branch_id: result.rows[0].id,
        branch_name: result.rows[0].name,
        intermittency_rate: result.rows[0].bulk_sales_kra_percentage || 100
      }
    })

  } catch (error: any) {
    console.error("Error fetching intermittency rate:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const session = JSON.parse(sessionCookie.value)
    const { user_id, vendor_id } = session
    const { id: branchId } = await params

    const userResult = await pool.query(
      `SELECT s.role FROM staff s WHERE s.user_id = $1
       UNION
       SELECT 'vendor' as role FROM vendors v 
       JOIN users u ON u.email = v.email WHERE u.id = $1`,
      [user_id]
    )
    const userRole = userResult.rows[0]?.role

    if (!['director', 'vendor'].includes(userRole)) {
      return NextResponse.json({ error: "Only directors and vendors can modify the intermittency rate" }, { status: 403 })
    }

    const body = await request.json()
    const { intermittency_rate } = body

    if (intermittency_rate === undefined || intermittency_rate === null) {
      return NextResponse.json({ error: "intermittency_rate is required" }, { status: 400 })
    }

    const rate = parseInt(intermittency_rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return NextResponse.json({ error: "intermittency_rate must be between 0 and 100" }, { status: 400 })
    }

    const branchCheck = await pool.query(
      `SELECT id FROM branches WHERE id = $1 AND ($2::uuid IS NULL OR vendor_id = $2)`,
      [branchId, vendor_id]
    )

    if (branchCheck.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found or access denied" }, { status: 404 })
    }

    await pool.query(
      `UPDATE branches SET bulk_sales_kra_percentage = $1, updated_at = NOW() WHERE id = $2`,
      [rate, branchId]
    )

    return NextResponse.json({
      success: true,
      message: `Intermittency rate updated to ${rate}%`,
      data: {
        branch_id: branchId,
        intermittency_rate: rate
      }
    })

  } catch (error: any) {
    console.error("Error updating intermittency rate:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
