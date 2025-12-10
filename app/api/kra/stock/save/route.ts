import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/stock/save", "POST")

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { tin, bhfId, sarNo, itemList, ...stockData } = body

    const { data: branch } = await supabase.from("branches").select("id").eq("name", bhfId).single()

    if (!branch) {
      const errorResponse = { resultCd: "001", resultMsg: "Branch not found", resultDt: new Date().toISOString() }
      await logger.error(body, new Error("Branch not found"), 404)
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const { data: movement, error: movementError } = await supabase
      .from("stock_movements")
      .upsert(
        {
          branch_id: branch.id,
          tin,
          bhf_id: bhfId,
          sar_no: sarNo,
          ...stockData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "branch_id,sar_no",
        },
      )
      .select()
      .single()

    if (movementError) throw movementError

    if (itemList && itemList.length > 0) {
      const items = itemList.map((item: any) => ({
        stock_movement_id: movement.id,
        ...item,
      }))

      const { error: itemsError } = await supabase.from("stock_movement_items").insert(items)

      if (itemsError) throw itemsError

      for (const item of itemList) {
        await supabase.from("stock_master").upsert(
          {
            branch_id: branch.id,
            tin,
            bhf_id: bhfId,
            item_cd: item.itemCd,
            rsd_qty: item.qty,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "branch_id,item_cd",
          },
        )
      }
    }

    const response = {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: new Date().toISOString(),
      data: movement,
    }

    await logger.success(body, response, branch.id)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Save stock error:", error)
    const errorResponse = { resultCd: "999", resultMsg: error.message, resultDt: new Date().toISOString() }

    await logger.error(await request.json().catch(() => ({})), error, 500)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
