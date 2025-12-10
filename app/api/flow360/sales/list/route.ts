import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get("station")
    const shift = searchParams.get("shift")

    let endpoint = "/sale/list/"
    const params = new URLSearchParams()
    if (station) params.append("station", station)
    if (shift) params.append("shift", shift)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    const response = await flow360Request(endpoint)

    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    if (!response.ok) {
      const errorData = isJson ? await response.json() : await response.text()
      const errorMessage = typeof errorData === "string" ? errorData : errorData.message || "Failed to fetch sales"
      console.error("[Flow360 API Error] Sales list:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = isJson ? await response.json() : { error: await response.text() }
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Flow360 API Error] Sales list:", error)
    return NextResponse.json({ error: "Network error fetching sales", details: String(error) }, { status: 500 })
  }
}
