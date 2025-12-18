import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "100")

    let query = `
      SELECT 
        pt.id,
        pt.branch_id,
        pt.invc_no,
        pt.spplr_nm as supplier_name,
        pt.spplr_tin as supplier_tin,
        pt.pchs_dt as purchase_date,
        pt.tot_item_cnt as item_count,
        pt.tot_amt as total_amount,
        pt.tot_tax_amt as tax_amount,
        pt.tot_taxbl_amt as taxable_amount,
        pt.pchs_stts_cd as status_code,
        pt.pchs_ty_cd as purchase_type,
        pt.pmt_ty_cd as payment_type,
        pt.remark,
        pt.created_at,
        CASE 
          WHEN pt.pchs_stts_cd = '02' THEN 'approved'
          WHEN pt.pchs_stts_cd = '03' THEN 'rejected'
          WHEN pt.pchs_stts_cd = '04' THEN 'cancelled'
          ELSE 'pending'
        END as status
      FROM purchase_transactions pt
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      query += ` AND pt.branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (status) {
      const statusCode = status === 'approved' ? '02' : status === 'rejected' ? '03' : status === 'cancelled' ? '04' : '01'
      query += ` AND pt.pchs_stts_cd = $${paramIndex}`
      params.push(statusCode)
      paramIndex++
    }

    if (dateFrom) {
      query += ` AND pt.pchs_dt >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      query += ` AND pt.pchs_dt <= $${paramIndex}`
      params.push(dateTo)
      paramIndex++
    }

    if (search) {
      query += ` AND (pt.spplr_nm ILIKE $${paramIndex} OR CAST(pt.invc_no AS TEXT) ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY pt.created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await pool.query(query, params)

    const purchases = result.rows.map(row => ({
      id: row.id,
      po_number: `PO-${String(row.invc_no || '').padStart(4, '0')}`,
      supplier: row.supplier_name || 'Unknown Supplier',
      supplier_tin: row.supplier_tin,
      date: row.purchase_date ? new Date(row.purchase_date).toISOString().split('T')[0] : null,
      items: row.item_count || 0,
      amount: parseFloat(row.total_amount) || 0,
      tax_amount: parseFloat(row.tax_amount) || 0,
      status: row.status,
      purchase_type: row.purchase_type,
      payment_type: row.payment_type,
      remark: row.remark,
      created_at: row.created_at,
    }))

    return NextResponse.json({
      success: true,
      purchases,
      count: purchases.length
    })
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch purchases" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branch_id,
      tin,
      bhf_id,
      supplier_name,
      supplier_tin,
      purchase_date,
      purchase_type,
      payment_type,
      items,
      total_amount,
      tax_amount,
      remark
    } = body

    const result = await pool.query(`
      INSERT INTO purchase_transactions (
        branch_id, tin, bhf_id, spplr_nm, spplr_tin, pchs_dt,
        pchs_ty_cd, pmt_ty_cd, tot_item_cnt, tot_amt, tot_tax_amt,
        tot_taxbl_amt, pchs_stts_cd, remark, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '01', $13, NOW(), NOW())
      RETURNING *
    `, [
      branch_id, tin, bhf_id, supplier_name, supplier_tin, purchase_date,
      purchase_type, payment_type, items?.length || 0, total_amount,
      tax_amount, (total_amount || 0) - (tax_amount || 0), remark
    ])

    return NextResponse.json({
      success: true,
      purchase: result.rows[0],
      message: "Purchase order created successfully"
    })
  } catch (error) {
    console.error("Error creating purchase:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create purchase" },
      { status: 500 }
    )
  }
}
