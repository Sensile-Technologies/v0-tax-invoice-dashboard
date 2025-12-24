import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dispenser_id, tank_ids, branch_id } = body

    if (!dispenser_id) {
      return NextResponse.json(
        { success: false, error: "dispenser_id is required" },
        { status: 400 }
      )
    }

    // Filter out any null/undefined/empty tank_ids
    const tankIdsArray = (tank_ids || []).filter((id: any) => id && typeof id === 'string' && id.trim() !== '')

    console.log("Assigning tanks:", { dispenser_id, tankIdsArray, rawTankIds: tank_ids })

    await pool.query('DELETE FROM dispenser_tanks WHERE dispenser_id = $1', [dispenser_id])

    let fuelTypes: string[] = []
    let itemId: string | null = null

    if (tankIdsArray.length > 0) {
      const tanksResult = await pool.query(
        'SELECT id, fuel_type, item_id FROM tanks WHERE id = ANY($1::uuid[])',
        [tankIdsArray]
      )
      
      fuelTypes = [...new Set(tanksResult.rows.map((t: any) => t.fuel_type))]
      const tankWithItem = tanksResult.rows.find((t: any) => t.item_id)
      if (tankWithItem) {
        itemId = tankWithItem.item_id
      }

      // Insert only valid tank IDs that exist in the database
      for (const tank of tanksResult.rows) {
        await pool.query(
          'INSERT INTO dispenser_tanks (dispenser_id, tank_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [dispenser_id, tank.id]
        )
      }
    }

    const fuelType = fuelTypes.length > 0 ? fuelTypes.join("/") : "Pending"
    const primaryTankId = tankIdsArray.length > 0 ? tankIdsArray[0] : null

    await pool.query(
      'UPDATE dispensers SET fuel_type = $1, tank_id = $2, item_id = $3, updated_at = NOW() WHERE id = $4',
      [fuelType, primaryTankId, itemId, dispenser_id]
    )

    const dispenserResult = await pool.query('SELECT dispenser_number FROM dispensers WHERE id = $1', [dispenser_id])
    const dispenserNumber = dispenserResult.rows[0]?.dispenser_number || 1

    let nozzlesCreated = 0
    const createdNozzles: any[] = []
    
    if (tankIdsArray.length > 0) {
      const existingNozzlesResult = await pool.query(
        'SELECT tank_id FROM nozzles WHERE dispenser_id = $1',
        [dispenser_id]
      )
      const existingTankIds = existingNozzlesResult.rows.map((n: any) => n.tank_id)

      const tanksResultForNozzles = await pool.query(
        'SELECT id, fuel_type, item_id, tank_name FROM tanks WHERE id = ANY($1::uuid[])',
        [tankIdsArray]
      )

      for (let i = 0; i < tanksResultForNozzles.rows.length; i++) {
        const tank = tanksResultForNozzles.rows[i]
        
        if (!existingTankIds.includes(tank.id)) {
          const nozzleNumber = i + 1

          const nozzleResult = await pool.query(
            `INSERT INTO nozzles (branch_id, dispenser_id, tank_id, nozzle_number, fuel_type, item_id, status, initial_meter_reading)
             VALUES ($1, $2, $3, $4, $5, $6, 'active', 0)
             RETURNING id, nozzle_number, fuel_type`,
            [branch_id, dispenser_id, tank.id, nozzleNumber, tank.fuel_type, tank.item_id]
          )
          
          if (nozzleResult.rows.length > 0) {
            createdNozzles.push({
              id: nozzleResult.rows[0].id,
              nozzle_number: nozzleResult.rows[0].nozzle_number,
              fuel_type: nozzleResult.rows[0].fuel_type,
              tank_name: tank.tank_name,
              dispenser_number: dispenserNumber
            })
          }
          nozzlesCreated++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tanks assigned successfully",
      nozzlesCreated,
      createdNozzles,
      fuelType,
      itemId
    })

  } catch (error: any) {
    console.error("Error assigning tanks to dispenser:", error)
    return NextResponse.json(
      { success: false, error: "Failed to assign tanks", details: error.message },
      { status: 500 }
    )
  }
}
