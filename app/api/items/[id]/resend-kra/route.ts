import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      )
    }

    const itemResult = await query(`
      SELECT id, branch_id FROM items WHERE id = $1
    `, [id])

    if (itemResult.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    const item = itemResult[0]

    if (!item.branch_id) {
      return NextResponse.json(
        { error: "Item does not have a branch assigned" },
        { status: 400 }
      )
    }

    console.log(`[Items API] Resending item ${id} to KRA via middleware`)

    const baseUrl = request.nextUrl.origin
    const response = await fetch(`${baseUrl}/api/kra/items/saveItems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: id,
        branchId: item.branch_id
      })
    })

    const result = await response.json()

    console.log(`[Items API] KRA middleware result for ${id}:`, result)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Error resending item to KRA:", error)
    return NextResponse.json(
      { error: "Failed to resend item to KRA", details: error.message },
      { status: 500 }
    )
  }
}
