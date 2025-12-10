import { createClient } from "@/lib/supabase/server"

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
}

export async function logApiCall(entry: ApiLogEntry) {
  try {
    const supabase = await createClient()

    await supabase.from("api_logs").insert({
      endpoint: entry.endpoint,
      method: entry.method,
      payload: entry.payload || null,
      response: entry.response || null,
      status_code: entry.statusCode || null,
      error: entry.error || null,
      duration_ms: entry.durationMs || null,
      branch_id: entry.branchId || null,
      user_agent: entry.externalEndpoint || null,
    })
  } catch (error) {
    console.error("[v0] Failed to log API call:", error)
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
