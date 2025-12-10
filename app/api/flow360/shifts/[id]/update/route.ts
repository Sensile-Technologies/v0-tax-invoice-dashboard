import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const response = await flow360Request(`/shift/${params.id}/update/`, {
      method: "PUT",
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const data = await response.json()
      if (!response.ok) {
        return NextResponse.json({ error: "Failed to update shift", details: data }, { status: response.status })
      }
      return NextResponse.json(data)
    } else {
      const text = await response.text()
      if (!response.ok) {
        return NextResponse.json({ error: "Failed to update shift", details: text }, { status: response.status })
      }
      return NextResponse.json({ message: text })
    }
  } catch (error) {
    console.error("[Flow360 API Error] Update shift:", error)
    return NextResponse.json({ error: "Network error updating shift" }, { status: 500 })
  }
}
