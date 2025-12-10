import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branchId, name, location, county, address, organization } = body

    console.log("[v0] Attempting backend registration with data:", {
      name,
      location,
      county,
      address,
    })

    const authToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxMDY3NjgyLCJpYXQiOjE3NjEwNjQwODIsImp0aSI6ImZiMTA2ZDI2YmIwMDQxNTU5NjU0NWViY2U0ZDhkNjgwIiwidXNlcl9pZCI6IjQifQ.uUI2bDV8WA00a9_CIr5DPf7njaO929MZnYbpqIhi3IY"

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const backendResponse = await fetch(
        "https://flow-360-backend-x6wvex-0ad73a-147-93-155-29.traefik.me/station/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            city: location,
            county: county || location,
            created_at: new Date().toISOString(),
            id: branchId,
            is_active: true,
            location: address || location,
            name: name,
            organization: organization || "35c7be82-cc63-4e9d-ac34-a79bc2d7633b",
          }),
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      console.log("[v0] Backend response status:", backendResponse.status)

      const contentType = backendResponse.headers.get("content-type")
      let responseData: any

      if (contentType?.includes("application/json")) {
        responseData = await backendResponse.json()
      } else {
        responseData = await backendResponse.text()
      }

      console.log("[v0] Backend response data:", responseData)

      if (!backendResponse.ok || (typeof responseData === "string" && responseData.toLowerCase().includes("invalid"))) {
        console.error("[Backend API Error]:", responseData)
        return NextResponse.json(
          {
            success: false,
            error: "Backend registration failed",
            details: typeof responseData === "string" ? responseData : JSON.stringify(responseData),
            status: backendResponse.status,
          },
          { status: backendResponse.ok ? 400 : backendResponse.status },
        )
      }

      return NextResponse.json({ success: true, data: responseData })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      let errorMessage = "Network error"
      if (fetchError.name === "AbortError") {
        errorMessage = "Request timed out after 10 seconds"
      } else if (fetchError.message?.includes("certificate")) {
        errorMessage = "SSL certificate validation failed"
      } else if (fetchError.message?.includes("ENOTFOUND") || fetchError.message?.includes("getaddrinfo")) {
        errorMessage = "Backend server not reachable (DNS lookup failed)"
      } else if (fetchError.message?.includes("ECONNREFUSED")) {
        errorMessage = "Backend server refused connection"
      }

      console.error("[Backend API Network Error]:", errorMessage, fetchError)

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: fetchError.message || String(fetchError),
          suggestion: "Branch created locally. Backend registration can be retried later.",
        },
        { status: 503 }, // Service Unavailable
      )
    }
  } catch (error) {
    console.error("[Backend API Exception]:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process backend registration",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
