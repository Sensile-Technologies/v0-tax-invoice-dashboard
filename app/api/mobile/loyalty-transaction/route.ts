import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branch_id,
      sale_id,
      customer_name,
      customer_pin,
      transaction_amount,
      fuel_type,
      quantity,
      payment_method,
    } = body

    if (!branch_id || !sale_id || !customer_name) {
      return NextResponse.json(
        { error: 'branch_id, sale_id, and customer_name are required' },
        { status: 400 }
      )
    }

    // Check if loyalty transaction already exists for this sale (created by create-sale API)
    const existingCheck = await pool.query(
      'SELECT id, points_earned FROM loyalty_transactions WHERE sale_id = $1',
      [sale_id]
    )
    if (existingCheck.rows.length > 0) {
      // Already created by create-sale API, return existing data
      return NextResponse.json({ 
        success: true, 
        transaction_id: existingCheck.rows[0].id,
        points_earned: existingCheck.rows[0].points_earned,
        already_exists: true
      })
    }

    // Fetch branch earning rules for points calculation
    const earningRulesResult = await pool.query(
      `SELECT loyalty_earn_type, loyalty_points_per_litre, loyalty_points_per_amount, loyalty_amount_threshold
       FROM branches WHERE id = $1`,
      [branch_id]
    )
    const earningRules = earningRulesResult.rows[0] || {}
    // Use nullish coalescing BEFORE Number() - Number(null) returns NaN, not null!
    const earnType = earningRules.loyalty_earn_type ?? 'per_amount'
    const pointsPerLitre = Number(earningRules.loyalty_points_per_litre ?? 1)
    const pointsPerAmount = Number(earningRules.loyalty_points_per_amount ?? 1)
    // Threshold must be at least 1 to prevent division by zero
    const amountThreshold = Math.max(1, Number(earningRules.loyalty_amount_threshold ?? 100))
    
    // Calculate points based on earning type
    let points_earned: number
    if (earnType === 'per_litre') {
      points_earned = Math.floor((quantity || 0) * pointsPerLitre)
    } else {
      points_earned = Math.floor(transaction_amount / amountThreshold) * pointsPerAmount
    }

    const result = await pool.query(
      `INSERT INTO loyalty_transactions 
       (branch_id, sale_id, customer_name, customer_pin, transaction_date, transaction_amount, points_earned, payment_method, fuel_type, quantity)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        branch_id,
        sale_id,
        customer_name,
        customer_pin || '',
        transaction_amount,
        points_earned,
        payment_method,
        fuel_type,
        quantity
      ]
    )

    return NextResponse.json({ 
      success: true, 
      transaction_id: result.rows[0].id,
      points_earned 
    })
  } catch (error: any) {
    console.error('Error creating loyalty transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create loyalty transaction' },
      { status: 500 }
    )
  }
}
