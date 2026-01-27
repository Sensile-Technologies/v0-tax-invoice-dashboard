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

    // fuel_type is optional when nozzle_id is provided (item_id is derived from nozzle → tank → item)
    if (!branch_id || !total_amount) {
      console.log("[Mobile Create Sale] Missing required fields - branch_id:", branch_id, "total_amount:", total_amount)
      return NextResponse.json(
        { error: `Missing required fields: branch_id=${branch_id}, total_amount=${total_amount}` },
        { status: 400 }
      )
    }
    
    // If no nozzle_id, fuel_type is required for backward compatibility
    if (!nozzle_id && !fuel_type) {
      console.log("[Mobile Create Sale] Missing fuel_type when no nozzle_id provided")
      return NextResponse.json(
        { error: `Either nozzle_id or fuel_type is required` },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    // Derive item_id from nozzle → tank → item relationship (single source of truth)
    let derivedItemId: string | null = null
    let derivedFuelType: string = fuel_type || ''
    let derivedTankId: string | null = null
    let nozzleInfo: any = null
    
    // Validate nozzle has a tank assigned before allowing sale
    if (nozzle_id) {
      const nozzleTankCheck = await client.query(
        `SELECT n.id, n.tank_id, n.nozzle_number, n.item_id as nozzle_item_id,
                d.dispenser_number,
                t.id as tank_id, t.item_id as tank_item_id, t.tank_name,
                i.id as item_id, i.item_name, i.item_code, COALESCE(t.kra_item_cd, i.item_code) as kra_item_cd
         FROM nozzles n 
         JOIN dispensers d ON n.dispenser_id = d.id
         LEFT JOIN tanks t ON n.tank_id = t.id
         LEFT JOIN items i ON t.item_id = i.id
         WHERE n.id = $1`,
        [nozzle_id]
      )
      
      if (nozzleTankCheck.rows.length === 0) {
        client.release()
        return NextResponse.json(
          { error: "Nozzle not found" },
          { status: 400 }
        )
      }
      
      nozzleInfo = nozzleTankCheck.rows[0]
      if (!nozzleInfo.tank_id) {
        client.release()
        console.log(`[Mobile Create Sale] Blocked sale - Nozzle D${nozzleInfo.dispenser_number}N${nozzleInfo.nozzle_number} has no tank assigned`)
        return NextResponse.json(
          { error: `Cannot sell from nozzle D${nozzleInfo.dispenser_number}N${nozzleInfo.nozzle_number} - no tank assigned. Please assign a tank in Manage Nozzles.` },
          { status: 400 }
        )
      }
      
      // Derive item_id from nozzle → tank → item chain
      derivedItemId = nozzleInfo.item_id || nozzleInfo.tank_item_id || nozzleInfo.nozzle_item_id
      derivedFuelType = nozzleInfo.item_name || fuel_type || ''
      derivedTankId = nozzleInfo.tank_id
      
      if (!derivedItemId) {
        client.release()
        console.log(`[Mobile Create Sale] Blocked sale - Tank ${nozzleInfo.tank_name} has no item assigned`)
        return NextResponse.json(
          { error: `Tank "${nozzleInfo.tank_name}" is not mapped to a product. Please assign an item to the tank.` },
          { status: 400 }
        )
      }
      
      console.log(`[Mobile Create Sale] Derived item_id: ${derivedItemId}, fuel_type: ${derivedFuelType} from nozzle ${nozzle_id}`)
    } else if (fuel_type) {
      // No nozzle_id provided - look up item_id from fuel_type for backward compatibility
      const itemLookup = await client.query(
        `SELECT i.id as item_id, i.item_name, i.item_code,
                t.id as tank_id, t.tank_name, COALESCE(t.kra_item_cd, i.item_code) as kra_item_cd
         FROM items i
         LEFT JOIN tanks t ON t.item_id = i.id AND t.branch_id = $1 AND t.status = 'active'
         WHERE UPPER(i.item_name) = UPPER($2)
         ORDER BY t.current_stock DESC NULLS LAST
         LIMIT 1`,
        [branch_id, fuel_type]
      )
      
      if (itemLookup.rows.length > 0) {
        const item = itemLookup.rows[0]
        derivedItemId = item.item_id
        derivedFuelType = item.item_name
        derivedTankId = item.tank_id || null
        nozzleInfo = {
          item_id: item.item_id,
          item_name: item.item_name,
          item_code: item.item_code,
          kra_item_cd: item.kra_item_cd,
          tank_id: item.tank_id,
          tank_name: item.tank_name
        }
        console.log(`[Mobile Create Sale] Derived item_id: ${derivedItemId} from fuel_type: ${fuel_type}`)
      } else {
        client.release()
        console.log(`[Mobile Create Sale] Item not found for fuel_type: ${fuel_type}`)
        return NextResponse.json(
          { error: `Product "${fuel_type}" not found. Please check the product name.` },
          { status: 400 }
        )
      }
    }
    
    try {
      // Duplicate check uses item_id when available, falls back to fuel_type for backward compatibility
      const duplicateCheck = await client.query(
        `SELECT id, invoice_number, kra_status, kra_cu_inv, kra_rcpt_sign, kra_internal_data,
                customer_name, customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin
         FROM sales 
         WHERE branch_id = $1 
           AND (item_id = $2 OR ($2 IS NULL AND fuel_type = $3))
           AND total_amount = $4 
           AND created_at > NOW() - INTERVAL '60 seconds'
           AND kra_status = 'success'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [branch_id, derivedItemId, fuel_type, total_amount]
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

      // Use derivedTankId from nozzle if available, otherwise skip tank check
      // Tank info was already validated in nozzle check above
      const tankInfo = nozzleInfo ? {
        id: derivedTankId,
        tank_name: nozzleInfo.tank_name,
        kra_item_cd: nozzleInfo.kra_item_cd,
        item_name: nozzleInfo.item_name,
        item_code: nozzleInfo.item_code
      } : null

      if (tankInfo && !tankInfo.kra_item_cd && !tankInfo.item_code) {
        return NextResponse.json(
          { error: `Tank "${tankInfo.tank_name}" is not mapped to an item. Please map the tank to an item in the item list before selling.` },
          { status: 400 }
        )
      }

      // Get item price from branch_items using item_id (single source of truth)
      const itemPriceResult = await client.query(
        `SELECT bi.sale_price 
         FROM branch_items bi
         WHERE bi.branch_id = $1
           AND bi.item_id = $2
           AND bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
         LIMIT 1`,
        [branch_id, derivedItemId]
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

      // Get current meter reading from previous shift's closing reading (not from initial_meter_reading)
      // The meter_reading_after is calculated based on the last known reading + quantity
      let meterReadingAfter = null
      if (nozzle_id && correctQuantity > 0) {
        // Get the latest meter reading from sales or shift_readings
        const lastReadingResult = await client.query(
          `SELECT COALESCE(
            (SELECT meter_reading_after FROM sales 
             WHERE nozzle_id = $1 AND meter_reading_after IS NOT NULL 
             ORDER BY created_at DESC LIMIT 1),
            (SELECT sr.closing_reading FROM shift_readings sr 
             JOIN shifts s ON sr.shift_id = s.id 
             WHERE sr.nozzle_id = $1 AND s.status = 'completed' 
             ORDER BY s.end_time DESC NULLS LAST LIMIT 1),
            (SELECT initial_meter_reading FROM nozzles WHERE id = $1),
            0
          ) as last_reading`,
          [nozzle_id]
        )
        
        const currentReading = parseFloat(lastReadingResult.rows[0]?.last_reading) || 0
        meterReadingAfter = currentReading + correctQuantity
        // Note: We don't update nozzle's initial_meter_reading - it stays static
      }

      const saleResult = await client.query(
        `INSERT INTO sales (
          branch_id, nozzle_id, item_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date,
          customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin,
          meter_reading_after, shift_id, staff_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
        [
          branch_id,
          nozzle_id || null,
          derivedItemId,
          derivedFuelType,
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

      if (derivedTankId && correctQuantity > 0) {
        await client.query(
          `UPDATE tanks SET current_stock = GREATEST(0, current_stock - $1), updated_at = NOW() WHERE id = $2`,
          [correctQuantity, derivedTankId]
        )
        console.log(`[Mobile Create Sale] Reduced tank ${derivedTankId} stock by ${correctQuantity} liters`)
      }

      // Create loyalty_transaction record for loyalty sales
      if (is_loyalty_customer) {
        const loyaltyCustomerName = loyalty_customer_name || customer_name || 'Walk-in Customer'
        const loyaltyCustomerPin = loyalty_customer_pin || kra_pin || ''
        
        // Fetch branch earning rules for points calculation
        const earningRulesResult = await client.query(
          `SELECT loyalty_earn_type, loyalty_points_per_litre, loyalty_points_per_amount, loyalty_amount_threshold
           FROM branches WHERE id = $1`,
          [branch_id]
        )
        const earningRules = earningRulesResult.rows[0] || {}
        // Use nullish coalescing BEFORE Number() - Number(null) returns NaN, not null!
        const earnType = earningRules.loyalty_earn_type ?? 'per_amount'
        const pointsPerLitre = Number(earningRules.loyalty_points_per_litre ?? 1)
        const pointsPerAmount = Number(earningRules.loyalty_points_per_amount ?? 1)
        // Threshold must be at least 1 to prevent division by zero
        const amountThreshold = Math.max(1, Number(earningRules.loyalty_amount_threshold ?? 100))
        
        // Calculate points based on earning type
        let pointsEarned: number
        if (earnType === 'per_litre') {
          // Points per litre of fuel purchased
          pointsEarned = Math.floor(correctQuantity * pointsPerLitre)
        } else {
          // Points per amount spent (default) - safe division with threshold >= 1
          pointsEarned = Math.floor(total_amount / amountThreshold) * pointsPerAmount
        }
        
        await client.query(
          `INSERT INTO loyalty_transactions 
           (branch_id, sale_id, customer_name, customer_pin, transaction_date, transaction_amount, points_earned, payment_method, fuel_type, quantity, item_id)
           VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10)`,
          [
            branch_id,
            sale.id,
            loyaltyCustomerName,
            loyaltyCustomerPin,
            total_amount,
            pointsEarned,
            payment_method || 'cash',
            derivedFuelType,
            correctQuantity,
            derivedItemId
          ]
        )
        console.log(`[Mobile Create Sale] Created loyalty_transaction for sale ${sale.id}, points: ${pointsEarned}`)
      }

      await client.query('COMMIT')

      const branchResult = await client.query(
        `SELECT name, address, phone, kra_pin, bhf_id, server_address FROM branches WHERE id = $1`,
        [branch_id]
      )
      const branchData = branchResult.rows[0] || {}

      // Get item code from nozzle info (already retrieved from nozzle → tank → item chain)
      const itemCode = nozzleInfo?.item_code || nozzleInfo?.kra_item_cd || null

      // Check if branch has KRA configured (server_address must be set)
      const kraConfigured = !!(branchData.server_address && branchData.server_address.trim())
      
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
      
      // If KRA is not configured for this branch, skip KRA transmission
      if (!kraConfigured) {
        console.log("[Mobile Create Sale] Branch has no KRA server configured, skipping KRA transmission")
        
        await client.query(
          `UPDATE sales SET 
            kra_status = 'not_required',
            customer_pin = COALESCE(customer_pin, $2::text),
            loyalty_customer_pin = CASE WHEN is_loyalty_sale THEN COALESCE(loyalty_customer_pin, $2::text) ELSE loyalty_customer_pin END,
            updated_at = NOW()
          WHERE id = $1`,
          [sale.id, effectiveCustomerPin || null]
        )

        return NextResponse.json({
          success: true,
          sale_id: sale.id,
          sale: { ...sale, kra_status: 'not_required' },
          invoice_number: invoiceNumber,
          receipt_number: receiptNumber,
          kra_response: null,
          kra_success: false,
          kra_not_configured: true,
          print_data: {
            invoice_number: invoiceNumber,
            receipt_no: receiptNumber,
            cu_serial_number: null,
            cu_invoice_no: null,
            intrl_data: null,
            branch_name: branchData.name || null,
            branch_address: branchData.address || null,
            branch_phone: branchData.phone || null,
            branch_pin: branchData.kra_pin || null,
            item_code: itemCode,
            receipt_signature: null,
            bhf_id: branchData.bhf_id || null,
            customer_name: effectiveCustomerName,
            customer_pin: effectiveCustomerPin || null,
            is_loyalty_customer: is_loyalty_customer || false,
          }
        })
      }
      
      console.log("[Mobile Create Sale] Sale created successfully, calling KRA endpoint...")
      console.log(`[Mobile Create Sale] is_loyalty_customer: ${is_loyalty_customer}, customer_pin for KRA: ${effectiveCustomerPin}`)
      
      const kraResult = await callKraSaveSales({
        branch_id,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
        fuel_type: derivedFuelType,
        quantity: correctQuantity,
        unit_price: correctUnitPrice,
        total_amount,
        payment_method: payment_method || 'cash',
        customer_name: effectiveCustomerName,
        customer_pin: effectiveCustomerPin,
        sale_date: new Date().toISOString(),
        tank_id: derivedTankId || undefined
      })

      console.log("[Mobile Create Sale] KRA API Response:", JSON.stringify(kraResult, null, 2))

      const kraData = kraResult.kraResponse?.data || {}
      const kraStatus = kraResult.success ? 'success' : 'failed'
      // CU invoice number is formatted as sdcId/invcNo (e.g., KRACU0300003796/253)
      // IMPORTANT: Use our internal invoice number (kraResult.invcNo), NOT KRA's rcptNo
      // The QR code verification on KRA's portal shows our internal invoice number, not their rcptNo
      const cuInvNo = (kraData.sdcId && kraResult.invcNo) ? `${kraData.sdcId}/${kraResult.invcNo}` : null
      
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
          cuInvNo,
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
          invoice_number: cuInvNo || invoiceNumber,
          receipt_no: kraResult.invcNo?.toString() || null,
          cu_serial_number: kraData.sdcId || null,
          cu_invoice_no: cuInvNo,
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
