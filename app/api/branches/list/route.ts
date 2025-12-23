import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const userId = searchParams.get("user_id");
    const vendorId = searchParams.get("vendor_id");
    
    let vendorFilter = vendorId;
    
    // If user_id is provided, find the user's vendor
    if (userId && !vendorFilter) {
      // First try: match user email to vendor email
      const userResult = await query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      );
      if (userResult && userResult.length > 0) {
        vendorFilter = userResult[0].vendor_id;
      }
      
      // Second try: get vendor_id from user's staff record → branch → vendor
      if (!vendorFilter) {
        const staffResult = await query(
          `SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
          [userId]
        );
        if (staffResult && staffResult.length > 0) {
          vendorFilter = staffResult[0].vendor_id;
        }
      }
      
      // Third try: if still no vendor, get only branches where user has a staff record
      if (!vendorFilter) {
        const staffBranchIds = await query(
          `SELECT branch_id FROM staff WHERE user_id = $1`,
          [userId]
        );
        if (staffBranchIds && staffBranchIds.length > 0) {
          const branchIds = staffBranchIds.map((s: any) => s.branch_id);
          const branches = await query(
            `SELECT * FROM branches WHERE id = ANY($1::uuid[]) AND status IN ('active', 'pending_onboarding') ORDER BY name`,
            [branchIds]
          );
          return NextResponse.json(branches);
        }
        
        // SECURITY: No vendor or staff association found - return empty array
        // Do NOT fall through to return all branches
        return NextResponse.json([]);
      }
    }
    
    // Build query with filters - include both active and pending_onboarding branches
    let sql = "SELECT * FROM branches WHERE status IN ('active', 'pending_onboarding')";
    const params: any[] = [];
    let paramIndex = 1;
    
    // SECURITY: When user_id was provided but vendor lookup succeeded, 
    // always filter by vendorFilter (which is now set)
    if (vendorFilter) {
      sql += ` AND vendor_id = $${paramIndex}`;
      params.push(vendorFilter);
      paramIndex++;
    } else if (userId) {
      // SECURITY: If user_id was provided but no vendor found and we somehow
      // got here, return empty array for safety
      return NextResponse.json([]);
    }
    
    if (name) {
      sql += ` AND LOWER(name) LIKE LOWER($${paramIndex})`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    
    // SECURITY: If no user_id or vendor_id provided, return empty array
    // to prevent leaking all branches
    if (!userId && !vendorId) {
      return NextResponse.json([]);
    }
    
    sql += " ORDER BY name";
    
    const branches = await query(sql, params);
    
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
