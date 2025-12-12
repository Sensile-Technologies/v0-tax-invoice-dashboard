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
      const result = await client.query(
        `SELECT 
          id, item_cd, item_nm, item_cls_cd, pkg_unit_cd, qty_unit_cd,
          dflt_prc as unit_price, avail_qty as stock_quantity,
          CASE WHEN use_yn = 'Y' THEN 'active' ELSE 'inactive' END as status
         FROM items 
         WHERE branch_id = $1 
         ORDER BY item_nm ASC`,
        [branchId]
      )

      return NextResponse.json({
        products: result.rows,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Products API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
