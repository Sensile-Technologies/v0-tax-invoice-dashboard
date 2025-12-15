import { NextRequest, NextResponse } from "next/server"
import { resendItemToKra } from "@/lib/kra-items-api"

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

    console.log(`[Items API] Resending item ${id} to KRA`)

    const result = await resendItemToKra(id)

    console.log(`[Items API] KRA resend result for ${id}:`, result)

    return NextResponse.json({
      success: result.success,
      kraResponse: result.kraResponse,
      message: result.success 
        ? "Item successfully submitted to KRA" 
        : `KRA submission failed: ${result.error || result.kraResponse?.resultMsg || 'Unknown error'}`
    })

  } catch (error: any) {
    console.error("Error resending item to KRA:", error)
    return NextResponse.json(
      { error: "Failed to resend item to KRA", details: error.message },
      { status: 500 }
    )
  }
}
