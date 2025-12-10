import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { branchId, status } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    const newStatus = status === "active" ? "inactive" : "active"

    const response = await fetch(`${supabaseUrl}/rest/v1/branches?id=eq.${branchId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update branch status: ${errorText}`)
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("[Branch Deactivate Error]:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
