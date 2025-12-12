import { query } from "@/lib/db"
import { logApiCall } from "@/lib/api-logger"

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
  device_token: string
  server_address: string
  server_port: string
}

async function getBranchConfig(branchId: string): Promise<BranchConfig | null> {
  try {
    const result = await query(`
      SELECT id, bhf_id, device_token, server_address, server_port
      FROM branches
      WHERE id = $1
    `, [branchId])

    if (result.length === 0) {
      return null
    }

    return result[0] as BranchConfig
  } catch (error) {
    console.error("[KRA API] Error fetching branch config:", error)
    return null
  }
}

export async function callKraTestSalesEndpoint(saleData: KraSaleData): Promise<{
  success: boolean
  kraResponse: KraResponse | null
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const branchConfig = await getBranchConfig(saleData.branch_id)
    
    if (!branchConfig) {
      const errorMsg = "Branch configuration not found"
      console.log(`[KRA API] ${errorMsg}`)
      return { success: false, kraResponse: null, error: errorMsg }
    }

    if (!branchConfig.server_address || !branchConfig.server_port) {
      const errorMsg = "KRA server configuration not set for this branch"
      console.log(`[KRA API] ${errorMsg}`)
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

    const kraEndpoint = `http://${branchConfig.server_address}:${branchConfig.server_port}/trnsSales/saveSales`
    
    const kraPayload = {
      tin: branchConfig.bhf_id?.split("-")[0] || "",
      bhfId: branchConfig.bhf_id || "",
      dvcSrlNo: branchConfig.device_token || "",
      invcNo: saleData.invoice_number,
      rcptNo: saleData.receipt_number,
      salesDt: saleData.sale_date,
      salesTy: "N",
      rcptTy: "S",
      pmtTy: saleData.payment_method === "cash" ? "01" : saleData.payment_method === "mobile_money" ? "02" : "03",
      salesSttsCd: "02",
      cfmDt: saleData.sale_date,
      salesAmt: saleData.total_amount,
      totTaxAmt: 0,
      totAmt: saleData.total_amount,
      custNm: saleData.customer_name || "Walk-in Customer",
      custTin: saleData.customer_pin || "",
      itemList: [
        {
          itemSeq: 1,
          itemCd: saleData.fuel_type.toUpperCase().replace(/\s/g, ""),
          itemNm: saleData.fuel_type,
          qty: saleData.quantity,
          unitPrc: saleData.unit_price,
          splyAmt: saleData.total_amount,
          totAmt: saleData.total_amount,
          taxAmt: 0,
          taxTy: "B",
          taxRt: 0
        }
      ]
    }

    console.log(`[KRA API] Calling endpoint: ${kraEndpoint}`)
    console.log(`[KRA API] Request payload:`, JSON.stringify(kraPayload, null, 2))

    let kraResponse: KraResponse
    let httpStatusCode = 200

    try {
      const response = await fetch(kraEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(kraPayload),
        signal: AbortSignal.timeout(30000)
      })

      httpStatusCode = response.status
      kraResponse = await response.json()
      
      console.log(`[KRA API] HTTP Status: ${response.status}`)
      console.log(`[KRA API] KRA Result Code: ${kraResponse.resultCd}`)
      console.log(`[KRA API] KRA Result Message: ${kraResponse.resultMsg}`)
      console.log(`[KRA API] Response body:`, JSON.stringify(kraResponse, null, 2))
    } catch (fetchError: any) {
      httpStatusCode = 0
      kraResponse = {
        resultCd: "NETWORK_ERROR",
        resultMsg: fetchError.message || "Failed to connect to KRA backend",
        resultDt: new Date().toISOString()
      }
      
      console.log(`[KRA API] Network error:`, fetchError.message)
      console.log(`[KRA API] Response (network error):`, JSON.stringify(kraResponse, null, 2))
    }

    const durationMs = Date.now() - startTime

    const responseWithMetadata = {
      ...kraResponse,
      _httpStatus: httpStatusCode,
      _kraEndpoint: kraEndpoint
    }

    await logApiCall({
      endpoint: "/kra/trnsSales/saveSales",
      method: "POST",
      payload: kraPayload,
      response: responseWithMetadata,
      statusCode: httpStatusCode || 500,
      durationMs,
      branchId: saleData.branch_id,
    })

    return {
      success: kraResponse.resultCd === "000",
      kraResponse
    }

  } catch (error: any) {
    const errorResponse: KraResponse = {
      resultCd: "SYSTEM_ERROR",
      resultMsg: error.message || "System error calling KRA API",
      resultDt: new Date().toISOString()
    }

    console.error(`[KRA API] System error:`, error)
    console.log(`[KRA API] Response (error):`, JSON.stringify(errorResponse, null, 2))
    console.log(`[KRA API] Sale data for context:`, JSON.stringify(saleData, null, 2))

    const durationMs = Date.now() - startTime
    
    await logApiCall({
      endpoint: "/kra/trnsSales/saveSales",
      method: "POST",
      payload: { saleData, errorContext: "System error before KRA call" },
      response: errorResponse,
      statusCode: 500,
      durationMs,
      branchId: saleData.branch_id,
      error: error.message
    })

    return {
      success: false,
      kraResponse: errorResponse,
      error: error.message
    }
  }
}
