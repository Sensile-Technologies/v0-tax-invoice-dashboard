import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { callKraCreditNote } from "@/lib/kra-sales-api"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const {
      sale_id,
      branch_id,
      reason,
      refund_reason_code
    } = body

    if (!sale_id || !branch_id) {
      return NextResponse.json(
        { error: "Missing required fields: sale_id and branch_id" },
        { status: 400 }
      )
    }

    const saleResult = await client.query(
      `SELECT s.*, i.item_code, i.class_code, i.item_name, i.package_unit, i.quantity_unit, i.tax_type
       FROM sales s
       LEFT JOIN items i ON i.branch_id = s.branch_id AND UPPER(i.item_name) = UPPER(s.fuel_type)
       WHERE s.id = $1`,
      [sale_id]
    )

    if (saleResult.rows.length === 0) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    const originalSale = saleResult.rows[0]
    
    const invoiceNoMatch = originalSale.invoice_number?.match(/\d+/)
    const originalInvoiceNo = invoiceNoMatch ? parseInt(invoiceNoMatch[0]) : 1

    const kraResult = await callKraCreditNote({
      branch_id: branch_id,
      original_sale_id: sale_id,
      original_invoice_no: originalInvoiceNo,
      refund_reason_code: refund_reason_code || reason || 'other',
      customer_tin: originalSale.customer_pin,
      customer_name: originalSale.customer_name,
      items: [{
        item_code: originalSale.item_code || 'KE2BFLTR0000001',
        item_class_code: originalSale.class_code || '99013001',
        item_name: originalSale.item_name || originalSale.fuel_type,
        package_unit: originalSale.package_unit || 'BF',
        quantity_unit: originalSale.quantity_unit || 'L',
        quantity: parseFloat(originalSale.quantity) || 0,
        price: parseFloat(originalSale.unit_price) || 0,
        tax_type: originalSale.tax_type || 'B'
      }]
    })

    if (!kraResult.success) {
      return NextResponse.json({
        success: false,
        error: "KRA credit note submission failed",
        kraResponse: kraResult.kraResponse
      }, { status: 400 })
    }

    const creditNoteInvoiceNumber = `${originalSale.invoice_number}-CR`
    const kraData = kraResult.kraResponse?.data || {}

    const insertResult = await client.query(
      `INSERT INTO sales (
        id, branch_id, nozzle_id, fuel_type, quantity, unit_price, total_amount,
        payment_method, customer_name, customer_pin, is_loyalty_sale, 
        meter_reading_after, invoice_number, receipt_number,
        transmission_status, sale_date, is_credit_note, original_sale_id,
        kra_status, kra_rcpt_sign, kra_scu_id, kra_cu_inv
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16, $17, $18, $19, $20
      ) RETURNING *`,
      [
        branch_id,
        originalSale.nozzle_id,
        originalSale.fuel_type,
        -Math.abs(parseFloat(originalSale.quantity)),
        originalSale.unit_price,
        -Math.abs(parseFloat(originalSale.total_amount)),
        originalSale.payment_method,
        originalSale.customer_name,
        originalSale.customer_pin,
        originalSale.is_loyalty_sale,
        originalSale.meter_reading_after || 0,
        creditNoteInvoiceNumber,
        kraResult.creditNoteNumber,
        'transmitted',
        true,
        sale_id,
        'success',
        kraData.rcptSign || null,
        kraData.sdcId || null,
        kraData.intrlData || `${kraResult.creditNoteNumber}`
      ]
    )

    await client.query(
      `UPDATE sales SET has_credit_note = true WHERE id = $1`,
      [sale_id]
    )

    return NextResponse.json({
      success: true,
      data: insertResult.rows[0],
      kraResponse: kraResult.kraResponse,
      creditNoteNumber: kraResult.creditNoteNumber
    })

  } catch (error: any) {
    console.error("Error creating credit note:", error)
    return NextResponse.json(
      { error: "Failed to create credit note", details: error.message },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get('branch_id')

  try {
    let queryStr = `SELECT * FROM sales WHERE is_credit_note = true`
    const params: any[] = []
    
    if (branchId) {
      params.push(branchId)
      queryStr += ` AND branch_id = $${params.length}`
    }
    
    queryStr += ` ORDER BY sale_date DESC`
    
    const result = await pool.query(queryStr, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    console.error("Error fetching credit notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch credit notes", details: error.message },
      { status: 500 }
    )
  }
}
