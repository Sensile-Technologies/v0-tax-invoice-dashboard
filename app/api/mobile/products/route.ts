import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID required" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // First get the vendor_id for this branch
      const branchResult = await client.query(
        `SELECT vendor_id FROM branches WHERE id = $1`,
        [branchId]
      )
      
      if (branchResult.rows.length === 0) {
        return NextResponse.json({ error: "Branch not found" }, { status: 404 })
      }
      
      const vendorId = branchResult.rows[0].vendor_id

      // Fetch items from branch_items (single source of truth for prices)
      // Only show items that are assigned to this branch with prices configured
      const itemsResult = await client.query(
        `SELECT 
          i.id, 
          i.item_code as item_cd, 
          i.item_name as item_nm, 
          COALESCE(i.class_code, 'ITEM') as item_cls_cd, 
          'L' as pkg_unit_cd, 
          'L' as qty_unit_cd,
          bi.sale_price as unit_price,
          COALESCE(
            (SELECT t.current_stock FROM tanks t 
             WHERE (t.kra_item_cd = i.item_code OR t.item_id = i.id)
             AND t.branch_id = $1 
             AND t.status = 'active' 
             LIMIT 1),
            0
          ) as stock_quantity,
          COALESCE(i.status, 'active') as status
         FROM items i
         JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
         WHERE bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND i.status = 'active'
         ORDER BY i.item_name ASC`,
        [branchId]
      )

      return NextResponse.json({
        products: itemsResult.rows || [],
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Products API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
