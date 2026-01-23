import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { logApiCall } from "@/lib/api-logger"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

const PAYMENT_TYPE_CODES: Record<string, string> = {
  'cash': '01',
  'credit': '02', 
  'mobile_money': '03',
  'mpesa': '03',
  'bank_transfer': '04',
  'card': '05',
  'cheque': '06',
  'other': '07'
}

function formatKraDateTime(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

function formatKraDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function toFixed2(num: number): string {
  return (Math.round(num * 100) / 100).toFixed(2)
}

function calculateTax(amount: number, taxType: string = "B"): { taxblAmt: number, taxAmt: number, taxRt: number } {
  if (taxType === "A") {
    const taxRt = 16
    const taxblAmt = amount / (1 + taxRt / 100)
    const taxAmt = amount - taxblAmt
    return { taxblAmt: Math.round(taxblAmt * 100) / 100, taxAmt: Math.round(taxAmt * 100) / 100, taxRt }
  } else if (taxType === "B") {
    const taxRt = 16
    return { taxblAmt: amount, taxAmt: Math.round(amount * 0.16 * 100) / 100, taxRt }
  } else if (taxType === "C") {
    const taxRt = 8
    return { taxblAmt: amount, taxAmt: Math.round(amount * 0.08 * 100) / 100, taxRt }
  }
  return { taxblAmt: amount, taxAmt: 0, taxRt: 0 }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branch_id,
      amount,
      nozzle_id,
      fuel_type,
      customer_pin,
      payment_method,
      discount_type,
      discount_value,
      is_loyalty_sale,
      loyalty_customer_name
    } = body

    if (!branch_id || !amount || !nozzle_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const branchResult = await query(`
      SELECT id, bhf_id, kra_pin, device_token, server_address, server_port, 
             COALESCE(invoice_number, 0) as invoice_number,
             COALESCE(sr_number, 0) as sr_number,
             loyalty_earn_type, loyalty_points_per_litre, loyalty_points_per_amount, loyalty_amount_threshold
      FROM branches
      WHERE id = $1
    `, [branch_id])

    if (branchResult.length === 0) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
    }

    const branch = branchResult[0]
    
    if (!branch.kra_pin) {
      return NextResponse.json({ success: false, error: "KRA PIN not configured for this branch" }, { status: 400 })
    }

    // Step 1: Get basic nozzle info
    const nozzleResult = await query(`
      SELECT n.id, i.item_name as fuel_type, n.item_id,
             COALESCE(n.initial_meter_reading, 0) as initial_meter_reading,
             i.item_code, i.class_code, i.item_name, i.package_unit, i.quantity_unit, i.tax_type
      FROM nozzles n
      JOIN items i ON n.item_id = i.id
      WHERE n.id = $1
    `, [nozzle_id])

    if (nozzleResult.length === 0) {
      return NextResponse.json({ success: false, error: "Nozzle not found" }, { status: 404 })
    }

    let nozzle = nozzleResult[0]
    let unitPrice = 0

    // Step 2: Get price STRICTLY from branch_items - this is the authoritative source
    // First try by nozzle's item_id if it exists
    if (nozzle.item_id) {
      const branchPriceResult = await query(`
        SELECT bi.sale_price
        FROM branch_items bi
        WHERE bi.branch_id = $1 AND bi.item_id = $2 AND bi.is_available = true
      `, [branch_id, nozzle.item_id])
      
      if (branchPriceResult.length > 0 && branchPriceResult[0].sale_price) {
        unitPrice = parseFloat(branchPriceResult[0].sale_price)
      }
    }

    // Step 3: If no price found yet, try to find by fuel type name in branch_items
    if (unitPrice <= 0 && nozzle.fuel_type) {
      const priceByFuelTypeResult = await query(`
        SELECT bi.sale_price, i.id as item_id, i.item_code, i.class_code, i.item_name,
               i.package_unit, i.quantity_unit, i.tax_type
        FROM branch_items bi
        JOIN items i ON bi.item_id = i.id
        WHERE bi.branch_id = $1
          AND bi.is_available = true
          AND (
            UPPER(i.item_name) = UPPER($2) 
            OR i.item_name ILIKE $3
            OR (UPPER($2) = 'PETROL' AND (UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%'))
            OR (UPPER($2) = 'DIESEL' AND UPPER(i.item_name) LIKE '%DIESEL%')
            OR (UPPER($2) = 'KEROSENE' AND UPPER(i.item_name) LIKE '%KEROSENE%')
          )
        ORDER BY bi.updated_at DESC NULLS LAST
        LIMIT 1
      `, [branch_id, nozzle.fuel_type, `%${nozzle.fuel_type}%`])
      
      if (priceByFuelTypeResult.length > 0 && priceByFuelTypeResult[0].sale_price) {
        const foundItem = priceByFuelTypeResult[0]
        unitPrice = parseFloat(foundItem.sale_price)
        // Update nozzle with item details if we found a match
        if (!nozzle.item_id) {
          nozzle = {
            ...nozzle,
            item_id: foundItem.item_id,
            item_code: foundItem.item_code,
            class_code: foundItem.class_code,
            item_name: foundItem.item_name,
            package_unit: foundItem.package_unit,
            quantity_unit: foundItem.quantity_unit,
            tax_type: foundItem.tax_type
          }
        }
      }
    }

    if (!nozzle.item_id) {
      return NextResponse.json({ success: false, error: `Nozzle "${nozzle.fuel_type}" is not mapped to an item. Please assign an item to this nozzle first.` }, { status: 400 })
    }

    if (unitPrice <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No branch-specific price found for "${nozzle.fuel_type}". Please go to Inventory Management and set a price for this item in branch_items.` 
      }, { status: 400 })
    }

    let discountAmount = 0
    if (discount_value && discount_value > 0) {
      if (discount_type === "percentage") {
        discountAmount = (amount * Math.min(discount_value, 100)) / 100
      } else {
        discountAmount = Math.min(discount_value, amount)
      }
    }

    const totalAmount = Math.max(amount - discountAmount, 0)
    const quantity = totalAmount / unitPrice
    
    // Get current meter reading from latest sale or previous shift's closing reading
    const lastReadingResult = await query(
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
    const currentMeterReading = parseFloat(lastReadingResult[0]?.last_reading) || 0
    const meterReadingAfter = currentMeterReading + quantity
    
    const kraBaseUrl = buildKraBaseUrl(branch.server_address, branch.server_port)
    const responses: any = {
      saveSales: null,
      saveStockItems: null,
      saveStockMaster: null
    }

    const newInvoiceNo = branch.invoice_number + 1
    await query(`UPDATE branches SET invoice_number = $1 WHERE id = $2`, [newInvoiceNo, branch_id])
    const trdInvcNo = `CIV-${String(newInvoiceNo).padStart(6, '0')}`

    const now = new Date()
    const cfmDt = formatKraDateTime(now)
    const salesDt = formatKraDate(now)
    const pmtTyCd = PAYMENT_TYPE_CODES[payment_method?.toLowerCase()] || "01"

    const itemCd = nozzle.item_code || "ITEM001"
    const itemClsCd = nozzle.class_code || "15100000"
    const itemNm = nozzle.item_name || fuel_type || "Fuel"
    const pkgUnitCd = nozzle.package_unit || "NT"
    const qtyUnitCd = nozzle.quantity_unit || "LTR"
    const taxTyCd = nozzle.tax_type || "B"
    
    const { taxblAmt, taxAmt, taxRt } = calculateTax(totalAmount, taxTyCd)

    const saveSalesPayload = {
      tin: branch.kra_pin,
      bhfId: branch.bhf_id || "00",
      trdInvcNo: trdInvcNo,
      invcNo: String(newInvoiceNo),
      orgInvcNo: 0,
      custTin: customer_pin || null,
      custNm: is_loyalty_sale ? loyalty_customer_name : "Walk-in Customer",
      salesTyCd: "N",
      rcptTyCd: "S",
      pmtTyCd: pmtTyCd,
      salesSttsCd: "02",
      cfmDt: cfmDt,
      salesDt: salesDt,
      stockRlsDt: cfmDt,
      cnclReqDt: null,
      cnclDt: null,
      rfdDt: null,
      rfdRsnCd: null,
      totItemCnt: 1,
      taxblAmtA: taxTyCd === "A" ? toFixed2(taxblAmt) : "0.00",
      taxblAmtB: taxTyCd === "B" ? toFixed2(taxblAmt) : "0.00",
      taxblAmtC: taxTyCd === "C" ? toFixed2(taxblAmt) : "0.00",
      taxblAmtD: "0.00",
      taxblAmtE: "0.00",
      taxRtA: taxTyCd === "A" ? toFixed2(taxRt) : "0.00",
      taxRtB: taxTyCd === "B" ? toFixed2(taxRt) : "0.00",
      taxRtC: taxTyCd === "C" ? toFixed2(taxRt) : "0.00",
      taxRtD: "0.00",
      taxRtE: "0.00",
      taxAmtA: taxTyCd === "A" ? toFixed2(taxAmt) : "0.00",
      taxAmtB: taxTyCd === "B" ? toFixed2(taxAmt) : "0.00",
      taxAmtC: taxTyCd === "C" ? toFixed2(taxAmt) : "0.00",
      taxAmtD: "0.00",
      taxAmtE: "0.00",
      totTaxblAmt: toFixed2(taxblAmt),
      totTaxAmt: toFixed2(taxAmt),
      totAmt: toFixed2(totalAmount),
      prchrAcptcYn: "N",
      remark: null,
      regrNm: "Admin",
      regrId: "Admin",
      modrNm: "Admin",
      modrId: "Admin",
      receipt: {
        custTin: customer_pin || null,
        custMblNo: null,
        rcptPbctDt: null,
        trdeNm: null,
        adrs: null,
        topMsg: null,
        btmMsg: null,
        prchrAcptcYn: "Y"
      },
      itemList: [
        {
          itemSeq: 1,
          itemCd: itemCd,
          itemClsCd: itemClsCd,
          itemNm: itemNm,
          bcd: null,
          pkgUnitCd: pkgUnitCd,
          pkg: 1,
          qtyUnitCd: qtyUnitCd,
          qty: parseFloat(quantity.toFixed(2)),
          prc: unitPrice,
          splyAmt: toFixed2(totalAmount),
          dcRt: discountAmount > 0 ? parseFloat(((discountAmount / amount) * 100).toFixed(2)) : 0.0,
          dcAmt: discountAmount,
          isrccCd: null,
          isrccNm: null,
          isrcRt: 0,
          isrcAmt: 0,
          taxTyCd: taxTyCd,
          taxblAmt: toFixed2(taxblAmt),
          taxAmt: toFixed2(taxAmt),
          totAmt: toFixed2(totalAmount)
        }
      ]
    }

    let startTime = Date.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(`${kraBaseUrl}/trnsSales/saveSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(branch.device_token ? { "DeviceSerialNo": branch.device_token } : {})
        },
        body: JSON.stringify(saveSalesPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      responses.saveSales = await response.json()
      
      await logApiCall({
        endpoint: "/trnsSales/saveSales",
        method: "POST",
        payload: saveSalesPayload,
        response: responses.saveSales,
        statusCode: response.status,
        durationMs: Date.now() - startTime,
        branchId: branch_id,
        externalEndpoint: `${kraBaseUrl}/trnsSales/saveSales`
      })
    } catch (err: any) {
      responses.saveSales = {
        resultCd: err.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
        resultMsg: err.message || "Failed to connect to KRA",
        resultDt: new Date().toISOString()
      }
      await logApiCall({
        endpoint: "/trnsSales/saveSales",
        method: "POST",
        payload: saveSalesPayload,
        response: responses.saveSales,
        statusCode: 0,
        durationMs: Date.now() - startTime,
        branchId: branch_id,
        error: err.message,
        externalEndpoint: `${kraBaseUrl}/trnsSales/saveSales`
      })
    }

    const saveSalesSuccess = responses.saveSales?.resultCd === "000" || responses.saveSales?.resultCd === "0"
    
    if (!saveSalesSuccess) {
      return NextResponse.json({
        success: false,
        invoiceNumber: trdInvcNo,
        error: responses.saveSales?.resultMsg || "Failed to save sales to KRA",
        responses: {
          saveSales: responses.saveSales,
          saveStockItems: null,
          saveStockMaster: null
        },
        summary: {
          saveSales: responses.saveSales?.resultMsg || "Failed",
          saveStockItems: "Skipped - saveSales failed",
          saveStockMaster: "Skipped - saveSales failed"
        }
      })
    }

    const newSarNo = branch.sr_number + 1
    await query(`UPDATE branches SET sr_number = $1 WHERE id = $2`, [newSarNo, branch_id])

    const activeShiftResult = await query(`
      SELECT id FROM shifts 
      WHERE branch_id = $1 AND status = 'active' 
      ORDER BY start_time DESC LIMIT 1
    `, [branch_id])
    const activeShiftId = activeShiftResult.length > 0 ? activeShiftResult[0].id : null

    const kraData = responses.saveSales?.data || {}
    // CU invoice number is formatted as sdcId/rcptNo (e.g., KRACU0300003796/378)
    const cuInvNo = (kraData.sdcId && kraData.rcptNo) ? `${kraData.sdcId}/${kraData.rcptNo}` : null
    const saleResult = await query(
      `INSERT INTO sales (
        branch_id, shift_id, nozzle_id, fuel_type, quantity, unit_price, 
        total_amount, payment_method, customer_name, customer_pin,
        invoice_number, transmission_status, meter_reading_after,
        is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin, 
        sale_date, created_at,
        kra_status, kra_rcpt_sign, kra_scu_id, kra_cu_inv, kra_internal_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW(), $17, $18, $19, $20, $21)
      RETURNING id`,
      [
        branch_id,
        activeShiftId,
        nozzle_id,
        fuel_type || nozzle.fuel_type,
        quantity,
        unitPrice,
        totalAmount,
        payment_method || 'cash',
        is_loyalty_sale ? loyalty_customer_name : 'Walk-in Customer',
        customer_pin || null,
        trdInvcNo,
        'transmitted',
        meterReadingAfter,
        is_loyalty_sale || false,
        is_loyalty_sale ? loyalty_customer_name : null,
        is_loyalty_sale ? customer_pin : null,
        'success',
        kraData.rcptSign || null,
        kraData.sdcId || null,
        cuInvNo,
        kraData.intrlData || null
      ]
    )
    const saleId = saleResult[0]?.id
    
    // Create loyalty transaction if this is a loyalty sale
    if (is_loyalty_sale && loyalty_customer_name && saleId) {
      try {
        const earnType = branch.loyalty_earn_type || 'per_amount'
        const pointsPerLitre = Number(branch.loyalty_points_per_litre ?? 1)
        const pointsPerAmount = Number(branch.loyalty_points_per_amount ?? 1)
        const amountThreshold = Math.max(1, Number(branch.loyalty_amount_threshold ?? 100))
        
        let points_earned: number
        if (earnType === 'per_litre') {
          points_earned = Math.floor((quantity || 0) * pointsPerLitre)
        } else {
          points_earned = Math.floor(totalAmount / amountThreshold) * pointsPerAmount
        }
        
        await query(
          `INSERT INTO loyalty_transactions 
           (branch_id, sale_id, customer_name, customer_pin, transaction_date, transaction_amount, points_earned, payment_method, fuel_type, quantity, transaction_type)
           VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, 'earn')
           ON CONFLICT (sale_id) DO NOTHING`,
          [
            branch_id,
            saleId,
            loyalty_customer_name,
            customer_pin || '',
            totalAmount,
            points_earned,
            payment_method || 'cash',
            fuel_type || nozzle.fuel_type,
            quantity
          ]
        )
      } catch (loyaltyError) {
        console.error('Failed to create loyalty transaction:', loyaltyError)
      }
    }
    
    // Note: We don't update nozzle's initial_meter_reading here
    // The meter_reading_after is stored in the sales record
    // Opening readings come from previous shift's closing reading in shift_readings table

    // OPTIMIZATION: Run stock sync in background (fire-and-forget) for faster response
    // Stock sync is not critical for the invoice to be issued - it can happen async
    const syncStockInBackground = async () => {
      try {
        const splyAmt = Math.round(quantity * unitPrice * 100) / 100
        const stockTaxAmt = Math.round(splyAmt * 0.16 * 100) / 100

        const saveStockItemsPayload = {
          tin: branch.kra_pin,
          bhfId: branch.bhf_id || "00",
          sarNo: newSarNo,
          orgSarNo: 0,
          regTyCd: "M",
          custTin: null,
          custNm: null,
          custBhfId: null,
          sarTyCd: "11",
          ocrnDt: formatKraDate(),
          totItemCnt: 1,
          totTaxblAmt: toFixed2(splyAmt),
          totTaxAmt: toFixed2(stockTaxAmt),
          totAmt: toFixed2(splyAmt),
          remark: null,
          regrId: "Admin",
          regrNm: "Admin",
          modrNm: "Admin",
          modrId: "Admin",
          itemList: [
            {
              itemSeq: 1,
              itemCd: itemCd,
              itemClsCd: itemClsCd,
              itemNm: itemNm,
              bcd: null,
              pkgUnitCd: pkgUnitCd,
              pkg: Math.ceil(quantity),
              qtyUnitCd: qtyUnitCd,
              qty: parseFloat(quantity.toFixed(2)),
              itemExprDt: null,
              prc: unitPrice,
              splyAmt: toFixed2(splyAmt),
              totDcAmt: 0,
              taxblAmt: toFixed2(splyAmt),
              taxTyCd: taxTyCd,
              taxAmt: toFixed2(stockTaxAmt),
              totAmt: toFixed2(splyAmt)
            }
          ]
        }

        let syncStartTime = Date.now()
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)
          
          const response = await fetch(`${kraBaseUrl}/stock/saveStockItems`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(saveStockItemsPayload),
            signal: controller.signal
          })

          clearTimeout(timeoutId)
          const stockItemsResponse = await response.json()
          
          await logApiCall({
            endpoint: "/stock/saveStockItems",
            method: "POST",
            payload: saveStockItemsPayload,
            response: stockItemsResponse,
            statusCode: response.status,
            durationMs: Date.now() - syncStartTime,
            branchId: branch_id,
            externalEndpoint: `${kraBaseUrl}/stock/saveStockItems`
          })
        } catch (err: any) {
          await logApiCall({
            endpoint: "/stock/saveStockItems",
            method: "POST",
            payload: saveStockItemsPayload,
            response: { resultCd: err.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR", resultMsg: err.message },
            statusCode: 0,
            durationMs: Date.now() - syncStartTime,
            branchId: branch_id,
            error: err.message,
            externalEndpoint: `${kraBaseUrl}/stock/saveStockItems`
          })
        }

        const tankResult = await query(`
          SELECT t.current_stock FROM tanks t
          LEFT JOIN items i ON t.item_id = i.id
          WHERE t.branch_id = $1 AND (t.kra_item_cd = $2 OR UPPER(i.item_name) = UPPER($3))
          LIMIT 1
        `, [branch_id, itemCd, itemNm])
        
        const currentStock = tankResult.length > 0 ? parseFloat(tankResult[0].current_stock) || 0 : 0

        const saveStockMasterPayload = {
          tin: branch.kra_pin,
          bhfId: branch.bhf_id || "00",
          itemCd: itemCd,
          rsdQty: currentStock,
          regrId: "Admin",
          regrNm: "Admin",
          modrNm: "Admin",
          modrId: "Admin"
        }

        syncStartTime = Date.now()
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)
          
          const response = await fetch(`${kraBaseUrl}/stockMaster/saveStockMaster`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(saveStockMasterPayload),
            signal: controller.signal
          })

          clearTimeout(timeoutId)
          const stockMasterResponse = await response.json()
          
          await logApiCall({
            endpoint: "/stockMaster/saveStockMaster",
            method: "POST",
            payload: saveStockMasterPayload,
            response: stockMasterResponse,
            statusCode: response.status,
            durationMs: Date.now() - syncStartTime,
            branchId: branch_id,
            externalEndpoint: `${kraBaseUrl}/stockMaster/saveStockMaster`
          })
        } catch (err: any) {
          await logApiCall({
            endpoint: "/stockMaster/saveStockMaster",
            method: "POST",
            payload: saveStockMasterPayload,
            response: { resultCd: err.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR", resultMsg: err.message },
            statusCode: 0,
            durationMs: Date.now() - syncStartTime,
            branchId: branch_id,
            error: err.message,
            externalEndpoint: `${kraBaseUrl}/stockMaster/saveStockMaster`
          })
        }
      } catch (bgError: any) {
        console.error("[Issue Invoice] Background stock sync error:", bgError.message)
      }
    }

    // Fire and forget - don't await, let it run in background
    syncStockInBackground().catch(err => console.error("[Issue Invoice] Stock sync failed:", err.message))

    // Return immediately after saveSales success - stock sync happens in background
    return NextResponse.json({
      success: true,
      invoiceNumber: trdInvcNo,
      responses: {
        saveSales: responses.saveSales,
        saveStockItems: { status: "processing_in_background" },
        saveStockMaster: { status: "processing_in_background" }
      },
      summary: {
        saveSales: "Success",
        saveStockItems: "Processing in background",
        saveStockMaster: "Processing in background"
      }
    })

  } catch (error: any) {
    console.error("[Issue Invoice API] Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to issue invoice" 
    }, { status: 500 })
  }
}
