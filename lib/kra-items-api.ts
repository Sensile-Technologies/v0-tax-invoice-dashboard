import { query } from "@/lib/db"

interface KraItemPayload {
  tin: string
  bhfId: string
  itemCd: string
  itemClsCd: string
  itemTyCd: string
  itemNm: string
  itemStdNm: string | null
  orgnNatCd: string
  pkgUnitCd: string
  qtyUnitCd: string
  taxTyCd: string
  btchNo: string | null
  bcd: string | null
  dftPrc: number
  grpPrcL1: number
  grpPrcL2: number
  grpPrcL3: number
  grpPrcL4: number
  grpPrcL5: number | null
  addInfo: string | null
  sftyQty: number | null
  isrcAplcbYn: string
  useYn: string
  regrNm: string
  regrId: string
  modrNm: string
  modrId: string
}

interface KraResponse {
  resultCd: string
  resultMsg: string
  resultDt: string
  data?: any
}

interface BranchConfig {
  id: string
  bhf_id: string
  kra_pin: string
  device_token: string
  server_address: string
  server_port: string
}

interface ItemData {
  id: string
  item_code: string
  item_name: string
  item_type: string
  class_code: string
  origin: string
  package_unit: string
  quantity_unit: string
  tax_type: string
  batch_number?: string
  sku?: string
  sale_price: number
  purchase_price: number
  status: string
  vendor_id: string
  branch_id: string
}

const DEFAULT_KRA_URL = process.env.KRA_VSCU_URL || "http://20.224.40.56:8088"

async function getBranchConfig(branchId: string): Promise<BranchConfig | null> {
  try {
    const result = await query(`
      SELECT b.id, b.bhf_id, v.kra_pin, b.device_token, 
             COALESCE(b.server_address, '20.224.40.56') as server_address, 
             COALESCE(b.server_port, '8088') as server_port
      FROM branches b
      JOIN vendors v ON v.id = b.vendor_id
      WHERE b.id = $1
    `, [branchId])

    if (result.length === 0) {
      return null
    }

    return result[0] as BranchConfig
  } catch (error) {
    console.error("[KRA Items API] Error fetching branch config:", error)
    return null
  }
}

export async function submitItemToKra(item: ItemData): Promise<{
  success: boolean
  kraResponse: KraResponse | null
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const branchConfig = await getBranchConfig(item.branch_id)
    
    if (!branchConfig) {
      const errorMsg = "Branch configuration not found"
      console.log(`[KRA Items API] ${errorMsg}`)
      return { success: false, kraResponse: null, error: errorMsg }
    }

    if (!branchConfig.server_address || !branchConfig.server_port) {
      const errorMsg = "KRA server configuration not set for this branch"
      console.log(`[KRA Items API] ${errorMsg}`)
      return { 
        success: false, 
        kraResponse: {
          resultCd: "CONFIG_ERROR",
          resultMsg: errorMsg,
          resultDt: new Date().toISOString()
        }, 
        error: errorMsg 
      }
    }

    if (!branchConfig.kra_pin) {
      const errorMsg = "Vendor KRA PIN not configured"
      console.log(`[KRA Items API] ${errorMsg}`)
      return { 
        success: false, 
        kraResponse: {
          resultCd: "CONFIG_ERROR",
          resultMsg: errorMsg,
          resultDt: new Date().toISOString()
        }, 
        error: errorMsg 
      }
    }

    const serverAddress = branchConfig.server_address.replace(/^https?:\/\//, '')
    const kraEndpoint = `http://${serverAddress}:${branchConfig.server_port}/items/saveItems`
    
    const kraPayload: KraItemPayload = {
      tin: branchConfig.kra_pin,
      bhfId: branchConfig.bhf_id || "00",
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

    console.log(`[KRA Items API] Calling endpoint: ${kraEndpoint}`)
    console.log(`[KRA Items API] Request payload:`, JSON.stringify(kraPayload, null, 2))

    let kraResponse: KraResponse
    let httpStatusCode = 200

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

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
          resultMsg: "Request timed out after 10 seconds",
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
    console.log(`[KRA Items API] Response (${duration}ms):`, JSON.stringify(kraResponse, null, 2))

    try {
      await query(`
        INSERT INTO api_logs (endpoint, method, payload, response, status_code, duration_ms, branch_id, user_agent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        kraEndpoint,
        "POST",
        JSON.stringify(kraPayload),
        JSON.stringify(kraResponse),
        httpStatusCode,
        duration,
        item.branch_id,
        "kra_items_api"
      ])
    } catch (logError) {
      console.error("[KRA Items API] Failed to log API call:", logError)
    }

    const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0"
    const status = isSuccess ? "success" : "rejected"

    await query(`
      UPDATE items 
      SET kra_status = $1, 
          kra_response = $2, 
          kra_last_synced_at = NOW()
      WHERE id = $3
    `, [status, JSON.stringify(kraResponse), item.id])

    return {
      success: isSuccess,
      kraResponse
    }

  } catch (error: any) {
    console.error("[KRA Items API] Error:", error)
    
    await query(`
      UPDATE items 
      SET kra_status = 'rejected', 
          kra_response = $1, 
          kra_last_synced_at = NOW()
      WHERE id = $2
    `, [JSON.stringify({ error: error.message }), item.id])

    return {
      success: false,
      kraResponse: null,
      error: error.message
    }
  }
}

export async function resendItemToKra(itemId: string): Promise<{
  success: boolean
  kraResponse: KraResponse | null
  error?: string
}> {
  try {
    const result = await query(`
      SELECT id, item_code, item_name, item_type, class_code, origin, 
             package_unit, quantity_unit, tax_type, batch_number, sku,
             sale_price, purchase_price, status, vendor_id, branch_id
      FROM items 
      WHERE id = $1
    `, [itemId])

    if (result.length === 0) {
      return { success: false, kraResponse: null, error: "Item not found" }
    }

    const item = result[0] as ItemData
    return submitItemToKra(item)

  } catch (error: any) {
    console.error("[KRA Items API] Resend error:", error)
    return { success: false, kraResponse: null, error: error.message }
  }
}
