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
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
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
        // CATALOG-ONLY ENFORCEMENT: Items must be created at HQ level (branch_id = NULL)
        // Branch-specific pricing is managed via branch_items table
        if (branchId) {
            console.log("[Items API] Rejecting legacy item creation - use HQ catalog instead");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Items can only be created at headquarters level. Please use the HQ Items catalog to create items, then assign them to branches with pricing."
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
        const existingItem = await client.query('SELECT id FROM items WHERE item_code = $1 AND vendor_id = $2', [
            itemCode,
            vendorId
        ]);
        if (existingItem.rows.length > 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Item code already exists. Please try again."
            }, {
                status: 409
            });
        }
        // Create catalog item (branch_id = NULL)
        const insertResult = await client.query(`INSERT INTO items (
        vendor_id, branch_id, item_code, item_name, description,
        item_type, class_code, tax_type, origin, batch_number,
        purchase_price, sale_price, sku, quantity_unit, package_unit,
        status, created_at, updated_at
      ) VALUES (
        $1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        'active', NOW(), NOW()
      ) RETURNING *`, [
            vendorId,
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            item: createdItem,
            itemCode: itemCode,
            message: `Item created successfully in catalog with code: ${itemCode}. Assign to branches to configure pricing and sync with KRA.`
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
        const catalogOnly = searchParams.get('catalog') === 'true';
        // For HQ catalog items (branch_id IS NULL), use vendorId + catalog=true
        if (catalogOnly && vendorId) {
            const result = await pool.query(`SELECT * FROM items WHERE vendor_id = $1 AND branch_id IS NULL ORDER BY item_name ASC`, [
                vendorId
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                items: result.rows
            });
        }
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
async function DELETE(request) {
    const client = await pool.connect();
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get("user_session");
        if (!sessionCookie) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        let session;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Invalid session"
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('id');
        if (!itemId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Item ID required"
            }, {
                status: 400
            });
        }
        const userResult = await client.query(`SELECT u.id, COALESCE(s.role, u.role) as role, v.id as vendor_id, s.branch_id
       FROM users u
       LEFT JOIN vendors v ON v.email = u.email
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE u.id = $1`, [
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
        const userBranchId = user.branch_id;
        const itemCheck = await client.query('SELECT id, item_name, branch_id, vendor_id FROM items WHERE id = $1', [
            itemId
        ]);
        if (itemCheck.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Item not found"
            }, {
                status: 404
            });
        }
        const item = itemCheck.rows[0];
        if (item.branch_id === null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "This is a catalog item. Delete it from Headquarters > Items instead."
            }, {
                status: 400
            });
        }
        if (![
            'director',
            'vendor',
            'manager'
        ].includes(user.role)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied. Only managers and above can delete items."
            }, {
                status: 403
            });
        }
        if ([
            'supervisor',
            'manager'
        ].includes(user.role) && item.branch_id !== userBranchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied to this branch's items"
            }, {
                status: 403
            });
        }
        const nozzlesCheck = await client.query('SELECT COUNT(*) as count FROM nozzles WHERE item_id = $1', [
            itemId
        ]);
        if (parseInt(nozzlesCheck.rows[0].count) > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Cannot delete item - it is linked to nozzles. Remove nozzle links first."
            }, {
                status: 400
            });
        }
        const tanksCheck = await client.query('SELECT COUNT(*) as count FROM tanks WHERE item_id = $1', [
            itemId
        ]);
        if (parseInt(tanksCheck.rows[0].count) > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Cannot delete item - it is linked to tanks. Remove tank links first."
            }, {
                status: 400
            });
        }
        await client.query('DELETE FROM items WHERE id = $1', [
            itemId
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Legacy item "${item.item_name}" deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to delete item"
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

//# sourceMappingURL=%5Broot-of-the-server%5D__ebbb6d1b._.js.map