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
"[project]/app/api/shifts/list/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const dateFrom = searchParams.get('date_from');
        const dateTo = searchParams.get('date_to');
        const search = searchParams.get('search');
        const userId = searchParams.get('user_id');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        let vendorId = null;
        let userBranchId = null;
        let userRole = null;
        if (userId) {
            const userVendorResult = await pool.query(`SELECT v.id as vendor_id, 'vendor' as role FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`, [
                userId
            ]);
            if (userVendorResult.rows.length > 0) {
                vendorId = userVendorResult.rows[0].vendor_id;
                userRole = 'vendor';
            } else {
                const staffResult = await pool.query(`SELECT s.branch_id, s.role, b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`, [
                    userId
                ]);
                if (staffResult.rows.length > 0) {
                    vendorId = staffResult.rows[0].vendor_id;
                    userBranchId = staffResult.rows[0].branch_id;
                    userRole = staffResult.rows[0].role;
                }
            }
        }
        let query = `
      SELECT 
        s.id,
        s.branch_id,
        s.staff_id,
        s.start_time,
        s.end_time,
        s.opening_cash,
        s.closing_cash,
        s.total_sales,
        s.status,
        s.notes,
        s.created_at,
        b.name as branch_name,
        st.full_name as staff_name,
        st.username as staff_username,
        COALESCE(nr.total_opening_reading, nz.total_nozzle_reading, 0) as total_opening_reading,
        COALESCE(nr.total_closing_reading, nz.total_nozzle_reading, 0) as total_closing_reading
      FROM shifts s
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN staff st ON s.staff_id = st.id
      LEFT JOIN LATERAL (
        SELECT 
          SUM(COALESCE(CAST(opening_reading AS numeric), 0)) as total_opening_reading,
          SUM(COALESCE(CAST(closing_reading AS numeric), 0)) as total_closing_reading
        FROM shift_readings sr
        WHERE sr.shift_id = s.id AND sr.reading_type = 'nozzle'
      ) nr ON true
      LEFT JOIN LATERAL (
        SELECT 
          SUM(COALESCE(initial_meter_reading, 0)) as total_nozzle_reading
        FROM nozzles n
        WHERE n.branch_id = s.branch_id AND n.status = 'active'
      ) nz ON true
      WHERE 1=1
    `;
        const params = [];
        if (vendorId) {
            params.push(vendorId);
            query += ` AND b.vendor_id = $${params.length}`;
        }
        // Supervisors and managers can only see their own branch (overrides any branchId param)
        const roleLower = userRole?.toLowerCase() || '';
        if ([
            'supervisor',
            'manager'
        ].includes(roleLower) && userBranchId) {
            // For restricted roles, ALWAYS use their assigned branch, ignore client-provided branch_id
            params.push(userBranchId);
            query += ` AND s.branch_id = $${params.length}`;
        } else if (branchId) {
            // For directors/vendors, allow filtering by specific branch
            params.push(branchId);
            query += ` AND s.branch_id = $${params.length}`;
        } else if (userBranchId) {
            // Fallback: use user's assigned branch if no branch_id provided
            params.push(userBranchId);
            query += ` AND s.branch_id = $${params.length}`;
        }
        if (dateFrom) {
            params.push(dateFrom);
            query += ` AND s.start_time >= $${params.length}::timestamp`;
        }
        if (dateTo) {
            params.push(dateTo + ' 23:59:59');
            query += ` AND s.start_time <= $${params.length}::timestamp`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (st.full_name ILIKE $${params.length} OR st.username ILIKE $${params.length} OR b.name ILIKE $${params.length})`;
        }
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0]?.total || '0');
        query += ` ORDER BY s.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        const result = await pool.query(query, params);
        const shifts = result.rows.map((shift)=>{
            const openingCash = parseFloat(shift.opening_cash) || 0;
            const closingCash = parseFloat(shift.closing_cash) || 0;
            const totalSales = parseFloat(shift.total_sales) || 0;
            const expectedCash = openingCash + totalSales;
            const variance = closingCash - expectedCash;
            const totalOpeningReading = parseFloat(shift.total_opening_reading) || 0;
            const totalClosingReading = parseFloat(shift.total_closing_reading) || 0;
            return {
                ...shift,
                opening_cash: openingCash,
                closing_cash: closingCash,
                total_sales: totalSales,
                variance: variance,
                total_opening_reading: totalOpeningReading,
                total_closing_reading: totalClosingReading,
                cashier: shift.staff_name || shift.staff_username || 'Unknown'
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: shifts,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + shifts.length < total
            }
        });
    } catch (error) {
        console.error("Error fetching shifts list:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch shifts",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2167b3cb._.js.map