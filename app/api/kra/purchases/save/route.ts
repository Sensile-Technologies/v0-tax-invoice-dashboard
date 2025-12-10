import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/purchases/save", "POST")

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { tin, bhfId, invcNo, itemList, ...purchaseData } = body

    const { data: branch } = await supabase.from("branches").select("id").eq("name", bhfId).single()

    if (!branch) {
      const errorResponse = { resultCd: "001", resultMsg: "Branch not found", resultDt: new Date().toISOString() }
      await logger.error(body, new Error("Branch not found"), 404)
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchase_transactions")
      .upsert(
        {
          branch_id: branch.id,
          tin,
          bhf_id: bhfId,
          invc_no: invcNo,
          ...purchaseData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "branch_id,invc_no",
        },
      )
      .select()
      .single()

    if (purchaseError) throw purchaseError

    if (itemList && itemList.length > 0) {
      const items = itemList.map((item: any) => ({
        purchase_transaction_id: purchase.id,
        ...item,
      }))

      const { error: itemsError } = await supabase.from("purchase_transaction_items").insert(items)

      if (itemsError) throw itemsError
    }

    const response = {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: new Date().toISOString(),
      data: purchase,
    }

    await logger.success(body, response, branch.id)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Save purchase error:", error)
    const errorResponse = { resultCd: "999", resultMsg: error.message, resultDt: new Date().toISOString() }

    await logger.error(await request.json().catch(() => ({})), error, 500)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
