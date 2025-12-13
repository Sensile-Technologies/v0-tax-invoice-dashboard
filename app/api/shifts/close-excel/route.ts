import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import * as XLSX from "xlsx"
import { randomUUID } from "crypto"

interface ShiftCloseData {
  date: string
  shift: string
  nozzle_id: string
  nozzle_meter_reading: number
  tank_id: string
  tank_volume: number
}

interface SaleRecord {
  branch_id: string
  shift_id: string
  nozzle_id: string
  quantity: number
  unit_price: number
  total_amount: number
  fuel_type: string
  meter_reading_after: number
}

function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const uuid = randomUUID().slice(0, 8).toUpperCase()
  return `SHIFT-${dateStr}-${uuid}`
}

function generateReceiptNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const uuid = randomUUID().slice(0, 8).toUpperCase()
  return `RCP-${dateStr}-${uuid}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData() as unknown as globalThis.FormData
    const file = formData.get("file") as File
    const branchId = formData.get("branchId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!branchId) {
      return NextResponse.json({ error: "No branch ID provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: "array" })

    const results: any[] = []
    const errors: string[] = []

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      let currentBranchName = sheetName
      let dataStartRow = 1

      if (jsonData.length > 0 && jsonData[0].length === 1) {
        currentBranchName = jsonData[0][0]
        dataStartRow = 2
      }

      const branchResult = await query(
        `SELECT id FROM branches WHERE name = $1`,
        [currentBranchName]
      )

      if (branchResult.length === 0) {
        errors.push(`Branch "${currentBranchName}" not found`)
        continue
      }

      const processingBranchId = branchResult[0].id

      const shiftResult = await query(
        `SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active' LIMIT 1`,
        [processingBranchId]
      )

      if (shiftResult.length === 0) {
        errors.push(`No active shift found for branch "${currentBranchName}"`)
        continue
      }

      const activeShiftId = shiftResult[0].id
      
      const pendingNozzleUpdates: { nozzleId: string; newReading: number; quantitySold: number; fuelType: string; unitPrice: number }[] = []
      const pendingTankUpdates: { tankId: string; volume: number }[] = []
      let branchHasErrors = false
      const branchValidationErrors: string[] = []

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

        if (isNaN(shiftData.nozzle_meter_reading)) {
          branchValidationErrors.push(`Row ${i + 1}: Invalid meter reading value`)
          branchHasErrors = true
          continue
        }

        try {
          const nozzleResult = await query(
            `SELECT id, initial_meter_reading, fuel_type FROM nozzles WHERE id = $1`,
            [shiftData.nozzle_id]
          )

          if (nozzleResult.length === 0) {
            branchValidationErrors.push(`Row ${i + 1}: Nozzle ${shiftData.nozzle_id} not found`)
            branchHasErrors = true
            continue
          }

          const nozzle = nozzleResult[0]
          const oldReading = parseFloat(nozzle.initial_meter_reading) || 0
          const newReading = shiftData.nozzle_meter_reading
          const quantitySold = newReading - oldReading

          if (quantitySold < 0) {
            branchValidationErrors.push(`Row ${i + 1}: New meter reading (${newReading}) is less than previous reading (${oldReading}) for nozzle ${shiftData.nozzle_id}`)
            branchHasErrors = true
            continue
          }

          if (quantitySold === 0) {
            branchValidationErrors.push(`Row ${i + 1}: Zero quantity difference for nozzle ${shiftData.nozzle_id}. No sale recorded, meter not updated.`)
            continue
          }

          const priceResult = await query(
            `SELECT price FROM fuel_prices 
             WHERE branch_id = $1 AND fuel_type = $2 
             ORDER BY effective_date DESC LIMIT 1`,
            [processingBranchId, nozzle.fuel_type]
          )

          if (priceResult.length === 0) {
            branchValidationErrors.push(`Row ${i + 1}: No fuel price configured for ${nozzle.fuel_type} at branch "${currentBranchName}"`)
            branchHasErrors = true
            continue
          }

          const unitPrice = parseFloat(priceResult[0].price)
          if (unitPrice <= 0) {
            branchValidationErrors.push(`Row ${i + 1}: Invalid fuel price (${unitPrice}) for ${nozzle.fuel_type}`)
            branchHasErrors = true
            continue
          }

          pendingNozzleUpdates.push({
            nozzleId: shiftData.nozzle_id,
            newReading,
            quantitySold,
            fuelType: nozzle.fuel_type,
            unitPrice
          })

          if (shiftData.tank_id && !isNaN(shiftData.tank_volume) && shiftData.tank_volume >= 0) {
            pendingTankUpdates.push({
              tankId: shiftData.tank_id,
              volume: shiftData.tank_volume
            })
          }

        } catch (error: any) {
          branchValidationErrors.push(`Row ${i + 1}: Error processing - ${error.message}`)
          branchHasErrors = true
        }
      }

      if (branchHasErrors) {
        errors.push(...branchValidationErrors)
        errors.push(`Branch "${currentBranchName}": Skipped due to validation errors. No changes made.`)
        continue
      }

      if (pendingNozzleUpdates.length === 0) {
        errors.push(`Branch "${currentBranchName}": No valid meter readings with positive quantity found.`)
        continue
      }

      const branchSalesCreated: SaleRecord[] = []

      try {
        await query('BEGIN')

        for (const update of pendingNozzleUpdates) {
          const invoiceNumber = generateInvoiceNumber()
          const receiptNumber = generateReceiptNumber()
          const totalAmount = update.quantitySold * update.unitPrice

          await query(
            `INSERT INTO sales (
              branch_id, shift_id, nozzle_id, invoice_number, receipt_number,
              sale_date, fuel_type, quantity, unit_price, total_amount,
              payment_method, customer_name, meter_reading_after, transmission_status
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            )`,
            [
              processingBranchId,
              activeShiftId,
              update.nozzleId,
              invoiceNumber,
              receiptNumber,
              new Date().toISOString(),
              update.fuelType,
              update.quantitySold,
              update.unitPrice,
              totalAmount,
              'cash',
              'Shift Close - Bulk Sale',
              update.newReading,
              'pending'
            ]
          )

          await query(
            `UPDATE nozzles SET initial_meter_reading = $1 WHERE id = $2`,
            [update.newReading, update.nozzleId]
          )

          branchSalesCreated.push({
            branch_id: processingBranchId,
            shift_id: activeShiftId,
            nozzle_id: update.nozzleId,
            quantity: update.quantitySold,
            unit_price: update.unitPrice,
            total_amount: totalAmount,
            fuel_type: update.fuelType,
            meter_reading_after: update.newReading
          })
        }

        for (const tankUpdate of pendingTankUpdates) {
          await query(
            `UPDATE tanks SET current_stock = $1 WHERE id = $2`,
            [tankUpdate.volume, tankUpdate.tankId]
          )
        }

        await query(
          `UPDATE shifts SET status = 'completed', end_time = $1 WHERE id = $2`,
          [new Date().toISOString(), activeShiftId]
        )

        await query('COMMIT')

        const totalSalesAmount = branchSalesCreated.reduce((sum, s) => sum + s.total_amount, 0)
        const totalQuantity = branchSalesCreated.reduce((sum, s) => sum + s.quantity, 0)

        results.push({
          branch: currentBranchName,
          shiftId: activeShiftId,
          nozzlesUpdated: pendingNozzleUpdates.length,
          tanksUpdated: pendingTankUpdates.length,
          salesCreated: branchSalesCreated.length,
          totalSalesAmount,
          totalQuantity
        })

      } catch (error: any) {
        await query('ROLLBACK')
        errors.push(`Branch "${currentBranchName}": Transaction failed - ${error.message}. All changes rolled back.`)
      }
    }

    const totalSales = results.reduce((sum, r) => sum + r.salesCreated, 0)
    const totalAmount = results.reduce((sum, r) => sum + r.totalSalesAmount, 0)
    const totalQuantity = results.reduce((sum, r) => sum + r.totalQuantity, 0)

    return NextResponse.json({
      success: results.length > 0,
      message: `Processed ${results.length} branch(es), created ${totalSales} sales records`,
      results,
      salesSummary: {
        totalSales,
        totalAmount,
        totalQuantity
      },
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
