import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("contract") as File | null
    const leadId = formData.get("leadId") as string | null

    console.log("[Upload Contract] Received request for leadId:", leadId, "file:", file?.name)

    if (!file || !(file instanceof File)) {
      console.log("[Upload Contract] No contract file provided")
      return NextResponse.json({ error: "No contract file provided" }, { status: 400 })
    }

    if (!leadId) {
      console.log("[Upload Contract] No lead ID provided")
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${leadId}_${timestamp}_${sanitizedFileName}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "contracts")
    const filePath = path.join(uploadDir, fileName)

    await mkdir(uploadDir, { recursive: true })

    await writeFile(filePath, buffer)
    console.log("[Upload Contract] File saved to:", filePath)

    const contractUrl = `/uploads/contracts/${fileName}`

    const result = await query(`
      UPDATE leads 
      SET contract_url = $1, stage = 'onboarding', updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [contractUrl, leadId])

    if (result.length === 0) {
      console.log("[Upload Contract] Lead not found:", leadId)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    console.log("[Upload Contract] Contract uploaded successfully for lead:", leadId)
    return NextResponse.json({ 
      success: true, 
      contract_url: contractUrl,
      lead: result[0]
    })
  } catch (error: any) {
    console.error("[Upload Contract] Error uploading contract:", error.message, error.stack)
    return NextResponse.json({ error: "Failed to upload contract: " + error.message }, { status: 500 })
  }
}
