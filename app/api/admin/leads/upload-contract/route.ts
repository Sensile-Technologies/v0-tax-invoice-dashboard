import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("contract") as File
    const leadId = formData.get("leadId") as string

    if (!file) {
      return NextResponse.json({ error: "No contract file provided" }, { status: 400 })
    }

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${leadId}_${timestamp}_${sanitizedFileName}`
    const filePath = path.join(process.cwd(), "public", "uploads", "contracts", fileName)

    await writeFile(filePath, buffer)

    const contractUrl = `/uploads/contracts/${fileName}`

    const result = await query(`
      UPDATE leads 
      SET contract_url = $1, stage = 'onboarding', updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [contractUrl, leadId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      contractUrl,
      lead: result[0]
    })
  } catch (error) {
    console.error("Error uploading contract:", error)
    return NextResponse.json({ error: "Failed to upload contract" }, { status: 500 })
  }
}
