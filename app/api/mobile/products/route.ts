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
      const fuelResult = await client.query(
        `SELECT 
          fp.id,
          fp.fuel_type as item_cd,
          CASE 
            WHEN fp.fuel_type = 'PMS' THEN 'Petrol (Super)'
            WHEN fp.fuel_type = 'AGO' THEN 'Diesel (AGO)'
            WHEN fp.fuel_type = 'DPK' THEN 'Kerosene (DPK)'
            WHEN fp.fuel_type = 'LPG' THEN 'LPG Gas'
            WHEN fp.fuel_type = 'Petrol' THEN 'Super Petrol'
            WHEN fp.fuel_type = 'Kerosene' THEN 'Kerosene'
            WHEN fp.fuel_type = 'Diesel' THEN 'Diesel'
            ELSE fp.fuel_type
          END as item_nm,
          'FUEL' as item_cls_cd,
          'L' as pkg_unit_cd,
          'L' as qty_unit_cd,
          fp.price as unit_price,
          COALESCE(
            (SELECT SUM(current_stock) FROM tanks t WHERE t.branch_id = fp.branch_id AND t.fuel_type = fp.fuel_type),
            0
          ) as stock_quantity,
          'active' as status
        FROM fuel_prices fp
        WHERE fp.branch_id = $1
          AND fp.effective_date = (
            SELECT MAX(fp2.effective_date) 
            FROM fuel_prices fp2 
            WHERE fp2.branch_id = fp.branch_id 
              AND fp2.fuel_type = fp.fuel_type 
              AND fp2.effective_date <= CURRENT_DATE
          )
        ORDER BY fp.fuel_type`,
        [branchId]
      )

      const itemsResult = await client.query(
        `SELECT 
          id, item_cd, item_nm, item_cls_cd, pkg_unit_cd, qty_unit_cd,
          dflt_prc as unit_price, avail_qty as stock_quantity,
          CASE WHEN use_yn = 'Y' THEN 'active' ELSE 'inactive' END as status
         FROM items 
         WHERE branch_id = $1 
         ORDER BY item_nm ASC`,
        [branchId]
      )

      const allProducts = [...(fuelResult.rows || []), ...(itemsResult.rows || [])]

      return NextResponse.json({
        products: allProducts,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Products API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
