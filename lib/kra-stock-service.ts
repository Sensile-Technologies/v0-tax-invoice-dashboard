import { query } from "@/lib/db"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

const DEFAULT_KRA_URL = process.env.KRA_VSCU_URL || "http://5.189.171.160:8088"
const STOCK_ENDPOINT = "/stock/saveStockItems"

interface BranchKraFullConfig {
  tin: string
  bhfId: string
  serverAddress: string
  serverPort: string
}

async function getBranchKraFullConfig(branchId: string): Promise<BranchKraFullConfig | null> {
  const result = await query(`
    SELECT b.kra_pin as tin, b.bhf_id,
           COALESCE(b.server_address, '5.189.171.160') as server_address,
           COALESCE(b.server_port, '8088') as server_port
    FROM branches b
    WHERE b.id = $1
  `, [branchId])
  
  if (result.length === 0) return null
  
  const branch = result[0]
  if (!branch.tin) {
    const vendorResult = await query(`
      SELECT v.kra_pin as tin 
      FROM branches b 
      JOIN vendors v ON v.id = b.vendor_id 
      WHERE b.id = $1
    `, [branchId])
    
    if (vendorResult.length > 0 && vendorResult[0].tin) {
      return { 
        tin: vendorResult[0].tin, 
        bhfId: branch.bhf_id || "00",
        serverAddress: branch.server_address,
        serverPort: branch.server_port
      }
    }
    return null
  }
  
  return { 
    tin: branch.tin, 
    bhfId: branch.bhf_id || "00",
    serverAddress: branch.server_address,
    serverPort: branch.server_port
  }
}

export interface StockItem {
  itemSeq: number
  itemCd: string
  itemClsCd: string
  itemNm: string
  bcd: string | null
  pkgUnitCd: string
  pkg: number
  qtyUnitCd: string
  qty: number
  itemExprDt: string | null
  prc: number
  splyAmt: number
  totDcAmt: number
  taxblAmt: number
  taxTyCd: string
  taxAmt: number
  totAmt: number
}

export interface StockPayload {
  tin: string
  bhfId: string
  sarNo: number
  orgSarNo: number
  regTyCd: string
  custTin: string | null
  custNm: string | null
  custBhfId: string | null
  sarTyCd: string
  ocrnDt: string
  totItemCnt: number
  totTaxblAmt: number
  totTaxAmt: number
  totAmt: number
  remark: string | null
  regrId: string
  regrNm: string
  modrNm: string
  modrId: string
  itemList: StockItem[]
}

export type StockMovementType = 
  | "initial_stock"      // Tank created with initial stock
  | "stock_receive"      // Stock received into tank
  | "stock_adjustment"   // Manual adjustment (gain/loss)
  | "stock_transfer"     // Transfer between tanks
  | "sale"               // Sale deducting from stock

export const SAR_TYPE_CODES = {
  initial_stock: "01",      // Opening/Initial Stock
  stock_receive: "02",      // Stock Received/Purchase
  stock_adjustment: "06",   // Stock Adjustment
  stock_transfer: "05",     // Stock Transfer
  sale: "11"                // Sale
}

export async function getNextSarNo(branchId: string, endpoint: string = STOCK_ENDPOINT): Promise<number> {
  const result = await query(`
    UPDATE branches 
    SET sr_number = COALESCE(sr_number, 0) + 1,
        updated_at = NOW()
    WHERE id = $1
    RETURNING sr_number
  `, [branchId])
  
  if (result.length === 0) {
    throw new Error(`Branch ${branchId} not found`)
  }
  
  return result[0].sr_number
}

export async function getBranchKraInfo(branchId: string): Promise<{ tin: string, bhfId: string } | null> {
  const result = await query(`
    SELECT b.kra_pin as tin, b.bhf_id 
    FROM branches b 
    WHERE b.id = $1
  `, [branchId])
  
  if (result.length === 0) return null
  
  const branch = result[0]
  if (!branch.tin) {
    const vendorResult = await query(`
      SELECT v.kra_pin as tin 
      FROM branches b 
      JOIN vendors v ON v.id = b.vendor_id 
      WHERE b.id = $1
    `, [branchId])
    
    if (vendorResult.length > 0 && vendorResult[0].tin) {
      return { tin: vendorResult[0].tin, bhfId: branch.bhf_id || "00" }
    }
    return null
  }
  
  return { tin: branch.tin, bhfId: branch.bhf_id || "00" }
}

export async function getTankWithItemInfo(tankId: string): Promise<any> {
  // ONLY use branch_items for pricing - no fallback to items table or fuel_prices
  const result = await query(`
    SELECT t.*, i.item_code, i.class_code, i.item_name, i.package_unit, 
           i.quantity_unit, i.tax_type, 
           bi.sale_price, bi.purchase_price,
           bi.sale_price as current_price
    FROM tanks t
    LEFT JOIN items i ON t.item_id = i.id
    LEFT JOIN branch_items bi ON bi.item_id = i.id AND bi.branch_id = t.branch_id
    WHERE t.id = $1
  `, [tankId])
  
  return result.length > 0 ? result[0] : null
}

