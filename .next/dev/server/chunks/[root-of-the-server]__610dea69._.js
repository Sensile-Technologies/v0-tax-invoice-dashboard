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
"[project]/app/api/customers/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get('branch_id');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '50');
        const offset = (page - 1) * pageSize;
        let baseQuery = `
      FROM customers c
      INNER JOIN customer_branches cb ON c.id = cb.customer_id
      WHERE c.use_yn = 'Y' AND cb.status = 'active'
    `;
        const params = [];
        let branchParamIndex = null;
        if (branchId) {
            params.push(branchId);
            branchParamIndex = params.length;
            baseQuery += ` AND cb.branch_id = $${branchParamIndex}`;
        }
        if (search) {
            params.push(`%${search}%`);
            baseQuery += ` AND (c.cust_nm ILIKE $${params.length} OR c.cust_tin ILIKE $${params.length} OR c.tel_no ILIKE $${params.length})`;
        }
        const countResult = await pool.query(`SELECT COUNT(DISTINCT c.id) ${baseQuery}`, params);
        const total = parseInt(countResult.rows[0].count);
        const dataParams = [
            ...params,
            pageSize,
            offset
        ];
        const limitParamIndex = dataParams.length - 1;
        const offsetParamIndex = dataParams.length;
        // Build branch-scoped aggregates with parameterized branch_id (reuses the same param index)
        const branchCondition = branchParamIndex ? ` AND lt.branch_id = $${branchParamIndex}` : '';
        const result = await pool.query(`SELECT DISTINCT c.id, c.cust_nm, c.cust_tin, c.cust_no, c.tel_no, c.email,
        COALESCE((SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE (lt.customer_name = c.cust_nm OR lt.customer_pin = c.cust_tin)${branchCondition}), 0) as total_points,
        COALESCE((SELECT COUNT(*) FROM loyalty_transactions lt WHERE (lt.customer_name = c.cust_nm OR lt.customer_pin = c.cust_tin)${branchCondition}), 0) as total_purchases,
        (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE (lt.customer_name = c.cust_nm OR lt.customer_pin = c.cust_tin)${branchCondition}) as last_activity
       ${baseQuery} ORDER BY c.cust_nm LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`, dataParams);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
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
async function POST(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { cust_nm, cust_tin, cust_no, tel_no, email, branch_id, vendor_id, tin, bhf_id } = body;
        if (!cust_nm) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Customer name is required"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        let customerId;
        let existingCustomer = null;
        if (cust_tin) {
            const existingResult = await client.query('SELECT id FROM customers WHERE cust_tin = $1', [
                cust_tin
            ]);
            existingCustomer = existingResult.rows[0];
        }
        if (!existingCustomer && tel_no) {
            const existingResult = await client.query('SELECT id FROM customers WHERE tel_no = $1', [
                tel_no
            ]);
            existingCustomer = existingResult.rows[0];
        }
        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            // tin and bhf_id are NOT NULL - use provided values or defaults
            const effectiveTin = tin || cust_tin || '';
            const effectiveBhfId = bhf_id || '00';
            const insertResult = await client.query(`INSERT INTO customers (cust_nm, cust_tin, cust_no, tel_no, email, tin, bhf_id, use_yn)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Y')
         RETURNING id`, [
                cust_nm,
                cust_tin || '',
                cust_no || null,
                tel_no || null,
                email || null,
                effectiveTin,
                effectiveBhfId
            ]);
            customerId = insertResult.rows[0].id;
        }
        if (branch_id) {
            await client.query(`INSERT INTO customer_branches (customer_id, branch_id, vendor_id, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (customer_id, branch_id) DO UPDATE SET status = 'active'`, [
                customerId,
                branch_id,
                vendor_id || null
            ]);
        }
        await client.query('COMMIT');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: existingCustomer ? 'Customer linked to branch' : 'Customer created and linked to branch',
            data: {
                id: customerId
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating customer:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create customer",
            details: error.message
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__610dea69._.js.map