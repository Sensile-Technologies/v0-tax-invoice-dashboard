import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

async function getUserVendorId(userId: string): Promise<string | null> {
  const userVendor = await query(
    `SELECT v.id FROM users u 
     JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  )
  if (userVendor && userVendor.length > 0) {
    return userVendor[0].id
  }

  const staffVendor = await query(
    `SELECT DISTINCT b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
    [userId]
  )
  if (staffVendor && staffVendor.length > 0) {
    return staffVendor[0].vendor_id
  }

  const branchVendor = await query(
    `SELECT DISTINCT vendor_id FROM branches WHERE user_id = $1 AND vendor_id IS NOT NULL`,
    [userId]
  )
  if (branchVendor && branchVendor.length > 0) {
    return branchVendor[0].vendor_id
  }

  return null
}

async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    return session.id || null
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { id } = await params

    const orderResult = await query(
      `SELECT 
        po.*,
        b.name as branch_name,
        vp.name as supplier_name,
        u.full_name as created_by_name
       FROM purchase_orders po
       LEFT JOIN branches b ON po.branch_id = b.id
       LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
       LEFT JOIN users u ON po.created_by = u.id
       WHERE po.id = $1 AND po.vendor_id = $2`,
      [id, vendorId]
    )

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ success: false, error: "Purchase order not found" }, { status: 404 })
    }

    const items = await query(
      `SELECT * FROM purchase_order_items WHERE purchase_order_id = $1 ORDER BY created_at`,
      [id]
    )

    return NextResponse.json({ 
      success: true, 
      data: { ...orderResult[0], items } 
    })
  } catch (error) {
    console.error("Error fetching purchase order:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch purchase order" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes, expected_delivery, branch_id } = body

    const existing = await query(
      `SELECT id FROM purchase_orders WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: "Purchase order not found" }, { status: 404 })
    }

    if (branch_id) {
      const branchCheck = await query(
        `SELECT id FROM branches WHERE id = $1 AND vendor_id = $2`,
        [branch_id, vendorId]
      )
      if (!branchCheck || branchCheck.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid branch" }, { status: 400 })
      }
    }

    const result = await query(
      `UPDATE purchase_orders 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           expected_delivery = COALESCE($3, expected_delivery),
           branch_id = COALESCE($4, branch_id),
           updated_at = NOW()
       WHERE id = $5 AND vendor_id = $6
       RETURNING *`,
      [status, notes, expected_delivery, branch_id, id, vendorId]
    )

    return NextResponse.json({ 
      success: true, 
      data: result[0],
      message: "Purchase order updated successfully" 
    })
  } catch (error) {
    console.error("Error updating purchase order:", error)
    return NextResponse.json({ success: false, error: "Failed to update purchase order" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { id } = await params

    const result = await query(
      `DELETE FROM purchase_orders WHERE id = $1 AND vendor_id = $2 AND status = 'pending' RETURNING id`,
      [id, vendorId]
    )

    if (!result || result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Purchase order not found or cannot be deleted (only pending orders can be deleted)" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Purchase order deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting purchase order:", error)
    return NextResponse.json({ success: false, error: "Failed to delete purchase order" }, { status: 500 })
  }
}
