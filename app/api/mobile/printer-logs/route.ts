import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      branch_id, 
      vendor_id, 
      user_id, 
      username,
      step, 
      status, 
      message, 
      invoice_number,
      error_details 
    } = body

    await query(`
      INSERT INTO printer_logs (
        branch_id, vendor_id, user_id, username,
        step, status, message, invoice_number, error_details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [
      branch_id || null,
      vendor_id || null,
      user_id || null,
      username || null,
      step || 'unknown',
      status || 'info',
      message || null,
      invoice_number || null,
      error_details ? JSON.stringify(error_details) : null
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Printer Logs API] Error:", error.message)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const vendorId = searchParams.get("vendor_id")
    const limit = searchParams.get("limit") || "50"

    let sql = `
      SELECT 
        pl.*,
        b.name as branch_name
      FROM printer_logs pl
      LEFT JOIN branches b ON pl.branch_id = b.id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (branchId) {
      conditions.push(`pl.branch_id = $${params.length + 1}`)
      params.push(branchId)
    }
    if (vendorId) {
      conditions.push(`pl.vendor_id = $${params.length + 1}`)
      params.push(vendorId)
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`
    }

    sql += ` ORDER BY pl.created_at DESC LIMIT $${params.length + 1}`
    params.push(parseInt(limit))

    const logs = await query(sql, params)
    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error("[Printer Logs API] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
