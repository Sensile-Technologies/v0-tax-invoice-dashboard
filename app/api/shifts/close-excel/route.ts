import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

interface ShiftCloseData {
  date: string
  shift: string
  nozzle_id: string
  nozzle_meter_reading: number
  tank_id: string
  tank_volume: number
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const branchId = formData.get("branchId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!branchId) {
      return NextResponse.json({ error: "No branch ID provided" }, { status: 400 })
    }

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: "array" })

    const supabase = await createClient()
    const results: any[] = []
    const errors: string[] = []

    // Process each sheet (for global uploads, each sheet is a branch)
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      // Check if first row is branch name
      let currentBranchName = sheetName
      let dataStartRow = 1 // Skip header

      if (jsonData.length > 0 && jsonData[0].length === 1) {
        currentBranchName = jsonData[0][0]
        dataStartRow = 2
      }

      // Get branch ID from name
      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("id")
        .eq("name", currentBranchName)
        .single()

      if (branchError || !branchData) {
        errors.push(`Branch "${currentBranchName}" not found`)
        continue
      }

      const processingBranchId = branchData.id

      // Find active shift for this branch
      const { data: activeShift, error: shiftError } = await supabase
        .from("shifts")
        .select("id")
        .eq("branch_id", processingBranchId)
        .eq("status", "active")
        .single()

      if (shiftError || !activeShift) {
        errors.push(`No active shift found for branch "${currentBranchName}"`)
        continue
      }

      // Process shift close data
      const updates: any[] = []

      for (let i = dataStartRow; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row || row.length < 6) continue

        const shiftData: ShiftCloseData = {
          date: row[0],
          shift: row[1],
          nozzle_id: row[2],
          nozzle_meter_reading: Number.parseFloat(row[3]),
          tank_id: row[4],
          tank_volume: Number.parseFloat(row[5]),
        }

        // Update nozzle meter reading
        const { error: nozzleError } = await supabase
          .from("nozzles")
          .update({ initial_meter_reading: shiftData.nozzle_meter_reading })
          .eq("id", shiftData.nozzle_id)

        if (nozzleError) {
          errors.push(`Failed to update nozzle ${shiftData.nozzle_id}: ${nozzleError.message}`)
        }

        // Update tank volume
        const { error: tankError } = await supabase
          .from("tanks")
          .update({ current_stock: shiftData.tank_volume })
          .eq("id", shiftData.tank_id)

        if (tankError) {
          errors.push(`Failed to update tank ${shiftData.tank_id}: ${tankError.message}`)
        }

        updates.push({ nozzle: shiftData.nozzle_id, tank: shiftData.tank_id })
      }

      // Close the shift
      const { error: closeError } = await supabase
        .from("shifts")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
        })
        .eq("id", activeShift.id)

      if (closeError) {
        errors.push(`Failed to close shift for branch "${currentBranchName}": ${closeError.message}`)
      } else {
        results.push({
          branch: currentBranchName,
          shiftId: activeShift.id,
          updates: updates.length,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} branch(es)`,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Shift close error:", error)
    return NextResponse.json(
      { error: "Failed to process shift close", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
