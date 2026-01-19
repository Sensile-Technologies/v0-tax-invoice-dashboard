import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { split_denominations } = body

    if (typeof split_denominations !== "boolean") {
      return NextResponse.json(
        { success: false, error: "split_denominations must be a boolean" },
        { status: 400 }
      )
    }

    await query(
      `UPDATE branches SET split_denominations = $1 WHERE id = $2`,
      [split_denominations, id]
    )

    return NextResponse.json({
      success: true,
      message: `Split denominations ${split_denominations ? "enabled" : "disabled"}`
    })
  } catch (error) {
    console.error("Error saving split denominations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save setting" },
      { status: 500 }
    )
  }
}
