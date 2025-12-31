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
"[project]/app/api/branches/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const status = searchParams.get("status");
        const limit = searchParams.get("limit");
        let query = "SELECT * FROM branches WHERE 1=1";
        const params = [];
        let paramIndex = 1;
        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        query += " ORDER BY name";
        if (limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(parseInt(limit));
        }
        const result = await pool.query(query, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch branches"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    console.log("[branches/POST] Starting branch creation request");
    let body;
    try {
        body = await request.json();
        console.log("[branches/POST] Request body parsed successfully, name:", body?.name);
    } catch (parseError) {
        console.error("[branches/POST] Failed to parse request body:", parseError.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Invalid request body - could not parse JSON"
        }, {
            status: 400
        });
    }
    try {
        const { vendor_id, user_id, name, location, address, county, local_tax_office, manager, phone, email, kra_pin, bhf_id, storage_indices, controller_id, status = "pending_onboarding" } = body;
        if (!name) {
            console.log("[branches/POST] Missing branch name");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch name is required"
            }, {
                status: 400
            });
        }
        let resolvedVendorId = vendor_id;
        console.log("[branches/POST] Initial vendor_id:", vendor_id, "user_id:", user_id);
        if (!resolvedVendorId && user_id) {
            console.log("[branches/POST] Looking up vendor_id from existing branches for user:", user_id);
            const userBranch = await pool.query('SELECT b.vendor_id FROM branches b WHERE b.user_id = $1 AND b.vendor_id IS NOT NULL LIMIT 1', [
                user_id
            ]);
            if (userBranch.rows.length > 0) {
                resolvedVendorId = userBranch.rows[0].vendor_id;
                console.log("[branches/POST] Found vendor_id from existing branch:", resolvedVendorId);
            } else {
                console.log("[branches/POST] No existing branches found for user");
            }
        }
        if (!resolvedVendorId && user_id) {
            console.log("[branches/POST] Looking up vendor by user email");
            const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [
                user_id
            ]);
            if (userResult.rows.length > 0) {
                const userEmail = userResult.rows[0].email;
                console.log("[branches/POST] User email found:", userEmail);
                const vendorResult = await pool.query('SELECT id FROM vendors WHERE email = $1', [
                    userEmail
                ]);
                if (vendorResult.rows.length > 0) {
                    resolvedVendorId = vendorResult.rows[0].id;
                    console.log("[branches/POST] Found vendor_id from email match:", resolvedVendorId);
                } else {
                    console.log("[branches/POST] No vendor found with matching email");
                }
            } else {
                console.log("[branches/POST] User not found in database");
            }
        }
        if (!resolvedVendorId) {
            console.log("[branches/POST] Could not resolve vendor_id - returning error");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Could not find vendor for this user. Please ensure your account is properly set up with a vendor."
            }, {
                status: 400
            });
        }
        console.log("[branches/POST] Inserting branch with vendor_id:", resolvedVendorId);
        const result = await pool.query(`INSERT INTO branches (
        vendor_id, name, location, address, county, local_tax_office, manager,
        phone, email, kra_pin, bhf_id, storage_indices, controller_id, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`, [
            resolvedVendorId,
            name,
            location || null,
            address || null,
            county || null,
            local_tax_office || null,
            manager || null,
            phone || null,
            email || null,
            kra_pin || null,
            bhf_id || '00',
            storage_indices ? JSON.stringify(storage_indices) : null,
            controller_id || null,
            status
        ]);
        console.log("[branches/POST] Branch created successfully:", result.rows[0]?.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("[branches/POST] Error creating branch:", error.message, error.stack);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || "Failed to create branch"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4a0192fc._.js.map