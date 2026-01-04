import { NextRequest, NextResponse } from "next/server"
import { query, getClient } from "@/lib/db"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

async function callKraWithRetry(
  url: string, 
  payload: any, 
  maxRetries: number = 3
): Promise<{ response: any; statusCode: number }> {
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      return { response: data, statusCode: response.status }
      
    } catch (error: any) {
      lastError = error
      console.log(`[Stock Adjust] KRA attempt ${attempt}/${maxRetries} failed: ${error.message}`)
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  const errorResponse = {
    resultCd: lastError?.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
    resultMsg: lastError?.name === 'AbortError' 
      ? `Request timed out after ${maxRetries} attempts` 
      : `Network error after ${maxRetries} attempts: ${lastError?.message}`,
    resultDt: new Date().toISOString()
  }
  
  return { response: errorResponse, statusCode: 0 }
}

function formatKraDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export async function POST(request: NextRequest) {
  const client = await getClient()
  
  try {
    const body = await request.json()
    const { 
      branch_id,
      tank_id,
      adjustment_type,
      quantity,
      reason,
      approved_by,
      sync_to_kra = true
    } = body

    if (!branch_id || !tank_id || !adjustment_type || quantity === undefined) {
      return NextResponse.json(
        { error: "branch_id, tank_id, adjustment_type, and quantity are required" },
        { status: 400 }
      )
    }

    if (!["increase", "decrease", "set"].includes(adjustment_type)) {
      return NextResponse.json(
        { error: "adjustment_type must be 'increase', 'decrease', or 'set'" },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const branchResult = await client.query(`
      SELECT b.id, b.kra_pin, b.bhf_id, b.sr_number,
             COALESCE(b.server_address, '5.189.171.160') as server_address,
             COALESCE(b.server_port, '8088') as server_port,
             (SELECT v.kra_pin FROM vendors v WHERE v.id = b.vendor_id) as vendor_kra_pin
      FROM branches b
      WHERE b.id = $1
      FOR UPDATE OF b
    `, [branch_id])
    
    if (branchResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }
    
    const branch = branchResult.rows[0]
    const tin = branch.kra_pin || branch.vendor_kra_pin
    const bhfId = branch.bhf_id || "00"

    const tankResult = await client.query(`
      SELECT t.*, 
             (SELECT i.item_code FROM items i WHERE i.id = t.item_id) as item_code,
             (SELECT i.class_code FROM items i WHERE i.id = t.item_id) as class_code,
             (SELECT i.item_name FROM items i WHERE i.id = t.item_id) as item_name,
             (SELECT i.package_unit FROM items i WHERE i.id = t.item_id) as package_unit,
             (SELECT i.quantity_unit FROM items i WHERE i.id = t.item_id) as quantity_unit
      FROM tanks t
      WHERE t.id = $1
      FOR UPDATE OF t
    `, [tank_id])
    
    if (tankResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: "Tank not found" }, { status: 404 })
    }

    const tank = tankResult.rows[0]
    const previousStock = parseFloat(tank.current_stock) || 0
    const tankCapacity = parseFloat(tank.capacity) || 0
    let newStock: number

    if (adjustment_type === "increase") {
      newStock = previousStock + quantity
    } else if (adjustment_type === "decrease") {
      newStock = Math.max(0, previousStock - quantity)
    } else {
      newStock = quantity
    }

    // Check if adjustment would exceed tank capacity (100%)
    if (tankCapacity > 0 && newStock > tankCapacity) {
      await client.query('ROLLBACK')
      const availableSpace = tankCapacity - previousStock
      return NextResponse.json({
        success: false,
        error: `Cannot adjust stock. Tank capacity is ${tankCapacity}L. Adjustment would result in ${newStock.toFixed(2)}L which exceeds capacity. Available space: ${availableSpace.toFixed(2)}L`
      }, { status: 400 })
    }

    const actualChange = Math.abs(newStock - previousStock)
    
    if (actualChange === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({
        success: true,
        data: {
          tankId: tank_id,
          adjustmentType: adjustment_type,
          previousStock,
          adjustedQuantity: 0,
          newStock: previousStock,
          fuelType: tank.fuel_type
        },
        kraSync: null,
        message: "No adjustment needed - stock unchanged"
      })
    }

    let kraResult: any = null
    let sarNo: number | null = null

    if (sync_to_kra && !tin) {
      await client.query('ROLLBACK')
      return NextResponse.json({
        success: false,
        error: "Branch KRA configuration is missing (no KRA PIN). Please configure KRA settings before adjusting stock."
      }, { status: 400 })
    }

    if (sync_to_kra && tin) {
      sarNo = (branch.sr_number || 0) + 1
      
      const kraBaseUrl = buildKraBaseUrl(branch.server_address, branch.server_port)
      const itemCd = tank.item_code || tank.kra_item_cd || `FUEL${tank_id.substring(0, 8)}`
      const itemClsCd = tank.class_code || "5059690800"
      const itemNm = tank.item_name || tank.fuel_type || "Fuel"
      
      const saveStockItemsPayload = {
        tin,
        bhfId,
        sarNo,
        orgSarNo: 0,
        regTyCd: "M",
        custTin: null,
        custNm: null,
        custBhfId: null,
        sarTyCd: "06",
        ocrnDt: formatKraDate(),
        totItemCnt: 1,
        totTaxblAmt: 0,
        totTaxAmt: 0,
        totAmt: 0,
        remark: reason || `Stock adjustment: ${previousStock} -> ${newStock}`,
        regrId: "Admin",
        regrNm: "Admin",
        modrNm: "Admin",
        modrId: "Admin",
        itemList: [{
          itemSeq: 1,
          itemCd,
          itemClsCd,
          itemNm,
          bcd: null,
          pkgUnitCd: tank.package_unit || "NT",
          pkg: Math.ceil(actualChange),
          qtyUnitCd: tank.quantity_unit || "U",
          qty: actualChange,
          itemExprDt: null,
          prc: 0,
          splyAmt: 0,
          totDcAmt: 0,
          taxblAmt: 0,
          taxTyCd: "B",
          taxAmt: 0,
          totAmt: 0
        }]
      }

      console.log(`[Stock Adjust] Calling saveStockItems for tank ${tank_id}, sarNo: ${sarNo}`)
      
      const { response: saveStockItemsResponse, statusCode: saveStockItemsStatus } = 
        await callKraWithRetry(`${kraBaseUrl}/stock/saveStockItems`, saveStockItemsPayload)

      await client.query(`
        INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        branch_id,
        "kra_stock_sync",
        "/stock/saveStockItems",
        JSON.stringify(saveStockItemsPayload),
        JSON.stringify(saveStockItemsResponse),
        (saveStockItemsResponse?.resultCd === "000" || saveStockItemsResponse?.resultCd === "0") ? "success" : "error"
      ])

      const saveStockItemsSuccess = saveStockItemsResponse?.resultCd === "000" || saveStockItemsResponse?.resultCd === "0"
      
      if (!saveStockItemsSuccess) {
        await client.query('ROLLBACK')
        console.error(`[Stock Adjust] saveStockItems failed:`, saveStockItemsResponse)
        return NextResponse.json({
          success: false,
          error: saveStockItemsResponse?.resultMsg || "Failed to sync stock adjustment to KRA",
          kraResponse: saveStockItemsResponse
        }, { status: 500 })
      }

      const saveStockMasterPayload = {
        tin,
        bhfId,
        itemCd,
        rsdQty: newStock,
        regrId: "Admin",
        regrNm: "Admin",
        modrNm: "Admin",
        modrId: "Admin"
      }

      console.log(`[Stock Adjust] Calling saveStockMaster for item ${itemCd}, newStock: ${newStock}`)
      
      const { response: saveStockMasterResponse, statusCode: saveStockMasterStatus } = 
        await callKraWithRetry(`${kraBaseUrl}/stockMaster/saveStockMaster`, saveStockMasterPayload)

      await client.query(`
        INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        branch_id,
        "kra_stock_sync",
        "/stockMaster/saveStockMaster",
        JSON.stringify(saveStockMasterPayload),
        JSON.stringify(saveStockMasterResponse),
        (saveStockMasterResponse?.resultCd === "000" || saveStockMasterResponse?.resultCd === "0") ? "success" : "error"
      ])

      const saveStockMasterSuccess = saveStockMasterResponse?.resultCd === "000" || saveStockMasterResponse?.resultCd === "0"
      
      kraResult = {
        success: saveStockItemsSuccess && saveStockMasterSuccess,
        saveStockItems: saveStockItemsResponse,
        saveStockMaster: saveStockMasterResponse
      }

      if (!saveStockMasterSuccess) {
        console.warn(`[Stock Adjust] saveStockMaster failed but saveStockItems succeeded - continuing with adjustment`)
      }

      await client.query(`
        INSERT INTO stock_movements (
          branch_id, tin, bhf_id, sar_no, org_sar_no, reg_ty_cd, 
          cust_tin, cust_bhf_id, cust_nm, sar_ty_cd, ocrn_dt,
          tot_item_cnt, tot_taxbl_amt, tot_tax_amt, tot_amt, remark,
          regr_id, regr_nm, modr_id, modr_nm,
          kra_status, kra_response, kra_synced_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23
        )
      `, [
        branch_id,
        tin,
        bhfId,
        sarNo,
        0,
        "M",
        null,
        null,
        null,
        "06",
        formatKraDate(),
        1,
        0,
        0,
        0,
        reason || `Stock adjustment: ${previousStock} -> ${newStock}`,
        "Admin",
        "Admin",
        "Admin",
        "Admin",
        saveStockItemsSuccess ? "success" : "failed",
        JSON.stringify(saveStockItemsResponse),
        saveStockItemsSuccess ? new Date() : null
      ])
    }

    if (sarNo) {
      await client.query(`UPDATE branches SET sr_number = $1, updated_at = NOW() WHERE id = $2`, [sarNo, branch_id])
    }

    await client.query(
      `UPDATE tanks SET current_stock = $1, kra_sync_status = $2, last_kra_synced_stock = $3, updated_at = NOW() WHERE id = $4`,
      [newStock, kraResult?.success ? 'synced' : (sync_to_kra ? 'failed' : 'pending'), kraResult?.success ? newStock : tank.last_kra_synced_stock, tank_id]
    )

    await client.query(
      `INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status, kra_sync_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [branch_id, tank_id, adjustment_type, actualChange, previousStock, newStock, reason || 'Manual adjustment', approved_by || 'System', 'approved', kraResult?.success ? 'synced' : 'pending']
    )

    await client.query('COMMIT')
    console.log(`[Stock Adjust] Successfully adjusted tank ${tank_id}: ${previousStock} -> ${newStock}`)

    return NextResponse.json({
      success: true,
      data: {
        tankId: tank_id,
        adjustmentType: adjustment_type,
        previousStock,
        adjustedQuantity: actualChange,
        newStock,
        fuelType: tank.fuel_type
      },
      kraSync: kraResult ? {
        synced: kraResult.success,
        error: kraResult.success ? undefined : "KRA sync completed with warnings"
      } : null
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("[Stock Adjust API] Error:", error)
    return NextResponse.json(
      { error: "Failed to adjust stock", details: error.message },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
