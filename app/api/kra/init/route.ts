import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createApiLogger } from "@/lib/api-logger"

export async function POST(request: Request) {
  const logger = createApiLogger("/api/kra/init", "POST")

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { tin, bhfId, dvcSrlNo, ...initData } = body.data

    const { data: branch } = await supabase.from("branches").select("id").eq("name", bhfId).single()

    if (!branch) {
      const errorResponse = { resultCd: "001", resultMsg: "Branch not found", resultDt: new Date().toISOString() }
      await logger.error(body, new Error("Branch not found"), 404)
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const { data, error } = await supabase
      .from("device_initialization")
      .upsert(
        {
          branch_id: branch.id,
          tin,
          bhf_id: bhfId,
          dvc_srl_no: dvcSrlNo,
          ...initData,
        },
        {
          onConflict: "tin,bhf_id,dvc_srl_no",
        },
      )
      .select()

    if (error) throw error

    const response = {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: new Date().toISOString(),
      data: data[0],
    }

    await logger.success(body, response, branch.id)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Device init error:", error)
    const errorResponse = { resultCd: "999", resultMsg: error.message, resultDt: new Date().toISOString() }

    await logger.error(await request.json().catch(() => ({})), error, 500)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
