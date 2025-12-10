import { type NextRequest, NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await flow360Request("/nozzle/create/", {
      method: "POST",
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const data = await response.json()
      if (!response.ok) {
        return NextResponse.json({ error: data.detail || "Failed to create nozzle" }, { status: response.status })
      }
      return NextResponse.json(data)
    } else {
      const text = await response.text()
      console.error("[Flow360 API Error] Create nozzle:", text)
      return NextResponse.json({ error: text || "Invalid response from server" }, { status: response.status })
    }
  } catch (error: any) {
    console.error("[Flow360 API Error] Create nozzle:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
