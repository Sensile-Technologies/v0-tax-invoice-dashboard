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
"[project]/app/api/customers/list/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get("branch_id");
        const vendorId = searchParams.get("vendor_id");
        const userId = searchParams.get("user_id");
        let vendorFilter = vendorId;
        if (userId && !vendorFilter) {
            const userResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`, [
                userId
            ]);
            if (userResult && userResult.length > 0) {
                vendorFilter = userResult[0].vendor_id;
            }
        }
        let result;
        if (branchId) {
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_phone = c.tel_no AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_phone = c.tel_no AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.branch_id = $1 AND c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `, [
                branchId
            ]);
        } else if (vendorFilter) {
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_phone = c.tel_no AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_phone = c.tel_no AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE b.vendor_id = $1 AND c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `, [
                vendorFilter
            ]);
        } else {
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_phone = c.tel_no AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_phone = c.tel_no AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            customers: result
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch customers",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8e81160e._.js.map