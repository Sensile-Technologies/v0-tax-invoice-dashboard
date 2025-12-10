import * as XLSX from "xlsx"

export interface ShiftCloseData {
  date: string
  shift: string
  nozzle_id: string
  nozzle_meter_reading: number
  tank_id: string
  tank_volume: number
}

export function generateShiftCloseTemplate(branchName?: string): void {
  const headers = ["Date", "Shift", "Nozzle ID", "Nozzle Meter Reading (Litres)", "Tank ID", "Tank Volume (Litres)"]

  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, branchName || "Shift Close")

  // Generate buffer and trigger download
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([wbout], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `shift_close_template_${branchName || "branch"}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateGlobalShiftCloseTemplate(branches: { name: string }[]): void {
  const workbook = XLSX.utils.book_new()

  const headers = ["Date", "Shift", "Nozzle ID", "Nozzle Meter Reading (Litres)", "Tank ID", "Tank Volume (Litres)"]

  branches.forEach((branch) => {
    // Add branch name as first row
    const branchNameRow = [branch.name]
    const worksheet = XLSX.utils.aoa_to_sheet([branchNameRow, headers])
    XLSX.utils.book_append_sheet(workbook, worksheet, branch.name.substring(0, 31)) // Excel sheet name limit
  })

  // Generate buffer and trigger download
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([wbout], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "global_shift_close_template.xlsx"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseShiftCloseExcel(file: File): Promise<Map<string, ShiftCloseData[]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        const shiftDataByBranch = new Map<string, ShiftCloseData[]>()

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

          // Check if first row is branch name (for global uploads)
          let branchName = sheetName
          let dataStartRow = 1 // Skip header

          if (jsonData.length > 0 && jsonData[0].length === 1) {
            // First row is branch name
            branchName = jsonData[0][0]
            dataStartRow = 2 // Skip branch name and header
          }

          const shiftData: ShiftCloseData[] = []

          for (let i = dataStartRow; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (row && row.length >= 6) {
              shiftData.push({
                date: row[0],
                shift: row[1],
                nozzle_id: row[2],
                nozzle_meter_reading: Number.parseFloat(row[3]),
                tank_id: row[4],
                tank_volume: Number.parseFloat(row[5]),
              })
            }
          }

          if (shiftData.length > 0) {
            shiftDataByBranch.set(branchName, shiftData)
          }
        })

        resolve(shiftDataByBranch)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}
