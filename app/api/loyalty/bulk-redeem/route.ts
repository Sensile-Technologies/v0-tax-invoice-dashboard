import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'

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
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branch_id = searchParams.get('branch_id')

    if (!branch_id) {
      return NextResponse.json({ error: 'branch_id is required' }, { status: 400 })
    }

    // Get all customers with their point balances for this branch
    const customersResult = await pool.query(
      `SELECT 
        customer_pin,
        customer_name,
        SUM(points_earned) as total_earned,
        SUM(points_redeemed) as total_redeemed,
        SUM(points_earned) - SUM(points_redeemed) as point_balance,
        COUNT(*) as transaction_count,
        MAX(transaction_date) as last_activity
       FROM loyalty_transactions 
       WHERE branch_id = $1
       GROUP BY customer_pin, customer_name
       HAVING SUM(points_earned) - SUM(points_redeemed) > 0
       ORDER BY point_balance DESC`,
      [branch_id]
    )

    // Get redemption rules
    const rulesResult = await pool.query(
      `SELECT redemption_points_per_ksh, min_redemption_points, max_redemption_percent
       FROM branches WHERE id = $1`,
      [branch_id]
    )
    const rules = rulesResult.rows[0] || {}

    // Calculate totals
    const customers = customersResult.rows.map(row => ({
      customer_pin: row.customer_pin,
      customer_name: row.customer_name,
      total_earned: parseFloat(row.total_earned) || 0,
      total_redeemed: parseFloat(row.total_redeemed) || 0,
      point_balance: parseFloat(row.point_balance) || 0,
      transaction_count: parseInt(row.transaction_count) || 0,
      last_activity: row.last_activity,
      eligible: parseFloat(row.point_balance) >= (parseFloat(rules.min_redemption_points) || 100)
    }))

    const totalPoints = customers.reduce((sum, c) => sum + c.point_balance, 0)
    const eligibleCount = customers.filter(c => c.eligible).length
    const pointsPerKsh = parseFloat(rules.redemption_points_per_ksh) || 1
    const totalValue = totalPoints / pointsPerKsh

    return NextResponse.json({
      success: true,
      customers,
      summary: {
        total_customers: customers.length,
        eligible_customers: eligibleCount,
        total_points: totalPoints,
        total_value: totalValue,
        points_per_ksh: pointsPerKsh,
        min_points: parseFloat(rules.min_redemption_points) || 100
      }
    })
  } catch (error: any) {
    console.error('Error fetching redemption data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { branch_id, customer_pins, redeem_all } = body

    if (!branch_id) {
      return NextResponse.json({ error: 'branch_id is required' }, { status: 400 })
    }

    // Get redemption rules
    const rulesResult = await pool.query(
      `SELECT redemption_points_per_ksh, min_redemption_points
       FROM branches WHERE id = $1`,
      [branch_id]
    )
    const rules = rulesResult.rows[0] || {}
    const pointsPerKsh = Math.max(1, parseFloat(rules.redemption_points_per_ksh) || 1)
    const minPoints = parseFloat(rules.min_redemption_points) || 100

    // Get eligible customers
    let customersQuery = `
      SELECT 
        customer_pin,
        customer_name,
        SUM(points_earned) - SUM(points_redeemed) as point_balance
       FROM loyalty_transactions 
       WHERE branch_id = $1
       GROUP BY customer_pin, customer_name
       HAVING SUM(points_earned) - SUM(points_redeemed) >= $2`
    
    const queryParams: any[] = [branch_id, minPoints]
    
    if (!redeem_all && customer_pins && customer_pins.length > 0) {
      customersQuery += ` AND customer_pin = ANY($3)`
      queryParams.push(customer_pins)
    }

    const customersResult = await pool.query(customersQuery, queryParams)

    if (customersResult.rows.length === 0) {
      return NextResponse.json({ error: 'No eligible customers found' }, { status: 400 })
    }

    await client.query('BEGIN')

    let totalRedeemed = 0
    let totalValue = 0
    const redemptions: any[] = []

    for (const customer of customersResult.rows) {
      const pointBalance = parseFloat(customer.point_balance)
      const discountValue = pointBalance / pointsPerKsh

      // Create redemption transaction
      await client.query(
        `INSERT INTO loyalty_transactions 
         (branch_id, customer_name, customer_pin, transaction_date, transaction_amount, 
          points_earned, points_redeemed, transaction_type)
         VALUES ($1, $2, $3, NOW(), $4, 0, $5, 'redeem')`,
        [
          branch_id,
          customer.customer_name,
          customer.customer_pin,
          discountValue,
          pointBalance
        ]
      )

      totalRedeemed += pointBalance
      totalValue += discountValue
      redemptions.push({
        customer_name: customer.customer_name,
        customer_pin: customer.customer_pin,
        points_redeemed: pointBalance,
        value: discountValue
      })
    }

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: `Bulk redemption completed for ${redemptions.length} customers`,
      summary: {
        customers_processed: redemptions.length,
        total_points_redeemed: totalRedeemed,
        total_value: totalValue
      },
      redemptions
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Error processing bulk redemption:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}
