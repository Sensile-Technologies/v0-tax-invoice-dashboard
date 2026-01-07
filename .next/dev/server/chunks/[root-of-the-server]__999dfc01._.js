module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/db/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "execute",
    ()=>execute,
    "getClient",
    ()=>getClient,
    "pool",
    ()=>pool,
    "query",
    ()=>query,
    "queryOne",
    ()=>queryOne
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL,
    ssl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false
});
async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } finally{
        client.release();
    }
}
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] || null;
}
async function execute(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rowCount || 0;
    } finally{
        client.release();
    }
}
async function getClient() {
    return await pool.connect();
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/db/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/api/headquarters/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function getSessionUserId() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get("user_session");
        if (!sessionCookie?.value) return null;
        const session = JSON.parse(sessionCookie.value);
        return session.id || null;
    } catch  {
        return null;
    }
}
async function getUserRoleAndVendorFilter(userId) {
    let vendorId = null;
    let role = null;
    const userResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT u.role, v.id as vendor_id FROM users u 
     LEFT JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`, [
        userId
    ]);
    if (userResult && userResult.length > 0) {
        vendorId = userResult[0].vendor_id;
        role = userResult[0].role;
    }
    if (!vendorId) {
        const staffResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT DISTINCT b.vendor_id, s.role FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`, [
            userId
        ]);
        if (staffResult && staffResult.length > 0) {
            vendorId = staffResult[0].vendor_id;
            if (!role) role = staffResult[0].role;
        }
    }
    if (!vendorId) {
        const staffBranchIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT branch_id, role FROM staff WHERE user_id = $1`, [
            userId
        ]);
        if (staffBranchIds && staffBranchIds.length > 0) {
            if (!role) role = staffBranchIds[0].role;
            return {
                role,
                vendorId: null,
                branchIds: staffBranchIds.map((s)=>s.branch_id)
            };
        }
        return {
            role,
            vendorId: null,
            branchIds: []
        };
    }
    return {
        role,
        vendorId,
        branchIds: null
    };
}
async function GET(request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized. Please log in.'
            }, {
                status: 401
            });
        }
        const { role, vendorId, branchIds } = await getUserRoleAndVendorFilter(userId);
        const restrictedRoles = [
            'supervisor',
            'manager',
            'cashier'
        ];
        if (role && restrictedRoles.includes(role.toLowerCase())) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Access denied. You do not have permission to view headquarters data.'
            }, {
                status: 403
            });
        }
        if (!vendorId && branchIds && branchIds.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
        let branchFilterParams = [];
        if (vendorId) {
            branchFilter = 'AND s.branch_id IN (SELECT id FROM branches WHERE vendor_id = $2)';
            branchFilterParams = [
                vendorId
            ];
        } else if (branchIds && branchIds.length > 0) {
            branchFilter = 'AND s.branch_id = ANY($2::uuid[])';
            branchFilterParams = [
                branchIds
            ];
        }
        const [revenueResult, lastMonthRevenueResult, transactionsResult, employeesResult, inventoryResult, branchStatsResult, monthlyRevenueResult] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales s
        WHERE created_at >= $1 ${branchFilter}
      `, [
                startOfMonth,
                ...branchFilterParams
            ]),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales s
        WHERE created_at >= $1 AND created_at <= $2 ${branchFilter.replace('$2', '$3')}
      `, [
                startOfLastMonth,
                endOfLastMonth,
                ...branchFilterParams
            ]),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT COUNT(*) as total_transactions
        FROM sales s
        WHERE created_at >= $1 ${branchFilter}
      `, [
                startOfMonth,
                ...branchFilterParams
            ]),
            vendorId ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT COUNT(DISTINCT u.id) as total_employees
        FROM users u
        JOIN staff st ON st.user_id = u.id
        JOIN branches b ON st.branch_id = b.id
        WHERE b.vendor_id = $1
      `, [
                vendorId
            ]) : branchIds && branchIds.length > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT COUNT(DISTINCT u.id) as total_employees
        FROM users u
        JOIN staff st ON st.user_id = u.id
        WHERE st.branch_id = ANY($1::uuid[])
      `, [
                branchIds
            ]) : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`SELECT 0 as total_employees`),
            vendorId ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT 
          COALESCE(SUM(current_stock), 0) as total_inventory,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%diesel%' THEN current_stock ELSE 0 END), 0) as diesel_stock,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%petrol%' OR LOWER(fuel_type) LIKE '%super%' OR LOWER(fuel_type) LIKE '%unleaded%' THEN current_stock ELSE 0 END), 0) as petrol_stock
        FROM tanks t
        JOIN branches b ON t.branch_id = b.id
        WHERE b.vendor_id = $1 AND (t.status = 'active' OR t.status IS NULL)
      `, [
                vendorId
            ]) : branchIds && branchIds.length > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT 
          COALESCE(SUM(current_stock), 0) as total_inventory,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%diesel%' THEN current_stock ELSE 0 END), 0) as diesel_stock,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%petrol%' OR LOWER(fuel_type) LIKE '%super%' OR LOWER(fuel_type) LIKE '%unleaded%' THEN current_stock ELSE 0 END), 0) as petrol_stock
        FROM tanks t
        WHERE t.branch_id = ANY($1::uuid[]) AND (t.status = 'active' OR t.status IS NULL)
      `, [
                branchIds
            ]) : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`SELECT 0 as total_inventory, 0 as diesel_stock, 0 as petrol_stock`),
            vendorId ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
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
      `, [
                startOfMonth,
                vendorId
            ]) : branchIds && branchIds.length > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
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
      `, [
                startOfMonth,
                branchIds
            ]) : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`SELECT NULL as id, NULL as name, 0 as mtd_sales, 0 as mtd_purchases, 0 as bulk_sales_count, 0 as bulk_sales_volume, 0 as bulk_sales_amount WHERE false`),
            vendorId ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') as month,
          COALESCE(SUM(s.total_amount), 0) as revenue
        FROM sales s
        JOIN branches b ON s.branch_id = b.id
        WHERE s.created_at >= NOW() - INTERVAL '6 months' AND b.vendor_id = $1
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY DATE_TRUNC('month', s.created_at)
      `, [
                vendorId
            ]) : branchIds && branchIds.length > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') as month,
          COALESCE(SUM(s.total_amount), 0) as revenue
        FROM sales s
        WHERE s.created_at >= NOW() - INTERVAL '6 months' AND s.branch_id = ANY($1::uuid[])
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY DATE_TRUNC('month', s.created_at)
      `, [
                branchIds
            ]) : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].query(`SELECT NULL as month, 0 as revenue WHERE false`)
        ]);
        const currentRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || 0);
        const lastMonthRevenue = parseFloat(lastMonthRevenueResult.rows[0]?.total_revenue || 0);
        const revenueGrowth = lastMonthRevenue > 0 ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : '0';
        const currentInventory = parseFloat(inventoryResult.rows[0]?.total_inventory || 0);
        const dieselStock = parseFloat(inventoryResult.rows[0]?.diesel_stock || 0);
        const petrolStock = parseFloat(inventoryResult.rows[0]?.petrol_stock || 0);
        const branchPerformance = branchStatsResult.rows.map((row)=>({
                branch: row.name,
                sales: parseFloat(row.mtd_sales) / 1000,
                purchases: parseFloat(row.mtd_purchases) / 1000,
                bulkSalesCount: parseInt(row.bulk_sales_count) || 0,
                bulkSalesVolume: parseFloat(row.bulk_sales_volume) || 0,
                bulkSalesAmount: parseFloat(row.bulk_sales_amount) || 0
            }));
        const monthlyRevenue = monthlyRevenueResult.rows.map((row)=>({
                month: row.month,
                revenue: parseFloat(row.revenue)
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
    } catch (error) {
        console.error('[HQ Stats] Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Failed to fetch stats'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__999dfc01._.js.map