import { query } from "@/lib/db"
import { logApiCall } from "@/lib/api-logger"
import { syncStockAfterSale, syncStockAfterCreditNote } from "@/lib/kra-stock-sync"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

const DEFAULT_KRA_URL = process.env.KRA_VSCU_URL || "http://5.189.171.160:8088"

interface KraSaleData {
  branch_id: string
  invoice_number: string
  receipt_number: string
  fuel_type: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_method: string
  customer_name?: string
  customer_pin?: string
  sale_date: string
  tank_id?: string
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
  invoice_number: number
}

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

async function getBranchConfig(branchId: string): Promise<BranchConfig | null> {
  try {
    const result = await query(`
      SELECT id, bhf_id, kra_pin, device_token, server_address, server_port, COALESCE(invoice_number, 0) as invoice_number
      FROM branches
      WHERE id = $1
    `, [branchId])

    if (result.length === 0) {
      return null
    }

    return result[0] as BranchConfig
  } catch (error) {
    console.error("[KRA Sales API] Error fetching branch config:", error)
    return null
  }
}

async function getNextInvoiceNo(branchId: string): Promise<number> {
  const result = await query(`
    UPDATE branches 
    SET invoice_number = COALESCE(invoice_number, 0) + 1 
    WHERE id = $1 
    RETURNING invoice_number
  `, [branchId])
  return result[0]?.invoice_number || 1
}

async function getItemInfoByFuelType(branchId: string, fuelType: string): Promise<any> {
  const result = await query(`
    SELECT item_code, class_code, item_name, package_unit, 
           quantity_unit, tax_type, sale_price, purchase_price
    FROM items
    WHERE branch_id = $1 
    AND (UPPER(item_name) = UPPER($2) OR item_name ILIKE $3)
    ORDER BY created_at DESC
    LIMIT 1
  `, [branchId, fuelType, `%${fuelType}%`])
  
  return result.length > 0 ? result[0] : null
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
  } else if (taxType === "D" || taxType === "E") {
    return { taxblAmt: 0, taxAmt: 0, taxRt: 0 }
  }
  return { taxblAmt: amount, taxAmt: 0, taxRt: 0 }
}

