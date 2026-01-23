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

    // Single query: check existing + get earning rules in one call
    const combinedResult = await pool.query(
      `SELECT 
        lt.id as existing_id, lt.points_earned as existing_points,
        b.loyalty_earn_type, b.loyalty_points_per_litre, b.loyalty_points_per_amount, b.loyalty_amount_threshold
       FROM branches b
       LEFT JOIN loyalty_transactions lt ON lt.sale_id = $2
       WHERE b.id = $1
       LIMIT 1`,
      [branch_id, sale_id]
    )
    
    const row = combinedResult.rows[0]
    
    // If transaction already exists, return immediately
    if (row?.existing_id) {
      return NextResponse.json({ 
        success: true, 
        transaction_id: row.existing_id,
        points_earned: row.existing_points,
        already_exists: true
      })
    }

    // Calculate points from earning rules
    const earnType = row?.loyalty_earn_type ?? 'per_amount'
    const pointsPerLitre = Number(row?.loyalty_points_per_litre ?? 1)
    const pointsPerAmount = Number(row?.loyalty_points_per_amount ?? 1)
    const amountThreshold = Math.max(1, Number(row?.loyalty_amount_threshold ?? 100))
    
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
       ON CONFLICT (sale_id) DO UPDATE SET id = loyalty_transactions.id
       RETURNING id, (xmax = 0) as inserted`,
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
      transaction_id: result.rows[0]?.id || null,
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
