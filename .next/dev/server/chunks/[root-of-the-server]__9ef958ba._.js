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
"[project]/app/api/headquarters/items/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch  {
        return null;
    }
}
function generateItemCode(origin, itemType, packageUnit, quantityUnit, itemCount) {
    const paddedCount = String(itemCount).padStart(7, '0');
    return `${origin}${itemType}${packageUnit}${quantityUnit}${paddedCount}`;
}
async function GET(request) {
    try {
        const session = await getSession();
        if (!session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const client = await pool.connect();
        try {
            const userResult = await client.query('SELECT role, vendor_id FROM users WHERE id = $1', [
                session.id
            ]);
            if (userResult.rows.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "User not found"
                }, {
                    status: 404
                });
            }
            const user = userResult.rows[0];
            if (![
                'director',
                'vendor'
            ].includes(user.role)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Access denied. HQ access required."
                }, {
                    status: 403
                });
            }
            const result = await client.query(`SELECT i.*, 
         (SELECT COUNT(*) FROM branch_items bi WHERE bi.item_id = i.id) as assigned_branches
         FROM items i 
         WHERE i.vendor_id = $1 AND i.branch_id IS NULL
         ORDER BY i.created_at DESC`, [
                user.vendor_id
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                items: result.rows
            });
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("Error fetching HQ items:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch items"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    const client = await pool.connect();
    try {
        const session = await getSession();
        if (!session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const userResult = await client.query('SELECT role, vendor_id FROM users WHERE id = $1', [
            session.id
        ]);
        if (userResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "User not found"
            }, {
                status: 404
            });
        }
        const user = userResult.rows[0];
        if (![
            'director',
            'vendor'
        ].includes(user.role)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied. Only HQ can create items."
            }, {
                status: 403
            });
        }
        const body = await request.json();
        const { itemName, description, itemType, classCode, taxType, origin, batchNumber, purchasePrice, salePrice, sku, quantityUnit, packageUnit } = body;
        if (!itemName || !itemType || !classCode || !taxType || !origin || !quantityUnit || !packageUnit) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Missing required fields"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        const vendorResult = await client.query('SELECT item_count FROM vendors WHERE id = $1 FOR UPDATE', [
            user.vendor_id
        ]);
        if (vendorResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Vendor not found"
            }, {
                status: 404
            });
        }
        const currentItemCount = vendorResult.rows[0].item_count || 0;
        const newItemCount = currentItemCount + 1;
        const itemCode = generateItemCode(origin, itemType, packageUnit, quantityUnit, newItemCount);
        const existingItem = await client.query('SELECT id FROM items WHERE item_code = $1 AND vendor_id = $2', [
            itemCode,
            user.vendor_id
        ]);
        if (existingItem.rows.length > 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Item code already exists. Please try again."
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
        $1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        'active', NOW(), NOW()
      ) RETURNING *`, [
            user.vendor_id,
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
            user.vendor_id
        ]);
        await client.query('COMMIT');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            item: insertResult.rows[0],
            itemCode: itemCode,
            message: `Item created successfully with code: ${itemCode}`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating HQ item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to create item"
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
async function PUT(request) {
    const client = await pool.connect();
    try {
        const session = await getSession();
        if (!session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const userResult = await client.query('SELECT role, vendor_id FROM users WHERE id = $1', [
            session.id
        ]);
        if (userResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "User not found"
            }, {
                status: 404
            });
        }
        const user = userResult.rows[0];
        if (![
            'director',
            'vendor'
        ].includes(user.role)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied. Only HQ can edit items."
            }, {
                status: 403
            });
        }
        const body = await request.json();
        const { id, itemName, description, purchasePrice, salePrice, status } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Item ID required"
            }, {
                status: 400
            });
        }
        const itemCheck = await client.query('SELECT id FROM items WHERE id = $1 AND vendor_id = $2', [
            id,
            user.vendor_id
        ]);
        if (itemCheck.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Item not found"
            }, {
                status: 404
            });
        }
        const updateResult = await client.query(`UPDATE items SET
        item_name = COALESCE($1, item_name),
        description = COALESCE($2, description),
        purchase_price = COALESCE($3, purchase_price),
        sale_price = COALESCE($4, sale_price),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $6 AND vendor_id = $7
      RETURNING *`, [
            itemName,
            description,
            purchasePrice,
            salePrice,
            status,
            id,
            user.vendor_id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            item: updateResult.rows[0]
        });
    } catch (error) {
        console.error("Error updating HQ item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to update item"
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

//# sourceMappingURL=%5Broot-of-the-server%5D__9ef958ba._.js.map