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
      SELECT n.*, d.dispenser_number 
      FROM nozzles n
      LEFT JOIN dispensers d ON n.dispenser_id = d.id
      WHERE 1=1`
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND n.branch_id = $${params.length}`
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
      fuel_type, 
      status,
      initial_meter_reading
    } = body

    if (!branch_id || !dispenser_id || !nozzle_number) {
      return NextResponse.json(
        { error: "branch_id, dispenser_id, and nozzle_number are required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO nozzles (branch_id, dispenser_id, nozzle_number, fuel_type, status, initial_meter_reading)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [branch_id, dispenser_id, nozzle_number, fuel_type || 'Petrol', status || 'active', initial_meter_reading || 0]
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
      fuel_type, 
      status,
      initial_meter_reading
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
           fuel_type = COALESCE($4, fuel_type),
           status = COALESCE($5, status),
           initial_meter_reading = COALESCE($6, initial_meter_reading),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, dispenser_id, nozzle_number, fuel_type, status, initial_meter_reading]
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
