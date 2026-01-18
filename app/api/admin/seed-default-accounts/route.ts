import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("user_session")
  if (!sessionCookie) return null
  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`,
      [session.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    let vendorId = user.vendor_id

    if (!vendorId) {
      const staffResult = await client.query(
        'SELECT b.vendor_id FROM staff s JOIN branches b ON s.branch_id = b.id WHERE s.user_id = $1',
        [session.id]
      )
      vendorId = staffResult.rows[0]?.vendor_id
    }

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const results = {
      petty_cash: false,
      genset: false,
      cash_drop: false
    }

    const existingExpense = await client.query(
      `SELECT account_name FROM expense_accounts WHERE vendor_id = $1`,
      [vendorId]
    )
    const existingExpenseNames = existingExpense.rows.map(r => r.account_name.toLowerCase())

    if (!existingExpenseNames.includes('petty cash')) {
      await client.query(
        `INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
         VALUES ($1, 'Petty Cash', 'Petty cash expenses', true)`,
        [vendorId]
      )
      results.petty_cash = true
    }

    if (!existingExpenseNames.includes('genset')) {
      await client.query(
        `INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
         VALUES ($1, 'Genset', 'Generator fuel and maintenance expenses', true)`,
        [vendorId]
      )
      results.genset = true
    }

    const existingBanking = await client.query(
      `SELECT account_name FROM banking_accounts WHERE vendor_id = $1`,
      [vendorId]
    )
    const existingBankingNames = existingBanking.rows.map(r => r.account_name.toLowerCase())

    if (!existingBankingNames.includes('cash drop')) {
      await client.query(
        `INSERT INTO banking_accounts (vendor_id, account_name, is_default, is_active)
         VALUES ($1, 'Cash Drop', true, true)`,
        [vendorId]
      )
      results.cash_drop = true
    } else {
      await client.query(
        `UPDATE banking_accounts SET is_default = true WHERE vendor_id = $1 AND LOWER(account_name) = 'cash drop'`,
        [vendorId]
      )
    }

    return NextResponse.json({
      success: true,
      message: "Default accounts seeded successfully",
      created: results
    })

  } catch (error) {
    console.error("Error seeding default accounts:", error)
    return NextResponse.json({ success: false, error: "Failed to seed default accounts" }, { status: 500 })
  } finally {
    client.release()
  }
}
