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
"[project]/app/api/shifts/reconcile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
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
async function POST(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { shift_id, attendant_collections, expenses, banking, notes } = body;
        if (!shift_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "shift_id is required"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        const shiftCheck = await client.query(`SELECT s.*, b.vendor_id FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1`, [
            shift_id
        ]);
        if (shiftCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift not found"
            }, {
                status: 404
            });
        }
        const shift = shiftCheck.rows[0];
        const branchId = shift.branch_id;
        const vendorId = shift.vendor_id;
        if (shift.reconciliation_status === 'reconciled') {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift has already been reconciled"
            }, {
                status: 400
            });
        }
        if (!attendant_collections || attendant_collections.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Attendant collections are required for reconciliation"
            }, {
                status: 400
            });
        }
        const hasValidCollections = attendant_collections.some((c)=>c.attendant_id && c.payments && Array.isArray(c.payments) && c.payments.some((p)=>p.amount > 0));
        if (!hasValidCollections) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "At least one attendant must have collection amounts entered"
            }, {
                status: 400
            });
        }
        if (!banking || banking.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Banking summary is required for reconciliation"
            }, {
                status: 400
            });
        }
        const hasValidBanking = banking.some((b)=>b.banking_account_id && b.amount > 0);
        if (!hasValidBanking) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "At least one banking entry with a valid amount is required"
            }, {
                status: 400
            });
        }
        await client.query(`DELETE FROM attendant_collections WHERE shift_id = $1`, [
            shift_id
        ]);
        if (attendant_collections && attendant_collections.length > 0) {
            for (const collection of attendant_collections){
                if (collection.attendant_id && collection.payments && Array.isArray(collection.payments)) {
                    for (const payment of collection.payments){
                        if (payment.payment_method && payment.amount > 0) {
                            await client.query(`INSERT INTO attendant_collections (shift_id, branch_id, staff_id, payment_method, amount, is_app_payment)
                 VALUES ($1, $2, $3, $4, $5, false)`, [
                                shift_id,
                                branchId,
                                collection.attendant_id,
                                payment.payment_method,
                                payment.amount
                            ]);
                        }
                    }
                }
            }
        }
        await client.query(`DELETE FROM shift_expenses WHERE shift_id = $1`, [
            shift_id
        ]);
        if (expenses && expenses.length > 0) {
            for (const expense of expenses){
                if (expense.expense_account_id && expense.amount > 0) {
                    const accountCheck = await client.query('SELECT id FROM expense_accounts WHERE id = $1 AND vendor_id = $2', [
                        expense.expense_account_id,
                        vendorId
                    ]);
                    if (accountCheck.rows.length === 0) {
                        console.warn(`[Reconcile] Skipping invalid expense account ${expense.expense_account_id}`);
                        continue;
                    }
                    await client.query(`INSERT INTO shift_expenses (shift_id, branch_id, expense_account_id, amount, description)
             VALUES ($1, $2, $3, $4, $5)`, [
                        shift_id,
                        branchId,
                        expense.expense_account_id,
                        expense.amount,
                        expense.description || null
                    ]);
                }
            }
        }
        await client.query(`DELETE FROM shift_banking WHERE shift_id = $1`, [
            shift_id
        ]);
        if (banking && banking.length > 0) {
            for (const entry of banking){
                if (entry.banking_account_id && entry.amount > 0) {
                    const accountCheck = await client.query('SELECT id FROM banking_accounts WHERE id = $1 AND vendor_id = $2', [
                        entry.banking_account_id,
                        vendorId
                    ]);
                    if (accountCheck.rows.length === 0) {
                        console.warn(`[Reconcile] Skipping invalid banking account ${entry.banking_account_id}`);
                        continue;
                    }
                    await client.query(`INSERT INTO shift_banking (shift_id, banking_account_id, amount, notes)
             VALUES ($1, $2, $3, $4)`, [
                        shift_id,
                        entry.banking_account_id,
                        entry.amount,
                        entry.notes || null
                    ]);
                }
            }
        }
        if (notes) {
            await client.query(`UPDATE shifts SET notes = $1 WHERE id = $2`, [
                notes,
                shift_id
            ]);
        }
        await client.query(`UPDATE shifts SET reconciliation_status = 'reconciled', updated_at = NOW() WHERE id = $1`, [
            shift_id
        ]);
        await client.query('COMMIT');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Shift reconciled successfully"
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error reconciling shift:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to reconcile shift",
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

//# sourceMappingURL=%5Broot-of-the-server%5D__a9b87b45._.js.map