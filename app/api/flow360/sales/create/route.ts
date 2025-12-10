import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await flow360Request("/sale/create/", {
      method: "POST",
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: "Failed to create sale", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Flow360 API Error] Create sale:", error)
    return NextResponse.json({ error: "Network error creating sale" }, { status: 500 })
  }
}
