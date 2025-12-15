import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sale_id,
      branch_id,
      credit_note_number,
      reason,
      return_quantity,
      refund_amount,
      approved_by,
      customer_signature,
      notes,
      approval_status
    } = body

    if (!sale_id || !branch_id || !reason || !refund_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO credit_notes (
        sale_id, branch_id, credit_note_number, reason, return_quantity, 
        refund_amount, approved_by, customer_signature, notes, approval_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        sale_id, branch_id, credit_note_number || `CN-${Date.now()}`, reason, 
        return_quantity, refund_amount, approved_by, customer_signature, notes,
        approval_status || 'pending'
      ]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error creating credit note:", error)
    return NextResponse.json(
      { error: "Failed to create credit note", details: error.message },
      { status: 500 }
    )
  }
}
