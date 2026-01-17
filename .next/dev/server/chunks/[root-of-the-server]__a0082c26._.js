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
"[project]/app/api/shifts/[id]/details/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
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
async function GET(request, { params }) {
    try {
        const { id } = await params;
        const shiftResult = await pool.query(`SELECT s.*, b.name as branch_name, st.full_name as staff_name, st.username as staff_username
       FROM shifts s
       LEFT JOIN branches b ON s.branch_id = b.id
       LEFT JOIN staff st ON s.staff_id = st.id
       WHERE s.id = $1`, [
            id
        ]);
        if (shiftResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift not found"
            }, {
                status: 404
            });
        }
        const shift = shiftResult.rows[0];
        const readingsResult = await pool.query(`SELECT sr.*, 
              n.nozzle_number, 
              d.name as dispenser_name,
              i.item_name as fuel_type,
              t.name as tank_name,
              ti.item_name as tank_fuel_type,
              u.username as incoming_attendant_name
       FROM shift_readings sr
       LEFT JOIN nozzles n ON sr.nozzle_id = n.id
       LEFT JOIN dispensers d ON n.dispenser_id = d.id
       LEFT JOIN items i ON n.item_id = i.id
       LEFT JOIN tanks t ON sr.tank_id = t.id
       LEFT JOIN items ti ON t.item_id = ti.id
       LEFT JOIN users u ON sr.incoming_attendant_id = u.id
       WHERE sr.shift_id = $1
       ORDER BY sr.reading_type, n.nozzle_number`, [
            id
        ]);
        const collectionsResult = await pool.query(`SELECT ac.*, 
              COALESCE(st.full_name, st.username, u.username) as staff_name
       FROM attendant_collections ac
       LEFT JOIN staff st ON ac.staff_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       WHERE ac.shift_id = $1
       ORDER BY ac.staff_id, ac.payment_method`, [
            id
        ]);
        const expensesResult = await pool.query(`SELECT se.*, ea.name as expense_account_name
       FROM shift_expenses se
       LEFT JOIN expense_accounts ea ON se.expense_account_id = ea.id
       WHERE se.shift_id = $1
       ORDER BY se.created_at`, [
            id
        ]);
        const bankingResult = await pool.query(`SELECT sb.*, ba.account_name, ba.bank_name, ba.account_number
       FROM shift_banking sb
       LEFT JOIN banking_accounts ba ON sb.banking_account_id = ba.id
       WHERE sb.shift_id = $1
       ORDER BY sb.created_at`, [
            id
        ]);
        const salesResult = await pool.query(`SELECT COUNT(*) as count, 
              COALESCE(SUM(total_amount), 0) as total_amount,
              COALESCE(SUM(quantity), 0) as total_quantity
       FROM sales
       WHERE branch_id = $1 
         AND created_at >= $2 
         AND ($3::timestamp IS NULL OR created_at <= $3)`, [
            shift.branch_id,
            shift.start_time,
            shift.end_time
        ]);
        const nozzleReadings = readingsResult.rows.filter((r)=>r.reading_type === 'nozzle');
        const tankReadings = readingsResult.rows.filter((r)=>r.reading_type === 'tank');
        const collectionsGrouped = {};
        for (const c of collectionsResult.rows){
            if (!collectionsGrouped[c.staff_id]) {
                collectionsGrouped[c.staff_id] = {
                    staff_id: c.staff_id,
                    staff_name: c.staff_name || 'Unknown',
                    payments: {}
                };
            }
            collectionsGrouped[c.staff_id].payments[c.payment_method] = parseFloat(c.amount) || 0;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            shift: {
                ...shift,
                cashier: shift.staff_name || shift.staff_username || 'Unknown'
            },
            nozzleReadings: nozzleReadings.map((r)=>({
                    id: r.id,
                    nozzle_id: r.nozzle_id,
                    nozzle_number: r.nozzle_number,
                    dispenser_name: r.dispenser_name,
                    fuel_type: r.fuel_type,
                    opening_reading: parseFloat(r.opening_reading) || 0,
                    closing_reading: parseFloat(r.closing_reading) || 0,
                    meter_difference: (parseFloat(r.closing_reading) || 0) - (parseFloat(r.opening_reading) || 0),
                    rtt: parseFloat(r.rtt) || 0,
                    self_fueling: parseFloat(r.self_fueling) || 0,
                    prepaid_sale: parseFloat(r.prepaid_sale) || 0,
                    incoming_attendant_name: r.incoming_attendant_name
                })),
            tankReadings: tankReadings.map((r)=>({
                    id: r.id,
                    tank_id: r.tank_id,
                    tank_name: r.tank_name,
                    fuel_type: r.tank_fuel_type,
                    opening_reading: parseFloat(r.opening_reading) || 0,
                    closing_reading: parseFloat(r.closing_reading) || 0,
                    stock_received: parseFloat(r.stock_received) || 0
                })),
            collections: Object.values(collectionsGrouped),
            expenses: expensesResult.rows.map((e)=>({
                    id: e.id,
                    expense_account_name: e.expense_account_name,
                    amount: parseFloat(e.amount) || 0,
                    description: e.description
                })),
            banking: bankingResult.rows.map((b)=>({
                    id: b.id,
                    account_name: b.account_name,
                    bank_name: b.bank_name,
                    account_number: b.account_number,
                    amount: parseFloat(b.amount) || 0,
                    notes: b.notes
                })),
            salesSummary: {
                count: parseInt(salesResult.rows[0]?.count) || 0,
                total_amount: parseFloat(salesResult.rows[0]?.total_amount) || 0,
                total_quantity: parseFloat(salesResult.rows[0]?.total_quantity) || 0
            }
        });
    } catch (error) {
        console.error("Error fetching shift details:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch shift details",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a0082c26._.js.map