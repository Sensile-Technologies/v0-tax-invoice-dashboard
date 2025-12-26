import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { cookies } from "next/headers";

async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie?.value) return null;
    
    const session = JSON.parse(sessionCookie.value);
    // SECURITY: Only trust the user ID from cookie, derive everything else from database
    return session.id || null;
  } catch {
    return null;
  }
}

async function getVendorIdFromUser(userId: string): Promise<string | null> {
  // Try to get vendor_id from user's vendor record
  const vendorResult = await query(
    `SELECT v.id as vendor_id FROM users u 
     JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  );
  if (vendorResult && vendorResult.length > 0) {
    return vendorResult[0].vendor_id;
  }
  
  // Try to get vendor_id from user's staff record
  const staffResult = await query(
    `SELECT DISTINCT b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
    [userId]
  );
  if (staffResult && staffResult.length > 0) {
    return staffResult[0].vendor_id;
  }
  
  return null;
}

async function getUserRoleAndBranch(userId: string): Promise<{ role: string | null; branchId: string | null }> {
  const result = await query(
    `SELECT COALESCE(s.role, u.role) as role, s.branch_id
     FROM users u 
     LEFT JOIN staff s ON s.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  if (result && result.length > 0) {
    return { role: result[0].role, branchId: result[0].branch_id };
  }
  return { role: null, branchId: null };
}

export async function GET(request: Request) {
  try {
    // SECURITY: Get user ID from httpOnly session cookie
    const userId = await getSessionUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // SECURITY: Always derive vendor_id and role from database (never trust cookie values)
    const vendorId = await getVendorIdFromUser(userId);
    const { role, branchId } = await getUserRoleAndBranch(userId);
    
    const restrictedRoles = ['supervisor', 'manager'];
    const isRestricted = role && restrictedRoles.includes(role.toLowerCase());
    
    // For managers/supervisors, only return their assigned branch
    if (isRestricted && branchId) {
      const branches = await query(
        `SELECT * FROM branches WHERE id = $1 AND status IN ('active', 'pending_onboarding')`,
        [branchId]
      );
      return NextResponse.json(branches || []);
    }
    
    // SECURITY: Must have vendor_id to list branches
    if (!vendorId) {
      return NextResponse.json([]);
    }
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    
    // Build query with vendor filter
    let sql = "SELECT * FROM branches WHERE status IN ('active', 'pending_onboarding') AND vendor_id = $1";
    const params: any[] = [vendorId];
    let paramIndex = 2;
    
    if (name) {
      sql += ` AND LOWER(name) LIKE LOWER($${paramIndex})`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    
    sql += " ORDER BY name";
    
    const branches = await query(sql, params);
    
    return NextResponse.json(branches || []);
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
