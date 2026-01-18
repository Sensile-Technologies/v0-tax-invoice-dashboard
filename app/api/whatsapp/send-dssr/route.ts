import { NextResponse } from 'next/server'
import { query } from '@/lib/db/client'
import { sendDSSRToDirectors, DSSRSummary } from '@/lib/whatsapp-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { branch_id, shift_id, date } = body
    
    if (!branch_id) {
      return NextResponse.json({ success: false, error: 'Missing branch_id' }, { status: 400 })
    }
    
    const branchResult = await query(
      `SELECT b.*, v.whatsapp_directors 
       FROM branches b 
       LEFT JOIN vendors v ON b.vendor_id = v.id 
       WHERE b.id = $1`,
      [branch_id]
    )
    
    if (!branchResult || branchResult.length === 0) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 })
    }
    
    const branch = branchResult[0]
    
    let directorNumbers: string[] = []
    if (branch.whatsapp_directors) {
      try {
        directorNumbers = typeof branch.whatsapp_directors === 'string' 
          ? JSON.parse(branch.whatsapp_directors) 
          : branch.whatsapp_directors
      } catch {
        directorNumbers = []
      }
    }
    
    if (directorNumbers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No director WhatsApp numbers configured for this vendor' 
      }, { status: 400 })
    }
    
    const reportDate = date || new Date().toISOString().split('T')[0]
    
    let shiftInfo: any = null
    if (shift_id) {
      const shiftResult = await query(
        `SELECT sh.*, u.full_name as attendant_name
         FROM shifts sh
         LEFT JOIN users u ON sh.user_id = u.id
         WHERE sh.id = $1`,
        [shift_id]
      )
      if (shiftResult && shiftResult.length > 0) {
        shiftInfo = shiftResult[0]
      }
    }
    
    const salesResult = await query(
      `SELECT 
         COALESCE(i.item_name, s.fuel_type, 'Unknown') as product,
         SUM(s.quantity) as volume,
         SUM(s.total_amount) as amount,
         SUM(CASE WHEN LOWER(s.payment_method) = 'cash' THEN s.total_amount ELSE 0 END) as cash_amount,
         SUM(CASE WHEN LOWER(s.payment_method) IN ('mpesa', 'm-pesa', 'mobile_money') THEN s.total_amount ELSE 0 END) as mpesa_amount,
         SUM(CASE WHEN LOWER(s.payment_method) = 'credit' THEN s.total_amount ELSE 0 END) as credit_amount
       FROM sales s
       LEFT JOIN items i ON s.item_id = i.id
       WHERE s.branch_id = $1 
         AND DATE(s.sale_date) = $2
         ${shift_id ? 'AND s.shift_id = $3' : ''}
       GROUP BY COALESCE(i.item_name, s.fuel_type, 'Unknown')`,
      shift_id ? [branch_id, reportDate, shift_id] : [branch_id, reportDate]
    )
    
    let totalSales = 0
    let totalVolume = 0
    let cashCollected = 0
    let mpesaCollected = 0
    let creditSales = 0
    const productBreakdown: Array<{ product: string; volume: number; amount: number }> = []
    
    for (const row of (salesResult || [])) {
      const volume = parseFloat(row.volume) || 0
      const amount = parseFloat(row.amount) || 0
      
      totalVolume += volume
      totalSales += amount
      cashCollected += parseFloat(row.cash_amount) || 0
      mpesaCollected += parseFloat(row.mpesa_amount) || 0
      creditSales += parseFloat(row.credit_amount) || 0
      
      productBreakdown.push({
        product: row.product,
        volume,
        amount
      })
    }
    
    const variance = (cashCollected + mpesaCollected) - (totalSales - creditSales)
    
    const summary: DSSRSummary = {
      branchName: branch.name,
      date: reportDate,
      shiftType: shiftInfo?.shift_type || 'Day',
      attendantName: shiftInfo?.attendant_name || 'N/A',
      totalSales,
      totalVolume,
      cashCollected,
      mpesaCollected,
      creditSales,
      variance,
      productBreakdown
    }
    
    const result = await sendDSSRToDirectors(summary, directorNumbers)
    
    await query(
      `INSERT INTO branch_logs (branch_id, action, details, created_at)
       VALUES ($1, 'whatsapp_dssr_sent', $2, NOW())`,
      [branch_id, JSON.stringify({ 
        date: reportDate, 
        shift_id, 
        directors: directorNumbers.length,
        results: result.results 
      })]
    )
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `DSSR sent to ${directorNumbers.length} director(s)` 
        : 'Some messages failed to send',
      results: result.results
    })
    
  } catch (error: any) {
    console.error('[WhatsApp DSSR] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send DSSR via WhatsApp' 
    }, { status: 500 })
  }
}
