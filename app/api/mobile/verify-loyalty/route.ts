import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branch_id = searchParams.get('branch_id')
    const phone = searchParams.get('phone')

    if (!branch_id || !phone) {
      return NextResponse.json(
        { error: 'branch_id and phone are required' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, '')
    
    const result = await pool.query(
      `SELECT c.id, c.cust_nm, c.tel_no, c.cust_tin
       FROM customers c
       INNER JOIN customer_branches cb ON c.id = cb.customer_id
       WHERE cb.branch_id = $1 
       AND cb.status = 'active'
       AND REPLACE(REPLACE(REPLACE(c.tel_no, ' ', ''), '-', ''), '+', '') LIKE '%' || $2
       LIMIT 1`,
      [branch_id, cleanPhone.slice(-9)]
    )

    if (result.rows.length > 0) {
      const customer = result.rows[0]
      
      // Get point balance for this customer at this branch
      const balanceResult = await pool.query(
        `SELECT 
          COALESCE(SUM(points_earned), 0) as total_earned,
          COALESCE(SUM(points_redeemed), 0) as total_redeemed
         FROM loyalty_transactions 
         WHERE branch_id = $1 
         AND (customer_pin = $2 OR customer_pin = $3)`,
        [branch_id, customer.tel_no, customer.cust_tin]
      )
      
      const balance = balanceResult.rows[0]
      const pointBalance = Math.floor(
        (parseFloat(balance.total_earned) || 0) - (parseFloat(balance.total_redeemed) || 0)
      )
      
      // Get redemption rules for the branch
      const rulesResult = await pool.query(
        `SELECT redemption_points_per_ksh, min_redemption_points, max_redemption_percent
         FROM branches WHERE id = $1`,
        [branch_id]
      )
      const rules = rulesResult.rows[0] || {}
      
      return NextResponse.json({ 
        customer: {
          ...customer,
          point_balance: pointBalance,
          redemption_rules: {
            points_per_ksh: parseFloat(rules.redemption_points_per_ksh) || 1,
            min_points: parseFloat(rules.min_redemption_points) || 100,
            max_percent: parseFloat(rules.max_redemption_percent) || 50
          }
        }
      })
    }

    return NextResponse.json({ customer: null })
  } catch (error: any) {
    console.error('Error verifying loyalty customer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify customer' },
      { status: 500 }
    )
  }
}
