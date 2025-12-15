import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const vendorId = searchParams.get("vendor_id")

    let sql = `
      SELECT 
        i.*,
        v.name as merchant_name,
        b.name as branch_name,
        u.username as created_by_username
      FROM invoices i
      LEFT JOIN vendors v ON v.id = i.vendor_id
      LEFT JOIN branches b ON b.id = i.branch_id
      LEFT JOIN users u ON u.id = i.created_by
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      sql += ` AND i.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (vendorId) {
      sql += ` AND i.vendor_id = $${paramIndex}`
      params.push(vendorId)
      paramIndex++
    }

    sql += " ORDER BY i.created_at DESC"

    const invoices = await query(sql, params)

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error("[Admin] Error fetching invoices:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendor_id, branch_id, branch_ids, billed_to_contact, issue_date, due_date, notes, line_items, created_by, include_vat } = body

    if (!vendor_id) {
      return NextResponse.json({ error: "Vendor is required" }, { status: 400 })
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    
    let subtotal = 0
    if (line_items && Array.isArray(line_items)) {
      subtotal = line_items.reduce((sum: number, item: any) => {
        const lineSubtotal = item.quantity * item.unit_price
        const discountAmount = lineSubtotal * ((item.discount || 0) / 100)
        return sum + (lineSubtotal - discountAmount)
      }, 0)
    }
    const taxAmount = include_vat !== false ? subtotal * 0.16 : 0
    const totalAmount = subtotal + taxAmount

    // Use first branch_id from branch_ids array if available, otherwise use branch_id
    const primaryBranchId = (branch_ids && branch_ids.length > 0) ? branch_ids[0] : branch_id

    const result = await query(
      `INSERT INTO invoices (invoice_number, vendor_id, branch_id, billed_to_contact, issue_date, due_date, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [invoiceNumber, vendor_id, primaryBranchId, billed_to_contact, issue_date || new Date(), due_date, subtotal, taxAmount, totalAmount, notes, created_by]
    )

    const invoice = result[0]

    // Insert all selected branches into invoice_branches junction table
    if (branch_ids && Array.isArray(branch_ids) && branch_ids.length > 0) {
      for (const branchId of branch_ids) {
        await query(
          `INSERT INTO invoice_branches (invoice_id, branch_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [invoice.id, branchId]
        )
      }
    }

    if (line_items && Array.isArray(line_items)) {
      for (const item of line_items) {
        const lineSubtotal = item.quantity * item.unit_price
        const discountAmount = lineSubtotal * ((item.discount || 0) / 100)
        const lineAmount = lineSubtotal - discountAmount
        await query(
          `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate, amount, discount)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [invoice.id, item.description, item.quantity, item.unit_price, item.tax_rate || 16, lineAmount, item.discount || 0]
        )
      }
    }

    const vendorResult = await query(`SELECT name, email FROM vendors WHERE id = $1`, [vendor_id])
    const vendor = vendorResult[0]

    if (vendor) {
      const userResult = await query(`SELECT id FROM users WHERE email = $1`, [vendor.email])
      const vendorUser = userResult[0]
      
      if (vendorUser) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, reference_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            vendorUser.id,
            'invoice',
            'New Invoice',
            `Invoice ${invoiceNumber} for KES ${totalAmount.toLocaleString()} has been created`,
            invoice.id
          ]
        )
      }
    }

    await query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id)
       VALUES (NULL, $1, $2, $3, $4)`,
      [
        'invoice',
        'Invoice Created',
        `Invoice ${invoiceNumber} for ${vendor?.name || 'Unknown'} - KES ${totalAmount.toLocaleString()}`,
        invoice.id
      ]
    )

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error("[Admin] Error creating invoice:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
