import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const search = searchParams.get('search')

    let query = `
      SELECT DISTINCT c.id, c.cust_nm, c.cust_tin, c.cust_no, c.tel_no, c.email
      FROM customers c
      INNER JOIN customer_branches cb ON c.id = cb.customer_id
      WHERE c.use_yn = 'Y' AND cb.status = 'active'
    `
    const params: any[] = []

    if (branchId) {
      params.push(branchId)
      query += ` AND cb.branch_id = $${params.length}`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (c.cust_nm ILIKE $${params.length} OR c.cust_tin ILIKE $${params.length} OR c.tel_no ILIKE $${params.length})`
    }

    query += ' ORDER BY c.cust_nm'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const { cust_nm, cust_tin, cust_no, tel_no, email, branch_id, vendor_id, tin, bhf_id } = body

    if (!cust_nm) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    let customerId: string
    let existingCustomer = null

    if (cust_tin) {
      const existingResult = await client.query(
        'SELECT id FROM customers WHERE cust_tin = $1',
        [cust_tin]
      )
      existingCustomer = existingResult.rows[0]
    }

    if (!existingCustomer && tel_no) {
      const existingResult = await client.query(
        'SELECT id FROM customers WHERE tel_no = $1',
        [tel_no]
      )
      existingCustomer = existingResult.rows[0]
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const insertResult = await client.query(
        `INSERT INTO customers (cust_nm, cust_tin, cust_no, tel_no, email, tin, bhf_id, use_yn)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Y')
         RETURNING id`,
        [cust_nm, cust_tin || null, cust_no || null, tel_no || null, email || null, tin || null, bhf_id || null]
      )
      customerId = insertResult.rows[0].id
    }

    if (branch_id) {
      await client.query(
        `INSERT INTO customer_branches (customer_id, branch_id, vendor_id, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (customer_id, branch_id) DO UPDATE SET status = 'active'`,
        [customerId, branch_id, vendor_id || null]
      )
    }

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: existingCustomer ? 'Customer linked to branch' : 'Customer created and linked to branch',
      data: { id: customerId }
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Failed to create customer", details: error.message },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
