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
"[project]/app/api/mobile/nozzles/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Branch ID required"
            }, {
                status: 400
            });
        }
        const client = await pool.connect();
        try {
            // Only return nozzles that have a tank assigned (tank_id IS NOT NULL)
            const nozzlesResult = await client.query(`SELECT n.id, n.nozzle_number, i.item_name as fuel_type, n.status, d.dispenser_number
         FROM nozzles n 
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         JOIN items i ON n.item_id = i.id
         WHERE n.branch_id = $1 AND n.status = 'active' AND n.tank_id IS NOT NULL
         ORDER BY d.dispenser_number, n.nozzle_number ASC`, [
                branchId
            ]);
            // Get fuel prices from branch_items (single source of truth)
            const branchItemsResult = await client.query(`SELECT DISTINCT ON (UPPER(i.item_name))
           i.item_name, 
           bi.sale_price as price
         FROM branch_items bi
         JOIN items i ON bi.item_id = i.id
         WHERE bi.branch_id = $1
           AND bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND (UPPER(i.item_name) IN ('PETROL', 'DIESEL', 'KEROSENE', 'SUPER PETROL', 'V-POWER') 
                OR i.item_name ILIKE '%petrol%' 
                OR i.item_name ILIKE '%diesel%'
                OR i.item_name ILIKE '%kerosene%')
         ORDER BY UPPER(i.item_name), bi.updated_at DESC NULLS LAST`, [
                branchId
            ]);
            // Process branch_items results to normalized fuel types
            const fuelPrices = branchItemsResult.rows.map((fp)=>{
                const itemName = fp.item_name.toUpperCase();
                let fuelType = fp.item_name;
                if (itemName.includes('DIESEL')) fuelType = 'Diesel';
                else if (itemName.includes('PETROL') || itemName.includes('SUPER')) fuelType = 'Petrol';
                else if (itemName.includes('KEROSENE')) fuelType = 'Kerosene';
                return {
                    fuel_type: fuelType,
                    price: parseFloat(fp.price)
                };
            });
            const nozzles = nozzlesResult.rows.map((n)=>{
                const fuelPrice = fuelPrices.find((fp)=>fp.fuel_type.toUpperCase() === n.fuel_type.toUpperCase());
                return {
                    id: n.id,
                    name: `D${n.dispenser_number || 1}N${n.nozzle_number} - ${n.fuel_type}`,
                    fuel_type: n.fuel_type,
                    status: n.status,
                    price: fuelPrice?.price || 0
                };
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                nozzles: nozzles,
                fuel_prices: fuelPrices
            });
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("[Mobile Nozzles API Error]:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch nozzles"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2c0fd4ca._.js.map