import { query } from "@/lib/db"
import { logApiCall } from "@/lib/api-logger"

const KRA_BASE_URL = "http://20.224.40.56:8088"

interface StockSyncItem {
  itemCode: string
  itemClassCode: string
  itemName: string
  packageUnit: string
  quantityUnit: string
  quantity: number
  unitPrice: number
  taxType: string
}

interface StockSyncResult {
  success: boolean
  saveStockItemsResponse?: any
  saveStockMasterResponses?: any[]
  error?: string
}

async function getBranchKraInfo(branchId: string): Promise<{ tin: string, bhfId: string } | null> {
  const result = await query(`
    SELECT kra_pin as tin, bhf_id 
    FROM branches 
    WHERE id = $1
  `, [branchId])
  
  if (result.length === 0 || !result[0].tin) return null
  return { tin: result[0].tin, bhfId: result[0].bhf_id || "00" }
}

async function getNextSarNo(branchId: string): Promise<number> {
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

function formatKraDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function toFixed2(num: number): string {
  return (Math.round(num * 100) / 100).toFixed(2)
}

function calculateTaxAmount(amount: number, taxType: string = "B"): number {
  if (taxType === "B") {
    return Math.round(amount * 0.16 * 100) / 100
  } else if (taxType === "A") {
    return Math.round((amount / 1.16) * 0.16 * 100) / 100
  } else if (taxType === "C") {
    return Math.round(amount * 0.08 * 100) / 100
  }
  return 0
}

async function callSaveStockItems(
  branchId: string,
  sarTyCd: string,
  items: StockSyncItem[]
): Promise<{ success: boolean; response: any; sarNo: number }> {
  const startTime = Date.now()
  
  const kraInfo = await getBranchKraInfo(branchId)
  if (!kraInfo) {
    return { 
      success: false, 
      response: { resultCd: "CONFIG_ERROR", resultMsg: "Branch KRA info not configured" },
      sarNo: 0 
    }
  }
  
  const sarNo = await getNextSarNo(branchId)
  
  let totTaxblAmt = 0
  let totTaxAmt = 0
  let totAmt = 0
  
  const itemList = items.map((item, index) => {
    const splyAmt = Math.round(item.quantity * item.unitPrice * 100) / 100
    const taxAmt = calculateTaxAmount(splyAmt, item.taxType)
    
    totTaxblAmt += splyAmt
    totTaxAmt += taxAmt
    totAmt += splyAmt
    
    return {
      itemSeq: index + 1,
      itemCd: item.itemCode,
      itemClsCd: item.itemClassCode || "15100000",
      itemNm: item.itemName,
      bcd: null,
      pkgUnitCd: item.packageUnit || "NT",
      pkg: Math.ceil(item.quantity),
      qtyUnitCd: item.quantityUnit || "LTR",
      qty: parseFloat(item.quantity.toFixed(2)),
      itemExprDt: null,
      prc: item.unitPrice,
      splyAmt: toFixed2(splyAmt),
      totDcAmt: 0,
      taxblAmt: toFixed2(splyAmt),
      taxTyCd: item.taxType || "B",
      taxAmt: toFixed2(taxAmt),
      totAmt: toFixed2(splyAmt)
    }
  })
  
  const payload = {
    tin: kraInfo.tin,
    bhfId: kraInfo.bhfId,
    sarNo,
    orgSarNo: 0,
    regTyCd: "M",
    custTin: null,
    custNm: null,
    custBhfId: null,
    sarTyCd,
    ocrnDt: formatKraDate(),
    totItemCnt: itemList.length,
    totTaxblAmt: toFixed2(totTaxblAmt),
    totTaxAmt: toFixed2(totTaxAmt),
    totAmt: toFixed2(totAmt),
    remark: null,
    regrId: "Admin",
    regrNm: "Admin",
    modrNm: "Admin",
    modrId: "Admin",
    itemList
  }
  
  console.log(`[KRA Stock Sync] Calling saveStockItems with sarTyCd=${sarTyCd}`)
  console.log(`[KRA Stock Sync] Payload:`, JSON.stringify(payload, null, 2))
  
  let response: any
  let httpStatus = 200
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const res = await fetch(`${KRA_BASE_URL}/stock/saveStockItems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    httpStatus = res.status
    response = await res.json()
  } catch (fetchError: any) {
    response = {
      resultCd: fetchError.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
      resultMsg: fetchError.message || "Failed to connect to KRA",
      resultDt: new Date().toISOString()
    }
    httpStatus = 0
  }
  
  const duration = Date.now() - startTime
  console.log(`[KRA Stock Sync] saveStockItems response (${duration}ms):`, JSON.stringify(response, null, 2))
  
  await logApiCall({
    endpoint: "/stock/saveStockItems",
    method: "POST",
    payload,
    response,
    statusCode: httpStatus,
    durationMs: duration,
    branchId,
    externalEndpoint: `${KRA_BASE_URL}/stock/saveStockItems`
  })
  
  const isSuccess = response?.resultCd === "000" || response?.resultCd === "0"
  return { success: isSuccess, response, sarNo }
}

async function callSaveStockMaster(
  branchId: string,
  itemCode: string
): Promise<{ success: boolean; response: any }> {
  const startTime = Date.now()
  
  const kraInfo = await getBranchKraInfo(branchId)
  if (!kraInfo) {
    return { 
      success: false, 
      response: { resultCd: "CONFIG_ERROR", resultMsg: "Branch KRA info not configured" }
    }
  }
  
  const tankResult = await query(`
    SELECT t.current_stock 
    FROM tanks t
    JOIN items i ON UPPER(t.fuel_type) = UPPER(i.item_name) AND i.branch_id = t.branch_id
    WHERE i.item_code = $1 AND t.branch_id = $2
    LIMIT 1
  `, [itemCode, branchId])
  
  const currentStock = tankResult.length > 0 ? parseFloat(tankResult[0].current_stock) || 0 : 0
  
  const payload = {
    tin: kraInfo.tin,
    bhfId: kraInfo.bhfId,
    itemCd: itemCode,
    rsdQty: currentStock,
    regrId: "Admin",
    regrNm: "Admin",
    modrNm: "Admin",
    modrId: "Admin"
  }
  
  console.log(`[KRA Stock Sync] Calling saveStockMaster for item ${itemCode}`)
  console.log(`[KRA Stock Sync] Payload:`, JSON.stringify(payload, null, 2))
  
  let response: any
  let httpStatus = 200
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const res = await fetch(`${KRA_BASE_URL}/stockMaster/saveStockMaster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    httpStatus = res.status
    response = await res.json()
  } catch (fetchError: any) {
    response = {
      resultCd: fetchError.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
      resultMsg: fetchError.message || "Failed to connect to KRA",
      resultDt: new Date().toISOString()
    }
    httpStatus = 0
  }
  
  const duration = Date.now() - startTime
  console.log(`[KRA Stock Sync] saveStockMaster response for ${itemCode} (${duration}ms):`, JSON.stringify(response, null, 2))
  
  await logApiCall({
    endpoint: "/stockMaster/saveStockMaster",
    method: "POST",
    payload,
    response,
    statusCode: httpStatus,
    durationMs: duration,
    branchId,
    externalEndpoint: `${KRA_BASE_URL}/stockMaster/saveStockMaster`
  })
  
  const isSuccess = response?.resultCd === "000" || response?.resultCd === "0"
  return { success: isSuccess, response }
}

export async function syncStockAfterSale(
  branchId: string,
  items: StockSyncItem[]
): Promise<StockSyncResult> {
  try {
    console.log(`[KRA Stock Sync] Starting stock sync after sale for branch ${branchId}`)
    
    const stockItemsResult = await callSaveStockItems(branchId, "11", items)
    
    if (!stockItemsResult.success) {
      console.log(`[KRA Stock Sync] saveStockItems failed, skipping saveStockMaster`)
      return {
        success: false,
        saveStockItemsResponse: stockItemsResult.response,
        error: stockItemsResult.response?.resultMsg || "saveStockItems failed"
      }
    }
    
    const stockMasterResponses: any[] = []
    for (const item of items) {
      const masterResult = await callSaveStockMaster(branchId, item.itemCode)
      stockMasterResponses.push({
        itemCode: item.itemCode,
        ...masterResult
      })
    }
    
    console.log(`[KRA Stock Sync] Stock sync after sale completed successfully`)
    return {
      success: true,
      saveStockItemsResponse: stockItemsResult.response,
      saveStockMasterResponses: stockMasterResponses
    }
    
  } catch (error: any) {
    console.error(`[KRA Stock Sync] Error during stock sync after sale:`, error)
    return {
      success: false,
      error: error.message || "Internal error during stock sync"
    }
  }
}

export async function syncStockAfterCreditNote(
  branchId: string,
  items: StockSyncItem[]
): Promise<StockSyncResult> {
  try {
    console.log(`[KRA Stock Sync] Starting stock sync after credit note for branch ${branchId}`)
    
    const stockItemsResult = await callSaveStockItems(branchId, "03", items)
    
    if (!stockItemsResult.success) {
      console.log(`[KRA Stock Sync] saveStockItems failed for credit note, skipping saveStockMaster`)
      return {
        success: false,
        saveStockItemsResponse: stockItemsResult.response,
        error: stockItemsResult.response?.resultMsg || "saveStockItems failed"
      }
    }
    
    const stockMasterResponses: any[] = []
    for (const item of items) {
      const masterResult = await callSaveStockMaster(branchId, item.itemCode)
      stockMasterResponses.push({
        itemCode: item.itemCode,
        ...masterResult
      })
    }
    
    console.log(`[KRA Stock Sync] Stock sync after credit note completed successfully`)
    return {
      success: true,
      saveStockItemsResponse: stockItemsResult.response,
      saveStockMasterResponses: stockMasterResponses
    }
    
  } catch (error: any) {
    console.error(`[KRA Stock Sync] Error during stock sync after credit note:`, error)
    return {
      success: false,
      error: error.message || "Internal error during stock sync"
    }
  }
}