export async function callKraSaveSales(saleData: KraSaleData): Promise<{
  success: boolean
  kraResponse: KraResponse | null
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const branchConfig = await getBranchConfig(saleData.branch_id)
    
    if (!branchConfig) {
      const errorMsg = "Branch configuration not found"
      console.log(`[KRA Sales API] ${errorMsg}`)
      return { success: false, kraResponse: null, error: errorMsg }
    }

    if (!branchConfig.kra_pin) {
      const errorMsg = "KRA PIN not configured for this branch"
      console.log(`[KRA Sales API] ${errorMsg}`)
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

    const itemInfo = await getItemInfoByFuelType(saleData.branch_id, saleData.fuel_type)
    const invcNo = await getNextInvoiceNo(saleData.branch_id)
    
    if (!itemInfo) {
      const errorMsg = `No item found for fuel type: ${saleData.fuel_type}`
      console.log(`[KRA Sales API] ${errorMsg}`)
      return { 
        success: false, 
        kraResponse: {
          resultCd: "ITEM_NOT_FOUND",
          resultMsg: errorMsg,
          resultDt: new Date().toISOString()
        }, 
        error: errorMsg 
      }
    }
    
    const itemCd = itemInfo.item_code
    const itemClsCd = itemInfo.class_code || "15100000"
    const itemNm = itemInfo.item_name
    const pkgUnitCd = itemInfo.package_unit || "NT"
    const qtyUnitCd = itemInfo.quantity_unit || "LTR"
    const taxTyCd = itemInfo.tax_type || "B"
    
    const prc = Number(itemInfo.sale_price) || 0
    const qty = saleData.quantity
    const totAmt = qty * prc
    
    console.log(`[KRA Sales API] Item lookup: ${itemNm}, item_code: ${itemCd}, sale_price from DB: ${prc}, qty: ${qty}, totAmt: ${totAmt}`)
    
    const { taxblAmt, taxAmt, taxRt } = calculateTax(totAmt, taxTyCd)
    
    const now = new Date()
    const cfmDt = formatKraDateTime(now)
    const salesDt = formatKraDate(now)
    
    const pmtTyCd = PAYMENT_TYPE_CODES[saleData.payment_method?.toLowerCase()] || "01"
    
    const trdInvcNo = `CIV-${String(invcNo).padStart(6, '0')}`

    const kraPayload = {
      tin: branchConfig.kra_pin,
      bhfId: branchConfig.bhf_id || "00",
      trdInvcNo: trdInvcNo,
      invcNo: String(invcNo),
      orgInvcNo: 0,
      custTin: saleData.customer_pin || null,
      custNm: saleData.customer_name || "Walk-in Customer",
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
      totAmt: toFixed2(totAmt),
      
      prchrAcptcYn: "N",
      remark: null,
      regrNm: "Admin",
      regrId: "Admin",
      modrNm: "Admin",
      modrId: "Admin",
      
      receipt: {
        custTin: saleData.customer_pin || null,
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
          qty: parseFloat(qty.toFixed(2)),
          prc: prc,
          splyAmt: toFixed2(qty),
          dcRt: 0.0,
          dcAmt: 0.0,
          isrccCd: null,
          isrccNm: null,
          isrcRt: 0,
          isrcAmt: 0,
          taxTyCd: taxTyCd,
          taxblAmt: toFixed2(taxblAmt),
          taxAmt: toFixed2(taxAmt),
          totAmt: toFixed2(totAmt)
        }
      ]
    }

    const kraBaseUrl = buildKraBaseUrl(branchConfig.server_address, branchConfig.server_port)
    const kraEndpoint = `${kraBaseUrl}/trnsSales/saveSales`
    
    console.log(`[KRA Sales API] Calling endpoint: ${kraEndpoint}`)
    console.log(`[KRA Sales API] Request payload:`, JSON.stringify(kraPayload, null, 2))

    let kraResponse: KraResponse
    let httpStatusCode = 200

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(kraEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(branchConfig.device_token ? { "DeviceSerialNo": branchConfig.device_token } : {})
        },
        body: JSON.stringify(kraPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      httpStatusCode = response.status
      kraResponse = await response.json()
      
      console.log(`[KRA Sales API] HTTP Status: ${response.status}`)
      console.log(`[KRA Sales API] KRA Result Code: ${kraResponse.resultCd}`)
      console.log(`[KRA Sales API] KRA Result Message: ${kraResponse.resultMsg}`)
      console.log(`[KRA Sales API] Response body:`, JSON.stringify(kraResponse, null, 2))
    } catch (fetchError: any) {
      httpStatusCode = 0
      if (fetchError.name === 'AbortError') {
        kraResponse = {
          resultCd: "TIMEOUT",
          resultMsg: "Request timed out after 30 seconds",
          resultDt: new Date().toISOString()
        }
      } else {
        kraResponse = {
          resultCd: "NETWORK_ERROR",
          resultMsg: fetchError.message || "Failed to connect to KRA backend",
          resultDt: new Date().toISOString()
        }
      }
      
      console.log(`[KRA Sales API] Network error:`, fetchError.message)
      console.log(`[KRA Sales API] Response (network error):`, JSON.stringify(kraResponse, null, 2))
    }

    const durationMs = Date.now() - startTime

    await logApiCall({
      endpoint: "/trnsSales/saveSales",
      method: "POST",
      payload: kraPayload,
      response: kraResponse,
      statusCode: httpStatusCode || 500,
      durationMs,
      branchId: saleData.branch_id,
      externalEndpoint: kraEndpoint
    })

    const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0"
    
    if (isSuccess) {
      console.log(`[KRA Sales API] saveSales successful, now syncing stock with KRA`)
      
      try {
        const stockSyncResult = await syncStockAfterSale(saleData.branch_id, [{
          itemCode: itemCd,
          itemClassCode: itemClsCd,
          itemName: itemNm,
          packageUnit: pkgUnitCd,
          quantityUnit: qtyUnitCd,
          quantity: qty,
          unitPrice: prc,
          taxType: taxTyCd
        }])
        
        if (stockSyncResult.success) {
          console.log(`[KRA Sales API] Stock sync completed successfully`)
        } else {
          console.log(`[KRA Sales API] Stock sync failed: ${stockSyncResult.error}`)
        }
      } catch (stockError: any) {
        console.error(`[KRA Sales API] Error during stock sync:`, stockError.message)
      }
    }
    
    return {
      success: isSuccess,
      kraResponse
    }

  } catch (error: any) {
    const errorResponse: KraResponse = {
      resultCd: "SYSTEM_ERROR",
      resultMsg: error.message || "System error calling KRA API",
      resultDt: new Date().toISOString()
    }

    console.error(`[KRA Sales API] System error:`, error)

    const durationMs = Date.now() - startTime
    
    await logApiCall({
      endpoint: "/trnsSales/saveSales",
      method: "POST",
      payload: { saleData, errorContext: "System error before KRA call" },
      response: errorResponse,
      statusCode: 500,
      durationMs,
      branchId: saleData.branch_id,
      error: error.message,
      externalEndpoint: `${DEFAULT_KRA_URL}/trnsSales/saveSales`
    })

    return {
      success: false,
      kraResponse: errorResponse,
      error: error.message
    }
  }
}

