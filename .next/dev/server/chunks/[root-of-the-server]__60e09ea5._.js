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
"[project]/app/api/branches/list/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function getSessionUserId(request) {
    try {
        // First try to get from cookie (preferred, more secure)
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
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
    } catch  {
        return null;
    }
}
async function getVendorIdFromUser(userId) {
    // Try to get vendor_id from user's vendor record
    const vendorResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT v.id as vendor_id FROM users u 
     JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`, [
        userId
    ]);
    if (vendorResult && vendorResult.length > 0) {
        return vendorResult[0].vendor_id;
    }
    // Try to get vendor_id from user's staff record
    const staffResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT DISTINCT b.vendor_id FROM staff s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`, [
        userId
    ]);
    if (staffResult && staffResult.length > 0) {
        return staffResult[0].vendor_id;
    }
    return null;
}
async function getUserRoleAndBranch(userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT COALESCE(s.role, u.role) as role, s.branch_id
     FROM users u 
     LEFT JOIN staff s ON s.user_id = u.id
     WHERE u.id = $1`, [
        userId
    ]);
    if (result && result.length > 0) {
        return {
            role: result[0].role,
            branchId: result[0].branch_id
        };
    }
    return {
        role: null,
        branchId: null
    };
}
async function GET(request) {
    try {
        // SECURITY: Get user ID from httpOnly session cookie or URL params (fallback)
        const userId = await getSessionUserId(request);
        if (!userId) {
            // Return empty array instead of 401 for backward compatibility
            // Frontend can still function with localStorage auth
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json([]);
        }
        // SECURITY: Always derive vendor_id and role from database (never trust cookie values)
        const vendorId = await getVendorIdFromUser(userId);
        const { role, branchId } = await getUserRoleAndBranch(userId);
        const restrictedRoles = [
            'supervisor',
            'manager'
        ];
        const isRestricted = role && restrictedRoles.includes(role.toLowerCase());
        // For managers/supervisors, only return their assigned branch with stats
        if (isRestricted && branchId) {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            const branches = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT b.*,
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
        WHERE b.id = $1 AND b.status IN ('active', 'pending_onboarding')`, [
                branchId,
                startOfMonth.toISOString(),
                startOfLastMonth.toISOString(),
                endOfLastMonth.toISOString()
            ]);
            const branchesWithStats = (branches || []).map((branch)=>{
                const mtdRevenue = parseFloat(branch.mtd_revenue) || 0;
                const lastMonthRevenue = parseFloat(branch.last_month_revenue) || 0;
                let growth = 0;
                if (lastMonthRevenue > 0) {
                    growth = Math.round((mtdRevenue - lastMonthRevenue) / lastMonthRevenue * 100);
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
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(branchesWithStats);
        }
        // SECURITY: Must have vendor_id to list branches
        if (!vendorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json([]);
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
        const params = [
            vendorId,
            startOfMonth.toISOString(),
            startOfLastMonth.toISOString(),
            endOfLastMonth.toISOString()
        ];
        let paramIndex = 5;
        if (name) {
            sql += ` AND LOWER(b.name) LIKE LOWER($${paramIndex})`;
            params.push(`%${name}%`);
            paramIndex++;
        }
        sql += " ORDER BY b.name";
        const branches = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
        // Calculate growth percentage for each branch
        const branchesWithStats = (branches || []).map((branch)=>{
            const mtdRevenue = parseFloat(branch.mtd_revenue) || 0;
            const lastMonthRevenue = parseFloat(branch.last_month_revenue) || 0;
            let growth = 0;
            if (lastMonthRevenue > 0) {
                growth = Math.round((mtdRevenue - lastMonthRevenue) / lastMonthRevenue * 100);
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(branchesWithStats);
    } catch (error) {
        console.error("Error fetching branches:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__60e09ea5._.js.map