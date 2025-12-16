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
      const itemsResult = await client.query(
        `SELECT 
          i.id, 
          i.item_code as item_cd, 
          i.item_name as item_nm, 
          COALESCE(i.class_code, 'ITEM') as item_cls_cd, 
          'L' as pkg_unit_cd, 
          'L' as qty_unit_cd,
          COALESCE(
            (SELECT fp.price FROM fuel_prices fp 
             WHERE fp.branch_id = i.branch_id 
             AND LOWER(fp.fuel_type) = LOWER(i.item_name)
             AND fp.effective_date <= CURRENT_DATE
             ORDER BY fp.effective_date DESC LIMIT 1),
            i.sale_price,
            0
          ) as unit_price,
          COALESCE(
            (SELECT t.current_stock FROM tanks t 
             WHERE t.kra_item_cd = i.item_code 
             AND t.branch_id = i.branch_id 
             AND t.status = 'active' 
             LIMIT 1),
            0
          ) as stock_quantity,
          COALESCE(i.status, 'active') as status
         FROM items i
         WHERE i.branch_id = $1 
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
