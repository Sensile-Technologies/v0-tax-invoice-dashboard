import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const branchId = cookieStore.get("branch_id")?.value

    if (!branchId) {
      return NextResponse.json({ error: "No branch selected" }, { status: 400 })
    }

    const result = await query(`
      SELECT 
        id, name, bhf_id, device_token, server_address, server_port,
        trading_name, kra_pin, location, county, address
      FROM branches
      WHERE id = $1
    `, [branchId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching branch config:", error)
    return NextResponse.json({ error: "Failed to fetch branch configuration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const branchId = cookieStore.get("branch_id")?.value

    if (!branchId) {
      return NextResponse.json({ error: "No branch selected" }, { status: 400 })
    }

    const { server_address, server_port } = await request.json()

    const result = await query(`
      UPDATE branches 
      SET server_address = $2, server_port = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [branchId, server_address, server_port])

    if (result.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating branch config:", error)
    return NextResponse.json({ error: "Failed to update branch configuration" }, { status: 500 })
  }
}
