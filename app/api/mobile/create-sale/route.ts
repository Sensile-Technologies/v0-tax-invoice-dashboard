import { NextResponse } from "next/server"
import { Pool } from "pg"
import { callKraSaveSales } from "@/lib/kra-sales-api"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[Mobile Create Sale] Request body:", JSON.stringify(body, null, 2))
    
    const {
      branch_id,
      user_id,
      nozzle_id,
      fuel_type,
      quantity,
      unit_price,
      total_amount,
      payment_method,
      customer_name,
      kra_pin,
      vehicle_number,
      is_loyalty_customer,
    } = body

    if (!branch_id || !fuel_type || !total_amount) {
      console.log("[Mobile Create Sale] Missing required fields - branch_id:", branch_id, "fuel_type:", fuel_type, "total_amount:", total_amount)
      return NextResponse.json(
        { error: `Missing required fields: branch_id=${branch_id}, fuel_type=${fuel_type}, total_amount=${total_amount}` },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const tankCheck = await client.query(
        `SELECT id, tank_name, kra_item_cd FROM tanks 
         WHERE branch_id = $1 AND fuel_type ILIKE $2 AND status = 'active' 
         ORDER BY current_stock DESC LIMIT 1`,
        [branch_id, `%${fuel_type}%`]
      )

      if (tankCheck.rows.length > 0 && !tankCheck.rows[0].kra_item_cd) {
        return NextResponse.json(
          { error: `Tank "${tankCheck.rows[0].tank_name}" is not mapped to an item. Please map the tank to an item in the item list before selling.` },
          { status: 400 }
        )
      }

      const itemPriceResult = await client.query(
        `SELECT sale_price FROM items 
         WHERE branch_id = $1 
         AND (UPPER(item_name) = UPPER($2) OR item_name ILIKE $3)
         ORDER BY created_at DESC LIMIT 1`,
        [branch_id, fuel_type, `%${fuel_type}%`]
      )

      const correctUnitPrice = itemPriceResult.rows.length > 0 
        ? parseFloat(itemPriceResult.rows[0].sale_price) 
        : unit_price
      
      const correctQuantity = total_amount / correctUnitPrice
      
      console.log(`[Mobile Create Sale] Price from items table: ${correctUnitPrice}, Calculated quantity: ${correctQuantity}`)

      await client.query('BEGIN')

      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`

      let meterReadingAfter = null
      if (nozzle_id && correctQuantity > 0) {
        const nozzleResult = await client.query(
          `SELECT initial_meter_reading FROM nozzles WHERE id = $1`,
          [nozzle_id]
        )
        
        if (nozzleResult.rows.length > 0) {
          const currentReading = parseFloat(nozzleResult.rows[0].initial_meter_reading) || 0
          meterReadingAfter = currentReading + correctQuantity
          
          await client.query(
            `UPDATE nozzles SET initial_meter_reading = $1, updated_at = NOW() WHERE id = $2`,
            [meterReadingAfter, nozzle_id]
          )
        }
      }

      const saleResult = await client.query(
        `INSERT INTO sales (
          branch_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date,
          customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin,
          meter_reading_after
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          branch_id,
          nozzle_id || null,
          fuel_type,
          correctQuantity,
          correctUnitPrice,
          total_amount,
          payment_method || 'cash',
          customer_name || 'Walk-in Customer',
          vehicle_number || null,
          invoiceNumber,
          receiptNumber,
          kra_pin || null,
          is_loyalty_customer || false,
          is_loyalty_customer ? customer_name : null,
          is_loyalty_customer ? kra_pin : null,
          meterReadingAfter,
        ]
      )

      const sale = saleResult.rows[0]

      if (is_loyalty_customer && customer_name && customer_name !== 'Walk-in Customer') {
        const existingCustomer = await client.query(
          `SELECT id FROM customers WHERE cust_nm = $1 AND branch_id = $2`,
          [customer_name, branch_id]
        )

        if (existingCustomer.rows.length === 0) {
          const custNo = `CUST-${Date.now().toString(36).toUpperCase()}`
          await client.query(
            `INSERT INTO customers (branch_id, cust_nm, cust_tin, cust_no, use_yn)
             VALUES ($1, $2, $3, $4, 'Y')
             ON CONFLICT DO NOTHING`,
            [branch_id, customer_name, kra_pin || null, custNo]
          )
        }
      }

      await client.query('COMMIT')

      const branchResult = await client.query(
        `SELECT name, address, phone, kra_pin FROM branches WHERE id = $1`,
        [branch_id]
      )
      const branchData = branchResult.rows[0] || {}

      const itemResult = await client.query(
        `SELECT item_cd FROM items WHERE branch_id = $1 AND item_name ILIKE $2 LIMIT 1`,
        [branch_id, `%${fuel_type}%`]
      )
      const itemCode = itemResult.rows[0]?.item_cd || null

      console.log("[Mobile Create Sale] Sale created successfully, calling KRA endpoint...")
      
      const kraResult = await callKraSaveSales({
        branch_id,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
        fuel_type,
        quantity: correctQuantity,
        unit_price: correctUnitPrice,
        total_amount,
        payment_method: payment_method || 'cash',
        customer_name: customer_name || 'Walk-in Customer',
        customer_pin: kra_pin || '',
        sale_date: new Date().toISOString(),
        tank_id: tankCheck.rows.length > 0 ? tankCheck.rows[0].id : undefined
      })

      console.log("[Mobile Create Sale] KRA API Response:", JSON.stringify(kraResult, null, 2))

      const kraData = kraResult.kraResponse?.data || {}
      const kraStatus = kraResult.success ? 'success' : 'failed'
      
      await client.query(
        `UPDATE sales SET 
          kra_status = $1,
          kra_rcpt_sign = $2,
          kra_scu_id = $3,
          kra_cu_inv = $4,
          kra_internal_data = $5,
          updated_at = NOW()
        WHERE id = $6`,
        [
          kraStatus,
          kraData.rcptSign || null,
          kraData.sdcId || null,
          kraData.rcptNo ? `${kraData.sdcId || ''}/${kraData.rcptNo}` : null,
          kraData.intrlData || null,
          sale.id
        ]
      )

      return NextResponse.json({
        success: true,
        sale_id: sale.id,
        sale: { ...sale, kra_status: kraStatus },
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
        kra_response: kraResult.kraResponse,
        kra_success: kraResult.success,
        print_data: {
          invoice_number: kraData.rcptNo ? `${kraData.sdcId || ''}/${kraData.rcptNo}` : invoiceNumber,
          receipt_no: kraData.rcptNo?.toString() || null,
          cu_serial_number: kraData.sdcId || null,
          cu_invoice_no: kraData.rcptNo ? `${kraData.sdcId || ''}/${kraData.rcptNo}` : null,
          intrl_data: kraData.intrlData || null,
          branch_name: branchData.name || null,
          branch_address: branchData.address || null,
          branch_phone: branchData.phone || null,
          branch_pin: branchData.kra_pin || null,
          item_code: itemCode,
        }
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Mobile Create Sale API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to create sale" }, { status: 500 })
  }
}
