import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "100")

    let query = `
      SELECT 
        ii.id,
        ii.branch_id,
        ii.tin,
        ii.bhf_id,
        ii.task_cd,
        ii.dcl_de as declaration_date,
        ii.item_seq,
        ii.hs_cd as hs_code,
        ii.item_cls_cd as item_class_code,
        ii.item_cd as item_code,
        ii.impt_item_stts_cd as status_code,
        ii.remark,
        ii.created_at,
        CASE 
          WHEN ii.impt_item_stts_cd = '1' THEN 'pending'
          WHEN ii.impt_item_stts_cd = '2' THEN 'approved'
          WHEN ii.impt_item_stts_cd = '3' THEN 'rejected'
          ELSE 'pending'
        END as approval_status,
        i.item_name,
        i.origin,
        i.purchase_price
      FROM imported_items ii
      LEFT JOIN items i ON ii.item_cd = i.item_code
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      query += ` AND ii.branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (search) {
      query += ` AND (ii.item_cd ILIKE $${paramIndex} OR ii.hs_cd ILIKE $${paramIndex} OR ii.task_cd ILIKE $${paramIndex} OR i.item_name ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY ii.created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await pool.query(query, params)

    const imports = result.rows.map(row => ({
      id: row.id,
      op_code: row.task_cd || `OP-${row.item_seq || '001'}`,
      declaration_date: row.declaration_date,
      hs_code: row.hs_code || 'N/A',
      item_code: row.item_code || 'N/A',
      item_name: row.item_name || 'Unknown Item',
      origin: row.origin || 'Unknown',
      invoice_amount: parseFloat(row.purchase_price) || 0,
      invoice_currency: 'KES',
      approval_status: row.approval_status,
      status: 'active',
      remark: row.remark,
      created_at: row.created_at,
    }))

    return NextResponse.json({
      success: true,
      imports,
      count: imports.length
    })
  } catch (error) {
    console.error("Error fetching imports:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch imports" },
      { status: 500 }
    )
  }
}
