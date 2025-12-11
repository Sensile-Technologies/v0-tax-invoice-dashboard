import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT 
        p.*,
        i.invoice_number,
        v.name as vendor_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN vendors v ON i.vendor_id = v.id
      ORDER BY p.created_at DESC
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoice_id, amount, payment_date, payment_method, reference_number, notes, created_by } = body

    const result = await query(`
      INSERT INTO payments (invoice_id, amount, payment_date, payment_method, reference_number, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [invoice_id, amount, payment_date, payment_method, reference_number, notes, created_by])

    await query(`
      UPDATE invoices 
      SET paid_amount = COALESCE(paid_amount, 0) + $1,
          status = CASE 
            WHEN COALESCE(paid_amount, 0) + $1 >= total_amount THEN 'paid'
            ELSE 'partial'
          END
      WHERE id = $2
    `, [amount, invoice_id])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
