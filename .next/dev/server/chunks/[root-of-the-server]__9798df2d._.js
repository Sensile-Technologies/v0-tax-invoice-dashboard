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
"[project]/app/api/stock-report/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const branchId = searchParams.get("branch_id");
        const tankId = searchParams.get("tank_id");
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");
        const tanksParams = [];
        let tankParamIndex = 1;
        let tankWhereClause = "WHERE 1=1";
        if (branchId) {
            tankWhereClause += ` AND t.branch_id = $${tankParamIndex}`;
            tanksParams.push(branchId);
            tankParamIndex++;
        }
        if (tankId) {
            tankWhereClause += ` AND t.id = $${tankParamIndex}`;
            tanksParams.push(tankId);
            tankParamIndex++;
        }
        const tanksQuery = `
      SELECT 
        t.id as tank_id,
        t.tank_name,
        i.item_name as fuel_type,
        t.capacity,
        t.current_stock,
        b.name as branch_name,
        b.id as branch_id
      FROM tanks t
      LEFT JOIN branches b ON t.branch_id = b.id
      JOIN items i ON t.item_id = i.id
      ${tankWhereClause}
      ORDER BY b.name, t.tank_name
    `;
        const tanksResult = await pool.query(tanksQuery, tanksParams);
        const summaryWithTotals = await Promise.all(tanksResult.rows.map(async (tank)=>{
            const aggParams = [
                tank.tank_id
            ];
            let aggParamIndex = 2;
            let dateFilter = "";
            if (startDate) {
                dateFilter += ` AND created_at >= $${aggParamIndex}`;
                aggParams.push(startDate);
                aggParamIndex++;
            }
            if (endDate) {
                dateFilter += ` AND created_at <= $${aggParamIndex}`;
                aggParams.push(endDate + 'T23:59:59');
                aggParamIndex++;
            }
            const aggQuery = `
          SELECT 
            COALESCE(SUM(CASE WHEN adjustment_type IN ('receive', 'stock_receive', 'addition', 'purchase_receive') THEN quantity ELSE 0 END), 0) as total_received,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('manual_adjustment', 'increase') AND quantity > 0 THEN quantity ELSE 0 END), 0) as total_adjusted_in,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('manual_adjustment', 'decrease') OR (adjustment_type = 'increase' AND quantity < 0) THEN ABS(quantity) ELSE 0 END), 0) as total_adjusted_out,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('sale', 'deduction') THEN ABS(quantity) ELSE 0 END), 0) as total_sold,
            COALESCE(SUM(CASE WHEN adjustment_type IN ('transfer_out', 'transfer') THEN ABS(quantity) ELSE 0 END), 0) as total_transferred_out,
            COALESCE(SUM(CASE WHEN adjustment_type = 'transfer_in' THEN quantity ELSE 0 END), 0) as total_transferred_in,
            COUNT(*) as movement_count
          FROM stock_adjustments
          WHERE tank_id = $1 ${dateFilter}
        `;
            const aggResult = await pool.query(aggQuery, aggParams);
            const agg = aggResult.rows[0] || {};
            return {
                ...tank,
                total_received: parseFloat(agg.total_received || 0),
                total_adjusted_in: parseFloat(agg.total_adjusted_in || 0),
                total_adjusted_out: parseFloat(agg.total_adjusted_out || 0),
                total_sold: parseFloat(agg.total_sold || 0),
                total_transferred_out: parseFloat(agg.total_transferred_out || 0),
                total_transferred_in: parseFloat(agg.total_transferred_in || 0),
                movement_count: parseInt(agg.movement_count || 0)
            };
        }));
        const movementsParams = [];
        let movementParamIndex = 1;
        let movementWhereClause = "WHERE 1=1";
        if (branchId) {
            movementWhereClause += ` AND sa.branch_id = $${movementParamIndex}`;
            movementsParams.push(branchId);
            movementParamIndex++;
        }
        if (tankId) {
            movementWhereClause += ` AND sa.tank_id = $${movementParamIndex}`;
            movementsParams.push(tankId);
            movementParamIndex++;
        }
        if (startDate) {
            movementWhereClause += ` AND sa.created_at >= $${movementParamIndex}`;
            movementsParams.push(startDate);
            movementParamIndex++;
        }
        if (endDate) {
            movementWhereClause += ` AND sa.created_at <= $${movementParamIndex}`;
            movementsParams.push(endDate + 'T23:59:59');
            movementParamIndex++;
        }
        const movementsQuery = `
      SELECT 
        sa.id,
        sa.tank_id,
        t.tank_name,
        i.item_name as fuel_type,
        b.name as branch_name,
        sa.adjustment_type,
        sa.quantity,
        sa.previous_stock,
        sa.new_stock,
        sa.reason,
        sa.requested_by,
        sa.approval_status,
        sa.kra_sync_status,
        sa.created_at
      FROM stock_adjustments sa
      LEFT JOIN tanks t ON sa.tank_id = t.id
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN branches b ON sa.branch_id = b.id
      ${movementWhereClause}
      ORDER BY sa.created_at DESC
      LIMIT 100
    `;
        const movementsResult = await pool.query(movementsQuery, movementsParams);
        const totals = summaryWithTotals.reduce((acc, row)=>({
                total_received: acc.total_received + row.total_received,
                total_adjusted_in: acc.total_adjusted_in + row.total_adjusted_in,
                total_adjusted_out: acc.total_adjusted_out + row.total_adjusted_out,
                total_sold: acc.total_sold + row.total_sold,
                total_transferred_out: acc.total_transferred_out + row.total_transferred_out,
                total_transferred_in: acc.total_transferred_in + row.total_transferred_in,
                current_stock: acc.current_stock + parseFloat(row.current_stock || 0),
                capacity: acc.capacity + parseFloat(row.capacity || 0)
            }), {
            total_received: 0,
            total_adjusted_in: 0,
            total_adjusted_out: 0,
            total_sold: 0,
            total_transferred_out: 0,
            total_transferred_in: 0,
            current_stock: 0,
            capacity: 0
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                summary: summaryWithTotals,
                movements: movementsResult.rows,
                totals
            }
        });
    } catch (error) {
        console.error("Error fetching stock report:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch stock report"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9798df2d._.js.map