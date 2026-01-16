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

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
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

    if (!vendorId && user.branch_id) {
      const branchResult = await client.query(
        'SELECT vendor_id FROM branches WHERE id = $1',
        [user.branch_id]
      )
      vendorId = branchResult.rows[0]?.vendor_id
    }

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const result = await client.query(
      `SELECT id, account_name, description, is_active, created_at, updated_at
       FROM expense_accounts
       WHERE vendor_id = $1
       ORDER BY account_name`,
      [vendorId]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error("Error fetching expense accounts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch expense accounts" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { account_name, description } = body

    if (!account_name?.trim()) {
      return NextResponse.json({ success: false, error: "Account name is required" }, { status: 400 })
    }

    const userResult = await client.query(
      `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
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

    if (!vendorId && user.branch_id) {
      const branchResult = await client.query(
        'SELECT vendor_id FROM branches WHERE id = $1',
        [user.branch_id]
      )
      vendorId = branchResult.rows[0]?.vendor_id
    }

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const result = await client.query(
      `INSERT INTO expense_accounts (vendor_id, account_name, description)
       VALUES ($1, $2, $3)
       RETURNING id, account_name, description, is_active, created_at`,
      [vendorId, account_name.trim(), description?.trim() || null]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error creating expense account:", error)
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: "An account with this name already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create expense account" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, account_name, description, is_active } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Account ID is required" }, { status: 400 })
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

    const accountCheck = await client.query(
      'SELECT id FROM expense_accounts WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    )

    if (accountCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    const result = await client.query(
      `UPDATE expense_accounts 
       SET account_name = COALESCE($2, account_name),
           description = COALESCE($3, description),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, account_name, description, is_active, updated_at`,
      [id, account_name?.trim(), description?.trim(), is_active]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    console.error("Error updating expense account:", error)
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: "An account with this name already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to update expense account" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: "Account ID is required" }, { status: 400 })
    }

    const userResult = await client.query(
      `SELECT u.id, v.id as vendor_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       WHERE u.id = $1`,
      [session.id]
    )

    const user = userResult.rows[0]
    let vendorId = user?.vendor_id

    if (!vendorId) {
      const staffResult = await client.query(
        'SELECT b.vendor_id FROM staff s JOIN branches b ON s.branch_id = b.id WHERE s.user_id = $1',
        [session.id]
      )
      vendorId = staffResult.rows[0]?.vendor_id
    }

    const usageCheck = await client.query(
      'SELECT COUNT(*) as count FROM shift_expenses WHERE expense_account_id = $1',
      [id]
    )

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete account - it has been used in shift expenses" 
      }, { status: 400 })
    }

    await client.query(
      'DELETE FROM expense_accounts WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting expense account:", error)
    return NextResponse.json({ success: false, error: "Failed to delete expense account" }, { status: 500 })
  } finally {
    client.release()
  }
}
