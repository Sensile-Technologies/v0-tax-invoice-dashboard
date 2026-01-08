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
"[project]/app/api/shifts/daily-summary/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get('branch_id');
        const date = searchParams.get('date');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "branch_id is required"
            }, {
                status: 400
            });
        }
        let startOfPeriod;
        let endOfPeriod;
        if (startDate && endDate) {
            startOfPeriod = `${startDate}T00:00:00`;
            endOfPeriod = `${endDate}T23:59:59`;
        } else if (date) {
            startOfPeriod = `${date}T00:00:00`;
            endOfPeriod = `${date}T23:59:59`;
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "date or (start_date and end_date) are required"
            }, {
                status: 400
            });
        }
        const shiftsQuery = `
      SELECT 
        s.id,
        s.start_time,
        s.end_time,
        s.status,
        COALESCE(st.full_name, 'Unknown') as cashier_name
      FROM shifts s
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE s.branch_id = $1
        AND s.start_time >= $2
        AND s.start_time <= $3
      ORDER BY s.start_time ASC
    `;
        const shiftsResult = await pool.query(shiftsQuery, [
            branchId,
            startOfPeriod,
            endOfPeriod
        ]);
        const shiftSummaries = [];
        for (const shift of shiftsResult.rows){
            const nozzleReadingsQuery = `
        SELECT 
          sr.nozzle_id,
          sr.opening_reading,
          sr.closing_reading,
          i.item_name as fuel_type
        FROM shift_readings sr
        JOIN nozzles n ON sr.nozzle_id = n.id
        JOIN items i ON n.item_id = i.id
        WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
      `;
            const readingsResult = await pool.query(nozzleReadingsQuery, [
                shift.id
            ]);
            const invoicedSalesQuery = `
        SELECT 
          s.nozzle_id,
          COALESCE(i.item_name, s.fuel_type) as fuel_type,
          SUM(s.quantity) as invoiced_quantity,
          SUM(s.total_amount) as invoiced_amount
        FROM sales s
        LEFT JOIN items i ON s.item_id = i.id
        WHERE s.shift_id = $1 AND s.nozzle_id IS NOT NULL
          AND (s.source_system IS NULL OR s.source_system NOT IN ('meter_diff_bulk', 'PTS'))
          AND s.is_automated = false
        GROUP BY s.nozzle_id, COALESCE(i.item_name, s.fuel_type)
      `;
            const invoicedResult = await pool.query(invoicedSalesQuery, [
                shift.id
            ]);
            const invoicedMap = new Map();
            for (const row of invoicedResult.rows){
                const key = row.nozzle_id;
                invoicedMap.set(key, {
                    quantity: parseFloat(row.invoiced_quantity) || 0,
                    amount: parseFloat(row.invoiced_amount) || 0
                });
            }
            const fuelTypeData = new Map();
            for (const reading of readingsResult.rows){
                const openingReading = parseFloat(reading.opening_reading) || 0;
                const closingReading = parseFloat(reading.closing_reading) || 0;
                const meterDifference = closingReading - openingReading;
                const invoiced = invoicedMap.get(reading.nozzle_id);
                const claimedQty = invoiced?.quantity || 0;
                const claimedAmt = invoiced?.amount || 0;
                const unclaimedQty = Math.max(0, meterDifference - claimedQty);
                const rawFuelType = reading.fuel_type || "Other";
                const fuelType = rawFuelType.charAt(0).toUpperCase() + rawFuelType.slice(1).toLowerCase();
                const existing = fuelTypeData.get(fuelType) || {
                    claimed: {
                        quantity: 0,
                        amount: 0
                    },
                    unclaimed: {
                        quantity: 0,
                        amount: 0
                    },
                    unitPrice: 0
                };
                existing.claimed.quantity += claimedQty;
                existing.claimed.amount += claimedAmt;
                existing.unclaimed.quantity += unclaimedQty;
                if (claimedQty > 0 && claimedAmt > 0) {
                    existing.unitPrice = claimedAmt / claimedQty;
                }
                fuelTypeData.set(fuelType, existing);
            }
            const items = [];
            let totalClaimedQty = 0;
            let totalClaimedAmt = 0;
            let totalUnclaimedQty = 0;
            let totalUnclaimedAmt = 0;
            for (const [fuelType, data] of fuelTypeData){
                const unitPrice = data.unitPrice || 180;
                const unclaimedAmt = data.unclaimed.quantity * unitPrice;
                items.push({
                    fuel_type: fuelType,
                    claimed_quantity: data.claimed.quantity,
                    claimed_amount: data.claimed.amount,
                    unclaimed_quantity: data.unclaimed.quantity,
                    unclaimed_amount: unclaimedAmt
                });
                totalClaimedQty += data.claimed.quantity;
                totalClaimedAmt += data.claimed.amount;
                totalUnclaimedQty += data.unclaimed.quantity;
                totalUnclaimedAmt += unclaimedAmt;
            }
            items.sort((a, b)=>a.fuel_type.localeCompare(b.fuel_type));
            shiftSummaries.push({
                shift_id: shift.id,
                cashier_name: shift.cashier_name,
                start_time: shift.start_time,
                end_time: shift.end_time,
                status: shift.status,
                items,
                totals: {
                    claimed_quantity: totalClaimedQty,
                    claimed_amount: totalClaimedAmt,
                    unclaimed_quantity: totalUnclaimedQty,
                    unclaimed_amount: totalUnclaimedAmt
                }
            });
        }
        const grandTotals = {
            claimed_quantity: shiftSummaries.reduce((sum, s)=>sum + s.totals.claimed_quantity, 0),
            claimed_amount: shiftSummaries.reduce((sum, s)=>sum + s.totals.claimed_amount, 0),
            unclaimed_quantity: shiftSummaries.reduce((sum, s)=>sum + s.totals.unclaimed_quantity, 0),
            unclaimed_amount: shiftSummaries.reduce((sum, s)=>sum + s.totals.unclaimed_amount, 0)
        };
        const productSummary = new Map();
        for (const shift of shiftSummaries){
            for (const item of shift.items){
                const existing = productSummary.get(item.fuel_type) || {
                    fuel_type: item.fuel_type,
                    claimed_quantity: 0,
                    claimed_amount: 0,
                    unclaimed_quantity: 0,
                    unclaimed_amount: 0
                };
                existing.claimed_quantity += item.claimed_quantity;
                existing.claimed_amount += item.claimed_amount;
                existing.unclaimed_quantity += item.unclaimed_quantity;
                existing.unclaimed_amount += item.unclaimed_amount;
                productSummary.set(item.fuel_type, existing);
            }
        }
        const productTotals = Array.from(productSummary.values()).sort((a, b)=>a.fuel_type.localeCompare(b.fuel_type));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                shifts: shiftSummaries,
                grandTotals,
                productTotals
            }
        });
    } catch (error) {
        console.error("Error fetching daily shift summary:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch daily shift summary",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3c5baf64._.js.map