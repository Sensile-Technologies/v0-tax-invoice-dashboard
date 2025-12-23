import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ptsId = searchParams.get("pts_id")

    let sql = `
      SELECT 
        m.id, m.pts_id, m.fuel_grade_id, m.fuel_grade_name, 
        m.item_id, m.is_active, m.notes, m.created_at, m.updated_at,
        i.item_name, i.item_code, i.sale_price
      FROM pump_fuel_grade_mappings m
      LEFT JOIN items i ON m.item_id = i.id
      WHERE 1=1
    `
    const params: any[] = []

    if (ptsId) {
      sql += ` AND (m.pts_id = $1 OR m.pts_id IS NULL)`
      params.push(ptsId)
    }

    sql += ` ORDER BY m.fuel_grade_id ASC`

    const result: any = await query(sql, params)
    const mappings = result.rows || result

    return NextResponse.json({ success: true, data: mappings })
  } catch (error: any) {
    console.error("[Fuel Grade Mappings API] Error:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pts_id, fuel_grade_id, fuel_grade_name, item_id, notes } = body

    if (!fuel_grade_id) {
      return NextResponse.json({ success: false, error: "fuel_grade_id is required" }, { status: 400 })
    }

    const ptsValue = pts_id || null
    const coalescedPts = ptsValue === null ? 'GLOBAL' : ptsValue
    
    const existing: any = await query(`
      SELECT id FROM pump_fuel_grade_mappings 
      WHERE COALESCE(pts_id, 'GLOBAL') = $1 AND fuel_grade_id = $2
    `, [coalescedPts, fuel_grade_id])
    
    let result: any
    if (existing.rows?.length > 0 || (Array.isArray(existing) && existing.length > 0)) {
      const existingId = (existing.rows || existing)[0].id
      result = await query(`
        UPDATE pump_fuel_grade_mappings SET
          fuel_grade_name = $1,
          item_id = $2,
          notes = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [fuel_grade_name, item_id || null, notes || null, existingId])
    } else {
      result = await query(`
        INSERT INTO pump_fuel_grade_mappings (pts_id, fuel_grade_id, fuel_grade_name, item_id, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [ptsValue, fuel_grade_id, fuel_grade_name, item_id || null, notes || null])
    }

    const mapping = (result.rows || result)[0]
    return NextResponse.json({ success: true, data: mapping })
  } catch (error: any) {
    console.error("[Fuel Grade Mappings API] Error:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }

    await query(`DELETE FROM pump_fuel_grade_mappings WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Fuel Grade Mappings API] Error:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
