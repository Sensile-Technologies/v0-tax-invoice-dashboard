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

    const points_earned = Math.floor(transaction_amount / 100)

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
