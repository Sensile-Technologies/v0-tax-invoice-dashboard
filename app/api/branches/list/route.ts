import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { cookies } from "next/headers";

async function getSessionUserId(request: Request): Promise<string | null> {
  try {
    // First try to get from cookie (preferred, more secure)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (sessionCookie?.value) {
      const session = JSON.parse(sessionCookie.value);
      if (session.id) return session.id;
    }
    
    // Fallback: Check URL params for backward compatibility
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    if (userId) return userId;
    
    return null;
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
    // SECURITY: Get user ID from httpOnly session cookie or URL params (fallback)
    const userId = await getSessionUserId(request);
    
    if (!userId) {
      // Return empty array instead of 401 for backward compatibility
      // Frontend can still function with localStorage auth
      return NextResponse.json([]);
    }
    
    // SECURITY: Always derive vendor_id and role from database (never trust cookie values)
    const vendorId = await getVendorIdFromUser(userId);
    const { role, branchId } = await getUserRoleAndBranch(userId);
    
    const restrictedRoles = ['supervisor', 'manager'];
    const isRestricted = role && restrictedRoles.includes(role.toLowerCase());
    
    // For managers/supervisors, only return their assigned branch with stats
    if (isRestricted && branchId) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      
      const branches = await query(
        `SELECT b.*,
          COALESCE((
            SELECT SUM(s.total_amount) 
            FROM sales s 
            WHERE s.branch_id = b.id 
              AND s.created_at >= $2
          ), 0) as mtd_revenue,
          COALESCE((
            SELECT SUM(s.total_amount) 
            FROM sales s 
            WHERE s.branch_id = b.id 
              AND s.created_at >= $3 
              AND s.created_at <= $4
          ), 0) as last_month_revenue,
          COALESCE((
            SELECT SUM(s.total_amount) 
            FROM sales s 
            JOIN shifts sh ON s.shift_id = sh.id 
            WHERE s.branch_id = b.id 
              AND sh.status = 'active'
          ), 0) as current_shift_revenue
        FROM branches b 
        WHERE b.id = $1 AND b.status IN ('active', 'pending_onboarding')`,
        [branchId, startOfMonth.toISOString(), startOfLastMonth.toISOString(), endOfLastMonth.toISOString()]
      );
      
      const branchesWithStats = (branches || []).map((branch: any) => {
        const mtdRevenue = parseFloat(branch.mtd_revenue) || 0;
        const lastMonthRevenue = parseFloat(branch.last_month_revenue) || 0;
        let growth = 0;
        if (lastMonthRevenue > 0) {
          growth = Math.round(((mtdRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
        } else if (mtdRevenue > 0) {
          growth = 100;
        }
        return {
          ...branch,
          monthToDateRevenue: mtdRevenue,
          currentShiftRevenue: parseFloat(branch.current_shift_revenue) || 0,
          performance: `${growth >= 0 ? '+' : ''}${growth}%`
        };
      });
      
      return NextResponse.json(branchesWithStats);
    }
    
    // SECURITY: Must have vendor_id to list branches
    if (!vendorId) {
      return NextResponse.json([]);
    }
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    
    // Build query with vendor filter and per-branch stats
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    let sql = `
      SELECT b.*,
        COALESCE((
          SELECT SUM(s.total_amount) 
          FROM sales s 
          WHERE s.branch_id = b.id 
            AND s.created_at >= $2
        ), 0) as mtd_revenue,
        COALESCE((
          SELECT SUM(s.total_amount) 
          FROM sales s 
          WHERE s.branch_id = b.id 
            AND s.created_at >= $3 
            AND s.created_at <= $4
        ), 0) as last_month_revenue,
        COALESCE((
          SELECT SUM(s.total_amount) 
          FROM sales s 
          JOIN shifts sh ON s.shift_id = sh.id 
          WHERE s.branch_id = b.id 
            AND sh.status = 'active'
        ), 0) as current_shift_revenue
      FROM branches b 
      WHERE b.status IN ('active', 'pending_onboarding') AND b.vendor_id = $1`;
    const params: any[] = [vendorId, startOfMonth.toISOString(), startOfLastMonth.toISOString(), endOfLastMonth.toISOString()];
    let paramIndex = 5;
    
    if (name) {
      sql += ` AND LOWER(b.name) LIKE LOWER($${paramIndex})`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    
    sql += " ORDER BY b.name";
    
    const branches = await query(sql, params);
    
    // Calculate growth percentage for each branch
    const branchesWithStats = (branches || []).map((branch: any) => {
      const mtdRevenue = parseFloat(branch.mtd_revenue) || 0;
      const lastMonthRevenue = parseFloat(branch.last_month_revenue) || 0;
      let growth = 0;
      if (lastMonthRevenue > 0) {
        growth = Math.round(((mtdRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
      } else if (mtdRevenue > 0) {
        growth = 100;
      }
      return {
        ...branch,
        monthToDateRevenue: mtdRevenue,
        currentShiftRevenue: parseFloat(branch.current_shift_revenue) || 0,
        performance: `${growth >= 0 ? '+' : ''}${growth}%`
      };
    });
    
    return NextResponse.json(branchesWithStats);
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
