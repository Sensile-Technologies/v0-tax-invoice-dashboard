import { NextResponse } from "next/server"
import { Pool } from "pg"
import jsPDF from "jspdf"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sale_id, branch_id } = body

    if (!sale_id || !branch_id) {
      return NextResponse.json({ error: "Missing sale_id or branch_id" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const saleResult = await client.query(
        `SELECT s.*, b.name as branch_name, b.kra_pin, b.bhf_id, b.address as branch_address,
                n.nozzle_number, d.dispenser_number
         FROM sales s
         LEFT JOIN branches b ON s.branch_id = b.id
         LEFT JOIN nozzles n ON s.nozzle_id = n.id
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         WHERE s.id = $1`,
        [sale_id]
      )

      if (saleResult.rows.length === 0) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 })
      }

      const sale = saleResult.rows[0]
      const doc = new jsPDF({ unit: 'mm', format: [80, 200] })
      
      const pageWidth = 80
      let y = 5

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("TAX INVOICE", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text(sale.branch_name || "Flow360 Station", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(sale.branch_address || "Branch Address", pageWidth / 2, y, { align: "center" })
      y += 4
      doc.text(`PIN: ${sale.kra_pin || 'N/A'}`, pageWidth / 2, y, { align: "center" })
      y += 5

      doc.setLineWidth(0.1)
      doc.line(3, y, pageWidth - 3, y)
      y += 3

      doc.text("Welcome to our shop", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFont("helvetica", "bold")
      doc.text("BUYER INFORMATION", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFont("helvetica", "normal")
      doc.text(`Buyer PIN:     ${sale.customer_pin || 'NOT PROVIDED'}`, 5, y)
      y += 3
      doc.text(`Buyer Name:    ${sale.customer_name || 'Walk-in Customer'}`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFont("helvetica", "bold")
      doc.text("PRODUCT DETAILS", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFont("helvetica", "normal")
      doc.text(`Fuel Type:     ${sale.fuel_type}`, 5, y)
      y += 3
      doc.text(`Dispenser:     D${sale.dispenser_number || '00'}${sale.nozzle_number ? `N${sale.nozzle_number}` : ''}`, 5, y)
      y += 3
      doc.text(`Nozzle No:     ${sale.nozzle_number || '1'}`, 5, y)
      y += 3
      
      const unitPrice = parseFloat(sale.unit_price) || 0
      const quantity = parseFloat(sale.quantity) || 0
      const totalAmount = parseFloat(sale.total_amount) || 0
      
      doc.text(`Unit Price:    KES ${unitPrice.toFixed(2)}`, 5, y)
      y += 3
      doc.text(`Quantity:      ${quantity.toFixed(2)}L`, 5, y)
      y += 4

      doc.text(`Discount:      (0.00)`, 5, y)
      y += 3
      doc.setFont("helvetica", "bold")
      doc.text(`Total:         KES ${totalAmount.toFixed(2)}`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFont("helvetica", "bold")
      doc.text("TAX BREAKDOWN", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFont("helvetica", "normal")
      doc.setFontSize(6)
      doc.text("Rate        Taxable        VAT", 5, y)
      y += 3
      doc.line(3, y, pageWidth - 3, y)
      y += 3

      const taxableAmount = totalAmount / 1.16
      const vatAmount = totalAmount - taxableAmount

      doc.text(`EX          KES 0.00       KES 0.00`, 5, y)
      y += 3
      doc.text(`16%         KES ${taxableAmount.toFixed(2)}   KES ${vatAmount.toFixed(2)}`, 5, y)
      y += 3
      doc.text(`0%          KES 0.00       KES 0.00`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFontSize(7)
      const saleDate = new Date(sale.sale_date)
      const dateStr = saleDate.toISOString().split('T')[0]
      const timeStr = saleDate.toTimeString().split(' ')[0]
      
      doc.text(`Date:      ${dateStr} ${timeStr.substring(0, 5)}`, 5, y)
      y += 3
      doc.text(`Time:      ${timeStr}`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.text(`SCU ID: ${sale.kra_scu_id || 'N/A'}`, 5, y)
      y += 3
      doc.text(`CU INV: ${sale.kra_cu_inv || 'N/A'}`, 5, y)
      y += 3
      doc.text(`Internal: ${sale.kra_internal_data || sale.invoice_number || 'N/A'}`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFont("helvetica", "bold")
      doc.text("KRA eTIMS QR Code:", pageWidth / 2, y, { align: "center" })
      y += 8

      const kraPin = sale.kra_pin || ''
      const bhfId = sale.bhf_id || '00'
      const rcptSign = sale.kra_rcpt_sign || ''
      const qrData = `${kraPin}${bhfId}${rcptSign}`
      const qrUrl = `https://etims-sbx.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=${qrData}`

      const qrSize = 25
      const qrX = (pageWidth - qrSize) / 2
      
      doc.setDrawColor(0)
      doc.setFillColor(255, 255, 255)
      doc.rect(qrX, y, qrSize, qrSize, 'FD')

      doc.setFontSize(4)
      doc.setFont("helvetica", "normal")
      
      const chars = qrData.substring(0, 100)
      const gridSize = 10
      const cellSize = qrSize / gridSize
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const charIndex = row * gridSize + col
          if (charIndex < chars.length) {
            const charCode = chars.charCodeAt(charIndex)
            if (charCode % 2 === 0) {
              doc.setFillColor(0)
              doc.rect(qrX + col * cellSize, y + row * cellSize, cellSize, cellSize, 'F')
            }
          }
        }
      }
      
      y += qrSize + 4

      doc.setFontSize(6)
      doc.text("Scan to verify with KRA eTIMS", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      const receiptNo = sale.kra_cu_inv?.split('/')[1] || sale.invoice_number?.replace('INV-', '') || 'N/A'
      doc.setFontSize(7)
      doc.text(`Receipt No           ${receiptNo}`, 5, y)
      y += 3
      doc.text(`Served by            System`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFont("helvetica", "bold")
      doc.text("Carbon Emission Details", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFont("helvetica", "normal")
      const co2PerLitre = 2.7
      const totalCo2 = quantity * co2PerLitre
      doc.text(`CO2 Per Litre        ${co2PerLitre.toFixed(2)}kg`, 5, y)
      y += 3
      doc.text(`Total CO2            ${totalCo2.toFixed(2)}kg`, 5, y)
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 4

      doc.setFont("helvetica", "bold")
      doc.text("THANK YOU FOR SHOPPING WITH US", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.setFont("helvetica", "normal")
      doc.text("Powered by Flow360", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.line(3, y, pageWidth - 3, y)
      y += 3

      doc.text("END OF LEGAL RECEIPT", pageWidth / 2, y, { align: "center" })

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="receipt-${sale.invoice_number || sale.id}.pdf"`,
        },
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Receipt Generate API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to generate receipt" }, { status: 500 })
  }
}
