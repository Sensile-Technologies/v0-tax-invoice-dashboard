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
"[project]/app/api/purchases/accept/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
async function getSessionUser() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get("user_session");
        if (!sessionCookie?.value) return null;
        const session = JSON.parse(sessionCookie.value);
        return {
            id: session.id,
            branch_id: session.branch_id
        };
    } catch  {
        return null;
    }
}
async function getUserBranchId(userId) {
    const staffBranch = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT branch_id FROM staff WHERE user_id = $1 LIMIT 1`, [
        userId
    ]);
    if (staffBranch && staffBranch.length > 0) {
        return staffBranch[0].branch_id;
    }
    const branchUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT id FROM branches WHERE user_id = $1 LIMIT 1`, [
        userId
    ]);
    if (branchUser && branchUser.length > 0) {
        return branchUser[0].id;
    }
    return null;
}
async function GET(request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const branchId = user.branch_id || await getUserBranchId(user.id);
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "No branch found for user"
            }, {
                status: 403
            });
        }
        const { searchParams } = new URL(request.url);
        const purchaseOrderId = searchParams.get("purchase_order_id");
        if (purchaseOrderId) {
            const poCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT id FROM purchase_orders WHERE id = $1 AND branch_id = $2`, [
                purchaseOrderId,
                branchId
            ]);
            if (!poCheck || poCheck.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Purchase order not found"
                }, {
                    status: 404
                });
            }
            const poItems = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT poi.item_id, poi.quantity, poi.unit_price, poi.total_amount,
                i.item_name, i.quantity_unit
         FROM purchase_order_items poi 
         JOIN items i ON poi.item_id = i.id 
         WHERE poi.purchase_order_id = $1`, [
                purchaseOrderId
            ]);
            const itemIds = poItems.map((item)=>item.item_id);
            let tanks = [];
            let dispensers = [];
            let nozzles = [];
            if (itemIds.length > 0) {
                tanks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT t.*, i.item_name 
           FROM tanks t 
           LEFT JOIN items i ON t.item_id = i.id 
           WHERE t.branch_id = $1 AND t.item_id = ANY($2::uuid[])
           ORDER BY t.tank_name`, [
                    branchId,
                    itemIds
                ]);
                const tankIds = tanks.map((t)=>t.id);
                if (tankIds.length > 0) {
                    dispensers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT DISTINCT d.*, t.tank_name,
             COALESCE(
               (SELECT meter_reading_after 
                FROM po_acceptance_dispenser_readings pdr
                JOIN purchase_order_acceptances poa ON pdr.acceptance_id = poa.id
                WHERE pdr.dispenser_id = d.id 
                ORDER BY poa.acceptance_timestamp DESC 
                LIMIT 1),
               0
             ) as last_meter_reading
             FROM dispensers d 
             LEFT JOIN tanks t ON d.tank_id = t.id
             LEFT JOIN dispenser_tanks dt ON d.id = dt.dispenser_id
             WHERE d.branch_id = $1 
               AND (d.tank_id = ANY($2::uuid[]) OR dt.tank_id = ANY($2::uuid[]))
             ORDER BY d.dispenser_number`, [
                        branchId,
                        tankIds
                    ]);
                }
            }
            // Fetch all nozzles for this branch (for multi-nozzle pump readings)
            nozzles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT n.*, d.dispenser_number, i.item_name as fuel_name,
         COALESCE(
           (SELECT meter_reading_after 
            FROM po_acceptance_nozzle_readings pnr
            JOIN purchase_order_acceptances poa ON pnr.acceptance_id = poa.id
            WHERE pnr.nozzle_id = n.id 
            ORDER BY poa.acceptance_timestamp DESC 
            LIMIT 1),
           n.initial_meter_reading,
           0
         ) as last_meter_reading
         FROM nozzles n
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         LEFT JOIN items i ON n.item_id = i.id
         WHERE n.branch_id = $1 AND n.status = 'active'
         ORDER BY d.dispenser_number, n.nozzle_number`, [
                branchId
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                tanks,
                dispensers,
                nozzles,
                items: poItems
            });
        }
        const orders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT 
        po.*,
        vp.name as supplier_name,
        tp.name as transporter_name,
        u.username as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount
       FROM purchase_orders po
       LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
       LEFT JOIN vendor_partners tp ON po.transporter_id = tp.id
       LEFT JOIN users u ON po.created_by = u.id
       WHERE po.branch_id = $1 AND po.status = 'pending' AND po.approval_status = 'approved'
       ORDER BY po.issued_at DESC`, [
            branchId
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Error fetching pending purchase orders:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch purchase orders"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const userBranchId = user.branch_id || await getUserBranchId(user.id);
        if (!userBranchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "No branch found for user"
            }, {
                status: 403
            });
        }
        const body = await request.json();
        const { purchase_order_id, bowser_volume, dips_mm, acceptance_timestamp, tank_readings, dispenser_readings, nozzle_readings, remarks } = body;
        if (!purchase_order_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Purchase order ID is required"
            }, {
                status: 400
            });
        }
        if (bowser_volume === undefined || bowser_volume === null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Bowser volume is required"
            }, {
                status: 400
            });
        }
        const order = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT po.*, b.id as branch_id FROM purchase_orders po 
       JOIN branches b ON po.branch_id = b.id
       WHERE po.id = $1 AND po.status = 'pending' AND po.branch_id = $2`, [
            purchase_order_id,
            userBranchId
        ]);
        if (!order || order.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Purchase order not found or not assigned to your branch"
            }, {
                status: 404
            });
        }
        const branchId = order[0].branch_id;
        // Validate tank capacity before processing
        if (tank_readings && Array.isArray(tank_readings)) {
            for (const reading of tank_readings){
                const tankResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT tank_name, capacity FROM tanks WHERE id = $1`, [
                    reading.tank_id
                ]);
                if (tankResult && tankResult.length > 0) {
                    const tank = tankResult[0];
                    const volumeAfter = parseFloat(reading.volume_after) || 0;
                    const capacity = parseFloat(tank.capacity) || 0;
                    if (capacity > 0 && volumeAfter > capacity) {
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            success: false,
                            error: `${tank.tank_name}: Volume after (${volumeAfter}L) exceeds tank capacity (${capacity}L)`
                        }, {
                            status: 400
                        });
                    }
                }
            }
        }
        let totalTankVariance = 0;
        let totalDispenserVariance = 0;
        let totalNozzleVariance = 0;
        if (tank_readings && Array.isArray(tank_readings)) {
            for (const reading of tank_readings){
                const tankDiff = (parseFloat(reading.volume_after) || 0) - (parseFloat(reading.volume_before) || 0);
                totalTankVariance += tankDiff;
            }
        }
        if (dispenser_readings && Array.isArray(dispenser_readings)) {
            for (const reading of dispenser_readings){
                const dispenserDiff = (parseFloat(reading.meter_reading_after) || 0) - (parseFloat(reading.meter_reading_before) || 0);
                totalDispenserVariance += dispenserDiff;
            }
        }
        if (nozzle_readings && Array.isArray(nozzle_readings)) {
            for (const reading of nozzle_readings){
                const nozzleDiff = (parseFloat(reading.meter_reading_after) || 0) - (parseFloat(reading.meter_reading_before) || 0);
                totalNozzleVariance += nozzleDiff;
            }
        }
        const bowserVol = parseFloat(bowser_volume) || 0;
        // Nozzle readings replace dispenser readings in variance calculation if provided
        const meterVariance = nozzle_readings && nozzle_readings.length > 0 ? totalNozzleVariance : totalDispenserVariance;
        const totalVariance = totalTankVariance + meterVariance - bowserVol;
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"].connect();
        try {
            await client.query('BEGIN');
            const acceptanceResult = await client.query(`INSERT INTO purchase_order_acceptances 
         (purchase_order_id, branch_id, accepted_by, bowser_volume, dips_mm, total_variance, remarks, acceptance_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`, [
                purchase_order_id,
                branchId,
                user.id,
                bowserVol,
                dips_mm || null,
                totalVariance,
                remarks || null,
                acceptance_timestamp || new Date().toISOString()
            ]);
            const acceptanceId = acceptanceResult.rows[0].id;
            if (tank_readings && Array.isArray(tank_readings)) {
                for (const reading of tank_readings){
                    const volumeBefore = parseFloat(reading.volume_before) || 0;
                    const volumeAfter = parseFloat(reading.volume_after) || 0;
                    const quantityReceived = volumeAfter - volumeBefore;
                    await client.query(`INSERT INTO po_acceptance_tank_readings 
             (acceptance_id, tank_id, volume_before, volume_after)
             VALUES ($1, $2, $3, $4)`, [
                        acceptanceId,
                        reading.tank_id,
                        volumeBefore,
                        volumeAfter
                    ]);
                    await client.query(`UPDATE tanks 
             SET current_stock = $1, updated_at = NOW()
             WHERE id = $2 AND branch_id = $3`, [
                        volumeAfter,
                        reading.tank_id,
                        branchId
                    ]);
                    // Insert stock_adjustments record for stock in history
                    if (quantityReceived > 0) {
                        await client.query(`INSERT INTO stock_adjustments 
               (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status)
               VALUES ($1, $2, 'purchase_receive', $3, $4, $5, $6, $7, 'approved')`, [
                            branchId,
                            reading.tank_id,
                            quantityReceived,
                            volumeBefore,
                            volumeAfter,
                            `Purchase order delivery accepted (PO: ${purchase_order_id.substring(0, 8)})`,
                            user.id
                        ]);
                    }
                }
            }
            if (dispenser_readings && Array.isArray(dispenser_readings)) {
                for (const reading of dispenser_readings){
                    await client.query(`INSERT INTO po_acceptance_dispenser_readings 
             (acceptance_id, dispenser_id, meter_reading_before, meter_reading_after)
             VALUES ($1, $2, $3, $4)`, [
                        acceptanceId,
                        reading.dispenser_id,
                        reading.meter_reading_before,
                        reading.meter_reading_after
                    ]);
                }
            }
            // Save nozzle-level readings (for multi-nozzle pumps)
            if (nozzle_readings && Array.isArray(nozzle_readings)) {
                for (const reading of nozzle_readings){
                    await client.query(`INSERT INTO po_acceptance_nozzle_readings 
             (acceptance_id, nozzle_id, meter_reading_before, meter_reading_after)
             VALUES ($1, $2, $3, $4)`, [
                        acceptanceId,
                        reading.nozzle_id,
                        reading.meter_reading_before,
                        reading.meter_reading_after
                    ]);
                }
            }
            await client.query(`UPDATE purchase_orders SET status = 'accepted', accepted_at = NOW(), updated_at = NOW() WHERE id = $1`, [
                purchase_order_id
            ]);
            await client.query('COMMIT');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: {
                    acceptance: acceptanceResult.rows[0],
                    variance: totalVariance,
                    tank_variance: totalTankVariance,
                    dispenser_variance: totalDispenserVariance,
                    nozzle_variance: totalNozzleVariance
                },
                message: "Purchase order accepted successfully"
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("Error accepting purchase order:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to accept purchase order"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8da8ca8b._.js.map