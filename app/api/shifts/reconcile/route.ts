import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const { shift_id, attendant_collections, expenses, banking, notes } = body

    if (!shift_id) {
      return NextResponse.json(
        { error: "shift_id is required" },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const shiftCheck = await client.query(
      `SELECT s.*, b.vendor_id FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1`,
      [shift_id]
    )

    if (shiftCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      )
    }

    const shift = shiftCheck.rows[0]
    const branchId = shift.branch_id
    const vendorId = shift.vendor_id

    if (shift.reconciliation_status === 'reconciled') {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "Shift has already been reconciled" },
        { status: 400 }
      )
    }

    if (!attendant_collections || attendant_collections.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "Attendant collections are required for reconciliation" },
        { status: 400 }
      )
    }

    const hasValidCollections = attendant_collections.some((c: any) => 
      c.attendant_id && c.payments && Array.isArray(c.payments) && 
      c.payments.some((p: any) => p.amount > 0)
    )
    if (!hasValidCollections) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "At least one attendant must have collection amounts entered" },
        { status: 400 }
      )
    }

    if (!banking || banking.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "Banking summary is required for reconciliation" },
        { status: 400 }
      )
    }

    const hasValidBanking = banking.some((b: any) => b.banking_account_id && b.amount > 0)
    if (!hasValidBanking) {
      await client.query('ROLLBACK')
      client.release()
      return NextResponse.json(
        { error: "At least one banking entry with a valid amount is required" },
        { status: 400 }
      )
    }

    await client.query(
      `DELETE FROM attendant_collections WHERE shift_id = $1`,
      [shift_id]
    )
    
    if (attendant_collections && attendant_collections.length > 0) {
      for (const collection of attendant_collections) {
        if (collection.attendant_id && collection.payments && Array.isArray(collection.payments)) {
          for (const payment of collection.payments) {
            if (payment.payment_method && payment.amount > 0) {
              await client.query(
                `INSERT INTO attendant_collections (shift_id, branch_id, staff_id, payment_method, amount, is_app_payment)
                 VALUES ($1, $2, $3, $4, $5, false)`,
                [shift_id, branchId, collection.attendant_id, payment.payment_method, payment.amount]
              )
            }
          }
        }
      }
    }

    await client.query(
      `DELETE FROM shift_expenses WHERE shift_id = $1`,
      [shift_id]
    )

    if (expenses && expenses.length > 0) {
      for (const expense of expenses) {
        if (expense.expense_account_id && expense.amount > 0) {
          const accountCheck = await client.query(
            'SELECT id FROM expense_accounts WHERE id = $1 AND vendor_id = $2',
            [expense.expense_account_id, vendorId]
          )
          if (accountCheck.rows.length === 0) {
            console.warn(`[Reconcile] Skipping invalid expense account ${expense.expense_account_id}`)
            continue
          }
          
          await client.query(
            `INSERT INTO shift_expenses (shift_id, branch_id, expense_account_id, amount, description)
             VALUES ($1, $2, $3, $4, $5)`,
            [shift_id, branchId, expense.expense_account_id, expense.amount, expense.description || null]
          )
        }
      }
    }

    await client.query(
      `DELETE FROM shift_banking WHERE shift_id = $1`,
      [shift_id]
    )

    if (banking && banking.length > 0) {
      for (const entry of banking) {
        if (entry.banking_account_id && entry.amount > 0) {
          const accountCheck = await client.query(
            'SELECT id FROM banking_accounts WHERE id = $1 AND vendor_id = $2',
            [entry.banking_account_id, vendorId]
          )
          if (accountCheck.rows.length === 0) {
            console.warn(`[Reconcile] Skipping invalid banking account ${entry.banking_account_id}`)
            continue
          }
          
          await client.query(
            `INSERT INTO shift_banking (shift_id, banking_account_id, amount, notes)
             VALUES ($1, $2, $3, $4)`,
            [shift_id, entry.banking_account_id, entry.amount, entry.notes || null]
          )
        }
      }
    }

    if (notes) {
      await client.query(
        `UPDATE shifts SET notes = $1 WHERE id = $2`,
        [notes, shift_id]
      )
    }

    await client.query(
      `UPDATE shifts SET reconciliation_status = 'reconciled', updated_at = NOW() WHERE id = $1`,
      [shift_id]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: "Shift reconciled successfully"
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("Error reconciling shift:", error)
    return NextResponse.json(
      { error: "Failed to reconcile shift", details: error.message },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
