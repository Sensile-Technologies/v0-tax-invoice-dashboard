import { NextResponse } from 'next/server'
import { query } from '@/lib/db/client'
import { cookies } from 'next/headers'

async function getVendorIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    if (!session.id) return null
    
    // Get vendor_id from user
    const result = await query(
      `SELECT v.id as vendor_id FROM users u 
       JOIN vendors v ON v.email = u.email 
       WHERE u.id = $1`,
      [session.id]
    )
    
    if (result && result.length > 0) {
      return result[0].vendor_id
    }
    
    // Try via staff
    const staffResult = await query(
      `SELECT DISTINCT b.vendor_id FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
      [session.id]
    )
    
    if (staffResult && staffResult.length > 0) {
      return staffResult[0].vendor_id
    }
    
    return null
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const vendorId = await getVendorIdFromSession()
    
    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 })
    }
    
    const result = await query(
      `SELECT whatsapp_directors FROM vendors WHERE id = $1`,
      [vendorId]
    )
    
    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 })
    }
    
    let directors: string[] = []
    if (result[0].whatsapp_directors) {
      try {
        const data = result[0].whatsapp_directors
        directors = typeof data === 'string' ? JSON.parse(data) : data
      } catch {
        directors = []
      }
    }
    
    return NextResponse.json({ success: true, directors })
  } catch (error: any) {
    console.error('[WhatsApp Directors GET] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const vendorId = await getVendorIdFromSession()
    
    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { directors } = body
    
    if (!Array.isArray(directors)) {
      return NextResponse.json({ success: false, error: 'Directors must be an array' }, { status: 400 })
    }
    
    // Validate phone numbers (basic validation)
    const validNumbers = directors.filter((num: string) => {
      const cleaned = num.replace(/\D/g, '')
      return cleaned.length >= 10 && cleaned.length <= 15
    }).map((num: string) => {
      // Ensure numbers start with +
      const cleaned = num.replace(/\D/g, '')
      return cleaned.startsWith('254') ? `+${cleaned}` : (num.startsWith('+') ? num : `+${num}`)
    })
    
    await query(
      `UPDATE vendors SET whatsapp_directors = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(validNumbers), vendorId]
    )
    
    return NextResponse.json({ 
      success: true, 
      message: `${validNumbers.length} director number(s) saved`,
      directors: validNumbers
    })
  } catch (error: any) {
    console.error('[WhatsApp Directors POST] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
