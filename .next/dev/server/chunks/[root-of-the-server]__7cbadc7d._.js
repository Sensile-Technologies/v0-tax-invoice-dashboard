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
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/db/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "execute",
    ()=>execute,
    "getClient",
    ()=>getClient,
    "pool",
    ()=>pool,
    "query",
    ()=>query,
    "queryOne",
    ()=>queryOne
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL,
    ssl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false
});
async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } finally{
        client.release();
    }
}
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] || null;
}
async function execute(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rowCount || 0;
    } finally{
        client.release();
    }
}
async function getClient() {
    return await pool.connect();
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/db/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/api-logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createApiLogger",
    ()=>createApiLogger,
    "logApiCall",
    ()=>logApiCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function deriveLogType(endpoint) {
    if (endpoint.includes('saveSales')) return 'kra_save_sales';
    if (endpoint.includes('saveStockItems')) return 'kra_stock_items';
    if (endpoint.includes('saveStockMaster')) return 'kra_stock_master';
    if (endpoint.includes('selectInitInfo')) return 'kra_initialize';
    if (endpoint.includes('saveItem')) return 'kra_save_item';
    return 'kra_api';
}
function deriveStatus(response, statusCode, error) {
    if (error) return 'error';
    if (!response) return 'error';
    if (response.resultCd === '000' || response.resultCd === '0') return 'success';
    if (statusCode && statusCode >= 200 && statusCode < 300 && !response.resultCd) return 'success';
    return 'error';
}
async function logApiCall(entry) {
    if (!entry.branchId) {
        console.warn("[API Logger] No branchId provided, skipping log");
        return;
    }
    try {
        const logType = entry.logType || deriveLogType(entry.endpoint);
        const status = deriveStatus(entry.response, entry.statusCode, entry.error);
        console.log(`[API Logger] Logging ${entry.endpoint} for branch ${entry.branchId} with status ${status}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
            entry.branchId,
            logType,
            entry.endpoint,
            JSON.stringify(entry.payload || {}),
            JSON.stringify(entry.response || {
                error: entry.error
            }),
            status
        ]);
        console.log(`[API Logger] Successfully logged ${entry.endpoint}`);
    } catch (error) {
        console.error("[API Logger] Failed to log API call:", error);
        console.error("[API Logger] Entry was:", JSON.stringify({
            branchId: entry.branchId,
            endpoint: entry.endpoint,
            statusCode: entry.statusCode
        }));
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/kra-url-helper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildKraBaseUrl",
    ()=>buildKraBaseUrl
]);
function buildKraBaseUrl(serverAddress, serverPort) {
    const DEFAULT_SERVER = '5.189.171.160';
    const DEFAULT_PORT = '8088';
    if (!serverAddress) {
        return `http://${DEFAULT_SERVER}:${serverPort || DEFAULT_PORT}`;
    }
    let address = serverAddress.trim();
    const hasScheme = /^https?:\/\//i.test(address);
    if (hasScheme) {
        address = address.replace(/^https?:\/\//i, '');
    }
    address = address.replace(/\/+$/, '');
    const hasPort = /:\d+$/.test(address);
    if (hasPort) {
        return `http://${address}`;
    }
    return `http://${address}:${serverPort || DEFAULT_PORT}`;
}
}),
"[project]/app/api/kra/codes/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-url-helper.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function POST(request) {
    const logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createApiLogger"])("/api/kra/codes", "POST");
    let kraPayload = null;
    let kraEndpoint = "";
    try {
        const branchId = request.headers.get("x-branch-id");
        console.log("[v0] Branch ID from header:", branchId);
        let branch;
        if (branchId) {
            const branches = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id, bhf_id, name, kra_pin, COALESCE(server_address, '5.189.171.160') as server_address, COALESCE(server_port, '8088') as server_port FROM branches WHERE id = $1", [
                branchId
            ]);
            if (branches && branches.length > 0) {
                branch = branches[0];
            }
        }
        if (!branch) {
            const branches = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id, bhf_id, name, kra_pin, COALESCE(server_address, '5.189.171.160') as server_address, COALESCE(server_port, '8088') as server_port FROM branches WHERE status = 'active' LIMIT 1");
            if (!branches || branches.length === 0) {
                throw new Error("No active branch found. Please configure a branch first.");
            }
            branch = branches[0];
        }
        const backendUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(branch.server_address, branch.server_port);
        console.log("[v0] Backend URL:", backendUrl);
        if (!branch.bhf_id) {
            throw new Error(`Branch "${branch.name}" is not configured with a BHF ID. Please configure the branch first in Security Settings.`);
        }
        console.log("[v0] Using branch:", branch.name, "with bhf_id:", branch.bhf_id);
        kraPayload = {
            tin: branch.kra_pin || "P052344628B",
            bhfId: branch.bhf_id,
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
        const flattenedCodes = [];
        const clsList = result.data?.clsList || [];
        for (const cls of clsList){
            const dtlList = cls.dtlList || [];
            for (const item of dtlList){
                flattenedCodes.push({
                    cdCls: cls.cdCls,
                    cdClsNm: cls.cdClsNm,
                    cd: item.cd,
                    cdNm: item.cdNm,
                    cdDesc: item.cdDesc,
                    useYn: item.useYn || "Y",
                    userDfnCd1: item.userDfnCd1,
                    userDfnCd2: item.userDfnCd2,
                    userDfnCd3: item.userDfnCd3
                });
            }
        }
        console.log("[v0] Flattened", flattenedCodes.length, "code list items");
        if (flattenedCodes.length > 0) {
            console.log("[v0] Saving", flattenedCodes.length, "code list items to database");
            for (const item of flattenedCodes){
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO kra_codelists (bhf_id, cd_cls, cd, cd_nm, cd_desc, use_yn, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (bhf_id, cd_cls, cd) DO UPDATE SET
             cd_nm = EXCLUDED.cd_nm,
             cd_desc = EXCLUDED.cd_desc,
             use_yn = EXCLUDED.use_yn,
             updated_at = NOW()`, [
                    branch.bhf_id,
                    item.cdCls,
                    item.cd,
                    item.cdNm,
                    item.cdDesc,
                    item.useYn || "Y"
                ]);
            }
        }
        await logger.success(kraPayload, result, branch.id, kraEndpoint);
        const transformedData = flattenedCodes.map((item)=>({
                cd_cls: item.cdCls,
                cd: item.cd,
                cd_nm: item.cdNm,
                cd_desc: item.cdDesc,
                use_yn: item.useYn || "Y"
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            resultCd: "000",
            resultMsg: "Successfully pulled code list from KRA",
            resultDt: new Date().toISOString(),
            data: transformedData
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7cbadc7d._.js.map