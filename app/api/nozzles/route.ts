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

    let query = 'SELECT * FROM nozzles WHERE 1=1'
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND branch_id = $${params.length}`
    }

    if (status) {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

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
      fuel_type, 
      status,
      item_id,
      tank_id
    } = body

    if (!branch_id || !dispenser_id || !nozzle_number) {
      return NextResponse.json(
        { error: "branch_id, dispenser_id, and nozzle_number are required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO nozzles (branch_id, dispenser_id, nozzle_number, fuel_type, status, item_id, tank_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [branch_id, dispenser_id, nozzle_number, fuel_type || 'Petrol', status || 'active', item_id || null, tank_id || null]
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
      nozzle_number, 
      fuel_type, 
      status,
      item_id,
      tank_id
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "Nozzle id is required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE nozzles 
       SET nozzle_number = COALESCE($2, nozzle_number),
           fuel_type = COALESCE($3, fuel_type),
           status = COALESCE($4, status),
           item_id = COALESCE($5, item_id),
           tank_id = COALESCE($6, tank_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, nozzle_number, fuel_type, status, item_id, tank_id]
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
    const id = searchParams.get('id')

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
