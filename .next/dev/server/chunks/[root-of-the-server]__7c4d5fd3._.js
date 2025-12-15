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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/api/auth/signin/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
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
async function POST(request) {
    try {
        const { email, password, username } = await request.json();
        if (!password || !email && !username) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: {
                    message: "Email/username and password are required"
                }
            }, {
                status: 400
            });
        }
        const client = await pool.connect();
        try {
            let user;
            const identifier = email || username;
            if (identifier && identifier.includes("@")) {
                const salesResult = await client.query("SELECT id, name, email, phone, is_active FROM sales_people WHERE email = $1 AND is_active = true", [
                    identifier
                ]);
                const salesPerson = salesResult.rows[0];
                if (salesPerson && salesPerson.phone) {
                    const phoneDigits = salesPerson.phone.replace(/\D/g, '');
                    const passwordDigits = password.replace(/\D/g, '');
                    if (phoneDigits.length >= 9 && passwordDigits.length >= 9 && phoneDigits === passwordDigits) {
                        const token = crypto.randomUUID();
                        const refreshToken = crypto.randomUUID();
                        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            access_token: token,
                            refresh_token: refreshToken,
                            user: {
                                id: salesPerson.id,
                                email: salesPerson.email,
                                username: salesPerson.name,
                                role: 'sales',
                                sales_person_id: salesPerson.id,
                                sales_person_name: salesPerson.name
                            }
                        });
                        response.cookies.set('sb-access-token', token, {
                            path: '/',
                            maxAge: 60 * 60 * 24 * 7,
                            sameSite: 'none',
                            secure: true,
                            httpOnly: false
                        });
                        response.cookies.set('sb-refresh-token', refreshToken, {
                            path: '/',
                            maxAge: 60 * 60 * 24 * 30,
                            sameSite: 'none',
                            secure: true,
                            httpOnly: false
                        });
                        return response;
                    }
                }
            }
            if (email) {
                const result = await client.query(`SELECT u.id, u.email, u.username, u.password_hash, u.role, 
           v.id as vendor_id, v.name as vendor_name,
           COALESCE(s.branch_id, vb.id) as branch_id, 
           COALESCE(b.name, vb.name) as branch_name,
           COALESCE(b.bhf_id, vb.bhf_id) as bhf_id
           FROM users u 
           LEFT JOIN vendors v ON v.email = u.email 
           LEFT JOIN staff s ON s.user_id = u.id
           LEFT JOIN branches b ON b.id = s.branch_id
           LEFT JOIN branches vb ON vb.vendor_id = v.id AND vb.is_main = true
           WHERE u.email = $1`, [
                    email
                ]);
                user = result.rows[0];
            } else {
                const result = await client.query(`SELECT u.id, u.email, u.username, u.password_hash, u.role, 
           v.id as vendor_id, v.name as vendor_name,
           COALESCE(s.branch_id, vb.id) as branch_id, 
           COALESCE(b.name, vb.name) as branch_name,
           COALESCE(b.bhf_id, vb.bhf_id) as bhf_id
           FROM users u 
           LEFT JOIN vendors v ON v.email = u.email 
           LEFT JOIN staff s ON s.user_id = u.id
           LEFT JOIN branches b ON b.id = s.branch_id
           LEFT JOIN branches vb ON vb.vendor_id = v.id AND vb.is_main = true
           WHERE u.username = $1`, [
                    username
                ]);
                user = result.rows[0];
            }
            if (!user) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: {
                        message: "Invalid credentials"
                    }
                }, {
                    status: 401
                });
            }
            if (!user.password_hash) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: {
                        message: "Password not set for this account"
                    }
                }, {
                    status: 401
                });
            }
            const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.password_hash);
            if (!isValid) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: {
                        message: "Invalid credentials"
                    }
                }, {
                    status: 401
                });
            }
            const token = crypto.randomUUID();
            const refreshToken = crypto.randomUUID();
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                access_token: token,
                refresh_token: refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role || 'vendor',
                    vendor_id: user.vendor_id,
                    vendor_name: user.vendor_name,
                    branch_id: user.branch_id,
                    branch_name: user.branch_name,
                    bhf_id: user.bhf_id
                }
            });
            response.cookies.set('sb-access-token', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'none',
                secure: true,
                httpOnly: false
            });
            response.cookies.set('sb-refresh-token', refreshToken, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                sameSite: 'none',
                secure: true,
                httpOnly: false
            });
            return response;
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("[API] Sign in error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: {
                message: "Failed to sign in"
            }
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7c4d5fd3._.js.map