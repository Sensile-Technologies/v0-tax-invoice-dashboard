import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get("station")

    let endpoint = "/fuel-dispenser/list/"
    if (station) {
      endpoint += `?station=${station}`
    }

    const response = await flow360Request(endpoint)

    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    if (!response.ok) {
      const errorData = isJson ? await response.json() : await response.text()
      const errorMessage = typeof errorData === "string" ? errorData : errorData.message || "Failed to fetch dispensers"
      console.error("[Flow360 API Error] Dispensers list:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = isJson ? await response.json() : { error: await response.text() }
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Flow360 API Error] Dispensers list:", error)
    return NextResponse.json({ error: "Network error fetching dispensers", details: String(error) }, { status: 500 })
  }
}
