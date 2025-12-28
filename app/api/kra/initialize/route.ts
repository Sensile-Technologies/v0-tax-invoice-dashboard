import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildKraBaseUrl } from "@/lib/kra-url-helper"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch_id, vendor_id } = body

    if (!branch_id) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const branchResult = await query<any>(`
      SELECT 
        b.id,
        b.bhf_id,
        b.device_serial_number,
        b.server_address,
        b.server_port,
        b.kra_pin,
        v.kra_pin as vendor_kra_pin
      FROM branches b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.id = $1
    `, [branch_id])

    if (branchResult.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    const branch = branchResult[0]
    const tin = branch.kra_pin || branch.vendor_kra_pin
    const bhfId = branch.bhf_id
    const dvcSrlNo = branch.device_serial_number

    if (!tin) {
      return NextResponse.json({ error: "KRA PIN not configured for this branch" }, { status: 400 })
    }
    if (!bhfId) {
      return NextResponse.json({ error: "BHF ID not configured for this branch" }, { status: 400 })
    }
    if (!dvcSrlNo) {
      return NextResponse.json({ error: "Device Serial Number not configured for this branch" }, { status: 400 })
    }

    const kraBaseUrl = buildKraBaseUrl(branch.server_address, branch.server_port)
    const endpoint = `${kraBaseUrl}/initializer/selectInitInfo`

    const payload = {
      tin,
      bhfId,
      dvcSrlNo
    }

    let responseData: any
    let status = "success"

    try {
      const kraResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      responseData = await kraResponse.json()
      
      if (!kraResponse.ok) {
        status = "error"
      }
    } catch (fetchError: any) {
      status = "error"
      responseData = { error: fetchError.message || "Failed to connect to KRA server" }
    }

    await query(`
      INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [branch_id, "kra_initialize", endpoint, JSON.stringify(payload), JSON.stringify(responseData), status])

    return NextResponse.json({
      success: status === "success",
      endpoint,
      request: payload,
      response: responseData
    })
  } catch (error: any) {
    console.error("Error in KRA initialize:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize" }, { status: 500 })
  }
}
