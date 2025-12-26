import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/codes", "POST")

  let kraPayload: any = null
  let kraEndpoint = ""

  try {
    let backendUrl = request.headers.get("x-backend-url") || process.env.KRA_VSCU_URL || "http://20.224.40.56:8088"
    backendUrl = backendUrl.replace(/\/$/, "")
    const branchId = request.headers.get("x-branch-id")

    console.log("[v0] Backend URL:", backendUrl)
    console.log("[v0] Branch ID from header:", branchId)

    let branch
    if (branchId) {
      const branches = await query(
        "SELECT id, bhf_id, name, kra_pin FROM branches WHERE id = $1",
        [branchId]
      )
      if (branches && branches.length > 0) {
        branch = branches[0]
      }
    }
    
    if (!branch) {
      const branches = await query(
        "SELECT id, bhf_id, name, kra_pin FROM branches WHERE status = 'active' LIMIT 1"
      )
      if (!branches || branches.length === 0) {
        throw new Error("No active branch found. Please configure a branch first.")
      }
      branch = branches[0]
    }

    if (!branch.bhf_id) {
      throw new Error(`Branch "${branch.name}" is not configured with a BHF ID. Please configure the branch first in Security Settings.`)
    }

    console.log("[v0] Using branch:", branch.name, "with bhf_id:", branch.bhf_id)

    kraPayload = {
      tin: branch.kra_pin || "P052344628B",
      bhfId: branch.bhf_id,
      lastReqDt: "20180328000000",
    }

    console.log("[v0] Pulling code list with payload:", kraPayload)

    kraEndpoint = `${backendUrl}/code/selectCodes`
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

    console.log("[v0] KRA API response status:", response.status)

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
      throw new Error(`KRA API error: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`)
    }

    console.log("[v0] Parsed result keys:", Object.keys(result))

    const flattenedCodes: any[] = []
    const clsList = result.data?.clsList || []
    
    for (const cls of clsList) {
      const dtlList = cls.dtlList || []
      for (const item of dtlList) {
        flattenedCodes.push({
          cdCls: cls.cdCls,
          cdClsNm: cls.cdClsNm,
          cd: item.cd,
          cdNm: item.cdNm,
          cdDesc: item.cdDesc,
          useYn: item.useYn || "Y",
          userDfnCd1: item.userDfnCd1,
          userDfnCd2: item.userDfnCd2,
          userDfnCd3: item.userDfnCd3,
        })
      }
    }

    console.log("[v0] Flattened", flattenedCodes.length, "code list items")

    if (flattenedCodes.length > 0) {
      console.log("[v0] Saving", flattenedCodes.length, "code list items to database")

      for (const item of flattenedCodes) {
        await query(
          `INSERT INTO kra_codelists (bhf_id, cd_cls, cd, cd_nm, cd_desc, use_yn, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (bhf_id, cd_cls, cd) DO UPDATE SET
             cd_nm = EXCLUDED.cd_nm,
             cd_desc = EXCLUDED.cd_desc,
             use_yn = EXCLUDED.use_yn,
             updated_at = NOW()`,
          [branch.bhf_id, item.cdCls, item.cd, item.cdNm, item.cdDesc, item.useYn || "Y"]
        )
      }
    }

    await logger.success(kraPayload, result, branch.id, kraEndpoint)

    const transformedData = flattenedCodes.map((item: any) => ({
      cd_cls: item.cdCls,
      cd: item.cd,
      cd_nm: item.cdNm,
      cd_desc: item.cdDesc,
      use_yn: item.useYn || "Y",
    }))

    return NextResponse.json({
      resultCd: "000",
      resultMsg: "Successfully pulled code list from KRA",
      resultDt: new Date().toISOString(),
      data: transformedData,
    })
  } catch (error: any) {
    console.error("[v0] Get codes error:", error.message)
    console.error("[v0] Full error:", error)

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

    const errorResponse = {
      resultCd: "999",
      resultMsg: errorMessage,
      resultDt: new Date().toISOString(),
    }

    await logger.error(kraPayload, error, 500, undefined, kraEndpoint)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
