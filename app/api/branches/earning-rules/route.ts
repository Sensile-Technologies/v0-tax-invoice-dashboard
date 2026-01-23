import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("user_session")
  if (!sessionCookie) return null
  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT 
        id,
        name,
        loyalty_earn_type,
        loyalty_points_per_litre,
        loyalty_points_per_amount,
        loyalty_amount_threshold,
        redemption_points_per_ksh,
        min_redemption_points,
        max_redemption_percent
      FROM branches WHERE id = $1`,
      [branchId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error("Error fetching earning rules:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      branch_id, 
      loyalty_earn_type, 
      loyalty_points_per_litre, 
      loyalty_points_per_amount, 
      loyalty_amount_threshold,
      redemption_points_per_ksh,
      min_redemption_points,
      max_redemption_percent
    } = body

    if (!branch_id) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    if (!loyalty_earn_type || !['per_litre', 'per_amount'].includes(loyalty_earn_type)) {
      return NextResponse.json({ success: false, error: "loyalty_earn_type must be 'per_litre' or 'per_amount'" }, { status: 400 })
    }

    // Validate numeric values - use nullish coalescing (??) not OR (||) to allow 0 values
    const pointsPerLitre = Number(loyalty_points_per_litre ?? 1)
    const pointsPerAmount = Number(loyalty_points_per_amount ?? 1)
    const amountThreshold = Number(loyalty_amount_threshold ?? 100)
    const pointsPerKsh = Number(redemption_points_per_ksh ?? 1)
    const minPoints = Number(min_redemption_points ?? 100)
    const maxPercent = Number(max_redemption_percent ?? 50)

    // Validate: points must be >= 0, threshold must be >= 1 to avoid division by zero
    if (pointsPerLitre < 0) {
      return NextResponse.json({ success: false, error: "Points per litre must be 0 or greater" }, { status: 400 })
    }
    if (pointsPerAmount < 0) {
      return NextResponse.json({ success: false, error: "Points per amount must be 0 or greater" }, { status: 400 })
    }
    if (amountThreshold < 1) {
      return NextResponse.json({ success: false, error: "Amount threshold must be at least 1" }, { status: 400 })
    }
    if (pointsPerKsh < 1) {
      return NextResponse.json({ success: false, error: "Points per KSH must be at least 1" }, { status: 400 })
    }
    if (minPoints < 0) {
      return NextResponse.json({ success: false, error: "Minimum redemption points must be 0 or greater" }, { status: 400 })
    }
    if (maxPercent < 0 || maxPercent > 100) {
      return NextResponse.json({ success: false, error: "Max redemption percent must be between 0 and 100" }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE branches SET
        loyalty_earn_type = $1,
        loyalty_points_per_litre = $2,
        loyalty_points_per_amount = $3,
        loyalty_amount_threshold = $4,
        redemption_points_per_ksh = $5,
        min_redemption_points = $6,
        max_redemption_percent = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING id, name, loyalty_earn_type, loyalty_points_per_litre, loyalty_points_per_amount, loyalty_amount_threshold, redemption_points_per_ksh, min_redemption_points, max_redemption_percent`,
      [
        loyalty_earn_type,
        pointsPerLitre,
        pointsPerAmount,
        amountThreshold,
        pointsPerKsh,
        minPoints,
        maxPercent,
        branch_id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Earning rules updated successfully",
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error("Error updating earning rules:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
