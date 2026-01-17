import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const branchId = searchParams.get('branch_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      )
    }

    // Get customer details
    const customerResult = await pool.query(
      `SELECT id, cust_nm, cust_tin, tel_no, email, adrs FROM customers WHERE id = $1`,
      [customerId]
    )

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    const customer = customerResult.rows[0]

    // Build sales query with date filters
    let salesQuery = `
      SELECT 
        s.id,
        s.created_at as date,
        s.invoice_number,
        s.fuel_type,
        s.quantity,
        s.total_price as amount,
        s.payment_method,
        s.status,
        b.name as branch_name
      FROM sales s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE (s.customer_id = $1 OR s.customer_pin = $2 OR s.customer_name = $3)
    `
    const params: any[] = [customerId, customer.cust_tin, customer.cust_nm]

    if (branchId) {
      params.push(branchId)
      salesQuery += ` AND s.branch_id = $${params.length}`
    }

    if (startDate) {
      params.push(startDate)
      salesQuery += ` AND s.created_at >= $${params.length}::date`
    }

    if (endDate) {
      params.push(endDate)
      salesQuery += ` AND s.created_at <= $${params.length}::date + interval '1 day'`
    }

    salesQuery += ` ORDER BY s.created_at DESC`

    const salesResult = await pool.query(salesQuery, params)

    // Calculate totals
    const transactions = salesResult.rows
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const totalQuantity = transactions.reduce((sum, t) => sum + parseFloat(t.quantity || 0), 0)

    // Get payment breakdown
    const paymentBreakdown: Record<string, number> = {}
    transactions.forEach(t => {
      const method = t.payment_method || 'unknown'
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + parseFloat(t.amount || 0)
    })

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.cust_nm,
          pin: customer.cust_tin,
          phone: customer.tel_no,
          email: customer.email,
          address: customer.adrs
        },
        transactions,
        summary: {
          totalTransactions: transactions.length,
          totalAmount,
          totalQuantity,
          paymentBreakdown,
          periodStart: startDate || null,
          periodEnd: endDate || null
        }
      }
    })

  } catch (error: any) {
    console.error("Error generating customer statement:", error)
    return NextResponse.json(
      { error: "Failed to generate statement", details: error.message },
      { status: 500 }
    )
  }
}
