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
        const tankIdsArray = tank_ids || [];
        await pool.query('DELETE FROM dispenser_tanks WHERE dispenser_id = $1', [
            dispenser_id
        ]);
        let fuelTypes = [];
        let itemId = null;
        if (tankIdsArray.length > 0) {
            const tanksResult = await pool.query('SELECT id, fuel_type, item_id FROM tanks WHERE id = ANY($1)', [
                tankIdsArray
            ]);
            fuelTypes = [
                ...new Set(tanksResult.rows.map((t)=>t.fuel_type))
            ];
            const tankWithItem = tanksResult.rows.find((t)=>t.item_id);
            if (tankWithItem) {
                itemId = tankWithItem.item_id;
            }
            for (const tankId of tankIdsArray){
                await pool.query('INSERT INTO dispenser_tanks (dispenser_id, tank_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
                    dispenser_id,
                    tankId
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
        if (tankIdsArray.length > 0) {
            const existingNozzlesResult = await pool.query('SELECT tank_id FROM nozzles WHERE dispenser_id = $1', [
                dispenser_id
            ]);
            const existingTankIds = existingNozzlesResult.rows.map((n)=>n.tank_id);
            const tanksResult = await pool.query('SELECT id, fuel_type, item_id FROM tanks WHERE id = ANY($1)', [
                tankIdsArray
            ]);
            for(let i = 0; i < tanksResult.rows.length; i++){
                const tank = tanksResult.rows[i];
                if (!existingTankIds.includes(tank.id)) {
                    const nozzleNumber = i + 1;
                    await pool.query(`INSERT INTO nozzles (branch_id, dispenser_id, tank_id, nozzle_number, fuel_type, item_id, status, initial_meter_reading)
             VALUES ($1, $2, $3, $4, $5, $6, 'active', 0)`, [
                        branch_id,
                        dispenser_id,
                        tank.id,
                        nozzleNumber,
                        tank.fuel_type,
                        tank.item_id
                    ]);
                    nozzlesCreated++;
                }
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Tanks assigned successfully",
            nozzlesCreated,
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