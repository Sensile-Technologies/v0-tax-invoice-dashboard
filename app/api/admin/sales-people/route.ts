import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM sales_people 
      ORDER BY name ASC
    `)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching sales people:", error)
    return NextResponse.json({ error: "Failed to fetch sales people" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    const result = await query(`
      INSERT INTO sales_people (name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, email, phone])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating sales person:", error)
    return NextResponse.json({ error: "Failed to create sales person" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, is_active } = body

    const result = await query(`
      UPDATE sales_people 
      SET name = $1, email = $2, phone = $3, is_active = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [name, email, phone, is_active, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating sales person:", error)
    return NextResponse.json({ error: "Failed to update sales person" }, { status: 500 })
  }
}
