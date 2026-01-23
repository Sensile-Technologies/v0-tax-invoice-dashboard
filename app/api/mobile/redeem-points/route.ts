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
      customer_phone,
      points_to_redeem,
      transaction_amount,
    } = body

    // Validate required fields
    if (!branch_id || !customer_pin || points_to_redeem === undefined || points_to_redeem === null) {
      return NextResponse.json(
        { error: 'branch_id, customer_pin, and points_to_redeem are required' },
        { status: 400 }
      )
    }

    // Validate numeric inputs
    const pointsNum = Number(points_to_redeem)
    if (isNaN(pointsNum) || pointsNum <= 0) {
      return NextResponse.json(
        { error: 'points_to_redeem must be a positive number' },
        { status: 400 }
      )
    }

    const txnAmount = Number(transaction_amount) || 0

    // Get customer's current point balance - match by customer_pin OR customer_phone (like verify-loyalty)
    const balanceResult = await pool.query(
      `SELECT 
        COALESCE(SUM(points_earned), 0) as total_earned,
        COALESCE(SUM(points_redeemed), 0) as total_redeemed
       FROM loyalty_transactions 
       WHERE branch_id = $1 
       AND (customer_pin = $2 OR customer_pin = $3)`,
      [branch_id, customer_pin, customer_phone || customer_pin]
    )
    
    const balance = balanceResult.rows[0]
    const currentBalance = Math.floor(
      (parseFloat(balance.total_earned) || 0) - (parseFloat(balance.total_redeemed) || 0)
    )

    // Get redemption rules
    const rulesResult = await pool.query(
      `SELECT redemption_points_per_ksh, min_redemption_points, max_redemption_percent
       FROM branches WHERE id = $1`,
      [branch_id]
    )
    const rules = rulesResult.rows[0] || {}
    const pointsPerKsh = Math.max(1, parseFloat(rules.redemption_points_per_ksh) || 1)
    const minPoints = parseFloat(rules.min_redemption_points) || 100
    const maxPercent = parseFloat(rules.max_redemption_percent) || 50

    // Validate: sufficient points
    if (pointsNum > currentBalance) {
      return NextResponse.json(
        { error: `Insufficient points. Customer has ${currentBalance} points.` },
        { status: 400 }
      )
    }

    // Validate: minimum redemption threshold
    if (pointsNum < minPoints) {
      return NextResponse.json(
        { error: `Minimum redemption is ${minPoints} points.` },
        { status: 400 }
      )
    }

    // Calculate discount value
    let discountAmount = pointsNum / pointsPerKsh

    // Enforce max redemption percent if transaction_amount is provided
    if (txnAmount > 0) {
      const maxDiscount = (txnAmount * maxPercent) / 100
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount
        // Recalculate points based on capped discount
        const actualPointsToRedeem = Math.floor(discountAmount * pointsPerKsh)
        return NextResponse.json(
          { error: `Maximum discount is ${maxPercent}% of transaction (KES ${maxDiscount.toFixed(2)}). You can redeem up to ${actualPointsToRedeem} points.` },
          { status: 400 }
        )
      }
    }

    // Create redemption transaction
    // transaction_amount stores the SALE amount (if any), discount goes in a separate calculation
    const result = await pool.query(
      `INSERT INTO loyalty_transactions 
       (branch_id, sale_id, customer_name, customer_pin, transaction_date, transaction_amount, 
        points_earned, points_redeemed, transaction_type)
       VALUES ($1, $2, $3, $4, NOW(), $5, 0, $6, 'redeem')
       RETURNING id`,
      [
        branch_id,
        sale_id || null,
        customer_name || 'Customer',
        customer_pin,
        txnAmount,
        pointsNum
      ]
    )

    const newBalance = currentBalance - pointsNum

    return NextResponse.json({
      success: true,
      transaction_id: result.rows[0].id,
      points_redeemed: pointsNum,
      discount_applied: discountAmount,
      new_balance: newBalance
    })
  } catch (error: any) {
    console.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to redeem points' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branch_id = searchParams.get('branch_id')
    const customer_pin = searchParams.get('customer_pin')
    const customer_phone = searchParams.get('customer_phone')

    if (!branch_id || (!customer_pin && !customer_phone)) {
      return NextResponse.json(
        { error: 'branch_id and customer_pin or customer_phone are required' },
        { status: 400 }
      )
    }

    // Get customer's point balance - match by customer_pin OR customer_phone
    const balanceResult = await pool.query(
      `SELECT 
        COALESCE(SUM(points_earned), 0) as total_earned,
        COALESCE(SUM(points_redeemed), 0) as total_redeemed
       FROM loyalty_transactions 
       WHERE branch_id = $1 
       AND (customer_pin = $2 OR customer_pin = $3)`,
      [branch_id, customer_pin || '', customer_phone || '']
    )
    
    const balance = balanceResult.rows[0]
    const currentBalance = Math.floor(
      (parseFloat(balance.total_earned) || 0) - (parseFloat(balance.total_redeemed) || 0)
    )

    // Get redemption rules
    const rulesResult = await pool.query(
      `SELECT redemption_points_per_ksh, min_redemption_points, max_redemption_percent
       FROM branches WHERE id = $1`,
      [branch_id]
    )
    const rules = rulesResult.rows[0] || {}

    return NextResponse.json({
      success: true,
      point_balance: currentBalance,
      total_earned: parseFloat(balance.total_earned) || 0,
      total_redeemed: parseFloat(balance.total_redeemed) || 0,
      redemption_rules: {
        points_per_ksh: parseFloat(rules.redemption_points_per_ksh) || 1,
        min_points: parseFloat(rules.min_redemption_points) || 100,
        max_percent: parseFloat(rules.max_redemption_percent) || 50
      }
    })
  } catch (error: any) {
    console.error('Error fetching point balance:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
