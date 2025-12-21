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
"[project]/app/api/shifts/end-all/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const vendorId = searchParams.get('vendor_id');
        const userId = searchParams.get('user_id');
        let branchFilter = '';
        const params = [];
        if (vendorId) {
            params.push(vendorId);
            branchFilter = `AND b.vendor_id = $${params.length}`;
        } else if (userId) {
            params.push(userId);
            branchFilter = `AND (b.vendor_id IN (SELECT vendor_id FROM staff WHERE id = $${params.length}) OR EXISTS (SELECT 1 FROM staff WHERE id = $${params.length} AND role IN ('admin', 'superadmin')))`;
        }
        const result = await pool.query(`
      SELECT 
        s.id,
        s.branch_id,
        s.start_time,
        s.opening_cash,
        s.status,
        b.name as branch_name,
        b.location as branch_location,
        COALESCE(st.name, 'Unknown') as cashier_name,
        (SELECT COALESCE(SUM(total), 0) FROM sales WHERE branch_id = s.branch_id AND shift_id = s.id) as total_sales
      FROM shifts s
      JOIN branches b ON s.branch_id = b.id
      LEFT JOIN staff st ON s.cashier_id = st.id
      WHERE s.status = 'active'
      ${branchFilter}
      ORDER BY b.name
    `, params);
        const shifts = result.rows;
        const shiftsWithDetails = await Promise.all(shifts.map(async (shift)=>{
            const nozzlesResult = await pool.query(`
        SELECT n.id, n.nozzle_number, n.fuel_type, n.initial_meter_reading,
               COALESCE(
                 (SELECT sr.closing_reading FROM shift_readings sr 
                  WHERE sr.nozzle_id = n.id AND sr.reading_type = 'nozzle'
                  ORDER BY sr.created_at DESC LIMIT 1),
                 n.initial_meter_reading
               ) as current_reading,
               d.dispenser_number
        FROM nozzles n
        LEFT JOIN dispensers d ON n.dispenser_id = d.id
        WHERE n.branch_id = $1 AND n.status = 'active'
        ORDER BY d.dispenser_number, n.nozzle_number
      `, [
                shift.branch_id
            ]);
            const tanksResult = await pool.query(`
        SELECT id, tank_name, fuel_type, capacity, current_stock
        FROM tanks
        WHERE branch_id = $1 AND status = 'active'
        ORDER BY tank_name
      `, [
                shift.branch_id
            ]);
            return {
                ...shift,
                nozzles: nozzlesResult.rows,
                tanks: tanksResult.rows
            };
        }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: shiftsWithDetails
        });
    } catch (error) {
        console.error("Error fetching active shifts:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch active shifts",
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
        const { shifts: shiftsToEnd } = body;
        if (!shiftsToEnd || !Array.isArray(shiftsToEnd) || shiftsToEnd.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No shifts provided to end"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        const results = [];
        const errors = [];
        for (const shiftData of shiftsToEnd){
            const { id, closing_cash, nozzle_readings, tank_stocks } = shiftData;
            try {
                const shiftCheck = await client.query(`SELECT * FROM shifts WHERE id = $1 AND status = 'active'`, [
                    id
                ]);
                if (shiftCheck.rows.length === 0) {
                    errors.push({
                        id,
                        error: "Shift not found or already closed"
                    });
                    continue;
                }
                const currentShift = shiftCheck.rows[0];
                const branchId = currentShift.branch_id;
                const endTimeValue = new Date().toISOString();
                const nozzlesResult = await client.query(`SELECT id, initial_meter_reading FROM nozzles WHERE branch_id = $1`, [
                    branchId
                ]);
                const nozzleBaseReadings = {};
                for (const n of nozzlesResult.rows){
                    nozzleBaseReadings[n.id] = parseFloat(n.initial_meter_reading) || 0;
                }
                const prevNozzleReadings = await client.query(`SELECT nozzle_id, closing_reading FROM shift_readings 
           WHERE branch_id = $1 AND reading_type = 'nozzle' AND nozzle_id IS NOT NULL
           ORDER BY created_at DESC`, [
                    branchId
                ]);
                for (const r of prevNozzleReadings.rows){
                    if (!nozzleBaseReadings[r.nozzle_id] || parseFloat(r.closing_reading) > nozzleBaseReadings[r.nozzle_id]) {
                        nozzleBaseReadings[r.nozzle_id] = parseFloat(r.closing_reading);
                    }
                }
                const tanksResult = await client.query(`SELECT id, current_stock FROM tanks WHERE branch_id = $1`, [
                    branchId
                ]);
                const tankBaseStocks = {};
                for (const t of tanksResult.rows){
                    tankBaseStocks[t.id] = parseFloat(t.current_stock) || 0;
                }
                let hasValidationError = false;
                if (nozzle_readings && nozzle_readings.length > 0) {
                    for (const reading of nozzle_readings){
                        if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
                            if (!nozzleBaseReadings.hasOwnProperty(reading.nozzle_id)) {
                                errors.push({
                                    id,
                                    error: `Nozzle ${reading.nozzle_id} does not belong to this branch`
                                });
                                hasValidationError = true;
                                break;
                            }
                            const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0;
                            if (reading.closing_reading < openingReading) {
                                errors.push({
                                    id,
                                    error: `Nozzle closing reading (${reading.closing_reading}) cannot be less than opening reading (${openingReading})`
                                });
                                hasValidationError = true;
                                break;
                            }
                        }
                    }
                }
                if (tank_stocks && tank_stocks.length > 0) {
                    for (const stock of tank_stocks){
                        if (stock.tank_id && !isNaN(stock.closing_reading)) {
                            if (!tankBaseStocks.hasOwnProperty(stock.tank_id)) {
                                errors.push({
                                    id,
                                    error: `Tank ${stock.tank_id} does not belong to this branch`
                                });
                                hasValidationError = true;
                                break;
                            }
                        }
                    }
                }
                if (hasValidationError) {
                    continue;
                }
                const salesResult = await client.query(`SELECT COALESCE(SUM(total), 0) as total_sales FROM sales WHERE branch_id = $1 AND shift_id = $2`, [
                    branchId,
                    id
                ]);
                const totalSales = parseFloat(salesResult.rows[0].total_sales) || 0;
                const result = await client.query(`UPDATE shifts 
           SET end_time = $1, closing_cash = $2, total_sales = $3, status = 'completed', updated_at = NOW()
           WHERE id = $4
           RETURNING *`, [
                    endTimeValue,
                    closing_cash || 0,
                    totalSales,
                    id
                ]);
                const shift = result.rows[0];
                await client.query(`DELETE FROM shift_readings WHERE shift_id = $1`, [
                    id
                ]);
                if (nozzle_readings && nozzle_readings.length > 0) {
                    for (const reading of nozzle_readings){
                        if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
                            const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0;
                            await client.query(`INSERT INTO shift_readings (shift_id, branch_id, reading_type, nozzle_id, opening_reading, closing_reading)
                 VALUES ($1, $2, 'nozzle', $3, $4, $5)`, [
                                id,
                                branchId,
                                reading.nozzle_id,
                                openingReading,
                                reading.closing_reading
                            ]);
                        }
                    }
                }
                if (tank_stocks && tank_stocks.length > 0) {
                    for (const stock of tank_stocks){
                        if (stock.tank_id && !isNaN(stock.closing_reading)) {
                            const openingStock = tankBaseStocks[stock.tank_id] || 0;
                            const stockReceived = stock.stock_received || 0;
                            await client.query(`INSERT INTO shift_readings (shift_id, branch_id, reading_type, tank_id, opening_reading, closing_reading, stock_received)
                 VALUES ($1, $2, 'tank', $3, $4, $5, $6)`, [
                                id,
                                branchId,
                                stock.tank_id,
                                openingStock,
                                stock.closing_reading,
                                stockReceived
                            ]);
                            await client.query(`UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`, [
                                stock.closing_reading,
                                stock.tank_id
                            ]);
                        }
                    }
                }
                const newShiftResult = await client.query(`INSERT INTO shifts (branch_id, start_time, status, opening_cash, notes, created_at)
           VALUES ($1, $2, 'active', $3, NULL, NOW())
           RETURNING *`, [
                    branchId,
                    endTimeValue,
                    closing_cash || 0
                ]);
                results.push({
                    closedShift: shift,
                    newShift: newShiftResult.rows[0]
                });
            } catch (shiftError) {
                errors.push({
                    id,
                    error: shiftError.message
                });
            }
        }
        if (errors.length > 0 && results.length === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to end shifts",
                errors
            }, {
                status: 400
            });
        }
        await client.query('COMMIT');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                closed: results,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error ending shifts:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to end shifts",
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

//# sourceMappingURL=%5Broot-of-the-server%5D__5934eb6d._.js.map