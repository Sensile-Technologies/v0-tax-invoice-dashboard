import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get("stage")

    let sql = `
      SELECT 
        l.*,
        sp.name as assigned_to_name
      FROM leads l
      LEFT JOIN sales_people sp ON l.assigned_to = sp.id
    `
    const params: any[] = []

    if (stage && stage !== "all") {
      sql += ` WHERE l.stage = $1`
      params.push(stage)
    }

    sql += ` ORDER BY l.created_at DESC`

    const result = await query(sql, params)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      company_name,
      trading_name,
      kra_pin,
      contact_name, 
      contact_email, 
      contact_phone, 
      stage, 
      assigned_to, 
      notes, 
      expected_value, 
      expected_close_date,
      source 
    } = body

    const result = await query(`
      INSERT INTO leads (
        company_name, trading_name, kra_pin, contact_name, contact_email, contact_phone, 
        stage, assigned_to, notes, expected_value, expected_close_date, source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      company_name, trading_name, kra_pin, contact_name, contact_email, contact_phone,
      stage || 'contact', assigned_to || null, notes, expected_value, expected_close_date, source
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      company_name,
      trading_name,
      kra_pin,
      contact_name, 
      contact_email, 
      contact_phone, 
      stage, 
      assigned_to, 
      notes, 
      expected_value, 
      expected_close_date,
      source 
    } = body

    const result = await query(`
      UPDATE leads 
      SET company_name = $1, trading_name = $2, kra_pin = $3, contact_name = $4, 
          contact_email = $5, contact_phone = $6, stage = $7, assigned_to = $8, 
          notes = $9, expected_value = $10, expected_close_date = $11, source = $12, updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `, [
      company_name, trading_name, kra_pin, contact_name, contact_email, contact_phone,
      stage, assigned_to || null, notes, expected_value, expected_close_date, source, id
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await query(`DELETE FROM leads WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
