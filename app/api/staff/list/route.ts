import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendor_id")
    const userId = searchParams.get("user_id")
    const branchId = searchParams.get("branch_id")
    
    let vendorFilter = null
    
    if (vendorId) {
      vendorFilter = vendorId
    } else if (userId) {
      // First try to get vendor_id from vendors table (for vendor owners)
      const vendorResult = await query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      )
      if (vendorResult && vendorResult.length > 0) {
        vendorFilter = vendorResult[0].vendor_id
      } else {
        // For staff members (including directors), get vendor_id from their branch
        const staffResult = await query(
          `SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
          [userId]
        )
        if (staffResult && staffResult.length > 0) {
          vendorFilter = staffResult[0].vendor_id
        }
      }
    }
    
    let result
    
    if (branchId) {
      result = await query(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          s.attendant_code,
          s.code_generated_at,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE s.branch_id = $1
        ORDER BY s.created_at DESC
      `, [branchId])
    } else if (vendorFilter) {
      // Include staff with branches belonging to vendor, OR staff with vendor_id directly set
      result = await query(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          s.attendant_code,
          s.code_generated_at,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE b.vendor_id = $1 OR s.vendor_id = $1
        ORDER BY s.created_at DESC
      `, [vendorFilter])
    } else {
      result = await query(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          s.attendant_code,
          s.code_generated_at,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        ORDER BY s.created_at DESC
      `)
    }

    return NextResponse.json({ staff: result })
  } catch (error: any) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff", details: error.message },
      { status: 500 }
    )
  }
}
