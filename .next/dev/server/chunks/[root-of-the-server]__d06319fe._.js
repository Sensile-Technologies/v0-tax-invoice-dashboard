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
"[project]/app/api/dispensers/assign-tanks/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    try {
        const body = await request.json();
        const { dispenser_id, tank_ids, branch_id } = body;
        if (!dispenser_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "dispenser_id is required"
            }, {
                status: 400
            });
        }
        // Filter out any null/undefined/empty tank_ids
        const tankIdsArray = (tank_ids || []).filter((id)=>id && typeof id === 'string' && id.trim() !== '');
        console.log("Assigning tanks:", {
            dispenser_id,
            tankIdsArray,
            rawTankIds: tank_ids
        });
        await pool.query('DELETE FROM dispenser_tanks WHERE dispenser_id = $1', [
            dispenser_id
        ]);
        let fuelTypes = [];
        let itemId = null;
        if (tankIdsArray.length > 0) {
            const tanksResult = await pool.query(`SELECT t.id, i.item_name as fuel_type, t.item_id 
         FROM tanks t
         JOIN items i ON t.item_id = i.id
         WHERE t.id = ANY($1::uuid[])`, [
                tankIdsArray
            ]);
            fuelTypes = [
                ...new Set(tanksResult.rows.map((t)=>t.fuel_type))
            ];
            const tankWithItem = tanksResult.rows.find((t)=>t.item_id);
            if (tankWithItem) {
                itemId = tankWithItem.item_id;
            }
            // Insert only valid tank IDs that exist in the database
            for (const tank of tanksResult.rows){
                await pool.query('INSERT INTO dispenser_tanks (dispenser_id, tank_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
                    dispenser_id,
                    tank.id
                ]);
            }
        }
        const fuelType = fuelTypes.length > 0 ? fuelTypes.join("/") : "Pending";
        const primaryTankId = tankIdsArray.length > 0 ? tankIdsArray[0] : null;
        await pool.query('UPDATE dispensers SET fuel_type = $1, tank_id = $2, item_id = $3, updated_at = NOW() WHERE id = $4', [
            fuelType,
            primaryTankId,
            itemId,
            dispenser_id
        ]);
        const dispenserResult = await pool.query('SELECT dispenser_number FROM dispensers WHERE id = $1', [
            dispenser_id
        ]);
        const dispenserNumber = dispenserResult.rows[0]?.dispenser_number || 1;
        let nozzlesCreated = 0;
        const createdNozzles = [];
        if (tankIdsArray.length > 0) {
            const existingNozzlesResult = await pool.query('SELECT tank_id, nozzle_number FROM nozzles WHERE dispenser_id = $1', [
                dispenser_id
            ]);
            const existingTankIds = existingNozzlesResult.rows.map((n)=>n.tank_id);
            const existingNozzleNumbers = existingNozzlesResult.rows.map((n)=>n.nozzle_number);
            // Find the next available nozzle number
            let nextNozzleNumber = existingNozzleNumbers.length > 0 ? Math.max(...existingNozzleNumbers) + 1 : 1;
            const tanksResultForNozzles = await pool.query(`SELECT t.id, i.item_name as fuel_type, t.item_id, t.tank_name 
         FROM tanks t
         JOIN items i ON t.item_id = i.id
         WHERE t.id = ANY($1::uuid[])`, [
                tankIdsArray
            ]);
            for(let i = 0; i < tanksResultForNozzles.rows.length; i++){
                const tank = tanksResultForNozzles.rows[i];
                if (!existingTankIds.includes(tank.id)) {
                    const nozzleNumber = nextNozzleNumber++;
                    const nozzleResult = await pool.query(`INSERT INTO nozzles (branch_id, dispenser_id, tank_id, nozzle_number, item_id, status, initial_meter_reading)
             VALUES ($1, $2, $3, $4, $5, 'active', 0)
             RETURNING id, nozzle_number`, [
                        branch_id,
                        dispenser_id,
                        tank.id,
                        nozzleNumber,
                        tank.item_id
                    ]);
                    if (nozzleResult.rows.length > 0) {
                        createdNozzles.push({
                            id: nozzleResult.rows[0].id,
                            nozzle_number: nozzleResult.rows[0].nozzle_number,
                            fuel_type: tank.fuel_type,
                            tank_name: tank.tank_name,
                            dispenser_number: dispenserNumber
                        });
                    }
                    nozzlesCreated++;
                }
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Tanks assigned successfully",
            nozzlesCreated,
            createdNozzles,
            fuelType,
            itemId
        });
    } catch (error) {
        console.error("Error assigning tanks to dispenser:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to assign tanks",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d06319fe._.js.map