export async function callKraTestSalesEndpoint(saleData: KraSaleData): Promise<{
  success: boolean
  kraResponse: KraResponse | null
  error?: string
}> {
  return callKraSaveSales(saleData)
}

interface CreditNoteData {
  branch_id: string
  original_sale_id: string
  original_invoice_no: number
  refund_reason_code: string
  customer_tin?: string
  customer_name?: string
  items: Array<{
    item_code: string
    item_class_code: string
    item_name: string
    package_unit: string
    quantity_unit: string
    quantity: number
    price: number
    tax_type: string
  }>
}

const REFUND_REASON_CODES: Record<string, string> = {
  'defective': '01',
  'wrong_item': '02',
  'customer_request': '03',
  'price_error': '04',
  'duplicate': '05',
  'other': '06'
}

export async function callKraCreditNote(creditNoteData: CreditNoteData): Promise<{
  success: boolean
  kraResponse: KraResponse | null
  creditNoteNumber?: string
  invcNo?: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const branchConfig = await getBranchConfig(creditNoteData.branch_id)
    
    if (!branchConfig) {
      return { success: false, kraResponse: null, error: "Branch configuration not found" }
    }

    if (!branchConfig.kra_pin) {
      return { 
        success: false, 
        kraResponse: {
          resultCd: "CONFIG_ERROR",
          resultMsg: "KRA PIN not configured for this branch",
          resultDt: new Date().toISOString()
        }, 
        error: "KRA PIN not configured" 
      }
    }

    const invcNo = await getNextInvoiceNo(creditNoteData.branch_id)
    const trdInvcNo = `CR${invcNo}`
    
    const now = new Date()
    const cfmDt = formatKraDateTime(now)
    const salesDt = formatKraDate(now)
    
    const rfdRsnCd = REFUND_REASON_CODES[creditNoteData.refund_reason_code?.toLowerCase()] || "06"
    
    let totTaxblAmtB = 0
    let totTaxAmtB = 0
    let totAmt = 0
    
    const itemList = creditNoteData.items.map((item, index) => {
      const splyAmt = item.quantity * item.price
      const taxblAmt = splyAmt / 1.16
      const taxAmt = splyAmt - taxblAmt
      
      totTaxblAmtB += taxblAmt
      totTaxAmtB += taxAmt
      totAmt += splyAmt
      
      return {
        itemSeq: index + 1,
        itemCd: item.item_code,
        itemClsCd: item.item_class_code || "99013001",
        itemNm: item.item_name,
        bcd: null,
        pkgUnitCd: item.package_unit || "BF",
        pkg: item.quantity,
        qtyUnitCd: item.quantity_unit || "L",
        qty: item.quantity,
        prc: item.price,
        splyAmt: toFixed2(splyAmt),
        dcRt: 0.0,
        dcAmt: 0.0,
        isrccCd: null,
        isrccNm: null,
        isrcRt: null,
        isrcAmt: null,
        taxTyCd: item.tax_type || "B",
        taxblAmt: toFixed2(taxblAmt),
        taxAmt: toFixed2(taxAmt),
        totAmt: toFixed2(splyAmt)
      }
    })

    const kraPayload = {
      tin: branchConfig.kra_pin,
      bhfId: branchConfig.bhf_id || "00",
      trdInvcNo: trdInvcNo,
      invcNo: invcNo,
      orgInvcNo: creditNoteData.original_invoice_no,
      custTin: creditNoteData.customer_tin || null,
      custNm: creditNoteData.customer_name || "Walk-in Customer",
      salesTyCd: "N",
      rcptTyCd: "R",
      pmtTyCd: "01",
      salesSttsCd: "02",
      cfmDt: cfmDt,
      salesDt: salesDt,
      stockRlsDt: cfmDt,
      cnclReqDt: null,
      cnclDt: null,
      rfdDt: cfmDt,
      rfdRsnCd: rfdRsnCd,
      totItemCnt: itemList.length,
      taxblAmtA: "0.00",
      taxblAmtB: toFixed2(totTaxblAmtB),
      taxblAmtC: "0.00",
      taxblAmtD: "0.00",
      taxblAmtE: "0.00",
      taxRtA: "0.00",
      taxRtB: "16.00",
      taxRtC: "0.00",
      taxRtD: "0.00",
      taxRtE: "0.00",
      taxAmtA: "0.00",
      taxAmtB: toFixed2(totTaxAmtB),
      taxAmtC: "0.00",
      taxAmtD: "0.00",
      taxAmtE: "0.00",
      totTaxblAmt: toFixed2(totTaxblAmtB),
      totTaxAmt: toFixed2(totTaxAmtB),
      totAmt: toFixed2(totAmt),
      prchrAcptcYn: "N",
      remark: null,
      regrNm: "Admin",
      regrId: "Admin",
      modrNm: "Admin",
      modrId: "Admin",
      receipt: {
        custTin: creditNoteData.customer_tin || null,
        custMblNo: null,
        rcptPbctDt: cfmDt,
        trdeNm: null,
        adrs: null,
        topMsg: null,
        btmMsg: null,
        prchrAcptcYn: "N"
      },
      itemList: itemList
    }

    const kraBaseUrl = buildKraBaseUrl(branchConfig.server_address, branchConfig.server_port)
    const kraEndpoint = `${kraBaseUrl}/trnsSales/saveSales`
    
    console.log(`[KRA Credit Note API] Calling endpoint: ${kraEndpoint}`)
    console.log(`[KRA Credit Note API] Request payload:`, JSON.stringify(kraPayload, null, 2))

    let kraResponse: KraResponse
    let httpStatusCode = 200

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(kraEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(branchConfig.device_token ? { "DeviceSerialNo": branchConfig.device_token } : {})
        },
        body: JSON.stringify(kraPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      httpStatusCode = response.status
      kraResponse = await response.json()
      
      console.log(`[KRA Credit Note API] HTTP Status: ${response.status}`)
      console.log(`[KRA Credit Note API] Response:`, JSON.stringify(kraResponse, null, 2))
    } catch (fetchError: any) {
      httpStatusCode = 0
      kraResponse = {
        resultCd: fetchError.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
        resultMsg: fetchError.message || "Failed to connect to KRA backend",
        resultDt: new Date().toISOString()
      }
      console.log(`[KRA Credit Note API] Network error:`, fetchError.message)
    }

    const durationMs = Date.now() - startTime

    await logApiCall({
      endpoint: "/trnsSales/saveSales",
      method: "POST",
      payload: kraPayload,
      response: kraResponse,
      statusCode: httpStatusCode || 500,
      durationMs,
      branchId: creditNoteData.branch_id,
      externalEndpoint: kraEndpoint
    })

    const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0"
    
    if (isSuccess) {
      console.log(`[KRA Credit Note API] saveSales successful for credit note, now syncing stock with KRA`)
      
      try {
        const stockItems = creditNoteData.items.map(item => ({
          itemCode: item.item_code,
          itemClassCode: item.item_class_code,
          itemName: item.item_name,
          packageUnit: item.package_unit,
          quantityUnit: item.quantity_unit,
          quantity: item.quantity,
          unitPrice: item.price,
          taxType: item.tax_type
        }))
        
        const stockSyncResult = await syncStockAfterCreditNote(creditNoteData.branch_id, stockItems)
        
        if (stockSyncResult.success) {
          console.log(`[KRA Credit Note API] Stock sync completed successfully for credit note`)
        } else {
          console.log(`[KRA Credit Note API] Stock sync failed for credit note: ${stockSyncResult.error}`)
        }
      } catch (stockError: any) {
        console.error(`[KRA Credit Note API] Error during stock sync for credit note:`, stockError.message)
      }
    }
    
    return {
      success: isSuccess,
      kraResponse,
      creditNoteNumber: trdInvcNo,
      invcNo: invcNo
    }

  } catch (error: any) {
    console.error(`[KRA Credit Note API] System error:`, error)
    return {
      success: false,
      kraResponse: {
        resultCd: "SYSTEM_ERROR",
        resultMsg: error.message || "System error calling KRA API",
        resultDt: new Date().toISOString()
      },
      error: error.message
    }
  }
}
