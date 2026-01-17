import { NextResponse } from "next/server"
import { Pool } from "pg"
import { callKraSaveSales } from "@/lib/kra-sales-api"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sale_id, branch_id } = body

    if (!sale_id || !branch_id) {
      return NextResponse.json({ success: false, error: "Missing sale_id or branch_id" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const saleResult = await client.query(
        `SELECT s.*, 
                i.item_name as fuel_type_from_item,
                bi.sale_price as branch_item_price
         FROM sales s
         LEFT JOIN items i ON s.item_id = i.id
         LEFT JOIN branch_items bi ON s.item_id = bi.item_id AND s.branch_id = bi.branch_id
         WHERE s.id = $1 AND s.branch_id = $2`,
        [sale_id, branch_id]
      )

      if (saleResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 })
      }

      const sale = saleResult.rows[0]

      if (sale.kra_status === 'success' || sale.kra_status === 'transmitted') {
        return NextResponse.json({ 
          success: false, 
          error: "This invoice has already been transmitted to KRA successfully" 
        }, { status: 400 })
      }

      const fuelType = sale.fuel_type_from_item || sale.fuel_type || 'Fuel'
      const unitPrice = Number(sale.branch_item_price) || Number(sale.unit_price) || 0
      const quantity = Number(sale.quantity) || 0

      const kraResult = await callKraSaveSales({
        branch_id: sale.branch_id,
        invoice_number: sale.invoice_number || '',
        receipt_number: sale.receipt_number || sale.invoice_number || '',
        fuel_type: fuelType,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: quantity * unitPrice,
        payment_method: sale.payment_method || 'cash',
        customer_name: sale.customer_name,
        customer_pin: sale.customer_pin,
        sale_date: sale.sale_date,
        tank_id: sale.tank_id
      })

      if (kraResult.success) {
        const kraData = kraResult.kraResponse?.data || {}
        // CU invoice number is formatted as sdcId/rcptNo (e.g., KRACU0300003796/378)
        const cuInvNo = (kraData.sdcId && kraData.rcptNo) ? `${kraData.sdcId}/${kraData.rcptNo}` : null
        
        await client.query(
          `UPDATE sales 
           SET kra_status = 'success', 
               transmission_status = 'transmitted',
               kra_rcpt_sign = $1,
               kra_scu_id = $2,
               kra_cu_inv = $3,
               kra_internal_data = $4,
               kra_response = $5,
               updated_at = NOW()
           WHERE id = $6`,
          [
            kraData.rcptSign || null,
            kraData.sdcId || null,
            cuInvNo,
            kraData.intrlData || null,
            JSON.stringify(kraResult.kraResponse),
            sale_id
          ]
        )

        return NextResponse.json({ 
          success: true, 
          message: "Invoice successfully transmitted to KRA",
          kraResponse: kraResult.kraResponse
        })
      } else {
        await client.query(
          `UPDATE sales 
           SET kra_status = 'failed', 
               transmission_status = 'failed',
               kra_response = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(kraResult.kraResponse), sale_id]
        )

        return NextResponse.json({ 
          success: false, 
          error: kraResult.kraResponse?.resultMsg || kraResult.error || "Failed to transmit to KRA",
          kraResponse: kraResult.kraResponse
        }, { status: 500 })
      }
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Resubmit KRA] Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to resubmit invoice to KRA" 
    }, { status: 500 })
  }
}
