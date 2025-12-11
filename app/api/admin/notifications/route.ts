import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    const result = await query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId])
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, type, title, message, reference_id } = body

    const result = await query(`
      INSERT INTO notifications (user_id, type, title, message, reference_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, type, title, message, reference_id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_read } = body

    const result = await query(`
      UPDATE notifications 
      SET is_read = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [is_read, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
