import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { branch_id, hardware_type, serial_number } = body

    // Insert hardware into database
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/hardware`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        branch_id,
        hardware_type,
        serial_number,
        status: "active",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Error creating hardware:", error)
      return NextResponse.json({ error: "Failed to create hardware" }, { status: 500 })
    }

    const hardware = await response.json()

    return NextResponse.json({ success: true, hardware: hardware[0] })
  } catch (error) {
    console.error("[v0] Error in hardware creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
