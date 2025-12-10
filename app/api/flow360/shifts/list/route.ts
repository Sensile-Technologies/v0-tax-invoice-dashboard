import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get("station")

    let endpoint = "/shift/list/"
    if (station) {
      endpoint += `?station=${station}`
    }

    const response = await flow360Request(endpoint)

    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    if (!response.ok) {
      const errorData = isJson ? await response.json() : await response.text()
      const errorMessage = typeof errorData === "string" ? errorData : errorData.message || "Failed to fetch shifts"
      console.error("[Flow360 API Error] Shifts list:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = isJson ? await response.json() : { error: await response.text() }
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Flow360 API Error] Shifts list:", error)
    return NextResponse.json({ error: "Network error fetching shifts", details: String(error) }, { status: 500 })
  }
}
