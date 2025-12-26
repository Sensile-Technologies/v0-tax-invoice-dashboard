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
    const { credit_note_id, branch_id } = body

    if (!credit_note_id || !branch_id) {
      return NextResponse.json({ error: "Missing credit_note_id or branch_id" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const creditNoteResult = await client.query(
        `SELECT cn.*, b.name as branch_name, b.kra_pin, b.bhf_id, b.address as branch_address,
                b.phone as branch_phone,
                s.fuel_type, s.quantity as original_qty, s.unit_price, s.invoice_number as original_invoice,
                i.item_name, i.item_code
         FROM credit_notes cn
         LEFT JOIN branches b ON cn.branch_id = b.id
         LEFT JOIN sales s ON cn.sale_id = s.id
         LEFT JOIN items i ON UPPER(s.fuel_type) = UPPER(i.item_name) AND i.branch_id = s.branch_id
         WHERE cn.id = $1`,
        [credit_note_id]
      )

      if (creditNoteResult.rows.length === 0) {
        return NextResponse.json({ error: "Credit note not found" }, { status: 404 })
      }

      const cn = creditNoteResult.rows[0]
      
      const pageWidth = 80
      const doc = new jsPDF({ unit: 'mm', format: [pageWidth, 280] })
      
      let y = 8
      const leftMargin = 5
      const rightMargin = pageWidth - 5

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
      doc.text("CREDIT NOTE", pageWidth / 2, y, { align: "center" })
      y += 6

      doc.setFontSize(10)
      doc.text(cn.branch_name || "Flow360 Station", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      if (cn.branch_address) {
        doc.text(cn.branch_address, pageWidth / 2, y, { align: "center" })
        y += 3
      }
      if (cn.branch_phone) {
        doc.text(`Tel: ${cn.branch_phone}`, pageWidth / 2, y, { align: "center" })
        y += 3
      }
      
      doc.setFont("helvetica", "bold")
      doc.text(`PIN: ${cn.kra_pin || 'P052344628B'}`, pageWidth / 2, y, { align: "center" })
      y += 5

      drawLine()

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("Refund/Credit Note", pageWidth / 2, y, { align: "center" })
      y += 4

      drawLine()

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("BUYER INFORMATION", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(`Buyer PIN:`, leftMargin, y)
      doc.text(cn.customer_tin || "NOT PROVIDED", leftMargin + 22, y)
      y += 3
      doc.text(`Buyer Name:`, leftMargin, y)
      doc.text(cn.customer_name || "Walk-in Customer", leftMargin + 22, y)
      y += 4

      drawLine()

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("ORIGINAL SALE REFERENCE", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(`Original Invoice:`, leftMargin, y)
      doc.text(cn.original_invoice || cn.original_invoice_no?.toString() || "N/A", leftMargin + 25, y)
      y += 4

      drawLine()

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("REFUND DETAILS", pageWidth / 2, y, { align: "center" })
      y += 4

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      
      const refundAmount = parseFloat(cn.refund_amount) || parseFloat(cn.amount) || 0
      const quantity = parseFloat(cn.refund_quantity) || parseFloat(cn.original_qty) || 0
      const unitPrice = parseFloat(cn.unit_price) || 0
      const taxableAmount = refundAmount / 1.16
      const vatAmount = refundAmount - taxableAmount

      doc.text(`Item Code:`, leftMargin, y)
      doc.text(cn.item_code || cn.fuel_type || "N/A", leftMargin + 22, y)
      y += 3
      doc.text(`Description:`, leftMargin, y)
      doc.text(cn.item_name || cn.fuel_type || "Fuel", leftMargin + 22, y)
      y += 3
      doc.text(`Unit Price:`, leftMargin, y)
      doc.text(`KES ${unitPrice.toFixed(2)}`, leftMargin + 22, y)
      y += 3
      doc.text(`Quantity:`, leftMargin, y)
      doc.text(`${quantity.toFixed(2)} L`, leftMargin + 22, y)
      y += 3
      doc.text(`Reason:`, leftMargin, y)
      doc.text(cn.refund_reason || cn.reason || "Customer Request", leftMargin + 22, y)
      y += 4
      
      doc.setFont("helvetica", "bold")
      doc.text(`Refund Total:`, leftMargin, y)
      doc.text(`KES ${refundAmount.toFixed(2)}`, leftMargin + 25, y)
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
      const cnDate = new Date(cn.created_at || cn.credit_note_date)
      const dateStr = cnDate.toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const timeStr = cnDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      
      doc.text(`Date:`, leftMargin, y)
      doc.text(dateStr, leftMargin + 22, y)
      y += 3
      doc.text(`Time:`, leftMargin, y)
      doc.text(timeStr, leftMargin + 22, y)
      y += 4

      drawLine()

      doc.setFontSize(6)
      doc.text(`SCU ID:`, leftMargin, y)
      doc.text(cn.kra_scu_id || "N/A", leftMargin + 18, y)
      y += 3
      doc.text(`CU INV NO:`, leftMargin, y)
      doc.text(cn.kra_cu_inv || "N/A", leftMargin + 18, y)
      y += 3
      doc.text(`Credit Note No:`, leftMargin, y)
      doc.text(cn.credit_note_number || cn.id?.substring(0, 8) || "N/A", leftMargin + 22, y)
      y += 4

      drawLine()

      const kraPin = cn.kra_pin || 'P052344628B'
      const bhfId = cn.bhf_id || '03'
      const rcptSign = cn.kra_rcpt_sign || ''
      
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
      doc.text(`Credit Note No:`, leftMargin, y)
      doc.text(cn.credit_note_number || `CR-${cn.id?.substring(0, 8)}`, leftMargin + 25, y)
      y += 3
      doc.text(`Processed by:`, leftMargin, y)
      doc.text(cn.processed_by || "System", leftMargin + 25, y)
      y += 4

      drawLine()

      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("REFUND PROCESSED", pageWidth / 2, y, { align: "center" })
      y += 5

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("Powered by Flow360", pageWidth / 2, y, { align: "center" })
      y += 4

      drawLine()

      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("END OF CREDIT NOTE", pageWidth / 2, y, { align: "center" })

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="credit-note-${cn.credit_note_number || cn.id}.pdf"`,
        },
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Credit Note Receipt API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to generate credit note receipt" }, { status: 500 })
  }
}
