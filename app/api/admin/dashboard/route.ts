import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [
      vendorStats,
      ticketStats,
      invoiceStats,
      recentTickets,
      recentVendors
    ] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_vendors,
          COUNT(*) FILTER (WHERE status = 'active') as active_vendors,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_vendors_30d
        FROM vendors
      `),
      query(`
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
          COUNT(*) FILTER (WHERE priority = 'high' AND status = 'open') as high_priority_open
        FROM support_tickets
      `),
      query(`
        SELECT 
          COUNT(*) as total_invoices,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_invoices,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_invoices,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
          COALESCE(SUM(paid_amount) FILTER (WHERE status = 'paid'), 0) as received_amount
        FROM invoices
      `),
      query(`
        SELECT t.*, v.name as vendor_name, c.name as category_name, c.color as category_color
        FROM support_tickets t
        LEFT JOIN vendors v ON v.id = t.vendor_id
        LEFT JOIN ticket_categories c ON c.id = t.category_id
        WHERE t.status IN ('open', 'in_progress')
        ORDER BY 
          CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
          t.created_at DESC
        LIMIT 5
      `),
      query(`
        SELECT v.*, COUNT(b.id) as branch_count
        FROM vendors v
        LEFT JOIN branches b ON b.vendor_id = v.id
        GROUP BY v.id
        ORDER BY v.created_at DESC
        LIMIT 5
      `)
    ])

    return NextResponse.json({
      vendors: vendorStats[0] || { total_vendors: 0, active_vendors: 0, new_vendors_30d: 0 },
      tickets: ticketStats[0] || { total_tickets: 0, open_tickets: 0, in_progress_tickets: 0, resolved_tickets: 0, high_priority_open: 0 },
      invoices: invoiceStats[0] || { total_invoices: 0, pending_invoices: 0, paid_invoices: 0, pending_amount: 0, received_amount: 0 },
      recentTickets,
      recentVendors
    })
  } catch (error: any) {
    console.error("[Admin] Error fetching dashboard:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
