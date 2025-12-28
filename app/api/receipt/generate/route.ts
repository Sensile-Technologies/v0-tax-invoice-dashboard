import { NextResponse } from "next/server"
import { Pool } from "pg"
import jsPDF from "jspdf"
import QRCode from "qrcode"

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
                b.phone as branch_phone,
                n.nozzle_number, d.dispenser_number,
                i.item_name, i.item_code
         FROM sales s
         LEFT JOIN branches b ON s.branch_id = b.id
         LEFT JOIN nozzles n ON s.nozzle_id = n.id
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         LEFT JOIN items i ON UPPER(s.fuel_type) = UPPER(i.item_name) AND i.branch_id = s.branch_id
         WHERE s.id = $1`,
        [sale_id]
      )

      if (saleResult.rows.length === 0) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 })
      }

      const sale = saleResult.rows[0]
      
      const isCreditNote = sale.sale_type === 'credit_note' || 
                           sale.invoice_number?.includes('-CR') || 
                           parseFloat(sale.total_amount) < 0
      
      const pageWidth = 80
      const doc = new jsPDF({ unit: 'mm', format: [pageWidth, 280] })
      
      let y = 8
      const leftMargin = 5
      const rightMargin = pageWidth - 5
      const contentWidth = rightMargin - leftMargin

      const drawLine = () => {
        doc.setDrawColor(0)
        doc.setLineWidth(0.1)
        doc.line(leftMargin, y, rightMargin, y)
        y += 3
      }

      const drawDottedLine = () => {
        doc.setDrawColor(150)
        doc.setLineWidth(0.1)
        for (let x = leftMargin; x < rightMargin; x += 2) {
          doc.line(x, y, x + 1, y)
        }
        y += 3
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(isCreditNote ? "CREDIT NOTE" : "TAX INVOICE", pageWidth / 2, y, { align: "center" })
      y += 6

      doc.setFontSize(10)
      doc.text(sale.branch_name || "Flow360 Station", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      if (sale.branch_address) {
        doc.text(sale.branch_address, pageWidth / 2, y, { align: "center" })
        y += 3
      }
      if (sale.branch_phone) {
        doc.text(`Tel: ${sale.branch_phone}`, pageWidth / 2, y, { align: "center" })
        y += 3
      }
      
      doc.setFont("helvetica", "bold")
      doc.text(`PIN: ${sale.kra_pin || 'P052344628B'}`, pageWidth / 2, y, { align: "center" })
      y += 5

      drawLine()

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("Welcome to our shop", pageWidth / 2, y, { align: "center" })
      y += 4

      drawLine()

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("BUYER INFORMATION", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(`Buyer PIN:`, leftMargin, y)
      doc.text(sale.customer_pin || "NOT PROVIDED", leftMargin + 22, y)
      y += 3
      doc.text(`Buyer Name:`, leftMargin, y)
      doc.text(sale.customer_name || "Walk-in Customer", leftMargin + 22, y)
      y += 4

      drawLine()

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("PRODUCT DETAILS", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      
      const unitPrice = parseFloat(sale.unit_price) || 0
      const quantity = parseFloat(sale.quantity) || 0
      const totalAmount = parseFloat(sale.total_amount) || 0
      const taxableAmount = totalAmount / 1.16
      const vatAmount = totalAmount - taxableAmount

      doc.text(`Item Code:`, leftMargin, y)
      doc.text(sale.item_code || sale.fuel_type || "N/A", leftMargin + 22, y)
      y += 3
      doc.text(`Description:`, leftMargin, y)
      doc.text(sale.item_name || sale.fuel_type || "Fuel", leftMargin + 22, y)
      y += 3
      doc.text(`Dispenser:`, leftMargin, y)
      doc.text(`D${sale.dispenser_number || '0'}N${sale.nozzle_number || '1'}`, leftMargin + 22, y)
      y += 3
      doc.text(`Unit Price:`, leftMargin, y)
      doc.text(`KES ${unitPrice.toFixed(2)}`, leftMargin + 22, y)
      y += 3
      doc.text(`Quantity:`, leftMargin, y)
      doc.text(`${quantity.toFixed(3)} L`, leftMargin + 22, y)
      y += 3
      doc.text(`Discount:`, leftMargin, y)
      doc.text("(0.00)", leftMargin + 22, y)
      y += 4
      
      doc.setFont("helvetica", "bold")
      doc.text(`Total:`, leftMargin, y)
      doc.text(`KES ${totalAmount.toFixed(2)}`, leftMargin + 22, y)
      y += 5

      drawLine()

      doc.setFontSize(8)
      doc.text("TAX BREAKDOWN", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(6)
      doc.setFont("helvetica", "bold")
      doc.text("Rate", leftMargin, y)
      doc.text("Taxable", leftMargin + 20, y)
      doc.text("VAT", leftMargin + 45, y)
      y += 3

      drawDottedLine()

      doc.setFont("helvetica", "normal")
      doc.text("EX", leftMargin, y)
      doc.text("KES 0.00", leftMargin + 20, y)
      doc.text("KES 0.00", leftMargin + 45, y)
      y += 3

      doc.text("16%", leftMargin, y)
      doc.text(`KES ${taxableAmount.toFixed(2)}`, leftMargin + 20, y)
      doc.text(`KES ${vatAmount.toFixed(2)}`, leftMargin + 45, y)
      y += 3

      doc.text("0%", leftMargin, y)
      doc.text("KES 0.00", leftMargin + 20, y)
      doc.text("KES 0.00", leftMargin + 45, y)
      y += 4

      drawLine()

      doc.setFontSize(7)
      const saleDate = new Date(sale.sale_date)
      const dateStr = saleDate.toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const timeStr = saleDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      
      doc.text(`Date:`, leftMargin, y)
      doc.text(dateStr, leftMargin + 22, y)
      y += 3
      doc.text(`Time:`, leftMargin, y)
      doc.text(timeStr, leftMargin + 22, y)
      y += 4

      drawLine()

      doc.setFontSize(6)
      doc.text(`SCU ID:`, leftMargin, y)
      doc.text(sale.kra_scu_id || "N/A", leftMargin + 18, y)
      y += 3
      doc.text(`CU INV NO:`, leftMargin, y)
      doc.text(sale.kra_cu_inv || "N/A", leftMargin + 18, y)
      y += 3
      doc.text(`Internal Data:`, leftMargin, y)
      doc.text(sale.kra_internal_data || sale.invoice_number || "N/A", leftMargin + 18, y)
      y += 4

      drawLine()

      const kraPin = sale.kra_pin || 'P052344628B'
      const bhfId = sale.bhf_id || '03'
      const rcptSign = sale.kra_rcpt_sign || ''
      
      const qrData = `${kraPin}${bhfId}${rcptSign}`
      const kraPortal = process.env.NODE_ENV === 'production' ? 'etims.kra.go.ke' : 'etims-sbx.kra.go.ke'
      const qrUrl = `https://${kraPortal}/common/link/etims/receipt/indexEtimsReceiptData?Data=${qrData}`

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("KRA eTIMS Verification", pageWidth / 2, y, { align: "center" })
      y += 5

      try {
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 150,
          margin: 1,
          errorCorrectionLevel: 'M'
        })
        
        const qrSize = 30
        const qrX = (pageWidth - qrSize) / 2
        doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize)
        y += qrSize + 3
      } catch (qrError) {
        console.error("QR Code generation error:", qrError)
        doc.setFontSize(6)
        doc.setFont("helvetica", "normal")
        doc.text("QR Code unavailable", pageWidth / 2, y + 10, { align: "center" })
        y += 20
      }

      doc.setFontSize(5)
      doc.setFont("helvetica", "normal")
      doc.text("Scan to verify with KRA eTIMS", pageWidth / 2, y, { align: "center" })
      y += 4

      drawLine()

      doc.setFontSize(7)
      const receiptNo = sale.kra_cu_inv?.split('/')[1] || sale.invoice_number?.replace('INV-', '') || String(sale.id).substring(0, 8)
      doc.text(`Receipt No:`, leftMargin, y)
      doc.text(receiptNo, leftMargin + 22, y)
      y += 3
      doc.text(`Served by:`, leftMargin, y)
      doc.text(sale.cashier_name || "System", leftMargin + 22, y)
      y += 3
      doc.text(`Payment:`, leftMargin, y)
      doc.text(sale.payment_method || "Cash", leftMargin + 22, y)
      y += 4

      drawLine()

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("Carbon Emission Details", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      const co2PerLitre = sale.fuel_type?.toLowerCase().includes('diesel') ? 2.68 : 2.31
      const totalCo2 = quantity * co2PerLitre
      doc.text(`CO2 Per Litre:`, leftMargin, y)
      doc.text(`${co2PerLitre.toFixed(2)} kg`, leftMargin + 22, y)
      y += 3
      doc.text(`Total CO2:`, leftMargin, y)
      doc.text(`${totalCo2.toFixed(2)} kg`, leftMargin + 22, y)
      y += 4

      drawLine()

      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("THANK YOU FOR SHOPPING WITH US", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("Powered by Flow360", pageWidth / 2, y, { align: "center" })
      y += 4

      drawLine()

      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
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
