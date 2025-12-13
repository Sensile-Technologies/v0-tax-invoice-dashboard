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
      const userResult = await query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      );
      if (userResult && userResult.length > 0) {
        vendorFilter = userResult[0].vendor_id;
      }
    }
    
    let sql = "SELECT * FROM branches WHERE status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (vendorFilter) {
      sql += ` AND vendor_id = $${paramIndex}`;
      params.push(vendorFilter);
      paramIndex++;
    }
    
    if (name) {
      sql += ` AND LOWER(name) LIKE LOWER($${paramIndex})`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    
    sql += " ORDER BY name";
    
    const branches = await query(sql, params);
    
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
