import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/sales/save", "POST")

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { tin, bhfId, invcNo, itemList, ...salesData } = body

    const { data: branch } = await supabase.from("branches").select("id").eq("name", bhfId).single()

    if (!branch) {
      const errorResponse = { resultCd: "001", resultMsg: "Branch not found", resultDt: new Date().toISOString() }
      await logger.error(body, new Error("Branch not found"), 404)
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const { data: device } = await supabase
      .from("device_initialization")
      .select("last_sale_invc_no")
      .eq("tin", tin)
      .eq("bhf_id", bhfId)
      .single()

    const nextInvcNo = invcNo || (device?.last_sale_invc_no || 0) + 1

    const { data: sale, error: saleError } = await supabase
      .from("sales_transactions")
      .upsert(
        {
          branch_id: branch.id,
          tin,
          bhf_id: bhfId,
          invc_no: nextInvcNo,
          ...salesData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "branch_id,invc_no",
        },
      )
      .select()
      .single()

    if (saleError) throw saleError

    if (itemList && itemList.length > 0) {
      const items = itemList.map((item: any) => ({
        sales_transaction_id: sale.id,
        ...item,
      }))

      const { error: itemsError } = await supabase.from("sales_transaction_items").insert(items)

      if (itemsError) throw itemsError
    }

    await supabase
      .from("device_initialization")
      .update({ last_sale_invc_no: nextInvcNo })
      .eq("tin", tin)
      .eq("bhf_id", bhfId)

    const response = {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: new Date().toISOString(),
      data: { ...sale, invcNo: nextInvcNo },
    }

    await logger.success(body, response, branch.id)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Save sales error:", error)
    const errorResponse = { resultCd: "999", resultMsg: error.message, resultDt: new Date().toISOString() }

    await logger.error(await request.json().catch(() => ({})), error, 500)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
