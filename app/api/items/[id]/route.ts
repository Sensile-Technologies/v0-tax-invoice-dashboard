import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE items SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item: result.rows[0]
    })

  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await pool.query(
      `SELECT * FROM items WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item: result.rows[0]
    })

  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await pool.query(
      `DELETE FROM items WHERE id = $1 RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    )
  }
}
