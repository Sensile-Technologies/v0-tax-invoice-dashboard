import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch_id, start_time, opening_cash, notes } = body

    if (!branch_id) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      )
    }

    const existingShift = await pool.query(
      `SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active'`,
      [branch_id]
    )

    if (existingShift.rows.length > 0) {
      return NextResponse.json(
        { error: "An active shift already exists for this branch" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO shifts (branch_id, start_time, status, opening_cash, notes, created_at)
       VALUES ($1, $2, 'active', $3, $4, NOW())
       RETURNING *`,
      [branch_id, start_time || new Date().toISOString(), opening_cash || 0, notes || null]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error starting shift:", error)
    return NextResponse.json(
      { error: "Failed to start shift", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const status = searchParams.get('status')

    let query = 'SELECT * FROM shifts WHERE 1=1'
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND branch_id = $${params.length}`
    }

    if (status) {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    query += ' ORDER BY created_at DESC LIMIT 1'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    })

  } catch (error: any) {
    console.error("Error fetching shift:", error)
    return NextResponse.json(
      { error: "Failed to fetch shift", details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, end_time, closing_cash, notes, status } = body

    if (!id) {
      return NextResponse.json(
        { error: "Shift ID is required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE shifts 
       SET end_time = $1, closing_cash = $2, notes = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [end_time || new Date().toISOString(), closing_cash || 0, notes || null, status || 'completed', id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error updating shift:", error)
    return NextResponse.json(
      { error: "Failed to update shift", details: error.message },
      { status: 500 }
    )
  }
}
