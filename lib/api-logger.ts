import { query } from "@/lib/db"

export interface ApiLogEntry {
  endpoint: string
  method: string
  payload?: any
  response?: any
  statusCode?: number
  error?: string
  durationMs?: number
  branchId?: string
  externalEndpoint?: string
  logType?: string
}

function deriveLogType(endpoint: string): string {
  if (endpoint.includes('saveSales')) return 'kra_save_sales'
  if (endpoint.includes('saveStockItems')) return 'kra_stock_items'
  if (endpoint.includes('saveStockMaster')) return 'kra_stock_master'
  if (endpoint.includes('selectInitInfo')) return 'kra_initialize'
  if (endpoint.includes('saveItem')) return 'kra_save_item'
  return 'kra_api'
}

function deriveStatus(response: any, statusCode?: number, error?: string): string {
  if (error) return 'error'
  if (!response) return 'error'
  if (response.resultCd === '000' || response.resultCd === '0') return 'success'
  if (statusCode && statusCode >= 200 && statusCode < 300 && !response.resultCd) return 'success'
  return 'error'
}

export async function logApiCall(entry: ApiLogEntry) {
  if (!entry.branchId) {
    console.warn("[API Logger] No branchId provided, skipping log")
    return
  }

  try {
    const logType = entry.logType || deriveLogType(entry.endpoint)
    const status = deriveStatus(entry.response, entry.statusCode, entry.error)

    console.log(`[API Logger] Logging ${entry.endpoint} for branch ${entry.branchId} with status ${status}`)

    await query(`
      INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      entry.branchId,
      logType,
      entry.endpoint,
      JSON.stringify(entry.payload || {}),
      JSON.stringify(entry.response || { error: entry.error }),
      status
    ])
    
    console.log(`[API Logger] Successfully logged ${entry.endpoint}`)
  } catch (error) {
    console.error("[API Logger] Failed to log API call:", error)
    console.error("[API Logger] Entry was:", JSON.stringify({
      branchId: entry.branchId,
      endpoint: entry.endpoint,
      statusCode: entry.statusCode
    }))
  }
}

export function createApiLogger(endpoint: string, method = "POST") {
  const startTime = Date.now()

  return {
    success: async (payload: any, response: any, branchId?: string, externalEndpoint?: string) => {
      const duration = Date.now() - startTime
      await logApiCall({
        endpoint,
        method,
        payload,
        response,
        statusCode: 200,
        durationMs: duration,
        branchId,
        externalEndpoint,
      })
    },
    error: async (payload: any, error: any, statusCode = 500, branchId?: string, externalEndpoint?: string) => {
      const duration = Date.now() - startTime
      await logApiCall({
        endpoint,
        method,
        payload,
        error: error?.message || String(error),
        statusCode,
        durationMs: duration,
        branchId,
        externalEndpoint,
      })
    },
  }
}
