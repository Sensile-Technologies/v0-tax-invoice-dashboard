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
        `SELECT id, name, fuel_type, status 
         FROM nozzles 
         WHERE branch_id = $1 AND status = 'active'
         ORDER BY name ASC`,
        [branchId]
      )

      const fuelPricesResult = await client.query(
        `SELECT fuel_type, price 
         FROM fuel_prices 
         WHERE branch_id = $1 
         ORDER BY effective_date DESC`,
        [branchId]
      )

      return NextResponse.json({
        nozzles: nozzlesResult.rows,
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
