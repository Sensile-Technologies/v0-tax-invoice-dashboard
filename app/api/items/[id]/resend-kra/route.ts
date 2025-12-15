import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

const KRA_BASE_URL = "http://20.224.40.56:8088"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      )
    }

    const itemResult = await query(`
      SELECT i.*, v.kra_pin, b.bhf_id
      FROM items i
      JOIN vendors v ON v.id = i.vendor_id
      JOIN branches b ON b.id = i.branch_id
      WHERE i.id = $1
    `, [id])

    if (itemResult.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    const item = itemResult[0]

    if (!item.branch_id) {
      return NextResponse.json(
        { error: "Item does not have a branch assigned" },
        { status: 400 }
      )
    }

    if (!item.kra_pin) {
      return NextResponse.json(
        { error: "Vendor KRA PIN not configured" },
        { status: 400 }
      )
    }

    console.log(`[Items API] Resending item ${id} to KRA directly`)

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

    const kraEndpoint = `${KRA_BASE_URL}/items/saveItems`
    
    console.log(`[Items API] Calling KRA endpoint: ${kraEndpoint}`)
    console.log(`[Items API] Request payload:`, JSON.stringify(kraPayload, null, 2))

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
    console.log(`[Items API] KRA Response (${duration}ms):`, JSON.stringify(kraResponse, null, 2))

    try {
      await query(`
        INSERT INTO api_logs (endpoint, method, payload, response, status_code, duration_ms, branch_id, user_agent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        "/api/kra/items/saveItems",
        "POST",
        JSON.stringify(kraPayload),
        JSON.stringify(kraResponse),
        httpStatusCode,
        duration,
        item.branch_id,
        kraEndpoint
      ])
      console.log(`[Items API] Logged API call to api_logs for branch ${item.branch_id}`)
    } catch (logError) {
      console.error("[Items API] Failed to log API call:", logError)
    }

    const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0"
    const status = isSuccess ? "success" : "rejected"

    await query(`
      UPDATE items 
      SET kra_status = $1, 
          kra_response = $2, 
          kra_last_synced_at = NOW()
      WHERE id = $3
    `, [status, JSON.stringify(kraResponse), id])

    return NextResponse.json({
      success: isSuccess,
      kraResponse,
      message: isSuccess 
        ? "Item successfully submitted to KRA" 
        : `KRA submission failed: ${kraResponse.resultMsg || 'Unknown error'}`
    })

  } catch (error: any) {
    console.error("[Items API] Error resending item to KRA:", error)
    return NextResponse.json(
      { error: "Failed to resend item to KRA", details: error.message },
      { status: 500 }
    )
  }
}
