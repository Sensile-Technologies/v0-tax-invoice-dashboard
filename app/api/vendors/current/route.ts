import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ success: false, error: "user_id is required" }, { status: 400 })
    }

    // Try multiple ways to get the vendor ID for this user
    
    // 1. First try: match user email to vendor email
    const userVendor = await query(
      `SELECT v.id, v.name FROM users u 
       JOIN vendors v ON v.email = u.email 
       WHERE u.id = $1`,
      [userId]
    )
    if (userVendor && userVendor.length > 0) {
      return NextResponse.json({ success: true, vendor_id: userVendor[0].id, vendor_name: userVendor[0].name })
    }

    // 2. Second try: get vendor_id from user's staff record → branch → vendor
    const staffVendor = await query(
      `SELECT DISTINCT v.id, v.name FROM staff s
       JOIN branches b ON s.branch_id = b.id
       JOIN vendors v ON b.vendor_id = v.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
      [userId]
    )
    if (staffVendor && staffVendor.length > 0) {
      return NextResponse.json({ success: true, vendor_id: staffVendor[0].id, vendor_name: staffVendor[0].name })
    }

    // 3. Third try: get any vendor associated with any of user's branches
    const branchVendor = await query(
      `SELECT DISTINCT v.id, v.name FROM branches b
       JOIN vendors v ON b.vendor_id = v.id
       WHERE b.user_id = $1 AND b.vendor_id IS NOT NULL`,
      [userId]
    )
    if (branchVendor && branchVendor.length > 0) {
      return NextResponse.json({ success: true, vendor_id: branchVendor[0].id, vendor_name: branchVendor[0].name })
    }

    return NextResponse.json({ success: false, error: "No vendor found for this user" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching current vendor:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch vendor" }, { status: 500 })
  }
}
