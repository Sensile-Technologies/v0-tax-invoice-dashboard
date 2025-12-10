import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function GET() {
  try {
    const response = await flow360Request("/station/list/")

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: "Failed to fetch stations", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Flow360 API Error] Stations list:", error)
    return NextResponse.json({ error: "Network error fetching stations" }, { status: 500 })
  }
}
