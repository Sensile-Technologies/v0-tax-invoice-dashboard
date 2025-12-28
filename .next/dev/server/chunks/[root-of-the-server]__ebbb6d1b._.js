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
"[project]/app/api/items/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
function generateItemCode(origin, itemType, packageUnit, quantityUnit, itemCount) {
    const paddedCount = String(itemCount).padStart(7, '0');
    return `${origin}${itemType}${packageUnit}${quantityUnit}${paddedCount}`;
}
async function POST(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { vendorId, branchId, itemName, description, itemType, classCode, taxType, origin, batchNumber, purchasePrice, salePrice, sku, quantityUnit, packageUnit } = body;
        if (!vendorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Session expired or vendor not found. Please login again."
            }, {
                status: 401
            });
        }
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Branch not assigned. Please contact your administrator."
            }, {
                status: 400
            });
        }
        if (!itemName || !itemType || !classCode || !taxType || !origin || !quantityUnit || !packageUnit) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing required fields"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        const vendorResult = await client.query('SELECT item_count FROM vendors WHERE id = $1 FOR UPDATE', [
            vendorId
        ]);
        if (vendorResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Vendor not found"
            }, {
                status: 404
            });
        }
        const currentItemCount = vendorResult.rows[0].item_count || 0;
        const newItemCount = currentItemCount + 1;
        const itemCode = generateItemCode(origin, itemType, packageUnit, quantityUnit, newItemCount);
        const existingItem = await client.query('SELECT id FROM items WHERE item_code = $1 AND branch_id = $2', [
            itemCode,
            branchId
        ]);
        if (existingItem.rows.length > 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Item code already exists for this branch. Please try again."
            }, {
                status: 409
            });
        }
        const insertResult = await client.query(`INSERT INTO items (
        vendor_id, branch_id, item_code, item_name, description,
        item_type, class_code, tax_type, origin, batch_number,
        purchase_price, sale_price, sku, quantity_unit, package_unit,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        'active', NOW(), NOW()
      ) RETURNING *`, [
            vendorId,
            branchId || null,
            itemCode,
            itemName,
            description || null,
            itemType,
            classCode,
            taxType,
            origin,
            batchNumber || null,
            purchasePrice || 0,
            salePrice || 0,
            sku || null,
            quantityUnit,
            packageUnit
        ]);
        await client.query('UPDATE vendors SET item_count = $1 WHERE id = $2', [
            newItemCount,
            vendorId
        ]);
        await client.query('COMMIT');
        const createdItem = insertResult.rows[0];
        let kraResult = {
            success: false,
            kraResponse: null,
            message: "KRA submission pending"
        };
        try {
            const kraResponse = await fetch(`${request.nextUrl.origin}/api/kra/items/saveItems`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    itemId: createdItem.id,
                    branchId: branchId
                })
            });
            kraResult = await kraResponse.json();
            console.log(`[Items API] KRA submission result for ${itemCode}:`, kraResult);
        } catch (kraError) {
            console.error(`[Items API] KRA submission error for ${itemCode}:`, kraError);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            item: createdItem,
            itemCode: itemCode,
            kraSubmission: {
                success: kraResult.success,
                status: kraResult.success ? 'success' : 'rejected',
                response: kraResult.kraResponse
            },
            message: `Item created successfully with code: ${itemCode}. KRA submission: ${kraResult.success ? 'Successful' : 'Pending/Rejected'}`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create item"
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');
        const branchId = searchParams.get('branchId');
        // CRITICAL: branchId is required to prevent cross-branch data leakage
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch ID is required",
                items: []
            }, {
                status: 400
            });
        }
        let query = 'SELECT * FROM items WHERE branch_id = $1';
        const params = [
            branchId
        ];
        if (vendorId) {
            params.push(vendorId);
            query += ` AND vendor_id = $${params.length}`;
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            items: result.rows
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch items"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ebbb6d1b._.js.map