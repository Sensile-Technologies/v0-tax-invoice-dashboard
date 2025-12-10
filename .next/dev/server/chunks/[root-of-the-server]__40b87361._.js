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
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>{
                        cookieStore.set(name, value, options);
                    });
                } catch (error) {
                // Handle cookies in Server Components
                }
            }
        }
    });
}
}),
"[project]/lib/api-logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createApiLogger",
    ()=>createApiLogger,
    "logApiCall",
    ()=>logApiCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
async function logApiCall(entry) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        await supabase.from("api_logs").insert({
            endpoint: entry.endpoint,
            method: entry.method,
            payload: entry.payload || null,
            response: entry.response || null,
            status_code: entry.statusCode || null,
            error: entry.error || null,
            duration_ms: entry.durationMs || null,
            branch_id: entry.branchId || null,
            user_agent: entry.externalEndpoint || null
        });
    } catch (error) {
        console.error("[v0] Failed to log API call:", error);
    }
}
function createApiLogger(endpoint, method = "POST") {
    const startTime = Date.now();
    return {
        success: async (payload, response, branchId, externalEndpoint)=>{
            const duration = Date.now() - startTime;
            await logApiCall({
                endpoint,
                method,
                payload,
                response,
                statusCode: 200,
                durationMs: duration,
                branchId,
                externalEndpoint
            });
        },
        error: async (payload, error, statusCode = 500, branchId, externalEndpoint)=>{
            const duration = Date.now() - startTime;
            await logApiCall({
                endpoint,
                method,
                payload,
                error: error?.message || String(error),
                statusCode,
                durationMs: duration,
                branchId,
                externalEndpoint
            });
        }
    };
}
}),
"[project]/app/api/kra/codes/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-logger.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    const logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createApiLogger"])("/api/kra/codes", "POST");
    let kraPayload = null;
    let kraEndpoint = "";
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        let backendUrl = request.headers.get("x-backend-url") || "http://20.224.40.56:8088";
        backendUrl = backendUrl.replace(/\/$/, "");
        console.log("[v0] Backend URL:", backendUrl);
        const { data: branches } = await supabase.from("branches").select("id, bhf_id, name").eq("bhf_id", "03").limit(1).single();
        if (!branches || !branches.bhf_id) {
            throw new Error("Thika Greens branch (BHF ID: 03) not found. Please configure it first.");
        }
        kraPayload = {
            tin: "P052344628B",
            bhfId: "03",
            lastReqDt: "20180328000000"
        };
        console.log("[v0] Pulling code list with payload:", kraPayload);
        kraEndpoint = `${backendUrl}/code/selectCodes`;
        console.log("[v0] Calling KRA API:", kraEndpoint);
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 30000);
        const fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(kraPayload),
            signal: controller.signal
        };
        const response = await fetch(kraEndpoint, fetchOptions).finally(()=>clearTimeout(timeoutId));
        console.log("[v0] KRA API response status:", response.status);
        const responseText = await response.text();
        console.log("[v0] KRA API raw response:", responseText.substring(0, 500));
        if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
            throw new Error(`Backend returned HTML instead of JSON. This usually means the endpoint doesn't exist or there's a routing error. Response: ${responseText.substring(0, 200)}`);
        }
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Failed to parse backend response as JSON: ${responseText.substring(0, 200)}`);
        }
        if (!response.ok) {
            throw new Error(`KRA API error: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`);
        }
        console.log("[v0] Parsed result keys:", Object.keys(result));
        // Save to local database
        if (result.data && Array.isArray(result.data)) {
            console.log("[v0] Saving", result.data.length, "code list items to database");
            for (const item of result.data){
                await supabase.from("code_lists").upsert({
                    cd_cls: item.cdCls,
                    cd: item.cd,
                    cd_nm: item.cdNm,
                    cd_desc: item.cdDesc,
                    use_yn: item.useYn || "Y",
                    user_dfn_cd1: item.userDfnCd1,
                    user_dfn_cd2: item.userDfnCd2,
                    user_dfn_cd3: item.userDfnCd3,
                    last_req_dt: new Date()
                }, {
                    onConflict: "cd_cls,cd"
                });
            }
        }
        await logger.success(kraPayload, result, branches.id, kraEndpoint);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            resultCd: "000",
            resultMsg: "Successfully pulled code list from KRA",
            resultDt: new Date().toISOString(),
            data: result.data || []
        });
    } catch (error) {
        console.error("[v0] Get codes error:", error.message);
        console.error("[v0] Full error:", error);
        let errorMessage = error.message;
        if (error.message.includes("fetch failed") || error.name === "FetchError") {
            errorMessage = "Failed to connect to KRA backend. Common causes:\n" + "1. Backend server may not be running or accessible\n" + "2. URL/Port configuration may be incorrect\n" + "3. Network/firewall may be blocking the connection\n" + "4. Check if backend requires HTTP or HTTPS\n\n" + "Current configuration: " + kraEndpoint;
        }
        const errorResponse = {
            resultCd: "999",
            resultMsg: errorMessage,
            resultDt: new Date().toISOString()
        };
        await logger.error(kraPayload, error, 500, undefined, kraEndpoint);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(errorResponse, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__40b87361._.js.map