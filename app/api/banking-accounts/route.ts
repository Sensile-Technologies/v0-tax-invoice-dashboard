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

async function getVendorId(client: any, session: any) {
  const userResult = await client.query(
    `SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
     FROM users u
     LEFT JOIN vendors v ON v.email = u.email
     LEFT JOIN staff s ON s.user_id = u.id
     WHERE u.id = $1`,
    [session.id]
  )

  if (userResult.rows.length === 0) {
    return null
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

  return vendorId
}

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const vendorId = await getVendorId(client, session)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const result = await client.query(
      `SELECT id, account_name, account_number, bank_name, branch_name, is_default, is_active, created_at, updated_at
       FROM banking_accounts
       WHERE vendor_id = $1
       ORDER BY is_default DESC, account_name`,
      [vendorId]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error("Error fetching banking accounts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch banking accounts" }, { status: 500 })
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
    const { account_name, account_number, bank_name, branch_name } = body

    if (!account_name?.trim()) {
      return NextResponse.json({ success: false, error: "Account name is required" }, { status: 400 })
    }

    const vendorId = await getVendorId(client, session)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const result = await client.query(
      `INSERT INTO banking_accounts (vendor_id, account_name, account_number, bank_name, branch_name, is_default)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, account_name, account_number, bank_name, branch_name, is_default, is_active, created_at`,
      [vendorId, account_name.trim(), account_number?.trim() || null, bank_name?.trim() || null, branch_name?.trim() || null]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Error creating banking account:", error)
    return NextResponse.json({ success: false, error: "Failed to create banking account" }, { status: 500 })
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
    const { id, account_name, account_number, bank_name, branch_name, is_active } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Account ID is required" }, { status: 400 })
    }

    const vendorId = await getVendorId(client, session)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const accountCheck = await client.query(
      'SELECT id, is_default FROM banking_accounts WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    )

    if (accountCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    const result = await client.query(
      `UPDATE banking_accounts 
       SET account_name = COALESCE($1, account_name),
           account_number = $2,
           bank_name = $3,
           branch_name = $4,
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND vendor_id = $7
       RETURNING id, account_name, account_number, bank_name, branch_name, is_default, is_active, created_at, updated_at`,
      [account_name?.trim(), account_number?.trim() || null, bank_name?.trim() || null, branch_name?.trim() || null, is_active, id, vendorId]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Error updating banking account:", error)
    return NextResponse.json({ success: false, error: "Failed to update banking account" }, { status: 500 })
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

    const vendorId = await getVendorId(client, session)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    const accountCheck = await client.query(
      'SELECT id, is_default FROM banking_accounts WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    )

    if (accountCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    if (accountCheck.rows[0].is_default) {
      return NextResponse.json({ success: false, error: "Cannot delete the default Cashdrop account" }, { status: 400 })
    }

    await client.query(
      'DELETE FROM banking_accounts WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting banking account:", error)
    return NextResponse.json({ success: false, error: "Failed to delete banking account" }, { status: 500 })
  } finally {
    client.release()
  }
}
