import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/items/classifications", "POST")

  let kraPayload: any = null
  let kraEndpoint = ""

  try {
    const supabase = await createClient()

    let backendUrl = request.headers.get("x-backend-url") || "http://20.224.40.56:8088"
    backendUrl = backendUrl.replace(/\/$/, "")

    console.log("[v0] Backend URL:", backendUrl)

    const { data: branches } = await supabase
      .from("branches")
      .select("id, bhf_id, name")
      .eq("name", "Thika Greens")
      .limit(1)
      .single()

    if (!branches || !branches.bhf_id) {
      throw new Error("Thika Greens branch not found. Please configure it first.")
    }

    kraPayload = {
      tin: "P052344628B",
      bhfId: branches.bhf_id,
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

    // Extract itemClsList from nested structure
    const itemClsList = result.data?.itemClsList || []
    console.log("[v0] Found", itemClsList.length, "item classifications")

    if (itemClsList.length > 0) {
      console.log("[v0] Saving", itemClsList.length, "item classifications to database")

      for (const item of itemClsList) {
        await supabase.from("item_classifications").upsert(
          {
            item_cls_cd: item.itemClsCd,
            item_cls_nm: item.itemClsNm,
            item_cls_lvl: item.itemClsLvl,
            tax_ty_cd: item.taxTyCd,
            mjr_tg_yn: item.mjrTgYn,
            use_yn: item.useYn || "Y",
            last_req_dt: new Date(),
          },
          { onConflict: "item_cls_cd" },
        )
      }
    }

    await logger.success(kraPayload, result, branches.id, kraEndpoint)

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
      data: [],
    }

    await logger.error(kraPayload, error, 500, undefined, kraEndpoint)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
