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
      return NextResponse.json({ customer: result.rows[0] })
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
