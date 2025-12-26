import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/notices", "POST")

  let kraPayload: any = null
  let kraEndpoint = ""

  try {
    const branchId = request.headers.get("x-branch-id")
    console.log("[v0] Branch ID from header:", branchId)

    let branch
    if (branchId) {
      const branches = await query(
        "SELECT id, bhf_id, name, kra_pin, COALESCE(server_address, '5.189.171.160') as server_address, COALESCE(server_port, '8088') as server_port FROM branches WHERE id = $1",
        [branchId]
      )
      if (branches && branches.length > 0) {
        branch = branches[0]
      }
    }
    
    if (!branch) {
      const branches = await query(
        "SELECT id, bhf_id, name, kra_pin, COALESCE(server_address, '5.189.171.160') as server_address, COALESCE(server_port, '8088') as server_port FROM branches WHERE status = 'active' LIMIT 1"
      )
      if (!branches || branches.length === 0) {
        throw new Error("No active branch found. Please configure a branch first.")
      }
      branch = branches[0]
    }
    
    const backendUrl = buildKraBaseUrl(branch.server_address, branch.server_port)
    console.log("[v0] Backend URL:", backendUrl)

    if (!branch.bhf_id) {
      throw new Error(`Branch "${branch.name}" is not configured with a BHF ID. Please configure the branch first in Security Settings.`)
    }

    console.log("[v0] Using branch:", branch.name, "with bhf_id:", branch.bhf_id)

    kraPayload = {
      tin: branch.kra_pin || "P052344628B",
      bhfId: branch.bhf_id,
      lastReqDt: "20180328000000",
    }

    console.log("[v0] Pulling notices with payload:", kraPayload)

    kraEndpoint = `${backendUrl}/notice/selectNotices`
    console.log("[v0] Calling KRA API:", kraEndpoint)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(kraPayload),
      signal: controller.signal,
    }

    const response = await fetch(kraEndpoint, fetchOptions).finally(() => clearTimeout(timeoutId))

    const responseText = await response.text()
    console.log("[v0] KRA API raw response:", responseText.substring(0, 500))

    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      throw new Error(
        `Backend returned HTML instead of JSON. This usually means the endpoint doesn't exist or there's a routing error. Response: ${responseText.substring(0, 200)}`,
      )
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      throw new Error(`Failed to parse backend response as JSON: ${responseText.substring(0, 200)}`)
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("The notices endpoint is not available on the KRA backend server. This feature may not be supported by your current backend configuration.")
      }
      throw new Error(`KRA API error: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`)
    }

    // Extract noticeList from nested structure (similar to other KRA endpoints)
    const noticeList = result.data?.noticeList || result.data?.notcList || (Array.isArray(result.data) ? result.data : [])
    console.log("[v0] Found", noticeList.length, "notices")

    if (noticeList.length > 0) {
      console.log("[v0] Saving", noticeList.length, "notices to database")

      for (const item of noticeList) {
        await query(
          `INSERT INTO notices (branch_id, tin, bhf_id, notce_no, title, cont, dtl_url, remark, last_req_dt)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (branch_id, notce_no) DO UPDATE SET
             title = EXCLUDED.title,
             cont = EXCLUDED.cont,
             dtl_url = EXCLUDED.dtl_url,
             remark = EXCLUDED.remark,
             last_req_dt = NOW()`,
          [branch.id, kraPayload.tin, kraPayload.bhfId, item.notceNo, item.title, item.cont, item.dtlUrl, item.remark]
        )
      }
    }

    await logger.success(kraPayload, result, branch.id, kraEndpoint)

    const transformedData = noticeList.map((item: any) => ({
      notce_no: item.notceNo,
      title: item.title,
      cont: item.cont,
      dtl_url: item.dtlUrl,
      last_req_dt: item.regrDt,
    }))

    return NextResponse.json({
      resultCd: "000",
      resultMsg: "Successfully pulled notices from KRA",
      resultDt: new Date().toISOString(),
      data: transformedData,
    })
  } catch (error: any) {
    console.error("[v0] Get notices error:", error.message)
    let errorMessage = error.message

    if (error.message.includes("fetch failed") || error.name === "FetchError") {
      errorMessage =
        "Failed to connect to KRA backend. Common causes:\n" +
        "1. Backend server may not be running or accessible\n" +
        "2. URL/Port configuration may be incorrect\n" +
        "3. Network/firewall may be blocking the connection\n" +
        "4. Check if backend requires HTTP or HTTPS\n\n" +
        "Current configuration: " +
        kraEndpoint
    }

    const errorResponse = { resultCd: "999", resultMsg: errorMessage, resultDt: new Date().toISOString() }

    await logger.error(kraPayload, error, 500, undefined, kraEndpoint)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
