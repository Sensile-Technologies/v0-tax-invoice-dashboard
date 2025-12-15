import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const compositeItemId = searchParams.get("composite_item_id")

    if (!compositeItemId) {
      return NextResponse.json({ success: false, error: "composite_item_id is required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT ic.*, i.item_name as parent_item_name
       FROM item_compositions ic
       LEFT JOIN items i ON ic.parent_item_id = i.id
       WHERE ic.composite_item_id = $1`,
      [compositeItemId]
    )

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching item compositions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch item compositions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { composite_item_id, parent_item_id, percentage } = body

    if (!composite_item_id || !parent_item_id) {
      return NextResponse.json({ success: false, error: "composite_item_id and parent_item_id are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO item_compositions (composite_item_id, parent_item_id, percentage)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [composite_item_id, parent_item_id, percentage || 0]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("Error creating item composition:", error)
    return NextResponse.json({ success: false, error: "Failed to create item composition" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const compositeItemId = searchParams.get("composite_item_id")

    if (!compositeItemId) {
      return NextResponse.json({ success: false, error: "composite_item_id is required" }, { status: 400 })
    }

    await pool.query(
      "DELETE FROM item_compositions WHERE composite_item_id = $1",
      [compositeItemId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting item compositions:", error)
    return NextResponse.json({ success: false, error: "Failed to delete item compositions" }, { status: 500 })
  }
}
