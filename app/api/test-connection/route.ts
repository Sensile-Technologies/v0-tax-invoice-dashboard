import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, port } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Construct the full URL
    let fullUrl = url.trim()
    if (fullUrl.endsWith("/")) {
      fullUrl = fullUrl.slice(0, -1)
    }

    if (port) {
      try {
        const urlObj = new URL(fullUrl)
        urlObj.port = port
        fullUrl = urlObj.toString()
        if (fullUrl.endsWith("/")) {
          fullUrl = fullUrl.slice(0, -1)
        }
      } catch {
        fullUrl = `${fullUrl}:${port}`
      }
    }

    const testUrl = `${fullUrl}/api/health`

    console.log("[v0] Testing backend connection to:", testUrl)

    // Server-side fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const startTime = Date.now()
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const duration = Date.now() - startTime

    const responseData = await response.text()

    console.log("[v0] Backend response:", {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      data: responseData.substring(0, 200),
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration,
      data: responseData,
      url: testUrl,
    })
  } catch (error) {
    console.error("[v0] Connection test error:", error)

    let errorMessage = "Failed to connect to backend"
    let errorType = "unknown"

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out after 10 seconds"
        errorType = "timeout"
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. Server may not be running."
        errorType = "refused"
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Host not found. Check the URL."
        errorType = "notfound"
      } else if (error.message.includes("ETIMEDOUT")) {
        errorMessage = "Connection timed out. Server may be unreachable."
        errorType = "timeout"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorType,
      },
      { status: 500 },
    )
  }
}