export function formatKraDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function calculateTaxAmount(taxableAmount: number, taxType: string = "B"): number {
  if (taxType === "B") {
    return Math.round(taxableAmount * 0.16 * 100) / 100
  }
  return 0
}

export async function createStockMovementRecord(
  branchId: string,
  kraPayload: StockPayload,
  kraResponse: any,
  httpStatus: number,
  durationMs: number
): Promise<string> {
  const isSuccess = kraResponse?.resultCd === "000" || kraResponse?.resultCd === "0"
  
  const result = await query(`
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
    ) RETURNING id
  `, [
    branchId,
    kraPayload.tin,
    kraPayload.bhfId,
    kraPayload.sarNo,
    kraPayload.orgSarNo,
    kraPayload.regTyCd,
    kraPayload.custTin,
    kraPayload.custBhfId,
    kraPayload.custNm,
    kraPayload.sarTyCd,
    kraPayload.ocrnDt,
    kraPayload.totItemCnt,
    kraPayload.totTaxblAmt,
    kraPayload.totTaxAmt,
    kraPayload.totAmt,
    kraPayload.remark,
    kraPayload.regrId,
    kraPayload.regrNm,
    kraPayload.modrId,
    kraPayload.modrNm,
    isSuccess ? "success" : "failed",
    JSON.stringify(kraResponse),
    isSuccess ? new Date() : null
  ])
  
  return result[0].id
}

