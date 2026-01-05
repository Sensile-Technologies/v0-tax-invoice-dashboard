import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')

    if (!branchId) {
      // No branch specified - return empty or all from fuel_prices table
      const result = await pool.query('SELECT * FROM fuel_prices ORDER BY effective_date DESC')
      return NextResponse.json({ success: true, data: result.rows })
    }

    // PRIMARY SOURCE: Get fuel prices from branch_items (what Inventory Management updates)
    const branchItemsResult = await pool.query(
      `SELECT DISTINCT ON (
         CASE 
           WHEN UPPER(i.item_name) LIKE '%DIESEL%' THEN 'Diesel'
           WHEN UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%' THEN 'Petrol'
           WHEN UPPER(i.item_name) LIKE '%KEROSENE%' THEN 'Kerosene'
           ELSE i.item_name
         END
       )
         CASE 
           WHEN UPPER(i.item_name) LIKE '%DIESEL%' THEN 'Diesel'
           WHEN UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%' THEN 'Petrol'
           WHEN UPPER(i.item_name) LIKE '%KEROSENE%' THEN 'Kerosene'
           ELSE i.item_name
         END as fuel_type,
         COALESCE(bi.sale_price, i.sale_price) as price,
         bi.updated_at as effective_date,
         $1::uuid as branch_id
       FROM branch_items bi
       JOIN items i ON bi.item_id = i.id
       WHERE bi.branch_id = $1
         AND bi.is_available = true
         AND (UPPER(i.item_name) IN ('PETROL', 'DIESEL', 'KEROSENE', 'SUPER PETROL', 'V-POWER') 
              OR i.item_name ILIKE '%petrol%' 
              OR i.item_name ILIKE '%diesel%'
              OR i.item_name ILIKE '%kerosene%')
       ORDER BY 
         CASE 
           WHEN UPPER(i.item_name) LIKE '%DIESEL%' THEN 'Diesel'
           WHEN UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%' THEN 'Petrol'
           WHEN UPPER(i.item_name) LIKE '%KEROSENE%' THEN 'Kerosene'
           ELSE i.item_name
         END,
         bi.updated_at DESC NULLS LAST`,
      [branchId]
    )

    // If we found prices in branch_items, use those
    if (branchItemsResult.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: branchItemsResult.rows
      })
    }

    // FALLBACK: Check legacy fuel_prices table
    const legacyResult = await pool.query(
      'SELECT * FROM fuel_prices WHERE branch_id = $1 ORDER BY effective_date DESC',
      [branchId]
    )

    return NextResponse.json({
      success: true,
      data: legacyResult.rows
    })

  } catch (error: any) {
    console.error("Error fetching fuel prices:", error)
    return NextResponse.json(
      { error: "Failed to fetch fuel prices", details: error.message },
      { status: 500 }
    )
  }
}
