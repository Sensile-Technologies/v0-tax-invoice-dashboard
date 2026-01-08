import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { itemId, branchId } = body

    if (!itemId || !branchId) {
      return NextResponse.json(
        { error: "Item ID and Branch ID are required" },
        { status: 400 }
      )
    }

    // First try catalog items (via branch_items)
    let itemResult = await query(`
      SELECT i.*, 
             COALESCE(bi.sale_price, 0) as sale_price,
             COALESCE(bi.purchase_price, 0) as purchase_price,
             COALESCE(b.kra_pin, v.kra_pin) as kra_pin, 
             b.bhf_id,
             COALESCE(b.server_address, '5.189.171.160') as server_address,
             COALESCE(b.server_port, '8088') as server_port,
             bi.id as branch_item_id,
             'catalog' as item_source
      FROM items i
      JOIN vendors v ON v.id = i.vendor_id
      JOIN branch_items bi ON bi.item_id = i.id
      JOIN branches b ON b.id = bi.branch_id
      WHERE i.id = $1 AND bi.branch_id = $2 AND i.branch_id IS NULL
    `, [itemId, branchId])

    // If not found as catalog item, try legacy items
    if (itemResult.length === 0) {
      itemResult = await query(`
        SELECT i.*, 
               COALESCE(i.sale_price, 0) as sale_price,
               COALESCE(i.purchase_price, 0) as purchase_price,
               COALESCE(b.kra_pin, v.kra_pin) as kra_pin, 
               b.bhf_id,
               COALESCE(b.server_address, '5.189.171.160') as server_address,
               COALESCE(b.server_port, '8088') as server_port,
               NULL as branch_item_id,
               'legacy' as item_source
        FROM items i
        JOIN vendors v ON v.id = i.vendor_id
        JOIN branches b ON b.id = i.branch_id
        WHERE i.id = $1 AND i.branch_id = $2
      `, [itemId, branchId])
    }

    if (itemResult.length === 0) {
      return NextResponse.json(
        { error: "Item not found or not assigned to this branch" },
        { status: 404 }
      )
    }

    const item = itemResult[0]

    if (!item.kra_pin) {
      return NextResponse.json(
        { error: "Vendor KRA PIN not configured" },
        { status: 400 }
      )
    }

    const kraPayload = {
      tin: item.kra_pin,
      bhfId: item.bhf_id || "00",
      itemCd: item.item_code,
      itemClsCd: item.class_code || "99000000",
      itemTyCd: item.item_type || "2",
      itemNm: item.item_name,
      itemStdNm: null,
      orgnNatCd: item.origin || "KE",
      pkgUnitCd: item.package_unit || "NT",
      qtyUnitCd: item.quantity_unit || "U",
      taxTyCd: item.tax_type || "B",
      btchNo: item.batch_number || null,
      bcd: item.sku || null,
      dftPrc: item.sale_price || 0,
      grpPrcL1: item.sale_price || 0,
      grpPrcL2: item.sale_price || 0,
      grpPrcL3: item.sale_price || 0,
      grpPrcL4: item.sale_price || 0,
      grpPrcL5: null,
      addInfo: null,
      sftyQty: null,
      isrcAplcbYn: "N",
      useYn: item.status === "active" ? "Y" : "N",
      regrNm: "Admin",
      regrId: "Admin",
      modrNm: "Admin",
      modrId: "Admin"
    }

    const kraBaseUrl = buildKraBaseUrl(item.server_address, item.server_port)
    const kraEndpoint = `${kraBaseUrl}/items/saveItems`
    
    console.log(`[KRA Items Middleware] Calling external endpoint: ${kraEndpoint}`)
    console.log(`[KRA Items Middleware] Request payload:`, JSON.stringify(kraPayload, null, 2))

    let kraResponse: any
    let httpStatusCode = 200

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(kraEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kraPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      httpStatusCode = response.status
      kraResponse = await response.json()
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        kraResponse = {
          resultCd: "TIMEOUT",
          resultMsg: "Request timed out after 15 seconds",
          resultDt: new Date().toISOString()
        }
      } else {
        kraResponse = {
          resultCd: "NETWORK_ERROR",
          resultMsg: `Network error: ${fetchError.message}`,
          resultDt: new Date().toISOString()
        }
      }
      httpStatusCode = 0
    }

    const duration = Date.now() - startTime
    console.log(`[KRA Items Middleware] Response (${duration}ms):`, JSON.stringify(kraResponse, null, 2))

    try {
      const logStatus = (kraResponse.resultCd === "000" || kraResponse.resultCd === "0") ? "success" : "error"
      await query(`
        INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        branchId,
        "kra_save_item",
        kraEndpoint,
        JSON.stringify(kraPayload),
        JSON.stringify(kraResponse),
        logStatus
      ])
    } catch (logError) {
      console.error("[KRA Items Middleware] Failed to log API call:", logError)
    }

    const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0"
    const status = isSuccess ? "success" : "rejected"

    // Update KRA status based on item source
    if (item.item_source === 'catalog' && item.branch_item_id) {
      // For catalog items, update branch_items table
      await query(`
        UPDATE branch_items 
        SET kra_status = $1, 
            kra_last_synced_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
      `, [status, item.branch_item_id])
    } else {
      // For legacy items, update items table
      await query(`
        UPDATE items 
        SET kra_status = $1, 
            kra_response = $2, 
            kra_last_synced_at = NOW()
        WHERE id = $3
      `, [status, JSON.stringify(kraResponse), itemId])
    }

    return NextResponse.json({
      success: isSuccess,
      kraResponse,
      itemSource: item.item_source,
      message: isSuccess 
        ? "Item successfully submitted to KRA" 
        : `KRA submission failed: ${kraResponse.resultMsg || 'Unknown error'}`
    })

  } catch (error: any) {
    console.error("[KRA Items Middleware] Error:", error)
    return NextResponse.json(
      { error: "Failed to submit item to KRA", details: error.message },
      { status: 500 }
    )
  }
}
