import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/items/classifications", "POST")

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

    console.log("[v0] Pulling item classifications with payload:", kraPayload)

    kraEndpoint = `${backendUrl}/itemClass/selectItemsClass`
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
      throw new Error(`KRA API error: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`)
    }

    const itemClsList = result.data?.itemClsList || []
    console.log("[v0] Found", itemClsList.length, "item classifications")

    if (itemClsList.length > 0) {
      console.log("[v0] Saving", itemClsList.length, "item classifications to database")

      for (const item of itemClsList) {
        await query(
          `INSERT INTO kra_item_classifications (bhf_id, item_cls_cd, item_cls_nm, item_cls_lvl, tax_ty_cd, mjr_tg_yn, use_yn, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (bhf_id, item_cls_cd) DO UPDATE SET
             item_cls_nm = EXCLUDED.item_cls_nm,
             item_cls_lvl = EXCLUDED.item_cls_lvl,
             tax_ty_cd = EXCLUDED.tax_ty_cd,
             mjr_tg_yn = EXCLUDED.mjr_tg_yn,
             use_yn = EXCLUDED.use_yn,
             updated_at = NOW()`,
          [branch.bhf_id, item.itemClsCd, item.itemClsNm, item.itemClsLvl, item.taxTyCd, item.mjrTgYn, item.useYn || "Y"]
        )
      }
    }

    await logger.success(kraPayload, result, branch.id, kraEndpoint)

    const transformedData = itemClsList.map((item: any) => ({
      item_cls_cd: item.itemClsCd,
      item_cls_nm: item.itemClsNm,
      item_cls_lvl: item.itemClsLvl,
      tax_ty_cd: item.taxTyCd,
      use_yn: item.useYn || "Y",
    }))

    return NextResponse.json({
      resultCd: "000",
      resultMsg: "Successfully pulled item classifications from KRA",
      resultDt: new Date().toISOString(),
      data: transformedData,
    })
  } catch (error: any) {
    console.error("[v0] Get item classifications error:", error.message)
    let errorMessage = error.message

    if (error.message.includes("fetch failed") || error.name === "FetchError" || error.message.includes("ConnectTimeoutError")) {
      errorMessage =
        "Cannot connect to KRA backend server. The server at " + kraEndpoint + " is not reachable. " +
        "Please check:\n" +
        "1. The backend server is running\n" +
        "2. The URL/Port is correct in backend configuration\n" +
        "3. The server is accessible from this network"
    }

    const errorResponse = {
      resultCd: "999",
      resultMsg: errorMessage,
      resultDt: new Date().toISOString(),
      data: [],
    }

    await logger.error(kraPayload, error, 500, undefined, kraEndpoint)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
