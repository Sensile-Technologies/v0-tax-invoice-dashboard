import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active")

    let sql = `SELECT * FROM billing_products`
    if (activeOnly === "true") {
      sql += ` WHERE is_active = true`
    }
    sql += ` ORDER BY name ASC`

    const result = await query(sql)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching billing products:", error)
    return NextResponse.json({ error: "Failed to fetch billing products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, product_type, default_amount } = body

    const result = await query(`
      INSERT INTO billing_products (name, description, product_type, default_amount, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `, [name, description, product_type, default_amount])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating billing product:", error)
    return NextResponse.json({ error: "Failed to create billing product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, product_type, default_amount, is_active } = body

    const result = await query(`
      UPDATE billing_products 
      SET name = $1, description = $2, product_type = $3, default_amount = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, product_type, default_amount, is_active, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating billing product:", error)
    return NextResponse.json({ error: "Failed to update billing product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await query(`DELETE FROM billing_products WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting billing product:", error)
    return NextResponse.json({ error: "Failed to delete billing product" }, { status: 500 })
  }
}
