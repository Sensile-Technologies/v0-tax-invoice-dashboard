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
      const nozzlesResult = await client.query(
        `SELECT n.id, n.nozzle_number, i.item_name as fuel_type, n.status, d.dispenser_number
         FROM nozzles n 
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         JOIN items i ON n.item_id = i.id
         WHERE n.branch_id = $1 AND n.status = 'active'
         ORDER BY d.dispenser_number, n.nozzle_number ASC`,
        [branchId]
      )

      // Get fuel prices from branch_items (single source of truth)
      const branchItemsResult = await client.query(
        `SELECT DISTINCT ON (UPPER(i.item_name))
           i.item_name, 
           bi.sale_price as price
         FROM branch_items bi
         JOIN items i ON bi.item_id = i.id
         WHERE bi.branch_id = $1
           AND bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND (UPPER(i.item_name) IN ('PETROL', 'DIESEL', 'KEROSENE', 'SUPER PETROL', 'V-POWER') 
                OR i.item_name ILIKE '%petrol%' 
                OR i.item_name ILIKE '%diesel%'
                OR i.item_name ILIKE '%kerosene%')
         ORDER BY UPPER(i.item_name), bi.updated_at DESC NULLS LAST`,
        [branchId]
      )

      // Process branch_items results to normalized fuel types
      const fuelPrices = branchItemsResult.rows.map(fp => {
        const itemName = fp.item_name.toUpperCase()
        let fuelType = fp.item_name
        if (itemName.includes('DIESEL')) fuelType = 'Diesel'
        else if (itemName.includes('PETROL') || itemName.includes('SUPER')) fuelType = 'Petrol'
        else if (itemName.includes('KEROSENE')) fuelType = 'Kerosene'
        return { fuel_type: fuelType, price: parseFloat(fp.price) }
      })

      const nozzles = nozzlesResult.rows.map(n => {
        const fuelPrice = fuelPrices.find(fp => 
          fp.fuel_type.toUpperCase() === n.fuel_type.toUpperCase()
        )
        return {
          id: n.id,
          name: `D${n.dispenser_number || 1}N${n.nozzle_number} - ${n.fuel_type}`,
          fuel_type: n.fuel_type,
          status: n.status,
          price: fuelPrice?.price || 0,
        }
      })

      return NextResponse.json({
        nozzles: nozzles,
        fuel_prices: fuelPrices,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Nozzles API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch nozzles" }, { status: 500 })
  }
}
