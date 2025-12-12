import { NextResponse } from "next/server"
import { callKraTestSalesEndpoint } from "@/lib/kra-sales-api"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[KRA Test Sale] Request body:", JSON.stringify(body, null, 2))
    
    const {
      branch_id,
      invoice_number,
      receipt_number,
      fuel_type,
      quantity,
      unit_price,
      total_amount,
      payment_method,
      customer_name,
      customer_pin,
    } = body

    if (!branch_id || !invoice_number || !fuel_type || !total_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("[KRA Test Sale] Calling KRA endpoint for invoice:", invoice_number)
    
    const kraResult = await callKraTestSalesEndpoint({
      branch_id,
      invoice_number,
      receipt_number: receipt_number || invoice_number,
      fuel_type,
      quantity: quantity || 0,
      unit_price: unit_price || 0,
      total_amount,
      payment_method: payment_method || 'cash',
      customer_name: customer_name || 'Walk-in Customer',
      customer_pin: customer_pin || '',
      sale_date: new Date().toISOString()
    })

    console.log("[KRA Test Sale] KRA API Response:", JSON.stringify(kraResult, null, 2))

    return NextResponse.json({
      success: kraResult.success,
      kra_response: kraResult.kraResponse,
      error: kraResult.error
    })

  } catch (error: any) {
    console.error("[KRA Test Sale API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to call KRA endpoint" },
      { status: 500 }
    )
  }
}
