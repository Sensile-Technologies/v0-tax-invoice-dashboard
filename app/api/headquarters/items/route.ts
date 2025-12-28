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

function generateItemCode(
  origin: string,
  itemType: string,
  packageUnit: string,
  quantityUnit: string,
  itemCount: number
): string {
  const paddedCount = String(itemCount).padStart(7, '0')
  return `${origin}${itemType}${packageUnit}${quantityUnit}${paddedCount}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const client = await pool.connect()
    try {
      const userResult = await client.query(
        `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id
         FROM users u
         LEFT JOIN vendors v ON v.email = u.email
         LEFT JOIN staff s ON s.user_id = u.id
         LEFT JOIN branches b ON b.id = s.branch_id
         WHERE u.id = $1`,
        [session.id]
      )
      
      if (userResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      const user = userResult.rows[0]
      const vendorId = user.vendor_id || (await client.query(
        'SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
        [session.id]
      )).rows[0]?.vendor_id
      
      if (!['director', 'vendor'].includes(user.role)) {
        return NextResponse.json({ success: false, error: "Access denied. HQ access required." }, { status: 403 })
      }

      if (!vendorId) {
        return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
      }

      const result = await client.query(
        `SELECT i.*, 
         (SELECT COUNT(*) FROM branch_items bi WHERE bi.item_id = i.id) as assigned_branches
         FROM items i 
         WHERE i.vendor_id = $1 AND i.branch_id IS NULL
         ORDER BY i.created_at DESC`,
        [vendorId]
      )

      return NextResponse.json({
        success: true,
        items: result.rows
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error("Error fetching HQ items:", error)
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

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id
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
    const vendorId = user.vendor_id || (await client.query(
      'SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
      [session.id]
    )).rows[0]?.vendor_id
    
    if (!['director', 'vendor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Access denied. Only HQ can create items." }, { status: 403 })
    }

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      itemName,
      description,
      itemType,
      classCode,
      taxType,
      origin,
      batchNumber,
      purchasePrice,
      salePrice,
      sku,
      quantityUnit,
      packageUnit
    } = body

    if (!itemName || !itemType || !classCode || !taxType || !origin || !quantityUnit || !packageUnit) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const vendorResult = await client.query(
      'SELECT item_count FROM vendors WHERE id = $1 FOR UPDATE',
      [vendorId]
    )

    if (vendorResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const currentItemCount = vendorResult.rows[0].item_count || 0
    const newItemCount = currentItemCount + 1

    const itemCode = generateItemCode(
      origin,
      itemType,
      packageUnit,
      quantityUnit,
      newItemCount
    )

    const existingItem = await client.query(
      'SELECT id FROM items WHERE item_code = $1 AND vendor_id = $2',
      [itemCode, vendorId]
    )

    if (existingItem.rows.length > 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { success: false, error: "Item code already exists. Please try again." },
        { status: 409 }
      )
    }

    const insertResult = await client.query(
      `INSERT INTO items (
        vendor_id, branch_id, item_code, item_name, description,
        item_type, class_code, tax_type, origin, batch_number,
        purchase_price, sale_price, sku, quantity_unit, package_unit,
        status, created_at, updated_at
      ) VALUES (
        $1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        'active', NOW(), NOW()
      ) RETURNING *`,
      [
        vendorId,
        itemCode,
        itemName,
        description || null,
        itemType,
        classCode,
        taxType,
        origin,
        batchNumber || null,
        purchasePrice || 0,
        salePrice || 0,
        sku || null,
        quantityUnit,
        packageUnit
      ]
    )

    await client.query(
      'UPDATE vendors SET item_count = $1 WHERE id = $2',
      [newItemCount, vendorId]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      item: insertResult.rows[0],
      itemCode: itemCode,
      message: `Item created successfully with code: ${itemCode}`
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error("Error creating HQ item:", error)
    return NextResponse.json({ success: false, error: "Failed to create item" }, { status: 500 })
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

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id
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
    const vendorId = user.vendor_id || (await client.query(
      'SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1',
      [session.id]
    )).rows[0]?.vendor_id
    
    if (!['director', 'vendor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Access denied. Only HQ can edit items." }, { status: 403 })
    }

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const body = await request.json()
    const { id, itemName, description, purchasePrice, salePrice, status } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 })
    }

    const itemCheck = await client.query(
      'SELECT id FROM items WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    )

    if (itemCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }

    const updateResult = await client.query(
      `UPDATE items SET
        item_name = COALESCE($1, item_name),
        description = COALESCE($2, description),
        purchase_price = COALESCE($3, purchase_price),
        sale_price = COALESCE($4, sale_price),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $6 AND vendor_id = $7
      RETURNING *`,
      [itemName, description, purchasePrice, salePrice, status, id, vendorId]
    )

    return NextResponse.json({
      success: true,
      item: updateResult.rows[0]
    })

  } catch (error) {
    console.error("Error updating HQ item:", error)
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 })
  } finally {
    client.release()
  }
}
