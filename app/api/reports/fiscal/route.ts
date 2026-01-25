import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    // Use request.cookies instead of cookies() from next/headers for reliability
    const sessionCookie = request.cookies.get('user_session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'x'
    const branchId = searchParams.get('branch_id') || session.branch_id
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const fromTime = searchParams.get('from_time') || '00:00:00'
    const toTime = searchParams.get('to_time') || '23:59:59'
    const shiftId = searchParams.get('shift_id')

    if (!branchId) {
      return NextResponse.json({ error: "branch_id is required" }, { status: 400 })
    }

    const branchResult = await pool.query(
      `SELECT b.*, v.name as vendor_name, v.kra_pin as vendor_pin
       FROM branches b
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE b.id = $1`,
      [branchId]
    )
    
    if (branchResult.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }
    
    const branch = branchResult.rows[0]

    let dateFilter = ""
    const params: any[] = [branchId]
    let paramIndex = 2

    if (shiftId) {
      dateFilter = ` AND s.shift_id = $${paramIndex}`
      params.push(shiftId)
      paramIndex++
    } else if (fromDate && toDate) {
      const startDateTime = `${fromDate} ${fromTime}`
      const endDateTime = `${toDate} ${toTime}`
      dateFilter = ` AND s.sale_date >= $${paramIndex} AND s.sale_date <= $${paramIndex + 1}`
      params.push(startDateTime, endDateTime)
      paramIndex += 2
    } else if (fromDate) {
      const startDateTime = `${fromDate} ${fromTime}`
      dateFilter = ` AND s.sale_date >= $${paramIndex}`
      params.push(startDateTime)
      paramIndex++
    } else {
      const today = new Date().toISOString().split('T')[0]
      dateFilter = ` AND DATE(s.sale_date) = $${paramIndex}`
      params.push(today)
      paramIndex++
    }

    const salesQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN NOT COALESCE(s.is_credit_note, false) THEN s.total_amount ELSE 0 END), 0) as gross_sales,
        COALESCE(SUM(CASE WHEN COALESCE(s.is_credit_note, false) THEN s.total_amount ELSE 0 END), 0) as returns,
        COUNT(*) FILTER (WHERE NOT COALESCE(s.is_credit_note, false)) as transaction_count,
        COUNT(*) FILTER (WHERE COALESCE(s.is_credit_note, false)) as voided_count
      FROM sales s
      WHERE s.branch_id = $1 ${dateFilter}
    `
    const salesResult = await pool.query(salesQuery, params)
    const salesData = salesResult.rows[0]

    const paymentQuery = `
      SELECT 
        COALESCE(s.payment_method, 'Cash') as method,
        COALESCE(SUM(s.total_amount), 0) as amount,
        COUNT(*) as count
      FROM sales s
      WHERE s.branch_id = $1 AND NOT COALESCE(s.is_credit_note, false) ${dateFilter}
      GROUP BY s.payment_method
      ORDER BY amount DESC
    `
    const paymentResult = await pool.query(paymentQuery, params)

    const vatQuery = `
      WITH sale_tax_types AS (
        SELECT 
          s.id as sale_id,
          s.total_amount,
          COALESCE(
            (SELECT i.tax_type FROM items i WHERE i.id = s.item_id LIMIT 1),
            'B'
          ) as tax_type
        FROM sales s
        WHERE s.branch_id = $1 AND NOT COALESCE(s.is_credit_note, false) ${dateFilter}
      )
      SELECT 
        CASE 
          WHEN tax_type = 'A' THEN 'A - Exempt'
          WHEN tax_type = 'B' THEN 'B - 16% VAT'
          WHEN tax_type = 'C' THEN 'C - Zero Rated'
          WHEN tax_type = 'D' THEN 'D - Non-VAT'
          ELSE 'B - 16% VAT'
        END as category,
        CASE 
          WHEN tax_type = 'B' THEN COALESCE(SUM(total_amount / 1.16), 0)
          ELSE COALESCE(SUM(total_amount), 0)
        END as taxable_amount,
        CASE 
          WHEN tax_type = 'B' THEN COALESCE(SUM(total_amount - (total_amount / 1.16)), 0)
          ELSE 0
        END as vat_amount,
        COALESCE(SUM(total_amount), 0) as total
      FROM sale_tax_types
      GROUP BY tax_type
      ORDER BY category
    `
    const vatResult = await pool.query(vatQuery, params)

    let vatBreakdown = vatResult.rows.map(row => ({
      category: row.category,
      taxableAmount: parseFloat(row.taxable_amount) || 0,
      vatAmount: parseFloat(row.vat_amount) || 0,
      total: parseFloat(row.total) || 0
    }))

    if (vatBreakdown.length === 0) {
      vatBreakdown = [
        { category: "A - Exempt", taxableAmount: 0, vatAmount: 0, total: 0 },
        { category: "B - 16% VAT", taxableAmount: 0, vatAmount: 0, total: 0 },
        { category: "C - Zero Rated", taxableAmount: 0, vatAmount: 0, total: 0 },
        { category: "D - Non-VAT", taxableAmount: 0, vatAmount: 0, total: 0 }
      ]
    }

    const grossSales = parseFloat(salesData.gross_sales) || 0
    const returns = parseFloat(salesData.returns) || 0
    const netSales = grossSales - returns

    let shiftInfo = null
    if (shiftId) {
      const shiftResult = await pool.query(
        `SELECT s.*, st.full_name as cashier_name 
         FROM shifts s 
         LEFT JOIN staff st ON s.staff_id = st.id 
         WHERE s.id = $1`,
        [shiftId]
      )
      if (shiftResult.rows.length > 0) {
        shiftInfo = shiftResult.rows[0]
      }
    } else {
      const activeShiftResult = await pool.query(
        `SELECT s.*, st.full_name as cashier_name 
         FROM shifts s 
         LEFT JOIN staff st ON s.staff_id = st.id 
         WHERE s.branch_id = $1 AND s.status = 'active'
         ORDER BY s.start_time DESC LIMIT 1`,
        [branchId]
      )
      if (activeShiftResult.rows.length > 0) {
        shiftInfo = activeShiftResult.rows[0]
      }
    }

    const now = new Date()
    const reportNumber = reportType === 'z' 
      ? `Z-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(3, '0')}-${String(now.getDate()).padStart(3, '0')}`
      : `X-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(3, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const cumulativeQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as cumulative_sales
      FROM sales
      WHERE branch_id = $1 AND NOT COALESCE(is_credit_note, false)
    `
    const cumulativeResult = await pool.query(cumulativeQuery, [branchId])
    const cumulativeSales = parseFloat(cumulativeResult.rows[0]?.cumulative_sales) || 0

    const kraTransmittedQuery = `
      SELECT 
        COUNT(*) as kra_count,
        COALESCE(SUM(s.total_amount), 0) as kra_gross,
        COALESCE(SUM(CASE WHEN COALESCE(i.tax_type, 'B') = 'B' THEN s.total_amount / 1.16 ELSE s.total_amount END), 0) as kra_net,
        COALESCE(SUM(CASE WHEN COALESCE(i.tax_type, 'B') = 'B' THEN s.total_amount - (s.total_amount / 1.16) ELSE 0 END), 0) as kra_vat
      FROM sales s
      LEFT JOIN items i ON s.item_id = i.id
      WHERE s.branch_id = $1 
        AND NOT COALESCE(s.is_credit_note, false)
        AND (s.kra_status = 'success' OR s.transmission_status = 'transmitted')
        ${dateFilter}
    `
    const kraTransmittedResult = await pool.query(kraTransmittedQuery, params)
    const kraData = kraTransmittedResult.rows[0] || {}
    
    const kraTransmittedSales = {
      count: parseInt(kraData.kra_count) || 0,
      gross: parseFloat(kraData.kra_gross) || 0,
      net: parseFloat(kraData.kra_net) || 0,
      vat: parseFloat(kraData.kra_vat) || 0
    }

    const reportData = {
      reportType: reportType.toUpperCase(),
      reportNumber,
      fiscalNumber: branch.device_token ? `${branch.device_token}-${reportNumber}` : reportNumber,
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      deviceSerial: branch.device_token || 'Not Configured',
      branchName: branch.name,
      vendorName: branch.vendor_name,
      
      cashier: shiftInfo?.cashier_name || 'N/A',
      operator: shiftInfo?.cashier_name || 'Manager',
      shiftStart: shiftInfo ? new Date(shiftInfo.start_time).toLocaleTimeString('en-US', { hour12: false }) : 'N/A',
      shiftDuration: shiftInfo && shiftInfo.end_time 
        ? `${Math.round((new Date(shiftInfo.end_time).getTime() - new Date(shiftInfo.start_time).getTime()) / (1000 * 60 * 60))} hours`
        : 'Active',

      salesSummary: {
        grossSales,
        returns,
        netSales
      },

      vatBreakdown,

      paymentMethods: paymentResult.rows.map(row => ({
        method: row.method || 'Cash',
        amount: parseFloat(row.amount) || 0,
        count: parseInt(row.count) || 0
      })),

      transactionCount: parseInt(salesData.transaction_count) || 0,
      voidedTransactions: parseInt(salesData.voided_count) || 0,
      voidedAmount: returns,

      counters: {
        totalTransactions: parseInt(salesData.transaction_count) || 0,
        voidedTransactions: parseInt(salesData.voided_count) || 0,
        cumulativeSales
      },

      kraTransmittedSales
    }

    return NextResponse.json({ success: true, data: reportData })

  } catch (error: any) {
    console.error("[Fiscal Report API] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate fiscal report", details: error.message },
      { status: 500 }
    )
  }
}
