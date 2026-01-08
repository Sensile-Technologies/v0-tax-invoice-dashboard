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
"[project]/app/api/branch-items/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
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
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get('branchId');
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch ID required"
            }, {
                status: 400
            });
        }
        const client = await pool.connect();
        try {
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
            const userVendorId = user.vendor_id || (await client.query('SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1', [
                session.id
            ])).rows[0]?.vendor_id;
            const branchCheck = await client.query('SELECT id, vendor_id FROM branches WHERE id = $1', [
                branchId
            ]);
            if (branchCheck.rows.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Branch not found"
                }, {
                    status: 404
                });
            }
            const branch = branchCheck.rows[0];
            if (branch.vendor_id !== userVendorId) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Access denied"
                }, {
                    status: 403
                });
            }
            if ([
                'supervisor',
                'manager'
            ].includes(user.role) && user.branch_id !== branchId) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Access denied to this branch"
                }, {
                    status: 403
                });
            }
            const result = await client.query(`SELECT 
          i.id as item_id,
          i.item_code,
          i.item_name,
          i.item_type,
          i.class_code,
          i.tax_type,
          i.origin,
          i.quantity_unit,
          i.package_unit,
          i.status as item_status,
          i.color_code,
          bi.id as branch_item_id,
          bi.sale_price as branch_sale_price,
          bi.purchase_price as branch_purchase_price,
          bi.is_available,
          bi.kra_status,
          bi.kra_last_synced_at,
          true as is_assigned
        FROM items i
        INNER JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
        WHERE i.status = 'active' 
          AND (
            (i.vendor_id = $2 AND i.branch_id IS NULL)
            OR i.branch_id = $1
          )
        ORDER BY i.item_name`, [
                branchId,
                branch.vendor_id
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                items: result.rows
            });
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("Error fetching branch items:", error);
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
        const body = await request.json();
        const { branchId, itemId, salePrice, purchasePrice } = body;
        if (!branchId || !itemId || salePrice === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Missing required fields"
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
        const userVendorId = user.vendor_id || (await client.query('SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1', [
            session.id
        ])).rows[0]?.vendor_id;
        const branchCheck = await client.query('SELECT id, vendor_id FROM branches WHERE id = $1', [
            branchId
        ]);
        if (branchCheck.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch not found"
            }, {
                status: 404
            });
        }
        const branch = branchCheck.rows[0];
        if (branch.vendor_id !== userVendorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied"
            }, {
                status: 403
            });
        }
        if ([
            'supervisor',
            'manager'
        ].includes(user.role) && user.branch_id !== branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied to this branch"
            }, {
                status: 403
            });
        }
        const itemCheck = await client.query('SELECT id, vendor_id, branch_id FROM items WHERE id = $1', [
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
        if (item.vendor_id !== userVendorId && item.branch_id !== branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Item not found"
            }, {
                status: 404
            });
        }
        const result = await client.query(`INSERT INTO branch_items (branch_id, item_id, sale_price, purchase_price, is_available)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (branch_id, item_id) 
       DO UPDATE SET sale_price = $3, purchase_price = $4, updated_at = NOW()
       RETURNING *`, [
            branchId,
            itemId,
            salePrice,
            purchasePrice || null
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            branchItem: result.rows[0],
            message: "Item price assigned to branch"
        });
    } catch (error) {
        console.error("Error assigning branch item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to assign item"
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
        const body = await request.json();
        const { branchItemId, salePrice, purchasePrice, isAvailable } = body;
        if (!branchItemId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch item ID required"
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
        const userVendorId = user.vendor_id || (await client.query('SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1', [
            session.id
        ])).rows[0]?.vendor_id;
        const branchItemCheck = await client.query(`SELECT bi.*, b.vendor_id 
       FROM branch_items bi 
       JOIN branches b ON bi.branch_id = b.id 
       WHERE bi.id = $1`, [
            branchItemId
        ]);
        if (branchItemCheck.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch item not found"
            }, {
                status: 404
            });
        }
        const branchItem = branchItemCheck.rows[0];
        if (branchItem.vendor_id !== userVendorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied"
            }, {
                status: 403
            });
        }
        if ([
            'supervisor',
            'manager'
        ].includes(user.role) && user.branch_id !== branchItem.branch_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied to this branch"
            }, {
                status: 403
            });
        }
        const result = await client.query(`UPDATE branch_items SET
        sale_price = COALESCE($1, sale_price),
        purchase_price = COALESCE($2, purchase_price),
        is_available = COALESCE($3, is_available),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *`, [
            salePrice,
            purchasePrice,
            isAvailable,
            branchItemId
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            branchItem: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating branch item:", error);
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
async function DELETE(request) {
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
        const { searchParams } = new URL(request.url);
        const branchItemId = searchParams.get('id');
        const preview = searchParams.get('preview') === 'true';
        if (!branchItemId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch item ID required"
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
        const userVendorId = user.vendor_id || (await client.query('SELECT vendor_id FROM branches b JOIN staff s ON s.branch_id = b.id WHERE s.user_id = $1 LIMIT 1', [
            session.id
        ])).rows[0]?.vendor_id;
        const branchItemCheck = await client.query(`SELECT bi.*, b.vendor_id, i.item_name
       FROM branch_items bi 
       JOIN branches b ON bi.branch_id = b.id 
       JOIN items i ON bi.item_id = i.id
       WHERE bi.id = $1`, [
            branchItemId
        ]);
        if (branchItemCheck.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch item not found"
            }, {
                status: 404
            });
        }
        const branchItem = branchItemCheck.rows[0];
        if (branchItem.vendor_id !== userVendorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Access denied"
            }, {
                status: 403
            });
        }
        const nozzleCount = await client.query('SELECT COUNT(*) as count FROM nozzles WHERE branch_id = $1 AND item_id = $2', [
            branchItem.branch_id,
            branchItem.item_id
        ]);
        const tankCount = await client.query('SELECT COUNT(*) as count FROM tanks WHERE branch_id = $1 AND item_id = $2', [
            branchItem.branch_id,
            branchItem.item_id
        ]);
        const dispenserCount = await client.query('SELECT COUNT(*) as count FROM dispensers WHERE branch_id = $1 AND item_id = $2', [
            branchItem.branch_id,
            branchItem.item_id
        ]);
        const affectedNozzles = parseInt(nozzleCount.rows[0].count);
        const affectedTanks = parseInt(tankCount.rows[0].count);
        const affectedDispensers = parseInt(dispenserCount.rows[0].count);
        if (preview) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                preview: true,
                itemName: branchItem.item_name,
                affectedNozzles,
                affectedTanks,
                affectedDispensers
            });
        }
        await client.query('BEGIN');
        try {
            if (affectedNozzles > 0) {
                await client.query('DELETE FROM nozzles WHERE branch_id = $1 AND item_id = $2', [
                    branchItem.branch_id,
                    branchItem.item_id
                ]);
            }
            if (affectedDispensers > 0) {
                await client.query('DELETE FROM dispensers WHERE branch_id = $1 AND item_id = $2', [
                    branchItem.branch_id,
                    branchItem.item_id
                ]);
            }
            if (affectedTanks > 0) {
                await client.query('DELETE FROM tanks WHERE branch_id = $1 AND item_id = $2', [
                    branchItem.branch_id,
                    branchItem.item_id
                ]);
            }
            await client.query('DELETE FROM branch_items WHERE id = $1', [
                branchItemId
            ]);
            await client.query('COMMIT');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: "Item removed from branch",
                deletedNozzles: affectedNozzles,
                deletedTanks: affectedTanks,
                deletedDispensers: affectedDispensers
            });
        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        }
    } catch (error) {
        console.error("Error removing branch item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to remove item"
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0eb262a4._.js.map