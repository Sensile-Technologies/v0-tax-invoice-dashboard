import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const userId = searchParams.get("user_id");
    
    let sql = "SELECT * FROM branches WHERE status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(userId);
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
