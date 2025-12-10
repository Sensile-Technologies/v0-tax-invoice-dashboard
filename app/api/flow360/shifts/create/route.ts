import { NextResponse } from "next/server"
import { flow360Request } from "@/lib/flow360-api"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await flow360Request("/shift/create/", {
      method: "POST",
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get("content-type")

    if (!response.ok) {
      let errorMessage = "Failed to create shift"

      if (contentType?.includes("application/json")) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        errorMessage = await response.text()
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // Handle successful response
    if (contentType?.includes("application/json")) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const textData = await response.text()
      return NextResponse.json({ message: textData })
    }
  } catch (error) {
    console.error("[Flow360 API Error] Create shift:", error)
    return NextResponse.json({ error: "Network error creating shift" }, { status: 500 })
  }
}
