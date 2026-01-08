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
      loyalty_customer_name,
      loyalty_customer_pin,
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
      const duplicateCheck = await client.query(
        `SELECT id, invoice_number, kra_status, kra_cu_inv, kra_rcpt_sign, kra_internal_data,
                customer_name, customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin
         FROM sales 
         WHERE branch_id = $1 
           AND fuel_type = $2 
           AND total_amount = $3 
           AND created_at > NOW() - INTERVAL '60 seconds'
           AND kra_status = 'success'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [branch_id, fuel_type, total_amount]
      )

      if (duplicateCheck.rows.length > 0) {
        const existingSale = duplicateCheck.rows[0]
        console.log("[Mobile Create Sale] Duplicate sale detected, returning existing:", existingSale.id)
        
        const branchResult = await client.query(
          `SELECT name, address, phone, kra_pin, bhf_id FROM branches WHERE id = $1`,
          [branch_id]
        )
        const branchData = branchResult.rows[0] || {}
        
        // Get customer info from the existing sale
        const dupCustomerName = existingSale.is_loyalty_sale 
          ? (existingSale.loyalty_customer_name || existingSale.customer_name)
          : existingSale.customer_name
        const dupCustomerPin = existingSale.is_loyalty_sale
          ? (existingSale.loyalty_customer_pin || existingSale.customer_pin)
          : existingSale.customer_pin
        
        return NextResponse.json({
          success: true,
          sale_id: existingSale.id,
          duplicate: true,
          message: "Sale already submitted to KRA within the last 60 seconds",
          invoice_number: existingSale.invoice_number,
          kra_success: true,
          print_data: {
            invoice_number: existingSale.kra_cu_inv || existingSale.invoice_number,
            receipt_no: existingSale.kra_cu_inv?.split('/')[1] || null,
            cu_serial_number: existingSale.kra_cu_inv?.split('/')[0] || null,
            cu_invoice_no: existingSale.kra_cu_inv || null,
            intrl_data: existingSale.kra_internal_data || null,
            branch_name: branchData.name || null,
            branch_address: branchData.address || null,
            branch_phone: branchData.phone || null,
            branch_pin: branchData.kra_pin || null,
            receipt_signature: existingSale.kra_rcpt_sign || null,
            bhf_id: branchData.bhf_id || '03',
            customer_name: dupCustomerName || null,
            customer_pin: dupCustomerPin || null,
            is_loyalty_customer: existingSale.is_loyalty_sale || false,
          }
        })
      }

      const tankCheck = await client.query(
        `SELECT t.id, t.tank_name, COALESCE(t.kra_item_cd, i.item_code) as kra_item_cd, i.item_name, i.item_code 
         FROM tanks t
         JOIN items i ON t.item_id = i.id
         WHERE t.branch_id = $1 AND UPPER(i.item_name) = UPPER($2) AND t.status = 'active' 
         ORDER BY t.current_stock DESC LIMIT 1`,
        [branch_id, fuel_type]
      )

      if (tankCheck.rows.length > 0 && !tankCheck.rows[0].kra_item_cd && !tankCheck.rows[0].item_code) {
        return NextResponse.json(
          { error: `Tank "${tankCheck.rows[0].tank_name}" is not mapped to an item. Please map the tank to an item in the item list before selling.` },
          { status: 400 }
        )
      }

      // Get item price from branch_items (single source of truth)
      const itemPriceResult = await client.query(
        `SELECT bi.sale_price 
         FROM items i
         JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
         WHERE bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND (UPPER(i.item_name) = UPPER($2) OR i.item_name ILIKE $3)
         ORDER BY bi.updated_at DESC NULLS LAST LIMIT 1`,
        [branch_id, fuel_type, `%${fuel_type}%`]
      )

      const correctUnitPrice = itemPriceResult.rows.length > 0 
        ? parseFloat(itemPriceResult.rows[0].sale_price) 
        : unit_price
      
      const correctQuantity = total_amount / correctUnitPrice
      
      console.log(`[Mobile Create Sale] Price from items table: ${correctUnitPrice}, Calculated quantity: ${correctQuantity}`)

      const shiftResult = await client.query(
        `SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
        [branch_id]
      )
      const shiftId = shiftResult.rows[0]?.id || null

      let staffId = null
      if (user_id) {
        const staffResult = await client.query(
          `SELECT id FROM staff WHERE user_id = $1 AND branch_id = $2 LIMIT 1`,
          [user_id, branch_id]
        )
        staffId = staffResult.rows[0]?.id || null
      }

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
          meter_reading_after, shift_id, staff_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14, $15, $16, $17, $18)
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
          loyalty_customer_name || (is_loyalty_customer ? customer_name : null),
          loyalty_customer_pin || (is_loyalty_customer ? kra_pin : null),
          meterReadingAfter,
          shiftId,
          staffId,
        ]
      )

      const sale = saleResult.rows[0]

      if (is_loyalty_customer && customer_name && customer_name !== 'Walk-in Customer') {
        const existingCustomer = await client.query(
          `SELECT id FROM customers WHERE cust_nm = $1 AND branch_id = $2`,
          [customer_name, branch_id]
        )

        if (existingCustomer.rows.length === 0) {
          // Get branch info for tin and bhf_id (required NOT NULL columns)
          const branchForCustomer = await client.query(
            `SELECT kra_pin, bhf_id FROM branches WHERE id = $1`,
            [branch_id]
          )
          const branchTin = branchForCustomer.rows[0]?.kra_pin || ''
          const branchBhfId = branchForCustomer.rows[0]?.bhf_id || '00'
          
          const custNo = `CUST-${Date.now().toString(36).toUpperCase()}`
          await client.query(
            `INSERT INTO customers (branch_id, tin, bhf_id, cust_nm, cust_tin, cust_no, use_yn)
             VALUES ($1, $2, $3, $4, $5, $6, 'Y')
             ON CONFLICT DO NOTHING`,
            [branch_id, branchTin, branchBhfId, customer_name, kra_pin || '', custNo]
          )
        }
      }

      if (tankCheck.rows.length > 0 && correctQuantity > 0) {
        const tankId = tankCheck.rows[0].id
        await client.query(
          `UPDATE tanks SET current_stock = GREATEST(0, current_stock - $1), updated_at = NOW() WHERE id = $2`,
          [correctQuantity, tankId]
        )
        console.log(`[Mobile Create Sale] Reduced tank ${tankId} stock by ${correctQuantity} liters`)
      }

      await client.query('COMMIT')

      const branchResult = await client.query(
        `SELECT name, address, phone, kra_pin, bhf_id FROM branches WHERE id = $1`,
        [branch_id]
      )
      const branchData = branchResult.rows[0] || {}

      // Get item code from branch_items (for HQ-assigned items) or legacy items table
      const itemResult = await client.query(
        `SELECT i.item_code FROM items i
         LEFT JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
         WHERE (i.branch_id = $1 OR (i.branch_id IS NULL AND bi.branch_id = $1))
         AND i.item_name ILIKE $2 LIMIT 1`,
        [branch_id, `%${fuel_type}%`]
      )
      const itemCode = itemResult.rows[0]?.item_code || null

      console.log("[Mobile Create Sale] Sale created successfully, calling KRA endpoint...")
      
      // For loyalty customers, look up their KRA PIN from the customers table if not provided
      // Priority: kra_pin (from request) -> loyalty_customer_pin (explicit field) -> DB lookup
      let effectiveCustomerPin = kra_pin || loyalty_customer_pin || ''
      let effectiveCustomerName = loyalty_customer_name || customer_name || 'Walk-in Customer'
      
      if (is_loyalty_customer && !effectiveCustomerPin && (loyalty_customer_name || customer_name)) {
        const lookupName = loyalty_customer_name || customer_name
        const loyaltyCustomerLookup = await client.query(
          `SELECT c.cust_tin, c.cust_nm FROM customers c
           INNER JOIN customer_branches cb ON c.id = cb.customer_id
           WHERE cb.branch_id = $1 AND cb.status = 'active' AND c.cust_nm = $2
           LIMIT 1`,
          [branch_id, lookupName]
        )
        if (loyaltyCustomerLookup.rows.length > 0) {
          effectiveCustomerPin = loyaltyCustomerLookup.rows[0].cust_tin || ''
          effectiveCustomerName = loyaltyCustomerLookup.rows[0].cust_nm || customer_name
          console.log(`[Mobile Create Sale] Found loyalty customer PIN from DB: ${effectiveCustomerPin}`)
        }
      }
      
      console.log(`[Mobile Create Sale] is_loyalty_customer: ${is_loyalty_customer}, customer_pin for KRA: ${effectiveCustomerPin}`)
      
      const kraResult = await callKraSaveSales({
        branch_id,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
        fuel_type,
        quantity: correctQuantity,
        unit_price: correctUnitPrice,
        total_amount,
        payment_method: payment_method || 'cash',
        customer_name: effectiveCustomerName,
        customer_pin: effectiveCustomerPin,
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
          customer_pin = COALESCE(customer_pin, $7::text),
          loyalty_customer_pin = CASE WHEN is_loyalty_sale THEN COALESCE(loyalty_customer_pin, $7::text) ELSE loyalty_customer_pin END,
          updated_at = NOW()
        WHERE id = $6`,
        [
          kraStatus,
          kraData.rcptSign || null,
          kraData.sdcId || null,
          kraData.rcptNo ? `${kraData.sdcId || ''}/${kraData.rcptNo}` : null,
          kraData.intrlData || null,
          sale.id,
          effectiveCustomerPin || null
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
          receipt_signature: kraData.rcptSign || null,
          bhf_id: branchData.bhf_id || '03',
          customer_name: effectiveCustomerName,
          customer_pin: effectiveCustomerPin || null,
          is_loyalty_customer: is_loyalty_customer || false,
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
