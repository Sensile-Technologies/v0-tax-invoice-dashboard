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
"[project]/app/api/credit-transactions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
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
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch  {
        return null;
    }
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    if (!branchId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Branch ID required'
        }, {
            status: 400
        });
    }
    try {
        const session = await getSession();
        if (!session?.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const dateFilter = startDate && endDate ? `AND DATE(s.sale_date) BETWEEN $2 AND $3` : '';
        const dateParams = startDate && endDate ? [
            branchId,
            startDate,
            endDate
        ] : [
            branchId
        ];
        const creditSalesQuery = `
      SELECT 
        s.id,
        'sale' as credit_type,
        s.sale_date as transaction_date,
        DATE(s.sale_date) as day,
        s.invoice_number,
        s.customer_name,
        s.vehicle_number,
        s.total_amount as credit_amount,
        COALESCE(i.item_name, s.fuel_type) as item_name,
        s.quantity,
        s.unit_price,
        COALESCE(
          (SELECT SUM(cp.payment_amount) FROM credit_payments cp WHERE cp.source_id = s.id AND cp.credit_type = 'sale'),
          0
        ) as paid_amount
      FROM sales s
      LEFT JOIN items i ON s.item_id = i.id
      WHERE s.branch_id = $1
        AND s.payment_method = 'credit'
        AND (s.is_credit_note = false OR s.is_credit_note IS NULL)
        ${dateFilter}
      ORDER BY s.sale_date DESC
    `;
        const creditSales = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(creditSalesQuery, dateParams);
        const collectionDateFilter = startDate && endDate ? `AND DATE(ac.created_at) BETWEEN $2 AND $3` : '';
        const creditCollectionsQuery = `
      SELECT 
        ac.id,
        'collection' as credit_type,
        ac.created_at as transaction_date,
        DATE(ac.created_at) as day,
        sh.id as shift_id,
        u.full_name as staff_name,
        ac.amount as credit_amount,
        COALESCE(
          (SELECT SUM(cp.payment_amount) FROM credit_payments cp WHERE cp.source_id = ac.id AND cp.credit_type = 'collection'),
          0
        ) as paid_amount
      FROM attendant_collections ac
      JOIN shifts sh ON ac.shift_id = sh.id
      LEFT JOIN users u ON ac.staff_id = u.id
      WHERE ac.branch_id = $1
        AND ac.payment_method = 'credit'
        ${collectionDateFilter}
      ORDER BY ac.created_at DESC
    `;
        const creditCollections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(creditCollectionsQuery, dateParams);
        const allTransactions = [
            ...creditSales.map((s)=>({
                    ...s,
                    credit_amount: parseFloat(s.credit_amount) || 0,
                    paid_amount: parseFloat(s.paid_amount) || 0,
                    outstanding: (parseFloat(s.credit_amount) || 0) - (parseFloat(s.paid_amount) || 0)
                })),
            ...creditCollections.map((c)=>({
                    ...c,
                    credit_amount: parseFloat(c.credit_amount) || 0,
                    paid_amount: parseFloat(c.paid_amount) || 0,
                    outstanding: (parseFloat(c.credit_amount) || 0) - (parseFloat(c.paid_amount) || 0)
                }))
        ].sort((a, b)=>new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
        const dailyTotals = {};
        for (const tx of allTransactions){
            const day = tx.day;
            if (!dailyTotals[day]) {
                dailyTotals[day] = {
                    date: day,
                    total_credit: 0,
                    total_paid: 0,
                    outstanding: 0,
                    transactions: []
                };
            }
            dailyTotals[day].total_credit += tx.credit_amount;
            dailyTotals[day].total_paid += tx.paid_amount;
            dailyTotals[day].outstanding += tx.outstanding;
            dailyTotals[day].transactions.push(tx);
        }
        const dailySummary = Object.values(dailyTotals).sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
        const overallTotals = {
            total_credit: allTransactions.reduce((sum, tx)=>sum + tx.credit_amount, 0),
            total_paid: allTransactions.reduce((sum, tx)=>sum + tx.paid_amount, 0),
            outstanding: allTransactions.reduce((sum, tx)=>sum + tx.outstanding, 0)
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                daily: dailySummary,
                totals: overallTotals,
                transaction_count: allTransactions.length
            }
        });
    } catch (error) {
        console.error('Error fetching credit transactions:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch credit transactions'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await request.json();
        const { branch_id, credit_type, source_id, source_date, payment_amount, payment_reference, payment_notes } = body;
        if (!branch_id || !credit_type || !source_id || !payment_amount) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Missing required fields: branch_id, credit_type, source_id, payment_amount'
            }, {
                status: 400
            });
        }
        const paymentNum = parseFloat(payment_amount);
        if (isNaN(paymentNum) || paymentNum <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Payment amount must be greater than 0'
            }, {
                status: 400
            });
        }
        let originalAmount = 0;
        let actualSourceDate = source_date;
        if (credit_type === 'sale') {
            const saleResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT total_amount, DATE(sale_date) as day FROM sales 
         WHERE id = $1 AND branch_id = $2 AND payment_method = 'credit'`, [
                source_id,
                branch_id
            ]);
            if (saleResult.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: 'Credit sale not found or access denied'
                }, {
                    status: 404
                });
            }
            originalAmount = parseFloat(saleResult[0].total_amount) || 0;
            actualSourceDate = saleResult[0].day;
        } else if (credit_type === 'collection') {
            const collectionResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT amount, DATE(created_at) as day FROM attendant_collections 
         WHERE id = $1 AND branch_id = $2 AND payment_method = 'credit'`, [
                source_id,
                branch_id
            ]);
            if (collectionResult.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: 'Credit collection not found or access denied'
                }, {
                    status: 404
                });
            }
            originalAmount = parseFloat(collectionResult[0].amount) || 0;
            actualSourceDate = collectionResult[0].day;
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid credit_type. Must be "sale" or "collection"'
            }, {
                status: 400
            });
        }
        const existingPayments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT COALESCE(SUM(payment_amount), 0) as total_paid 
       FROM credit_payments 
       WHERE source_id = $1 AND credit_type = $2`, [
            source_id,
            credit_type
        ]);
        const totalPaid = parseFloat(existingPayments[0]?.total_paid || 0);
        const outstanding = originalAmount - totalPaid;
        if (paymentNum > outstanding + 0.01) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: `Payment exceeds outstanding amount. Outstanding: ${outstanding.toFixed(2)}`
            }, {
                status: 400
            });
        }
        const userResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT u.id, v.id as vendor_id, s.branch_id as staff_branch_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`, [
            session.id
        ]);
        let vendorId = userResult[0]?.vendor_id || null;
        if (!vendorId && userResult[0]?.staff_branch_id) {
            const branchResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT vendor_id FROM branches WHERE id = $1', [
                userResult[0].staff_branch_id
            ]);
            vendorId = branchResult[0]?.vendor_id || null;
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO credit_payments (
        branch_id, vendor_id, credit_type, source_id, source_date, 
        credit_amount, payment_amount, payment_reference, payment_notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`, [
            branch_id,
            vendorId,
            credit_type,
            source_id,
            actualSourceDate || new Date().toISOString().split('T')[0],
            originalAmount,
            paymentNum,
            payment_reference || null,
            payment_notes || null,
            session.id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error recording credit payment:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to record payment'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9f6a0a29._.js.map