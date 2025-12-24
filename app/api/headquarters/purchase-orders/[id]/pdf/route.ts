import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const orderResult = await pool.query(`
      SELECT 
        po.*,
        b.name as branch_name,
        vp.name as supplier_name,
        vp.tin as supplier_tin,
        vp.address as supplier_address,
        vp.phone as supplier_phone,
        tp.name as transporter_name,
        u.username as created_by_name,
        au.username as approved_by_name
      FROM purchase_orders po
      LEFT JOIN branches b ON po.branch_id = b.id
      LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
      LEFT JOIN vendor_partners tp ON po.transporter_id = tp.id
      LEFT JOIN users u ON po.created_by = u.id
      LEFT JOIN users au ON po.approved_by = au.id
      WHERE po.id = $1
    `, [id])

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 })
    }

    const order = orderResult.rows[0]

    const itemsResult = await pool.query(`
      SELECT 
        poi.*,
        i.item_name
      FROM purchase_order_items poi
      LEFT JOIN items i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = $1
      ORDER BY poi.created_at
    `, [id])

    const items = itemsResult.rows

    const acceptanceResult = await pool.query(`
      SELECT 
        poa.*,
        u.username as accepted_by_name
      FROM purchase_order_acceptances poa
      LEFT JOIN users u ON poa.accepted_by = u.id
      WHERE poa.purchase_order_id = $1
      ORDER BY poa.acceptance_timestamp DESC
      LIMIT 1
    `, [id])

    const acceptance = acceptanceResult.rows[0] || null

    let tankReadings: any[] = []
    let dispenserReadings: any[] = []

    if (acceptance) {
      const tankResult = await pool.query(`
        SELECT 
          ptr.*,
          t.tank_name
        FROM po_acceptance_tank_readings ptr
        LEFT JOIN tanks t ON ptr.tank_id = t.id
        WHERE ptr.acceptance_id = $1
      `, [acceptance.id])
      tankReadings = tankResult.rows

      const dispenserResult = await pool.query(`
        SELECT 
          pdr.*,
          d.dispenser_number
        FROM po_acceptance_dispenser_readings pdr
        LEFT JOIN dispensers d ON pdr.dispenser_id = d.id
        WHERE pdr.acceptance_id = $1
      `, [acceptance.id])
      dispenserReadings = dispenserResult.rows
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("PURCHASE ORDER", pageWidth / 2, 20, { align: "center" })

    doc.setFontSize(14)
    doc.text(order.po_number, pageWidth / 2, 28, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    let yPos = 40

    doc.setFont("helvetica", "bold")
    doc.text("Order Details", 14, yPos)
    yPos += 6

    doc.setFont("helvetica", "normal")
    const orderDetails = [
      ["Branch:", order.branch_name || "N/A"],
      ["Supplier:", order.supplier_name || "N/A"],
      ["Supplier TIN:", order.supplier_tin || "N/A"],
      ["Status:", `${order.status} / ${order.approval_status}`],
      ["Issued Date:", order.issued_at ? new Date(order.issued_at).toLocaleDateString() : "N/A"],
      ["Expected Delivery:", order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "N/A"],
      ["Created By:", order.created_by_name || "N/A"],
    ]

    if (order.approved_by_name) {
      orderDetails.push(["Approved By:", order.approved_by_name])
    }

    orderDetails.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 14, yPos)
      yPos += 5
    })

    if (order.transporter_name || order.vehicle_registration || order.driver_name) {
      yPos += 5
      doc.setFont("helvetica", "bold")
      doc.text("Transport Details", 14, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")

      if (order.transporter_name) {
        doc.text(`Transporter: ${order.transporter_name}`, 14, yPos)
        yPos += 5
      }
      if (order.vehicle_registration) {
        doc.text(`Vehicle: ${order.vehicle_registration}`, 14, yPos)
        yPos += 5
      }
      if (order.driver_name) {
        doc.text(`Driver: ${order.driver_name} ${order.driver_phone ? `(${order.driver_phone})` : ""}`, 14, yPos)
        yPos += 5
      }
      if (order.transport_cost) {
        doc.text(`Transport Cost: KES ${parseFloat(order.transport_cost).toLocaleString()}`, 14, yPos)
        yPos += 5
      }
    }

    yPos += 8
    doc.setFont("helvetica", "bold")
    doc.text("Order Items", 14, yPos)
    yPos += 4

    const totalQuantity = items.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity) || 0), 0)
    const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.total_amount) || 0), 0)

    autoTable(doc, {
      startY: yPos,
      head: [["Item", "Quantity (L)", "Unit Price", "Total"]],
      body: items.map((item: any) => [
        item.item_name || "Unknown Item",
        parseFloat(item.quantity).toLocaleString(),
        `KES ${parseFloat(item.unit_price).toLocaleString()}`,
        `KES ${parseFloat(item.total_amount).toLocaleString()}`
      ]),
      foot: [[
        "TOTAL",
        `${totalQuantity.toLocaleString()} L`,
        "",
        `KES ${totalAmount.toLocaleString()}`
      ]],
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      footStyles: { fillColor: [236, 240, 241], textColor: [0, 0, 0], fontStyle: "bold" },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    if (acceptance) {
      if (yPos > 240) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("DELIVERY ACCEPTANCE", 14, yPos)
      yPos += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)

      const acceptanceDetails = [
        ["Accepted By:", acceptance.accepted_by_name || "N/A"],
        ["Acceptance Date:", acceptance.acceptance_timestamp ? new Date(acceptance.acceptance_timestamp).toLocaleString() : "N/A"],
        ["Bowser Volume:", `${parseFloat(acceptance.bowser_volume).toLocaleString()} L`],
        ["Total Variance:", `${parseFloat(acceptance.total_variance).toLocaleString()} L`],
      ]

      if (acceptance.dips_mm) {
        acceptanceDetails.push(["Dips (mm):", acceptance.dips_mm.toString()])
      }
      if (acceptance.remarks) {
        acceptanceDetails.push(["Remarks:", acceptance.remarks])
      }

      acceptanceDetails.forEach(([label, value]) => {
        doc.text(`${label} ${value}`, 14, yPos)
        yPos += 5
      })

      if (tankReadings.length > 0) {
        yPos += 5
        doc.setFont("helvetica", "bold")
        doc.text("Tank Readings", 14, yPos)
        yPos += 4

        autoTable(doc, {
          startY: yPos,
          head: [["Tank", "Volume Before (L)", "Volume After (L)", "Received (L)"]],
          body: tankReadings.map((tr: any) => [
            tr.tank_name || "Unknown Tank",
            parseFloat(tr.volume_before).toLocaleString(),
            parseFloat(tr.volume_after).toLocaleString(),
            (parseFloat(tr.volume_after) - parseFloat(tr.volume_before)).toLocaleString()
          ]),
          theme: "striped",
          headStyles: { fillColor: [39, 174, 96] },
        })

        yPos = (doc as any).lastAutoTable.finalY + 8
      }

      if (dispenserReadings.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFont("helvetica", "bold")
        doc.text("Dispenser Readings", 14, yPos)
        yPos += 4

        autoTable(doc, {
          startY: yPos,
          head: [["Dispenser", "Meter Before", "Meter After", "Difference"]],
          body: dispenserReadings.map((dr: any) => [
            `Dispenser ${dr.dispenser_number}`,
            parseFloat(dr.meter_reading_before).toLocaleString(),
            parseFloat(dr.meter_reading_after).toLocaleString(),
            (parseFloat(dr.meter_reading_after) - parseFloat(dr.meter_reading_before)).toLocaleString()
          ]),
          theme: "striped",
          headStyles: { fillColor: [155, 89, 182] },
        })
      }
    }

    if (order.notes) {
      yPos = (doc as any).lastAutoTable?.finalY + 10 || yPos + 10
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 14, yPos)
      yPos += 5
      doc.setFont("helvetica", "normal")
      doc.text(order.notes, 14, yPos, { maxWidth: pageWidth - 28 })
    }

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      )
    }

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.po_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
