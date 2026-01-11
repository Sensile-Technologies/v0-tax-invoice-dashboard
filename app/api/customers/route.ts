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
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const offset = (page - 1) * pageSize

    let baseQuery = `
      FROM customers c
      INNER JOIN customer_branches cb ON c.id = cb.customer_id
      WHERE c.use_yn = 'Y' AND cb.status = 'active'
    `
    const params: any[] = []
    let branchParamIndex: number | null = null

    if (branchId) {
      params.push(branchId)
      branchParamIndex = params.length
      baseQuery += ` AND cb.branch_id = $${branchParamIndex}`
    }

    if (search) {
      params.push(`%${search}%`)
      baseQuery += ` AND (c.cust_nm ILIKE $${params.length} OR c.cust_tin ILIKE $${params.length} OR c.tel_no ILIKE $${params.length})`
    }

    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT c.id) ${baseQuery}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    const dataParams = [...params, pageSize, offset]
    const limitParamIndex = dataParams.length - 1
    const offsetParamIndex = dataParams.length
    
    // Build branch-scoped aggregates with parameterized branch_id (reuses the same param index)
    const branchCondition = branchParamIndex ? ` AND lt.branch_id = $${branchParamIndex}` : ''
    const result = await pool.query(
      `SELECT DISTINCT c.id, c.cust_nm, c.cust_tin, c.cust_no, c.tel_no, c.email,
        COALESCE((SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE (lt.customer_name = c.cust_nm OR lt.customer_pin = c.cust_tin)${branchCondition}), 0) as total_points,
        COALESCE((SELECT COUNT(*) FROM loyalty_transactions lt WHERE (lt.customer_name = c.cust_nm OR lt.customer_pin = c.cust_tin)${branchCondition}), 0) as total_purchases,
        (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE (lt.customer_name = c.cust_nm OR lt.customer_pin = c.cust_tin)${branchCondition}) as last_activity
       ${baseQuery} ORDER BY c.cust_nm LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
      dataParams
    )

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
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
      // tin and bhf_id are NOT NULL - use provided values or defaults
      const effectiveTin = tin || cust_tin || ''
      const effectiveBhfId = bhf_id || '00'
      
      const insertResult = await client.query(
        `INSERT INTO customers (cust_nm, cust_tin, cust_no, tel_no, email, tin, bhf_id, use_yn)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Y')
         RETURNING id`,
        [cust_nm, cust_tin || '', cust_no || null, tel_no || null, email || null, effectiveTin, effectiveBhfId]
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
