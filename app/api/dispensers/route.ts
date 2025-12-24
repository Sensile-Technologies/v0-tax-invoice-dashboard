import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const tankId = searchParams.get('tank_id')

    let query = 'SELECT d.*, i.item_name, t.tank_name FROM dispensers d LEFT JOIN items i ON d.item_id = i.id LEFT JOIN tanks t ON d.tank_id = t.id WHERE 1=1'
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND d.branch_id = $${params.length}`
    }

    if (tankId) {
      params.push(tankId)
      query += ` AND d.tank_id = $${params.length}`
    }

    query += ' ORDER BY d.dispenser_number ASC'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    console.error("Error fetching dispensers:", error)
    return NextResponse.json(
      { error: "Failed to fetch dispensers", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch_id, dispenser_number, fuel_type, status, tank_id, tank_ids, item_id } = body

    if (!branch_id || !dispenser_number) {
      return NextResponse.json(
        { success: false, error: "branch_id and dispenser_number are required" },
        { status: 400 }
      )
    }

    let finalItemId = item_id
    const tankIdsArray = tank_ids || (tank_id ? [tank_id] : [])

    if (tankIdsArray.length > 0 && !item_id) {
      const tankResult = await pool.query('SELECT item_id FROM tanks WHERE id = ANY($1) AND item_id IS NOT NULL LIMIT 1', [tankIdsArray])
      if (tankResult.rows.length > 0 && tankResult.rows[0].item_id) {
        finalItemId = tankResult.rows[0].item_id
      }
    }

    const result = await pool.query(
      `INSERT INTO dispensers (branch_id, dispenser_number, fuel_type, status, tank_id, item_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [branch_id, dispenser_number, fuel_type || 'Petrol', status || 'active', tankIdsArray[0] || null, finalItemId || null]
    )

    const dispenserId = result.rows[0].id

    if (tankIdsArray.length > 0) {
      for (const tId of tankIdsArray) {
        await pool.query(
          `INSERT INTO dispenser_tanks (dispenser_id, tank_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [dispenserId, tId]
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error creating dispenser:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create dispenser", details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, dispenser_number, fuel_type, status, tank_id, item_id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Dispenser id is required" },
        { status: 400 }
      )
    }

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (dispenser_number !== undefined) {
      updates.push(`dispenser_number = $${paramIndex}`)
      values.push(dispenser_number)
      paramIndex++
    }

    if (fuel_type !== undefined) {
      updates.push(`fuel_type = $${paramIndex}`)
      values.push(fuel_type)
      paramIndex++
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (tank_id !== undefined) {
      updates.push(`tank_id = $${paramIndex}`)
      values.push(tank_id || null)
      paramIndex++
    }

    if (item_id !== undefined) {
      updates.push(`item_id = $${paramIndex}`)
      values.push(item_id || null)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      )
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const result = await pool.query(
      `UPDATE dispensers SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error updating dispenser:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update dispenser", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Dispenser id is required" },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM dispensers WHERE id = $1', [id])

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Error deleting dispenser:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete dispenser", details: error.message },
      { status: 500 }
    )
  }
}
