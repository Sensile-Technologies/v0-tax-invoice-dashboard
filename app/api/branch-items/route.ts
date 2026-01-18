import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("user_session")
  if (!sessionCookie) return null
  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')

    if (!branchId) {
      return NextResponse.json({ success: false, error: "Branch ID required" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const userResult = await client.query(
        `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
         FROM users u
         LEFT JOIN vendors v ON v.email = u.email
         LEFT JOIN staff s ON s.user_id = u.id
         WHERE u.id = $1`,
        [session.id]
      )
      
      if (userResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      const user = userResult.rows[0]
      const userVendorId = user.vendor_id || (await client.query(
        'SELECT b.vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
        [session.id]
      )).rows[0]?.vendor_id

      const branchCheck = await client.query(
        'SELECT id, vendor_id FROM branches WHERE id = $1',
        [branchId]
      )

      if (branchCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
      }

      const branch = branchCheck.rows[0]

      if (branch.vendor_id !== userVendorId) {
        return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
      }

      if (['supervisor', 'manager'].includes(user.role) && user.branch_id !== branchId) {
        return NextResponse.json({ success: false, error: "Access denied to this branch" }, { status: 403 })
      }

      const result = await client.query(
        `SELECT 
          i.id as item_id,
          i.item_code,
          i.item_name,
          i.item_type,
          i.class_code,
          i.tax_type,
          i.origin,
          i.quantity_unit,
          i.package_unit,
          i.status as item_status,
          i.color_code,
          bi.id as branch_item_id,
          bi.sale_price as branch_sale_price,
          bi.purchase_price as branch_purchase_price,
          bi.is_available,
          bi.kra_status,
          bi.kra_last_synced_at,
          true as is_assigned
        FROM items i
        INNER JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
        WHERE i.status = 'active'
        ORDER BY i.item_name`,
        [branchId]
      )

      return NextResponse.json({
        success: true,
        items: result.rows
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error("Error fetching branch items:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { branchId, itemId, salePrice, purchasePrice } = body

    if (!branchId || !itemId || salePrice === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`,
      [session.id]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    const userVendorId = user.vendor_id || (await client.query(
      'SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
      [session.id]
    )).rows[0]?.vendor_id

    const branchCheck = await client.query(
      'SELECT id, vendor_id FROM branches WHERE id = $1',
      [branchId]
    )

    if (branchCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
    }

    const branch = branchCheck.rows[0]

    if (branch.vendor_id !== userVendorId) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    if (['supervisor', 'manager'].includes(user.role) && user.branch_id !== branchId) {
      return NextResponse.json({ success: false, error: "Access denied to this branch" }, { status: 403 })
    }

    const itemCheck = await client.query(
      'SELECT id, vendor_id, branch_id FROM items WHERE id = $1',
      [itemId]
    )

    if (itemCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }
    
    const item = itemCheck.rows[0]
    if (item.vendor_id !== userVendorId && item.branch_id !== branchId) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }

    const result = await client.query(
      `INSERT INTO branch_items (branch_id, item_id, sale_price, purchase_price, is_available)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (branch_id, item_id) 
       DO UPDATE SET sale_price = $3, purchase_price = $4, updated_at = NOW()
       RETURNING *`,
      [branchId, itemId, salePrice, purchasePrice || null]
    )

    return NextResponse.json({
      success: true,
      branchItem: result.rows[0],
      message: "Item price assigned to branch"
    })

  } catch (error) {
    console.error("Error assigning branch item:", error)
    return NextResponse.json({ success: false, error: "Failed to assign item" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { branchItemId, salePrice, purchasePrice, isAvailable } = body

    if (!branchItemId) {
      return NextResponse.json({ success: false, error: "Branch item ID required" }, { status: 400 })
    }

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`,
      [session.id]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    const userVendorId = user.vendor_id || (await client.query(
      'SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
      [session.id]
    )).rows[0]?.vendor_id

    const branchItemCheck = await client.query(
      `SELECT bi.*, b.vendor_id 
       FROM branch_items bi 
       JOIN branches b ON bi.branch_id = b.id 
       WHERE bi.id = $1`,
      [branchItemId]
    )

    if (branchItemCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch item not found" }, { status: 404 })
    }

    const branchItem = branchItemCheck.rows[0]

    if (branchItem.vendor_id !== userVendorId) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    if (['supervisor', 'manager'].includes(user.role) && user.branch_id !== branchItem.branch_id) {
      return NextResponse.json({ success: false, error: "Access denied to this branch" }, { status: 403 })
    }

    const result = await client.query(
      `UPDATE branch_items SET
        sale_price = COALESCE($1, sale_price),
        purchase_price = COALESCE($2, purchase_price),
        is_available = COALESCE($3, is_available),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *`,
      [salePrice, purchasePrice, isAvailable, branchItemId]
    )

    return NextResponse.json({
      success: true,
      branchItem: result.rows[0]
    })

  } catch (error) {
    console.error("Error updating branch item:", error)
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchItemId = searchParams.get('id')
    const preview = searchParams.get('preview') === 'true'

    if (!branchItemId) {
      return NextResponse.json({ success: false, error: "Branch item ID required" }, { status: 400 })
    }

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`,
      [session.id]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    const userVendorId = user.vendor_id || (await client.query(
      'SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
      [session.id]
    )).rows[0]?.vendor_id

    const branchItemCheck = await client.query(
      `SELECT bi.*, b.vendor_id, i.item_name
       FROM branch_items bi 
       JOIN branches b ON bi.branch_id = b.id 
       JOIN items i ON bi.item_id = i.id
       WHERE bi.id = $1`,
      [branchItemId]
    )

    if (branchItemCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch item not found" }, { status: 404 })
    }

    const branchItem = branchItemCheck.rows[0]

    if (branchItem.vendor_id !== userVendorId) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const nozzleCount = await client.query(
      'SELECT COUNT(*) as count FROM nozzles WHERE branch_id = $1 AND item_id = $2',
      [branchItem.branch_id, branchItem.item_id]
    )

    const tankCount = await client.query(
      'SELECT COUNT(*) as count FROM tanks WHERE branch_id = $1 AND item_id = $2',
      [branchItem.branch_id, branchItem.item_id]
    )

    const dispenserCount = await client.query(
      'SELECT COUNT(*) as count FROM dispensers WHERE branch_id = $1 AND item_id = $2',
      [branchItem.branch_id, branchItem.item_id]
    )

    const affectedNozzles = parseInt(nozzleCount.rows[0].count)
    const affectedTanks = parseInt(tankCount.rows[0].count)
    const affectedDispensers = parseInt(dispenserCount.rows[0].count)

    if (preview) {
      return NextResponse.json({
        success: true,
        preview: true,
        itemName: branchItem.item_name,
        affectedNozzles,
        affectedTanks,
        affectedDispensers
      })
    }

    await client.query('BEGIN')

    try {
      if (affectedNozzles > 0) {
        await client.query(
          'DELETE FROM nozzles WHERE branch_id = $1 AND item_id = $2',
          [branchItem.branch_id, branchItem.item_id]
        )
      }

      if (affectedDispensers > 0) {
        await client.query(
          'DELETE FROM dispensers WHERE branch_id = $1 AND item_id = $2',
          [branchItem.branch_id, branchItem.item_id]
        )
      }

      if (affectedTanks > 0) {
        await client.query(
          'DELETE FROM tanks WHERE branch_id = $1 AND item_id = $2',
          [branchItem.branch_id, branchItem.item_id]
        )
      }

      await client.query('DELETE FROM branch_items WHERE id = $1', [branchItemId])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: "Item removed from branch",
        deletedNozzles: affectedNozzles,
        deletedTanks: affectedTanks,
        deletedDispensers: affectedDispensers
      })
    } catch (txError) {
      await client.query('ROLLBACK')
      throw txError
    }

  } catch (error) {
    console.error("Error removing branch item:", error)
    return NextResponse.json({ success: false, error: "Failed to remove item" }, { status: 500 })
  } finally {
    client.release()
  }
}
