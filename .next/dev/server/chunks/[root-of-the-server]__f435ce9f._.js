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
"[project]/app/api/shifts/nozzle-report/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const shiftId = searchParams.get('shift_id');
        const branchId = searchParams.get('branch_id');
        const date = searchParams.get('date');
        const userId = searchParams.get('user_id');
        let vendorId = null;
        if (userId) {
            const userVendorResult = await pool.query(`SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`, [
                userId
            ]);
            if (userVendorResult.rows.length > 0) {
                vendorId = userVendorResult.rows[0].vendor_id;
            } else {
                const staffResult = await pool.query(`SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`, [
                    userId
                ]);
                if (staffResult.rows.length > 0) {
                    vendorId = staffResult.rows[0].vendor_id;
                }
            }
        }
        if (shiftId) {
            const report = await getShiftNozzleReport(shiftId, vendorId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: report
            });
        }
        if (branchId && date) {
            const report = await getDailyNozzleReport(branchId, date, vendorId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: report
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Either shift_id or (branch_id and date) are required"
        }, {
            status: 400
        });
    } catch (error) {
        console.error("Error fetching nozzle report:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch nozzle report",
            details: error.message
        }, {
            status: 500
        });
    }
}
async function getShiftNozzleReport(shiftId, vendorId) {
    const shiftQuery = `
    SELECT s.*, b.name as branch_name, st.full_name as cashier_name
    FROM shifts s
    LEFT JOIN branches b ON s.branch_id = b.id
    LEFT JOIN staff st ON s.staff_id = st.id
    WHERE s.id = $1
    ${vendorId ? 'AND b.vendor_id = $2' : ''}
  `;
    const shiftParams = vendorId ? [
        shiftId,
        vendorId
    ] : [
        shiftId
    ];
    const shiftResult = await pool.query(shiftQuery, shiftParams);
    if (shiftResult.rows.length === 0) {
        return {
            shift: null,
            nozzles: [],
            totals: null
        };
    }
    const shift = shiftResult.rows[0];
    const nozzleReadingsQuery = `
    SELECT 
      sr.nozzle_id,
      sr.opening_reading,
      sr.closing_reading,
      n.nozzle_number,
      COALESCE(i.item_name, 'Unknown') as fuel_type,
      'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name
    FROM shift_readings sr
    JOIN nozzles n ON sr.nozzle_id = n.id
    LEFT JOIN items i ON n.item_id = i.id
    LEFT JOIN dispensers d ON n.dispenser_id = d.id
    WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
  `;
    const readingsResult = await pool.query(nozzleReadingsQuery, [
        shiftId
    ]);
    const invoicedSalesQuery = `
    SELECT 
      nozzle_id,
      SUM(quantity) as invoiced_quantity,
      SUM(total_amount) as invoiced_amount
    FROM sales
    WHERE shift_id = $1 AND nozzle_id IS NOT NULL
      AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
    GROUP BY nozzle_id
  `;
    const invoicedResult = await pool.query(invoicedSalesQuery, [
        shiftId
    ]);
    const invoicedMap = new Map(invoicedResult.rows.map((r)=>[
            r.nozzle_id,
            r
        ]));
    const nozzles = readingsResult.rows.map((reading)=>{
        const openingReading = parseFloat(reading.opening_reading) || 0;
        const closingReading = parseFloat(reading.closing_reading) || 0;
        const meterDifference = closingReading - openingReading;
        const invoiced = invoicedMap.get(reading.nozzle_id);
        const invoicedQuantity = parseFloat(invoiced?.invoiced_quantity) || 0;
        const invoicedAmount = parseFloat(invoiced?.invoiced_amount) || 0;
        const variance = meterDifference - invoicedQuantity;
        return {
            nozzle_id: reading.nozzle_id,
            nozzle_name: reading.nozzle_name || `Nozzle ${reading.nozzle_number}`,
            fuel_type: reading.fuel_type,
            opening_reading: openingReading,
            closing_reading: closingReading,
            meter_difference: meterDifference,
            invoiced_quantity: invoicedQuantity,
            invoiced_amount: invoicedAmount,
            variance: variance
        };
    });
    const totals = {
        total_meter_difference: nozzles.reduce((sum, n)=>sum + n.meter_difference, 0),
        total_invoiced_quantity: nozzles.reduce((sum, n)=>sum + n.invoiced_quantity, 0),
        total_invoiced_amount: nozzles.reduce((sum, n)=>sum + n.invoiced_amount, 0),
        total_variance: nozzles.reduce((sum, n)=>sum + n.variance, 0)
    };
    return {
        shift: {
            id: shift.id,
            branch_name: shift.branch_name,
            cashier_name: shift.cashier_name,
            start_time: shift.start_time,
            end_time: shift.end_time,
            status: shift.status,
            opening_cash: parseFloat(shift.opening_cash) || 0,
            closing_cash: parseFloat(shift.closing_cash) || 0
        },
        nozzles,
        totals
    };
}
async function getDailyNozzleReport(branchId, date, vendorId) {
    const branchCheckQuery = vendorId ? `SELECT id, name FROM branches WHERE id = $1 AND vendor_id = $2` : `SELECT id, name FROM branches WHERE id = $1`;
    const branchCheckParams = vendorId ? [
        branchId,
        vendorId
    ] : [
        branchId
    ];
    const branchResult = await pool.query(branchCheckQuery, branchCheckParams);
    if (branchResult.rows.length === 0) {
        return {
            branch: null,
            shifts: [],
            nozzles: [],
            totals: null
        };
    }
    const branch = branchResult.rows[0];
    const shiftsQuery = `
    SELECT s.id, s.start_time, s.end_time, s.status, st.full_name as cashier_name
    FROM shifts s
    LEFT JOIN staff st ON s.staff_id = st.id
    WHERE s.branch_id = $1 
    AND DATE(s.start_time) = $2
    ORDER BY s.start_time
  `;
    const shiftsResult = await pool.query(shiftsQuery, [
        branchId,
        date
    ]);
    const shiftIds = shiftsResult.rows.map((s)=>s.id);
    if (shiftIds.length === 0) {
        const nozzlesQuery = `
      SELECT n.id, n.nozzle_number, COALESCE(i.item_name, 'Unknown') as fuel_type, n.initial_meter_reading,
        'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name
      FROM nozzles n
      LEFT JOIN dispensers d ON n.dispenser_id = d.id
      LEFT JOIN items i ON n.item_id = i.id
      WHERE n.branch_id = $1 AND n.status = 'active'
      ORDER BY n.nozzle_number
    `;
        const nozzlesResult = await pool.query(nozzlesQuery, [
            branchId
        ]);
        return {
            branch: {
                id: branch.id,
                name: branch.name
            },
            date,
            shifts: [],
            nozzles: nozzlesResult.rows.map((n)=>({
                    nozzle_id: n.id,
                    nozzle_name: n.nozzle_name,
                    fuel_type: n.fuel_type,
                    opening_reading: parseFloat(n.initial_meter_reading) || 0,
                    closing_reading: parseFloat(n.initial_meter_reading) || 0,
                    meter_difference: 0,
                    invoiced_quantity: 0,
                    invoiced_amount: 0,
                    variance: 0
                })),
            totals: {
                total_meter_difference: 0,
                total_invoiced_quantity: 0,
                total_invoiced_amount: 0,
                total_variance: 0
            }
        };
    }
    const nozzleReadingsQuery = `
    SELECT 
      sr.nozzle_id,
      n.nozzle_number,
      COALESCE(i.item_name, 'Unknown') as fuel_type,
      'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name,
      MIN(sr.opening_reading) as day_opening,
      MAX(sr.closing_reading) as day_closing
    FROM shift_readings sr
    JOIN nozzles n ON sr.nozzle_id = n.id
    LEFT JOIN items i ON n.item_id = i.id
    LEFT JOIN dispensers d ON n.dispenser_id = d.id
    WHERE sr.shift_id = ANY($1) AND sr.reading_type = 'nozzle'
    GROUP BY sr.nozzle_id, n.nozzle_number, COALESCE(i.item_name, 'Unknown'), d.dispenser_number
  `;
    const readingsResult = await pool.query(nozzleReadingsQuery, [
        shiftIds
    ]);
    const invoicedSalesQuery = `
    SELECT 
      nozzle_id,
      SUM(quantity) as invoiced_quantity,
      SUM(total_amount) as invoiced_amount
    FROM sales
    WHERE shift_id = ANY($1) AND nozzle_id IS NOT NULL
      AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
    GROUP BY nozzle_id
  `;
    const invoicedResult = await pool.query(invoicedSalesQuery, [
        shiftIds
    ]);
    const invoicedMap = new Map(invoicedResult.rows.map((r)=>[
            r.nozzle_id,
            r
        ]));
    const nozzles = readingsResult.rows.map((reading)=>{
        const openingReading = parseFloat(reading.day_opening) || 0;
        const closingReading = parseFloat(reading.day_closing) || 0;
        const meterDifference = closingReading - openingReading;
        const invoiced = invoicedMap.get(reading.nozzle_id);
        const invoicedQuantity = parseFloat(invoiced?.invoiced_quantity) || 0;
        const invoicedAmount = parseFloat(invoiced?.invoiced_amount) || 0;
        const variance = meterDifference - invoicedQuantity;
        return {
            nozzle_id: reading.nozzle_id,
            nozzle_name: reading.nozzle_name || `Nozzle ${reading.nozzle_number}`,
            fuel_type: reading.fuel_type,
            opening_reading: openingReading,
            closing_reading: closingReading,
            meter_difference: meterDifference,
            invoiced_quantity: invoicedQuantity,
            invoiced_amount: invoicedAmount,
            variance: variance
        };
    });
    const totals = {
        total_meter_difference: nozzles.reduce((sum, n)=>sum + n.meter_difference, 0),
        total_invoiced_quantity: nozzles.reduce((sum, n)=>sum + n.invoiced_quantity, 0),
        total_invoiced_amount: nozzles.reduce((sum, n)=>sum + n.invoiced_amount, 0),
        total_variance: nozzles.reduce((sum, n)=>sum + n.variance, 0)
    };
    return {
        branch: {
            id: branch.id,
            name: branch.name
        },
        date,
        shifts: shiftsResult.rows,
        nozzles,
        totals
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f435ce9f._.js.map