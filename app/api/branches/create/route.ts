import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      location,
      manager,
      email,
      phone,
      status,
      bhf_id,
      address,
      county,
      local_tax_office,
      device_token,
      storage_indices,
    } = body

    // Insert branch into database using fetch to Supabase REST API
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/branches`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name,
        location,
        address,
        manager,
        email,
        phone,
        bhf_id,
        county,
        local_tax_office,
        device_token,
        storage_indices,
        status: status || "active",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Error creating branch:", error)
      return NextResponse.json({ error: "Failed to create branch", details: error }, { status: 500 })
    }

    const branches = await response.json()
    const branch = branches[0]

    return NextResponse.json({ success: true, branch })
  } catch (error) {
    console.error("[v0] Error in branch creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
