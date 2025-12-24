import { NextRequest, NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
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

async function getNextPONumber(vendorId: string): Promise<string> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const result = await client.query(
      `INSERT INTO vendor_po_sequences (vendor_id, next_po_number)
       VALUES ($1, 2)
       ON CONFLICT (vendor_id) 
       DO UPDATE SET next_po_number = vendor_po_sequences.next_po_number + 1
       RETURNING next_po_number - 1 as current_number`,
      [vendorId]
    )
    
    await client.query('COMMIT')
    
    const poNumber = result.rows[0].current_number
    return `PO-${String(poNumber).padStart(5, '0')}`
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "100")

    let sql = `
      SELECT 
        po.*,
        b.name as branch_name,
        vp.name as supplier_name,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount
      FROM purchase_orders po
      LEFT JOIN branches b ON po.branch_id = b.id
      LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.vendor_id = $1
    `
    const params: any[] = [vendorId]
    let paramIndex = 2

    if (branchId) {
      sql += ` AND po.branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (status) {
      sql += ` AND po.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    sql += ` ORDER BY po.issued_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const orders = await query(sql, params)

    return NextResponse.json({ 
      success: true, 
      data: orders 
    })
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch purchase orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getUserVendorId(userId)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "No vendor found for user" }, { status: 403 })
    }

    const body = await request.json()
    const { branch_id, supplier_id, expected_delivery, notes, items } = body

    if (!branch_id) {
      return NextResponse.json({ success: false, error: "Branch is required" }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "At least one item is required" }, { status: 400 })
    }

    const poNumber = await getNextPONumber(vendorId)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const orderResult = await client.query(
        `INSERT INTO purchase_orders (vendor_id, branch_id, supplier_id, po_number, expected_delivery, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [vendorId, branch_id, supplier_id || null, poNumber, expected_delivery || null, notes || null, userId]
      )

      const order = orderResult.rows[0]

      for (const item of items) {
        await client.query(
          `INSERT INTO purchase_order_items (purchase_order_id, item_id, item_name, quantity, unit_price, total_amount)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, item.item_id || null, item.item_name, item.quantity, item.unit_price || null, item.total_amount || null]
        )
      }

      await client.query('COMMIT')

      return NextResponse.json({ 
        success: true, 
        data: order,
        message: `Purchase order ${poNumber} created successfully` 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating purchase order:", error)
    return NextResponse.json({ success: false, error: "Failed to create purchase order" }, { status: 500 })
  }
}
