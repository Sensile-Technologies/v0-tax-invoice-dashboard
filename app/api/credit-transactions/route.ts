import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get('branch_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  if (!branchId) {
    return NextResponse.json({ success: false, error: 'Branch ID required' }, { status: 400 })
  }

  try {
    const dateFilter = startDate && endDate 
      ? `AND DATE(s.sale_date) BETWEEN $2 AND $3`
      : ''
    const dateParams = startDate && endDate ? [branchId, startDate, endDate] : [branchId]

    const creditSalesQuery = `
      SELECT 
        s.id,
        'sale' as credit_type,
        s.sale_date as transaction_date,
        DATE(s.sale_date) as day,
        s.invoice_number,
        s.customer_name,
        s.vehicle_number,
        s.total_amount as credit_amount,
        COALESCE(i.item_name, s.fuel_type) as item_name,
        s.quantity,
        s.unit_price,
        COALESCE(
          (SELECT SUM(cp.payment_amount) FROM credit_payments cp WHERE cp.source_id = s.id AND cp.credit_type = 'sale'),
          0
        ) as paid_amount
      FROM sales s
      LEFT JOIN items i ON s.item_id = i.id
      WHERE s.branch_id = $1
        AND s.payment_method = 'credit'
        AND s.is_credit_note = false
        ${dateFilter}
      ORDER BY s.sale_date DESC
    `

    const creditSales = await query(creditSalesQuery, dateParams)

    const collectionDateFilter = startDate && endDate 
      ? `AND DATE(ac.created_at) BETWEEN $2 AND $3`
      : ''

    const creditCollectionsQuery = `
      SELECT 
        ac.id,
        'collection' as credit_type,
        ac.created_at as transaction_date,
        DATE(ac.created_at) as day,
        sh.id as shift_id,
        u.full_name as staff_name,
        ac.amount as credit_amount,
        COALESCE(
          (SELECT SUM(cp.payment_amount) FROM credit_payments cp WHERE cp.source_id = ac.id AND cp.credit_type = 'collection'),
          0
        ) as paid_amount
      FROM attendant_collections ac
      JOIN shifts sh ON ac.shift_id = sh.id
      LEFT JOIN users u ON ac.staff_id = u.id
      WHERE ac.branch_id = $1
        AND ac.payment_method = 'credit'
        ${collectionDateFilter}
      ORDER BY ac.created_at DESC
    `

    const creditCollections = await query(creditCollectionsQuery, dateParams)

    const allTransactions = [
      ...creditSales.map((s: any) => ({
        ...s,
        credit_amount: parseFloat(s.credit_amount) || 0,
        paid_amount: parseFloat(s.paid_amount) || 0,
        outstanding: (parseFloat(s.credit_amount) || 0) - (parseFloat(s.paid_amount) || 0)
      })),
      ...creditCollections.map((c: any) => ({
        ...c,
        credit_amount: parseFloat(c.credit_amount) || 0,
        paid_amount: parseFloat(c.paid_amount) || 0,
        outstanding: (parseFloat(c.credit_amount) || 0) - (parseFloat(c.paid_amount) || 0)
      }))
    ].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())

    const dailyTotals: Record<string, { 
      date: string, 
      total_credit: number, 
      total_paid: number, 
      outstanding: number,
      transactions: any[] 
    }> = {}

    for (const tx of allTransactions) {
      const day = tx.day
      if (!dailyTotals[day]) {
        dailyTotals[day] = { 
          date: day, 
          total_credit: 0, 
          total_paid: 0, 
          outstanding: 0,
          transactions: [] 
        }
      }
      dailyTotals[day].total_credit += tx.credit_amount
      dailyTotals[day].total_paid += tx.paid_amount
      dailyTotals[day].outstanding += tx.outstanding
      dailyTotals[day].transactions.push(tx)
    }

    const dailySummary = Object.values(dailyTotals).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const overallTotals = {
      total_credit: allTransactions.reduce((sum, tx) => sum + tx.credit_amount, 0),
      total_paid: allTransactions.reduce((sum, tx) => sum + tx.paid_amount, 0),
      outstanding: allTransactions.reduce((sum, tx) => sum + tx.outstanding, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        daily: dailySummary,
        totals: overallTotals,
        transaction_count: allTransactions.length
      }
    })
  } catch (error) {
    console.error('Error fetching credit transactions:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch credit transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      branch_id, 
      credit_type, 
      source_id, 
      source_date, 
      credit_amount, 
      payment_amount, 
      payment_reference, 
      payment_notes 
    } = body

    if (!branch_id || !credit_type || !source_id || !payment_amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: branch_id, credit_type, source_id, payment_amount' 
      }, { status: 400 })
    }

    if (payment_amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment amount must be greater than 0' 
      }, { status: 400 })
    }

    const existingPayments = await query(
      `SELECT COALESCE(SUM(payment_amount), 0) as total_paid 
       FROM credit_payments 
       WHERE source_id = $1 AND credit_type = $2`,
      [source_id, credit_type]
    )
    
    const totalPaid = parseFloat(existingPayments[0]?.total_paid || 0)
    const originalAmount = parseFloat(credit_amount) || 0
    const newPayment = parseFloat(payment_amount)
    
    if (totalPaid + newPayment > originalAmount) {
      return NextResponse.json({ 
        success: false, 
        error: `Payment exceeds outstanding amount. Outstanding: ${(originalAmount - totalPaid).toFixed(2)}` 
      }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO credit_payments (
        branch_id, vendor_id, credit_type, source_id, source_date, 
        credit_amount, payment_amount, payment_reference, payment_notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        branch_id,
        session.user.vendor_id || null,
        credit_type,
        source_id,
        source_date || new Date().toISOString().split('T')[0],
        credit_amount,
        payment_amount,
        payment_reference || null,
        payment_notes || null,
        session.user.id
      ]
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error recording credit payment:', error)
    return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 })
  }
}
