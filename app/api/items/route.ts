import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

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

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const body = await request.json()
    const {
      vendorId,
      branchId,
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

    if (!vendorId) {
      return NextResponse.json(
        { error: "Session expired or vendor not found. Please login again." },
        { status: 401 }
      )
    }

    // CATALOG-ONLY ENFORCEMENT: Items must be created at HQ level (branch_id = NULL)
    // Branch-specific pricing is managed via branch_items table
    if (branchId) {
      console.log("[Items API] Rejecting legacy item creation - use HQ catalog instead")
      return NextResponse.json(
        { error: "Items can only be created at headquarters level. Please use the HQ Items catalog to create items, then assign them to branches with pricing." },
        { status: 400 }
      )
    }

    if (!itemName || !itemType || !classCode || !taxType || !origin || !quantityUnit || !packageUnit) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      )
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
        { error: "Item code already exists. Please try again." },
        { status: 409 }
      )
    }

    // Create catalog item (branch_id = NULL)
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

    const createdItem = insertResult.rows[0]

    return NextResponse.json({
      success: true,
      item: createdItem,
      itemCode: itemCode,
      message: `Item created successfully in catalog with code: ${itemCode}. Assign to branches to configure pricing and sync with KRA.`
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error("Error creating item:", error)
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const branchId = searchParams.get('branchId')
    const catalogOnly = searchParams.get('catalog') === 'true'

    // For HQ catalog items (branch_id IS NULL), use vendorId + catalog=true
    if (catalogOnly && vendorId) {
      const result = await pool.query(
        `SELECT * FROM items WHERE vendor_id = $1 AND branch_id IS NULL ORDER BY item_name ASC`,
        [vendorId]
      )
      return NextResponse.json({
        success: true,
        items: result.rows
      })
    }

    // CRITICAL: branchId is required to prevent cross-branch data leakage
    if (!branchId) {
      return NextResponse.json({
        success: false,
        error: "Branch ID is required",
        items: []
      }, { status: 400 })
    }

    let query = 'SELECT * FROM items WHERE branch_id = $1'
    const params: string[] = [branchId]

    if (vendorId) {
      params.push(vendorId)
      query += ` AND vendor_id = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      items: result.rows
    })

  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 })
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
    const userBranchId = user.branch_id

    const itemCheck = await client.query(
      'SELECT id, item_name, branch_id, vendor_id FROM items WHERE id = $1',
      [itemId]
    )

    if (itemCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }

    const item = itemCheck.rows[0]

    if (item.branch_id === null) {
      return NextResponse.json({ 
        success: false, 
        error: "This is a catalog item. Delete it from Headquarters > Items instead." 
      }, { status: 400 })
    }

    if (!['director', 'vendor', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Access denied. Only managers and above can delete items." }, { status: 403 })
    }

    if (['supervisor', 'manager'].includes(user.role) && item.branch_id !== userBranchId) {
      return NextResponse.json({ success: false, error: "Access denied to this branch's items" }, { status: 403 })
    }

    const nozzlesCheck = await client.query(
      'SELECT COUNT(*) as count FROM nozzles WHERE item_id = $1',
      [itemId]
    )
    if (parseInt(nozzlesCheck.rows[0].count) > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete item - it is linked to nozzles. Remove nozzle links first." 
      }, { status: 400 })
    }

    const tanksCheck = await client.query(
      'SELECT COUNT(*) as count FROM tanks WHERE item_id = $1',
      [itemId]
    )
    if (parseInt(tanksCheck.rows[0].count) > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete item - it is linked to tanks. Remove tank links first." 
      }, { status: 400 })
    }

    await client.query('DELETE FROM items WHERE id = $1', [itemId])

    return NextResponse.json({
      success: true,
      message: `Legacy item "${item.item_name}" deleted successfully`
    })

  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 })
  } finally {
    client.release()
  }
}