export async function logKraApiCall(
  endpoint: string,
  payload: any,
  response: any,
  statusCode: number,
  durationMs: number,
  branchId: string,
  kraBaseUrl?: string
): Promise<void> {
  try {
    const isSuccess = response?.resultCd === "000" || response?.resultCd === "0"
    await query(`
      INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      branchId,
      "kra_stock_sync",
      endpoint,
      JSON.stringify(payload),
      JSON.stringify(response),
      isSuccess ? "success" : "error"
    ])
  } catch (error) {
    console.error("[KRA Stock Service] Failed to log API call:", error)
  }
}

export async function syncStockWithKRA(
  branchId: string,
  movementType: StockMovementType,
  items: Array<{
    tankId: string
    quantity: number
    unitPrice: number
    itemCode?: string
    itemClassCode?: string
    itemName?: string
  }>,
  options?: {
    customerId?: string
    customerName?: string
    customerBhfId?: string
    remark?: string
  }
): Promise<{ success: boolean; kraResponse: any; movementId?: string; error?: string }> {
  const startTime = Date.now()
  
  try {
    const kraConfig = await getBranchKraFullConfig(branchId)
    if (!kraConfig) {
      return { success: false, kraResponse: null, error: "Branch KRA info not configured (missing KRA PIN)" }
    }
    
    const kraInfo = { tin: kraConfig.tin, bhfId: kraConfig.bhfId }
    const kraBaseUrl = buildKraBaseUrl(kraConfig.serverAddress, kraConfig.serverPort)
    
    const sarNo = await getNextSarNo(branchId)
    const sarTyCd = SAR_TYPE_CODES[movementType] || "06"
    
    let totTaxblAmt = 0
    let totTaxAmt = 0
    let totAmt = 0
    
    const itemList: StockItem[] = await Promise.all(items.map(async (item, index) => {
      let tankInfo = await getTankWithItemInfo(item.tankId)
      
      const itemCd = item.itemCode || tankInfo?.item_code || tankInfo?.kra_item_cd || `KE1NTXU000000${index + 1}`
      const itemClsCd = item.itemClassCode || tankInfo?.class_code || "5059690800"
      const itemNm = item.itemName || tankInfo?.item_name || "Fuel Item"
      const isPurchaseMovement = movementType === "stock_receive"
      const price = item.unitPrice || (isPurchaseMovement ? tankInfo?.purchase_price : tankInfo?.current_price) || tankInfo?.sale_price || 0
      
      const splyAmt = Math.round(item.quantity * price * 100) / 100
      const taxAmt = calculateTaxAmount(splyAmt, tankInfo?.tax_type || "B")
      
      totTaxblAmt += splyAmt
      totTaxAmt += taxAmt
      totAmt += splyAmt
      
      return {
        itemSeq: index + 1,
        itemCd,
        itemClsCd,
        itemNm,
        bcd: null,
        pkgUnitCd: tankInfo?.package_unit || "NT",
        pkg: Math.ceil(item.quantity),
        qtyUnitCd: tankInfo?.quantity_unit || "U",
        qty: item.quantity,
        itemExprDt: null,
        prc: price,
        splyAmt,
        totDcAmt: 0,
        taxblAmt: splyAmt,
        taxTyCd: tankInfo?.tax_type || "B",
        taxAmt,
        totAmt: splyAmt
      }
    }))
    
    const payload: StockPayload = {
      tin: kraInfo.tin,
      bhfId: kraInfo.bhfId,
      sarNo,
      orgSarNo: 0,
      regTyCd: "M",
      custTin: options?.customerId || null,
      custNm: options?.customerName || null,
      custBhfId: options?.customerBhfId || null,
      sarTyCd,
      ocrnDt: formatKraDate(),
      totItemCnt: itemList.length,
      totTaxblAmt: Math.round(totTaxblAmt * 100) / 100,
      totTaxAmt: Math.round(totTaxAmt * 100) / 100,
      totAmt: Math.round(totAmt * 100) / 100,
      remark: options?.remark || null,
      regrId: "Admin",
      regrNm: "Admin",
      modrNm: "Admin",
      modrId: "Admin",
      itemList
    }
    
    console.log(`[KRA Stock Service] Syncing ${movementType} to KRA for branch ${branchId}`)
    console.log(`[KRA Stock Service] Payload:`, JSON.stringify(payload, null, 2))
    
    let kraResponse: any
    let httpStatusCode = 200
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      
      const response = await fetch(`${kraBaseUrl}${STOCK_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    console.log(`[KRA Stock Service] Response (${duration}ms):`, JSON.stringify(kraResponse, null, 2))
    
    await logKraApiCall(STOCK_ENDPOINT, payload, kraResponse, httpStatusCode, duration, branchId, kraBaseUrl)
    
    const movementId = await createStockMovementRecord(branchId, payload, kraResponse, httpStatusCode, duration)
    
    const isSuccess = kraResponse?.resultCd === "000" || kraResponse?.resultCd === "0"
    
    if (isSuccess) {
      console.log(`[KRA Stock Service] saveStockItems successful, now calling saveStockMaster for each item`)
      
      for (const item of items) {
        const stockMasterStartTime = Date.now()
        let stockMasterResponse: any = null
        let stockMasterStatusCode = 0
        
        try {
          const tankInfo = await getTankWithItemInfo(item.tankId)
          const tankResult = await query(`SELECT current_stock FROM tanks WHERE id = $1`, [item.tankId])
          const currentStock = tankResult.length > 0 ? parseFloat(tankResult[0].current_stock) || 0 : 0
          
          const itemCd = item.itemCode || tankInfo?.item_code || tankInfo?.kra_item_cd
          
          if (!itemCd) {
            console.log(`[KRA Stock Service] Skipping saveStockMaster for tank ${item.tankId} - no item code`)
            continue
          }
          
          const stockMasterPayload = {
            tin: kraInfo.tin,
            bhfId: kraInfo.bhfId,
            itemCd: itemCd,
            rsdQty: currentStock,
            regrId: "Admin",
            regrNm: "Admin",
            modrNm: "Admin",
            modrId: "Admin"
          }
          
          console.log(`[KRA Stock Service] Calling saveStockMaster:`, JSON.stringify(stockMasterPayload, null, 2))
          
          try {
            const stockMasterController = new AbortController()
            const stockMasterTimeoutId = setTimeout(() => stockMasterController.abort(), 15000)
            
            const response = await fetch(`${kraBaseUrl}/stockMaster/saveStockMaster`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(stockMasterPayload),
              signal: stockMasterController.signal
            })
            
            clearTimeout(stockMasterTimeoutId)
            stockMasterStatusCode = response.status
            stockMasterResponse = await response.json()
          } catch (fetchError: any) {
            if (fetchError.name === 'AbortError') {
              stockMasterResponse = {
                resultCd: "TIMEOUT",
                resultMsg: "Request timed out after 15 seconds",
                resultDt: new Date().toISOString()
              }
            } else {
              stockMasterResponse = {
                resultCd: "NETWORK_ERROR",
                resultMsg: `Network error: ${fetchError.message}`,
                resultDt: new Date().toISOString()
              }
            }
          }
          
          console.log(`[KRA Stock Service] saveStockMaster response for ${itemCd}:`, JSON.stringify(stockMasterResponse, null, 2))
          
          await logKraApiCall("/stockMaster/saveStockMaster", stockMasterPayload, stockMasterResponse, stockMasterStatusCode, Date.now() - stockMasterStartTime, branchId, kraBaseUrl)
          
        } catch (stockMasterError: any) {
          console.error(`[KRA Stock Service] Error calling saveStockMaster for tank ${item.tankId}:`, stockMasterError.message)
        }
      }
    }
    
    return {
      success: isSuccess,
      kraResponse,
      movementId,
      error: isSuccess ? undefined : kraResponse?.resultMsg || "KRA sync failed"
    }
    
  } catch (error: any) {
    console.error("[KRA Stock Service] Error:", error)
    return {
      success: false,
      kraResponse: null,
      error: error.message || "Internal error during KRA sync"
    }
  }
}

