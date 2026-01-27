import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    
    let vendorId = null
    let branchId = null
    
    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value)
        vendorId = session.vendor_id
        branchId = session.branch_id
      } catch (e) {}
    }

    const notifications = await query(`
      SELECT 
        id,
        title,
        message,
        type,
        priority,
        created_at
      FROM admin_notifications
      WHERE is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (
          target_audience = 'all'
          OR (target_audience = 'vendor' AND vendor_id = $1)
          OR (target_audience = 'branch' AND branch_id = $2)
        )
      ORDER BY priority DESC, created_at DESC
      LIMIT 20
    `, [vendorId, branchId])

    return NextResponse.json({
      success: true,
      notifications: notifications || []
    })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({
      success: true,
      notifications: []
    })
  }
}
