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
        `SELECT n.id, n.nozzle_number, n.fuel_type, n.status, d.dispenser_number
         FROM nozzles n 
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         WHERE n.branch_id = $1 AND n.status = 'active'
         ORDER BY d.dispenser_number, n.nozzle_number ASC`,
        [branchId]
      )

      // Get fuel prices - check multiple sources in order of priority:
      // 1. branch_items (branch-specific prices from Inventory Management)
      // 2. items table (legacy/default prices)
      // 3. fuel_prices table (fallback for older setup)
      
      // First, get prices from branch_items (primary source - what Inventory Management updates)
      const branchItemsResult = await client.query(
        `SELECT DISTINCT ON (UPPER(i.item_name))
           i.item_name, 
           COALESCE(bi.sale_price, i.sale_price) as price,
           bi.sale_price as branch_price,
           i.sale_price as default_price
         FROM branch_items bi
         JOIN items i ON bi.item_id = i.id
         WHERE bi.branch_id = $1
           AND bi.is_available = true
           AND (UPPER(i.item_name) IN ('PETROL', 'DIESEL', 'KEROSENE', 'SUPER PETROL', 'V-POWER') 
                OR i.item_name ILIKE '%petrol%' 
                OR i.item_name ILIKE '%diesel%'
                OR i.item_name ILIKE '%kerosene%')
         ORDER BY UPPER(i.item_name), bi.updated_at DESC NULLS LAST`,
        [branchId]
      )

      // Fallback: check fuel_prices table if no branch_items found
      let fuelPricesFromTable: { fuel_type: string, price: number }[] = []
      if (branchItemsResult.rows.length === 0) {
        const fuelTableResult = await client.query(
          `SELECT fuel_type, price FROM fuel_prices 
           WHERE branch_id = $1 
           ORDER BY effective_date DESC`,
          [branchId]
        )
        fuelPricesFromTable = fuelTableResult.rows.map(fp => ({
          fuel_type: fp.fuel_type,
          price: parseFloat(fp.price)
        }))
      }

      // Process branch_items results
      const fuelPrices = branchItemsResult.rows.length > 0 
        ? branchItemsResult.rows.map(fp => {
            const itemName = fp.item_name.toUpperCase()
            let fuelType = fp.item_name
            if (itemName.includes('DIESEL')) fuelType = 'Diesel'
            else if (itemName.includes('PETROL') || itemName.includes('SUPER')) fuelType = 'Petrol'
            else if (itemName.includes('KEROSENE')) fuelType = 'Kerosene'
            // Use branch_price if set, otherwise default_price
            const price = fp.branch_price !== null ? parseFloat(fp.branch_price) : parseFloat(fp.default_price || 0)
            return { fuel_type: fuelType, price }
          })
        : fuelPricesFromTable

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
