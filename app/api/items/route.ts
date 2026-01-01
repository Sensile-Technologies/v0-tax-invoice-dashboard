import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

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

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch not assigned. Please contact your administrator." },
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
      'SELECT id FROM items WHERE item_code = $1 AND branch_id = $2',
      [itemCode, branchId]
    )

    if (existingItem.rows.length > 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: "Item code already exists for this branch. Please try again." },
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
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        'active', NOW(), NOW()
      ) RETURNING *`,
      [
        vendorId,
        branchId || null,
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

    let kraResult = { success: false, kraResponse: null as any, message: "KRA submission pending" }
    
    try {
      const kraResponse = await fetch(`${request.nextUrl.origin}/api/kra/items/saveItems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: createdItem.id,
          branchId: branchId
        })
      })
      kraResult = await kraResponse.json()
      console.log(`[Items API] KRA submission result for ${itemCode}:`, kraResult)
    } catch (kraError) {
      console.error(`[Items API] KRA submission error for ${itemCode}:`, kraError)
    }

    return NextResponse.json({
      success: true,
      item: createdItem,
      itemCode: itemCode,
      kraSubmission: {
        success: kraResult.success,
        status: kraResult.success ? 'success' : 'rejected',
        response: kraResult.kraResponse
      },
      message: `Item created successfully with code: ${itemCode}. KRA submission: ${kraResult.success ? 'Successful' : 'Pending/Rejected'}`
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
