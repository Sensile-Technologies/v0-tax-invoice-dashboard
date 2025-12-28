import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const itemType = searchParams.get("item_type")
    const excludeType = searchParams.get("exclude_type")
    const status = searchParams.get("status")

    if (!branchId) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    const branchResult = await pool.query(
      'SELECT vendor_id FROM branches WHERE id = $1',
      [branchId]
    )

    if (branchResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
    }

    const vendorId = branchResult.rows[0].vendor_id

    let query = `
      SELECT 
        i.id,
        i.vendor_id,
        $1::uuid as branch_id,
        i.item_code,
        i.sku,
        i.item_name,
        i.description,
        i.item_type,
        i.class_code,
        i.tax_type,
        i.origin,
        i.batch_number,
        COALESCE(bi.purchase_price, i.purchase_price) as purchase_price,
        COALESCE(bi.sale_price, i.sale_price) as sale_price,
        i.status,
        i.quantity_unit,
        i.package_unit,
        COALESCE(bi.kra_status, i.kra_status) as kra_status,
        i.kra_response,
        i.kra_last_synced_at,
        i.created_at,
        i.updated_at,
        CASE 
          WHEN bi.id IS NOT NULL THEN 'vendor_catalog'
          WHEN i.branch_id = $1 THEN 'branch_specific'
          ELSE 'unknown'
        END as item_source
      FROM items i
      LEFT JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1 AND bi.is_available = true
      WHERE (
        (i.vendor_id = $2 AND i.branch_id IS NULL AND bi.id IS NOT NULL)
        OR 
        (i.branch_id = $1)
      )
    `
    
    const params: any[] = [branchId, vendorId]
    let paramIndex = 3

    if (status) {
      query += ` AND i.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (itemType) {
      query += ` AND i.item_type = $${paramIndex}`
      params.push(itemType)
      paramIndex++
    }

    if (excludeType) {
      query += ` AND i.item_type != $${paramIndex}`
      params.push(excludeType)
      paramIndex++
    }

    query += " ORDER BY i.item_name"

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 })
  }
}
