import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { cookies } from 'next/headers';

async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie?.value) return null;
    
    const session = JSON.parse(sessionCookie.value);
    return session.id || null;
  } catch {
    return null;
  }
}

async function getUserRoleAndVendorFilter(userId: string): Promise<{ role: string | null; vendorId: string | null; branchIds: string[] | null }> {
  let vendorId: string | null = null;
  let role: string | null = null;
  
  const userResult = await query(
    `SELECT u.role, v.id as vendor_id FROM users u 
     LEFT JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,
    [userId]
  );
  if (userResult && userResult.length > 0) {
    vendorId = userResult[0].vendor_id;
    role = userResult[0].role;
  }
  
  if (!vendorId) {
    const staffResult = await query(
      `SELECT DISTINCT b.vendor_id, s.role FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,
      [userId]
    );
    if (staffResult && staffResult.length > 0) {
      vendorId = staffResult[0].vendor_id;
      if (!role) role = staffResult[0].role;
    }
  }
  
  if (!vendorId) {
    const staffBranchIds = await query(
      `SELECT branch_id, role FROM staff WHERE user_id = $1`,
      [userId]
    );
    if (staffBranchIds && staffBranchIds.length > 0) {
      if (!role) role = staffBranchIds[0].role;
      return { role, vendorId: null, branchIds: staffBranchIds.map((s: any) => s.branch_id) };
    }
    return { role, vendorId: null, branchIds: [] };
  }
  
  return { role, vendorId, branchIds: null };
}

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    const { role, vendorId, branchIds } = await getUserRoleAndVendorFilter(userId);
    
    const restrictedRoles = ['supervisor', 'manager', 'cashier'];
    if (role && restrictedRoles.includes(role.toLowerCase())) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to view headquarters data.' },
        { status: 403 }
      );
    }
    
    if (!vendorId && branchIds && branchIds.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        revenueGrowth: 0,
        totalTransactions: 0,
        totalEmployees: 0,
        totalInventory: 0,
        inventoryGrowth: 0,
        branchPerformance: [],
        monthlyRevenue: []
      });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    let branchFilter = '';
    let branchFilterParams: any[] = [];
    
    if (vendorId) {
      branchFilter = 'AND s.branch_id IN (SELECT id FROM branches WHERE vendor_id = $2)';
      branchFilterParams = [vendorId];
    } else if (branchIds && branchIds.length > 0) {
      branchFilter = 'AND s.branch_id = ANY($2::uuid[])';
      branchFilterParams = [branchIds];
    }

    const [
      revenueResult,
      lastMonthRevenueResult,
      transactionsResult,
      employeesResult,
      inventoryResult,
      branchStatsResult,
      monthlyRevenueResult
    ] = await Promise.all([
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales s
        WHERE created_at >= $1 ${branchFilter}
      `, [startOfMonth, ...branchFilterParams]),
      
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales s
        WHERE created_at >= $1 AND created_at <= $2 ${branchFilter.replace('$2', '$3')}
      `, [startOfLastMonth, endOfLastMonth, ...branchFilterParams]),
      
      pool.query(`
        SELECT COUNT(*) as total_transactions
        FROM sales s
        WHERE created_at >= $1 ${branchFilter}
      `, [startOfMonth, ...branchFilterParams]),
      
      vendorId ? pool.query(`
        SELECT COUNT(DISTINCT u.id) as total_employees
        FROM users u
        JOIN staff st ON st.user_id = u.id
        JOIN branches b ON st.branch_id = b.id
        WHERE b.vendor_id = $1
      `, [vendorId]) : (branchIds && branchIds.length > 0 ? pool.query(`
        SELECT COUNT(DISTINCT u.id) as total_employees
        FROM users u
        JOIN staff st ON st.user_id = u.id
        WHERE st.branch_id = ANY($1::uuid[])
      `, [branchIds]) : pool.query(`SELECT 0 as total_employees`)),
      
      vendorId ? pool.query(`
        SELECT 
          COALESCE(SUM(current_stock), 0) as total_inventory,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%diesel%' THEN current_stock ELSE 0 END), 0) as diesel_stock,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%petrol%' OR LOWER(fuel_type) LIKE '%super%' OR LOWER(fuel_type) LIKE '%unleaded%' THEN current_stock ELSE 0 END), 0) as petrol_stock
        FROM tanks t
        JOIN branches b ON t.branch_id = b.id
        WHERE b.vendor_id = $1 AND (t.status = 'active' OR t.status IS NULL)
      `, [vendorId]) : (branchIds && branchIds.length > 0 ? pool.query(`
        SELECT 
          COALESCE(SUM(current_stock), 0) as total_inventory,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%diesel%' THEN current_stock ELSE 0 END), 0) as diesel_stock,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%petrol%' OR LOWER(fuel_type) LIKE '%super%' OR LOWER(fuel_type) LIKE '%unleaded%' THEN current_stock ELSE 0 END), 0) as petrol_stock
        FROM tanks t
        WHERE t.branch_id = ANY($1::uuid[]) AND (t.status = 'active' OR t.status IS NULL)
      `, [branchIds]) : pool.query(`SELECT 0 as total_inventory, 0 as diesel_stock, 0 as petrol_stock`)),
      
      vendorId ? pool.query(`
        SELECT 
          b.id,
          b.name,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 THEN s.total_amount ELSE 0 END), 0) as mtd_sales,
          0 as mtd_purchases,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 AND s.source_system = 'meter_diff_bulk' THEN 1 ELSE 0 END), 0) as bulk_sales_count,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 AND s.source_system = 'meter_diff_bulk' THEN s.quantity ELSE 0 END), 0) as bulk_sales_volume,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 AND s.source_system = 'meter_diff_bulk' THEN s.total_amount ELSE 0 END), 0) as bulk_sales_amount
        FROM branches b
        LEFT JOIN sales s ON s.branch_id = b.id
        WHERE b.vendor_id = $2 AND (b.status = 'active' OR b.status IS NULL)
        GROUP BY b.id, b.name
        ORDER BY b.name
      `, [startOfMonth, vendorId]) : (branchIds && branchIds.length > 0 ? pool.query(`
        SELECT 
          b.id,
          b.name,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 THEN s.total_amount ELSE 0 END), 0) as mtd_sales,
          0 as mtd_purchases,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 AND s.source_system = 'meter_diff_bulk' THEN 1 ELSE 0 END), 0) as bulk_sales_count,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 AND s.source_system = 'meter_diff_bulk' THEN s.quantity ELSE 0 END), 0) as bulk_sales_volume,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 AND s.source_system = 'meter_diff_bulk' THEN s.total_amount ELSE 0 END), 0) as bulk_sales_amount
        FROM branches b
        LEFT JOIN sales s ON s.branch_id = b.id
        WHERE b.id = ANY($2::uuid[]) AND (b.status = 'active' OR b.status IS NULL)
        GROUP BY b.id, b.name
        ORDER BY b.name
      `, [startOfMonth, branchIds]) : pool.query(`SELECT NULL as id, NULL as name, 0 as mtd_sales, 0 as mtd_purchases, 0 as bulk_sales_count, 0 as bulk_sales_volume, 0 as bulk_sales_amount WHERE false`)),
      
      vendorId ? pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') as month,
          COALESCE(SUM(s.total_amount), 0) as revenue
        FROM sales s
        JOIN branches b ON s.branch_id = b.id
        WHERE s.created_at >= NOW() - INTERVAL '6 months' AND b.vendor_id = $1
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY DATE_TRUNC('month', s.created_at)
      `, [vendorId]) : (branchIds && branchIds.length > 0 ? pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') as month,
          COALESCE(SUM(s.total_amount), 0) as revenue
        FROM sales s
        WHERE s.created_at >= NOW() - INTERVAL '6 months' AND s.branch_id = ANY($1::uuid[])
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY DATE_TRUNC('month', s.created_at)
      `, [branchIds]) : pool.query(`SELECT NULL as month, 0 as revenue WHERE false`))
    ]);

    const currentRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || 0);
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult.rows[0]?.total_revenue || 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0';

    const currentInventory = parseFloat(inventoryResult.rows[0]?.total_inventory || 0);
    const dieselStock = parseFloat(inventoryResult.rows[0]?.diesel_stock || 0);
    const petrolStock = parseFloat(inventoryResult.rows[0]?.petrol_stock || 0);

    const branchPerformance = branchStatsResult.rows.map((row: any) => ({
      branch: row.name,
      sales: parseFloat(row.mtd_sales) / 1000,
      purchases: parseFloat(row.mtd_purchases) / 1000,
      bulkSalesCount: parseInt(row.bulk_sales_count) || 0,
      bulkSalesVolume: parseFloat(row.bulk_sales_volume) || 0,
      bulkSalesAmount: parseFloat(row.bulk_sales_amount) || 0
    }));

    const monthlyRevenue = monthlyRevenueResult.rows.map((row: any) => ({
      month: row.month,
      revenue: parseFloat(row.revenue)
    }));

    return NextResponse.json({
      totalRevenue: currentRevenue,
      revenueGrowth: parseFloat(revenueGrowth),
      totalTransactions: parseInt(transactionsResult.rows[0]?.total_transactions || 0),
      totalEmployees: parseInt(employeesResult.rows[0]?.total_employees || 0),
      totalInventory: Math.round(currentInventory),
      dieselStock: Math.round(dieselStock),
      petrolStock: Math.round(petrolStock),
      inventoryGrowth: 0,
      branchPerformance,
      monthlyRevenue
    });
  } catch (error: any) {
    console.error('[HQ Stats] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
