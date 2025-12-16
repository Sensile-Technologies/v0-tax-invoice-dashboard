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

      const fuelPricesResult = await client.query(
        `SELECT item_name as fuel_type, sale_price as price 
         FROM items 
         WHERE branch_id = $1 
         AND (UPPER(item_name) IN ('PETROL', 'DIESEL', 'KEROSENE') 
              OR item_name ILIKE '%petrol%' 
              OR item_name ILIKE '%diesel%')
         ORDER BY item_name`,
        [branchId]
      )

      const nozzles = nozzlesResult.rows.map(n => ({
        id: n.id,
        name: `D${n.dispenser_number || 1}N${n.nozzle_number} - ${n.fuel_type}`,
        fuel_type: n.fuel_type,
        status: n.status,
      }))

      return NextResponse.json({
        nozzles: nozzles,
        fuel_prices: fuelPricesResult.rows,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[Mobile Nozzles API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch nozzles" }, { status: 500 })
  }
}
