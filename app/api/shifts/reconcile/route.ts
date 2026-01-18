import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { sendDSSRToDirectors, DSSRSummary } from "@/lib/whatsapp-service"

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

    // Collections, expenses, and banking are now optional for reconciliation

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

    // Send DSSR via WhatsApp to directors (async, don't block response)
    try {
      // Get whatsapp_directors from branch level (not vendor level)
      const branchConfigResult = await client.query(
        `SELECT whatsapp_directors FROM branches WHERE id = $1`,
        [branchId]
      )
      
      if (branchConfigResult.rows.length > 0 && branchConfigResult.rows[0].whatsapp_directors) {
        let directorNumbers: string[] = []
        try {
          const directors = branchConfigResult.rows[0].whatsapp_directors
          directorNumbers = typeof directors === 'string' ? JSON.parse(directors) : directors
        } catch {
          directorNumbers = []
        }
        
        if (directorNumbers.length > 0) {
          // Fetch sales data for DSSR
          const salesResult = await client.query(
            `SELECT 
               COALESCE(i.item_name, s.fuel_type, 'Unknown') as product,
               SUM(s.quantity) as volume,
               SUM(s.total_amount) as amount,
               SUM(CASE WHEN LOWER(s.payment_method) = 'cash' THEN s.total_amount ELSE 0 END) as cash_amount,
               SUM(CASE WHEN LOWER(s.payment_method) IN ('mpesa', 'm-pesa', 'mobile_money') THEN s.total_amount ELSE 0 END) as mpesa_amount,
               SUM(CASE WHEN LOWER(s.payment_method) = 'credit' THEN s.total_amount ELSE 0 END) as credit_amount
             FROM sales s
             LEFT JOIN items i ON s.item_id = i.id
             WHERE s.shift_id = $1
             GROUP BY COALESCE(i.item_name, s.fuel_type, 'Unknown')`,
            [shift_id]
          )
          
          const branchResult = await client.query(
            `SELECT name FROM branches WHERE id = $1`,
            [branchId]
          )
          
          const attendantResult = await client.query(
            `SELECT s.name FROM staff s
             WHERE s.id = (SELECT staff_id FROM shifts WHERE id = $1)`,
            [shift_id]
          )
          
          let totalSales = 0, totalVolume = 0, cashCollected = 0, mpesaCollected = 0, creditSales = 0
          const productBreakdown: Array<{ product: string; volume: number; amount: number }> = []
          
          for (const row of salesResult.rows) {
            const volume = parseFloat(row.volume) || 0
            const amount = parseFloat(row.amount) || 0
            totalVolume += volume
            totalSales += amount
            cashCollected += parseFloat(row.cash_amount) || 0
            mpesaCollected += parseFloat(row.mpesa_amount) || 0
            creditSales += parseFloat(row.credit_amount) || 0
            productBreakdown.push({ product: row.product, volume, amount })
          }
          
          const summary: DSSRSummary = {
            branchName: branchResult.rows[0]?.name || 'Unknown Branch',
            date: new Date().toISOString().split('T')[0],
            shiftType: shift.shift_type || 'Day',
            attendantName: attendantResult.rows[0]?.name || 'N/A',
            totalSales,
            totalVolume,
            cashCollected,
            mpesaCollected,
            creditSales,
            variance: (cashCollected + mpesaCollected) - (totalSales - creditSales),
            productBreakdown
          }
          
          // Fire and forget - don't wait for WhatsApp response
          sendDSSRToDirectors(summary, directorNumbers).catch(err => {
            console.error('[Reconcile] WhatsApp notification failed:', err)
          })
        }
      }
    } catch (whatsappError) {
      // Don't fail reconciliation if WhatsApp notification fails
      console.error('[Reconcile] WhatsApp notification error:', whatsappError)
    }

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
