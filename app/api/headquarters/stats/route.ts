import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      revenueResult,
      lastMonthRevenueResult,
      transactionsResult,
      employeesResult,
      inventoryResult,
      lastMonthInventoryResult,
      branchStatsResult,
      monthlyRevenueResult
    ] = await Promise.all([
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales
        WHERE created_at >= $1
      `, [startOfMonth]),
      
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales
        WHERE created_at >= $1 AND created_at <= $2
      `, [startOfLastMonth, endOfLastMonth]),
      
      pool.query(`
        SELECT COUNT(*) as total_transactions
        FROM sales
        WHERE created_at >= $1
      `, [startOfMonth]),
      
      pool.query(`
        SELECT COUNT(*) as total_employees
        FROM users
      `),
      
      pool.query(`
        SELECT COALESCE(SUM(current_stock), 0) as total_inventory
        FROM tanks
        WHERE status = 'active' OR status IS NULL
      `),
      
      pool.query(`
        SELECT COALESCE(SUM(current_stock), 0) as last_inventory
        FROM tanks
        WHERE status = 'active' OR status IS NULL
      `),
      
      pool.query(`
        SELECT 
          b.id,
          b.name,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 THEN s.total_amount ELSE 0 END), 0) as mtd_sales,
          0 as mtd_purchases
        FROM branches b
        LEFT JOIN sales s ON s.branch_id = b.id
        WHERE b.status = 'active' OR b.status IS NULL
        GROUP BY b.id, b.name
        ORDER BY b.name
      `, [startOfMonth]),
      
      pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM sales
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `)
    ]);

    const currentRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || 0);
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult.rows[0]?.total_revenue || 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0';

    const currentInventory = parseFloat(inventoryResult.rows[0]?.total_inventory || 0);
    const lastInventory = parseFloat(lastMonthInventoryResult.rows[0]?.last_inventory || 0);
    const inventoryGrowth = lastInventory > 0
      ? ((currentInventory - lastInventory) / lastInventory * 100).toFixed(1)
      : '0';

    const branchPerformance = branchStatsResult.rows.map((row: any) => ({
      branch: row.name,
      sales: parseFloat(row.mtd_sales) / 1000,
      purchases: parseFloat(row.mtd_purchases) / 1000
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
      inventoryGrowth: parseFloat(inventoryGrowth),
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
