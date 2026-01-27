import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const format = searchParams.get('format') || 'excel'
    const date = searchParams.get('date')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const itemId = searchParams.get('item_id')
    const nozzleId = searchParams.get('nozzle_id')
    const paymentMethod = searchParams.get('payment_method')
    const documentType = searchParams.get('document_type')
    const isAutomated = searchParams.get('is_automated')

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID required" }, { status: 400 })
    }

    let whereClause = 'WHERE branch_id = $1'
    const params: any[] = [branchId]
    let paramIndex = 2

    if (date) {
      whereClause += ` AND DATE(sale_date) = $${paramIndex}`
      params.push(date)
      paramIndex++
    }

    if (dateFrom) {
      whereClause += ` AND DATE(sale_date) >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      whereClause += ` AND DATE(sale_date) <= $${paramIndex}`
      params.push(dateTo)
      paramIndex++
    }

    // Filter by item_id only (no fuel_type fallback)
    if (itemId && itemId !== 'all') {
      whereClause += ` AND item_id = $${paramIndex}`
      params.push(itemId)
      paramIndex++
    }

    if (nozzleId && nozzleId !== 'all') {
      whereClause += ` AND nozzle_id = $${paramIndex}`
      params.push(nozzleId)
      paramIndex++
    }

    if (paymentMethod && paymentMethod !== 'all') {
      whereClause += ` AND LOWER(payment_method) = $${paramIndex}`
      params.push(paymentMethod.toLowerCase())
      paramIndex++
    }

    if (documentType === 'invoices') {
      whereClause += ` AND (is_credit_note IS NULL OR is_credit_note = false)`
    } else if (documentType === 'credit_notes') {
      whereClause += ` AND is_credit_note = true`
    }

    // Filter by is_automated (true = bulk/automated sales only, false = manual APK/web sales only)
    if (isAutomated === 'true') {
      whereClause += ` AND is_automated = true`
    } else if (isAutomated === 'false') {
      whereClause += ` AND (is_automated = false OR is_automated IS NULL)`
    }

    const sql = `SELECT * FROM sales ${whereClause} ORDER BY sale_date DESC`
    const sales = await query(sql, params)

    const branchResult = await query('SELECT name FROM branches WHERE id = $1', [branchId])
    const branchName = branchResult[0]?.name || 'Unknown Branch'

    const formattedData = sales.map((sale: any) => ({
      Date: new Date(sale.sale_date).toLocaleDateString('en-US'),
      Invoice: sale.invoice_number || sale.receipt_number || '',
      'Fuel Type': sale.fuel_type || '',
      'Quantity (L)': Number(sale.quantity || 0).toFixed(2),
      'Unit Price': Number(sale.unit_price || 0).toFixed(2),
      'Total Amount': Number(sale.total_amount || 0).toFixed(2),
      'Payment Method': sale.payment_method || 'cash',
      Customer: sale.customer_name || 'Walk-in',
      Status: sale.kra_status || sale.transmission_status || 'pending'
    }))

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report')
      
      ws['!cols'] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 15 },
        { wch: 20 },
        { wch: 12 }
      ]

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
          'Cache-Control': 'no-cache'
        }
      })
    } else if (format === 'pdf') {
      const doc = new jsPDF()
      
      doc.setFontSize(18)
      doc.text(`Sales Report - ${branchName}`, 14, 22)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
      doc.text(`Total Records: ${sales.length}`, 14, 36)

      const tableData = formattedData.map((row: any) => [
        row.Date,
        row.Invoice,
        row['Fuel Type'],
        row['Quantity (L)'],
        row['Unit Price'],
        row['Total Amount'],
        row['Payment Method'],
        row.Status
      ])

      autoTable(doc, {
        head: [['Date', 'Invoice', 'Fuel', 'Qty (L)', 'Price', 'Total', 'Payment', 'Status']],
        body: tableData,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      })

      const totalAmount = sales.reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0)
      const totalQty = sales.reduce((sum: number, s: any) => sum + Number(s.quantity || 0), 0)
      
      const finalY = (doc as any).lastAutoTable?.finalY || 50
      doc.setFontSize(10)
      doc.text(`Total Quantity: ${totalQty.toFixed(2)} L`, 14, finalY + 10)
      doc.text(`Total Amount: KES ${totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, finalY + 16)

      const pdfBuffer = doc.output('arraybuffer')
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.pdf"`,
          'Cache-Control': 'no-cache'
        }
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })

  } catch (error: any) {
    console.error("Error exporting sales:", error)
    return NextResponse.json(
      { error: "Failed to export sales", details: error.message },
      { status: 500 }
    )
  }
}
