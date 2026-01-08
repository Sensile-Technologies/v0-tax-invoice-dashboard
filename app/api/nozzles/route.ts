import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const status = searchParams.get('status')

    let query = `
      SELECT n.id, n.branch_id, n.dispenser_id, n.nozzle_number, n.status, 
             n.initial_meter_reading, n.item_id, n.created_at, n.updated_at,
             d.dispenser_number, i.item_name, i.item_name as fuel_type
      FROM nozzles n
      LEFT JOIN dispensers d ON n.dispenser_id = d.id
      JOIN items i ON n.item_id = i.id`
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` INNER JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = $${params.length}`
      query += ` WHERE n.branch_id = $${params.length}`
    } else {
      query += ` WHERE 1=1`
    }

    if (status) {
      params.push(status)
      query += ` AND n.status = $${params.length}`
    }

    query += ' ORDER BY d.dispenser_number, n.nozzle_number'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    console.error("Error fetching nozzles:", error)
    return NextResponse.json(
      { error: "Failed to fetch nozzles", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branch_id, 
      dispenser_id, 
      nozzle_number, 
      status,
      initial_meter_reading,
      item_id
    } = body

    if (!branch_id || !dispenser_id || !nozzle_number) {
      return NextResponse.json(
        { error: "branch_id, dispenser_id, and nozzle_number are required" },
        { status: 400 }
      )
    }

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id is required - select a fuel type from items" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO nozzles (branch_id, dispenser_id, nozzle_number, status, initial_meter_reading, item_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [branch_id, dispenser_id, nozzle_number, status || 'active', initial_meter_reading || 0, item_id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error creating nozzle:", error)
    return NextResponse.json(
      { error: "Failed to create nozzle", details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      dispenser_id,
      nozzle_number, 
      status,
      initial_meter_reading,
      item_id
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "Nozzle id is required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE nozzles 
       SET dispenser_id = COALESCE($2, dispenser_id),
           nozzle_number = COALESCE($3, nozzle_number),
           status = COALESCE($4, status),
           initial_meter_reading = COALESCE($5, initial_meter_reading),
           item_id = COALESCE($6, item_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, dispenser_id, nozzle_number, status, initial_meter_reading, item_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Nozzle not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error updating nozzle:", error)
    return NextResponse.json(
      { error: "Failed to update nozzle", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    // Also support JSON body for DELETE
    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { error: "Nozzle id is required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM nozzles WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Nozzle not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Nozzle deleted successfully"
    })

  } catch (error: any) {
    console.error("Error deleting nozzle:", error)
    return NextResponse.json(
      { error: "Failed to delete nozzle", details: error.message },
      { status: 500 }
    )
  }
}
