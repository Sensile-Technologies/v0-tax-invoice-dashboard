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
"[project]/lib/kra-stock-sync.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "syncStockAfterCreditNote",
    ()=>syncStockAfterCreditNote,
    "syncStockAfterSale",
    ()=>syncStockAfterSale
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-url-helper.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const DEFAULT_KRA_URL = process.env.KRA_VSCU_URL || "http://5.189.171.160:8088";
async function getBranchKraConfig(branchId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT b.kra_pin as tin, b.bhf_id, 
           COALESCE(b.server_address, '5.189.171.160') as server_address, 
           COALESCE(b.server_port, '8088') as server_port
    FROM branches b
    WHERE b.id = $1
  `, [
        branchId
    ]);
    if (result.length === 0 || !result[0].tin) return null;
    return {
        tin: result[0].tin,
        bhfId: result[0].bhf_id || "00",
        serverAddress: result[0].server_address,
        serverPort: result[0].server_port
    };
}
async function getBranchKraInfo(branchId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT kra_pin as tin, bhf_id 
    FROM branches 
    WHERE id = $1
  `, [
        branchId
    ]);
    if (result.length === 0 || !result[0].tin) return null;
    return {
        tin: result[0].tin,
        bhfId: result[0].bhf_id || "00"
    };
}
async function getNextSarNo(branchId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    UPDATE branches 
    SET sr_number = COALESCE(sr_number, 0) + 1,
        updated_at = NOW()
    WHERE id = $1
    RETURNING sr_number
  `, [
        branchId
    ]);
    if (result.length === 0) {
        throw new Error(`Branch ${branchId} not found`);
    }
    return result[0].sr_number;
}
function formatKraDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
function toFixed2(num) {
    return (Math.round(num * 100) / 100).toFixed(2);
}
function calculateTaxAmount(amount, taxType = "B") {
    if (taxType === "B") {
        return Math.round(amount * 0.16 * 100) / 100;
    } else if (taxType === "A") {
        return Math.round(amount / 1.16 * 0.16 * 100) / 100;
    } else if (taxType === "C") {
        return Math.round(amount * 0.08 * 100) / 100;
    }
    return 0;
}
async function callSaveStockItems(branchId, sarTyCd, items) {
    const startTime = Date.now();
    const kraConfig = await getBranchKraConfig(branchId);
    if (!kraConfig) {
        return {
            success: false,
            response: {
                resultCd: "CONFIG_ERROR",
                resultMsg: "Branch KRA info not configured"
            },
            sarNo: 0
        };
    }
    const kraInfo = {
        tin: kraConfig.tin,
        bhfId: kraConfig.bhfId
    };
    const kraBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(kraConfig.serverAddress, kraConfig.serverPort);
    const sarNo = await getNextSarNo(branchId);
    let totTaxblAmt = 0;
    let totTaxAmt = 0;
    let totAmt = 0;
    const itemList = items.map((item, index)=>{
        const splyAmt = Math.round(item.quantity * item.unitPrice * 100) / 100;
        const taxAmt = calculateTaxAmount(splyAmt, item.taxType);
        totTaxblAmt += splyAmt;
        totTaxAmt += taxAmt;
        totAmt += splyAmt;
        return {
            itemSeq: index + 1,
            itemCd: item.itemCode,
            itemClsCd: item.itemClassCode || "15100000",
            itemNm: item.itemName,
            bcd: null,
            pkgUnitCd: item.packageUnit || "NT",
            pkg: Math.ceil(item.quantity),
            qtyUnitCd: item.quantityUnit || "LTR",
            qty: parseFloat(item.quantity.toFixed(2)),
            itemExprDt: null,
            prc: item.unitPrice,
            splyAmt: toFixed2(splyAmt),
            totDcAmt: 0,
            taxblAmt: toFixed2(splyAmt),
            taxTyCd: item.taxType || "B",
            taxAmt: toFixed2(taxAmt),
            totAmt: toFixed2(splyAmt)
        };
    });
    const payload = {
        tin: kraInfo.tin,
        bhfId: kraInfo.bhfId,
        sarNo,
        orgSarNo: 0,
        regTyCd: "M",
        custTin: null,
        custNm: null,
        custBhfId: null,
        sarTyCd,
        ocrnDt: formatKraDate(),
        totItemCnt: itemList.length,
        totTaxblAmt: toFixed2(totTaxblAmt),
        totTaxAmt: toFixed2(totTaxAmt),
        totAmt: toFixed2(totAmt),
        remark: null,
        regrId: "Admin",
        regrNm: "Admin",
        modrNm: "Admin",
        modrId: "Admin",
        itemList
    };
    console.log(`[KRA Stock Sync] Calling saveStockItems with sarTyCd=${sarTyCd}`);
    console.log(`[KRA Stock Sync] Payload:`, JSON.stringify(payload, null, 2));
    let response;
    let httpStatus = 200;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 15000);
        const res = await fetch(`${kraBaseUrl}/stock/saveStockItems`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        httpStatus = res.status;
        response = await res.json();
    } catch (fetchError) {
        response = {
            resultCd: fetchError.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
            resultMsg: fetchError.message || "Failed to connect to KRA",
            resultDt: new Date().toISOString()
        };
        httpStatus = 0;
    }
    const duration = Date.now() - startTime;
    console.log(`[KRA Stock Sync] saveStockItems response (${duration}ms):`, JSON.stringify(response, null, 2));
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logApiCall"])({
        endpoint: "/stock/saveStockItems",
        method: "POST",
        payload,
        response,
        statusCode: httpStatus,
        durationMs: duration,
        branchId,
        externalEndpoint: `${kraBaseUrl}/stock/saveStockItems`
    });
    const isSuccess = response?.resultCd === "000" || response?.resultCd === "0";
    return {
        success: isSuccess,
        response,
        sarNo
    };
}
async function callSaveStockMaster(branchId, itemCode) {
    const startTime = Date.now();
    const kraConfig = await getBranchKraConfig(branchId);
    if (!kraConfig) {
        return {
            success: false,
            response: {
                resultCd: "CONFIG_ERROR",
                resultMsg: "Branch KRA info not configured"
            }
        };
    }
    const kraInfo = {
        tin: kraConfig.tin,
        bhfId: kraConfig.bhfId
    };
    const kraBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(kraConfig.serverAddress, kraConfig.serverPort);
    const tankResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT t.current_stock 
    FROM tanks t
    JOIN items i ON t.item_id = i.id
    WHERE i.item_code = $1 AND t.branch_id = $2
    LIMIT 1
  `, [
        itemCode,
        branchId
    ]);
    const currentStock = tankResult.length > 0 ? parseFloat(tankResult[0].current_stock) || 0 : 0;
    const payload = {
        tin: kraInfo.tin,
        bhfId: kraInfo.bhfId,
        itemCd: itemCode,
        rsdQty: currentStock,
        regrId: "Admin",
        regrNm: "Admin",
        modrNm: "Admin",
        modrId: "Admin"
    };
    console.log(`[KRA Stock Sync] Calling saveStockMaster for item ${itemCode}`);
    console.log(`[KRA Stock Sync] Payload:`, JSON.stringify(payload, null, 2));
    let response;
    let httpStatus = 200;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 15000);
        const res = await fetch(`${kraBaseUrl}/stockMaster/saveStockMaster`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        httpStatus = res.status;
        response = await res.json();
    } catch (fetchError) {
        response = {
            resultCd: fetchError.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
            resultMsg: fetchError.message || "Failed to connect to KRA",
            resultDt: new Date().toISOString()
        };
        httpStatus = 0;
    }
    const duration = Date.now() - startTime;
    console.log(`[KRA Stock Sync] saveStockMaster response for ${itemCode} (${duration}ms):`, JSON.stringify(response, null, 2));
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logApiCall"])({
        endpoint: "/stockMaster/saveStockMaster",
        method: "POST",
        payload,
        response,
        statusCode: httpStatus,
        durationMs: duration,
        branchId,
        externalEndpoint: `${kraBaseUrl}/stockMaster/saveStockMaster`
    });
    const isSuccess = response?.resultCd === "000" || response?.resultCd === "0";
    return {
        success: isSuccess,
        response
    };
}
async function syncStockAfterSale(branchId, items) {
    try {
        console.log(`[KRA Stock Sync] Starting stock sync after sale for branch ${branchId}`);
        const stockItemsResult = await callSaveStockItems(branchId, "11", items);
        if (!stockItemsResult.success) {
            console.log(`[KRA Stock Sync] saveStockItems failed, skipping saveStockMaster`);
            return {
                success: false,
                saveStockItemsResponse: stockItemsResult.response,
                error: stockItemsResult.response?.resultMsg || "saveStockItems failed"
            };
        }
        const stockMasterResponses = [];
        for (const item of items){
            const masterResult = await callSaveStockMaster(branchId, item.itemCode);
            stockMasterResponses.push({
                itemCode: item.itemCode,
                ...masterResult
            });
        }
        console.log(`[KRA Stock Sync] Stock sync after sale completed successfully`);
        return {
            success: true,
            saveStockItemsResponse: stockItemsResult.response,
            saveStockMasterResponses: stockMasterResponses
        };
    } catch (error) {
        console.error(`[KRA Stock Sync] Error during stock sync after sale:`, error);
        return {
            success: false,
            error: error.message || "Internal error during stock sync"
        };
    }
}
async function syncStockAfterCreditNote(branchId, items) {
    try {
        console.log(`[KRA Stock Sync] Starting stock sync after credit note for branch ${branchId}`);
        const stockItemsResult = await callSaveStockItems(branchId, "03", items);
        if (!stockItemsResult.success) {
            console.log(`[KRA Stock Sync] saveStockItems failed for credit note, skipping saveStockMaster`);
            return {
                success: false,
                saveStockItemsResponse: stockItemsResult.response,
                error: stockItemsResult.response?.resultMsg || "saveStockItems failed"
            };
        }
        const stockMasterResponses = [];
        for (const item of items){
            const masterResult = await callSaveStockMaster(branchId, item.itemCode);
            stockMasterResponses.push({
                itemCode: item.itemCode,
                ...masterResult
            });
        }
        console.log(`[KRA Stock Sync] Stock sync after credit note completed successfully`);
        return {
            success: true,
            saveStockItemsResponse: stockItemsResult.response,
            saveStockMasterResponses: stockMasterResponses
        };
    } catch (error) {
        console.error(`[KRA Stock Sync] Error during stock sync after credit note:`, error);
        return {
            success: false,
            error: error.message || "Internal error during stock sync"
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/kra-sales-api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "callKraCreditNote",
    ()=>callKraCreditNote,
    "callKraSaveSales",
    ()=>callKraSaveSales,
    "callKraTestSalesEndpoint",
    ()=>callKraTestSalesEndpoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-stock-sync.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-url-helper.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const DEFAULT_KRA_URL = process.env.KRA_VSCU_URL || "http://5.189.171.160:8088";
const PAYMENT_TYPE_CODES = {
    'cash': '01',
    'credit': '02',
    'mobile_money': '03',
    'mpesa': '03',
    'bank_transfer': '04',
    'card': '05',
    'cheque': '06',
    'other': '07'
};
async function getBranchConfig(branchId) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT id, bhf_id, kra_pin, device_token, server_address, server_port, COALESCE(invoice_number, 0) as invoice_number
      FROM branches
      WHERE id = $1
    `, [
            branchId
        ]);
        if (result.length === 0) {
            return null;
        }
        return result[0];
    } catch (error) {
        console.error("[KRA Sales API] Error fetching branch config:", error);
        return null;
    }
}
async function getNextInvoiceNo(branchId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    UPDATE branches 
    SET invoice_number = COALESCE(invoice_number, 0) + 1 
    WHERE id = $1 
    RETURNING invoice_number
  `, [
        branchId
    ]);
    return result[0]?.invoice_number || 1;
}
async function getItemInfoByFuelType(branchId, fuelType) {
    // ONLY use branch_items for pricing - no fallback to items table
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT i.item_code, i.class_code, i.item_name, i.package_unit, 
           i.quantity_unit, i.tax_type, 
           bi.sale_price, 
           bi.purchase_price
    FROM items i
    INNER JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
    WHERE (UPPER(i.item_name) = UPPER($2) OR i.item_name ILIKE $3)
    AND bi.sale_price IS NOT NULL AND bi.sale_price > 0
    ORDER BY i.created_at DESC
    LIMIT 1
  `, [
        branchId,
        fuelType,
        `%${fuelType}%`
    ]);
    return result.length > 0 ? result[0] : null;
}
function formatKraDateTime(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
function formatKraDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
function toFixed2(num) {
    return (Math.round(num * 100) / 100).toFixed(2);
}
function calculateTax(amount, taxType = "B") {
    if (taxType === "A") {
        const taxRt = 16;
        const taxblAmt = amount / (1 + taxRt / 100);
        const taxAmt = amount - taxblAmt;
        return {
            taxblAmt: Math.round(taxblAmt * 100) / 100,
            taxAmt: Math.round(taxAmt * 100) / 100,
            taxRt
        };
    } else if (taxType === "B") {
        const taxRt = 16;
        return {
            taxblAmt: amount,
            taxAmt: Math.round(amount * 0.16 * 100) / 100,
            taxRt
        };
    } else if (taxType === "C") {
        const taxRt = 8;
        return {
            taxblAmt: amount,
            taxAmt: Math.round(amount * 0.08 * 100) / 100,
            taxRt
        };
    } else if (taxType === "D" || taxType === "E") {
        return {
            taxblAmt: 0,
            taxAmt: 0,
            taxRt: 0
        };
    }
    return {
        taxblAmt: amount,
        taxAmt: 0,
        taxRt: 0
    };
}
async function callKraSaveSales(saleData) {
    const startTime = Date.now();
    try {
        const branchConfig = await getBranchConfig(saleData.branch_id);
        if (!branchConfig) {
            const errorMsg = "Branch configuration not found";
            console.log(`[KRA Sales API] ${errorMsg}`);
            return {
                success: false,
                kraResponse: null,
                error: errorMsg
            };
        }
        if (!branchConfig.kra_pin) {
            const errorMsg = "KRA PIN not configured for this branch";
            console.log(`[KRA Sales API] ${errorMsg}`);
            return {
                success: false,
                kraResponse: {
                    resultCd: "CONFIG_ERROR",
                    resultMsg: errorMsg,
                    resultDt: new Date().toISOString()
                },
                error: errorMsg
            };
        }
        const itemInfo = await getItemInfoByFuelType(saleData.branch_id, saleData.fuel_type);
        const invcNo = await getNextInvoiceNo(saleData.branch_id);
        if (!itemInfo) {
            const errorMsg = `No item found for fuel type: ${saleData.fuel_type}`;
            console.log(`[KRA Sales API] ${errorMsg}`);
            return {
                success: false,
                kraResponse: {
                    resultCd: "ITEM_NOT_FOUND",
                    resultMsg: errorMsg,
                    resultDt: new Date().toISOString()
                },
                error: errorMsg
            };
        }
        const itemCd = itemInfo.item_code;
        const itemClsCd = itemInfo.class_code || "15100000";
        const itemNm = itemInfo.item_name;
        const pkgUnitCd = itemInfo.package_unit || "NT";
        const qtyUnitCd = itemInfo.quantity_unit || "LTR";
        const taxTyCd = itemInfo.tax_type || "B";
        const prc = Number(itemInfo.sale_price) || 0;
        const qty = saleData.quantity;
        const totAmt = qty * prc;
        console.log(`[KRA Sales API] Item lookup: ${itemNm}, item_code: ${itemCd}, sale_price from DB: ${prc}, qty: ${qty}, totAmt: ${totAmt}`);
        const { taxblAmt, taxAmt, taxRt } = calculateTax(totAmt, taxTyCd);
        const now = new Date();
        const cfmDt = formatKraDateTime(now);
        const salesDt = formatKraDate(now);
        const pmtTyCd = PAYMENT_TYPE_CODES[saleData.payment_method?.toLowerCase()] || "01";
        const trdInvcNo = `CIV-${String(invcNo).padStart(6, '0')}`;
        const kraPayload = {
            tin: branchConfig.kra_pin,
            bhfId: branchConfig.bhf_id || "00",
            trdInvcNo: trdInvcNo,
            invcNo: String(invcNo),
            orgInvcNo: 0,
            custTin: saleData.customer_pin || null,
            custNm: saleData.customer_name || "Walk-in Customer",
            salesTyCd: "N",
            rcptTyCd: "S",
            pmtTyCd: pmtTyCd,
            salesSttsCd: "02",
            cfmDt: cfmDt,
            salesDt: salesDt,
            stockRlsDt: cfmDt,
            cnclReqDt: null,
            cnclDt: null,
            rfdDt: null,
            rfdRsnCd: null,
            totItemCnt: 1,
            taxblAmtA: taxTyCd === "A" ? toFixed2(taxblAmt) : "0.00",
            taxblAmtB: taxTyCd === "B" ? toFixed2(taxblAmt) : "0.00",
            taxblAmtC: taxTyCd === "C" ? toFixed2(taxblAmt) : "0.00",
            taxblAmtD: "0.00",
            taxblAmtE: "0.00",
            taxRtA: taxTyCd === "A" ? toFixed2(taxRt) : "0.00",
            taxRtB: taxTyCd === "B" ? toFixed2(taxRt) : "0.00",
            taxRtC: taxTyCd === "C" ? toFixed2(taxRt) : "0.00",
            taxRtD: "0.00",
            taxRtE: "0.00",
            taxAmtA: taxTyCd === "A" ? toFixed2(taxAmt) : "0.00",
            taxAmtB: taxTyCd === "B" ? toFixed2(taxAmt) : "0.00",
            taxAmtC: taxTyCd === "C" ? toFixed2(taxAmt) : "0.00",
            taxAmtD: "0.00",
            taxAmtE: "0.00",
            totTaxblAmt: toFixed2(taxblAmt),
            totTaxAmt: toFixed2(taxAmt),
            totAmt: toFixed2(totAmt),
            prchrAcptcYn: "N",
            remark: null,
            regrNm: "Admin",
            regrId: "Admin",
            modrNm: "Admin",
            modrId: "Admin",
            receipt: {
                custTin: saleData.customer_pin || null,
                custMblNo: null,
                rcptPbctDt: null,
                trdeNm: null,
                adrs: null,
                topMsg: null,
                btmMsg: null,
                prchrAcptcYn: "Y"
            },
            itemList: [
                {
                    itemSeq: 1,
                    itemCd: itemCd,
                    itemClsCd: itemClsCd,
                    itemNm: itemNm,
                    bcd: null,
                    pkgUnitCd: pkgUnitCd,
                    pkg: 1,
                    qtyUnitCd: qtyUnitCd,
                    qty: parseFloat(qty.toFixed(2)),
                    prc: prc,
                    splyAmt: toFixed2(qty),
                    dcRt: 0.0,
                    dcAmt: 0.0,
                    isrccCd: null,
                    isrccNm: null,
                    isrcRt: 0,
                    isrcAmt: 0,
                    taxTyCd: taxTyCd,
                    taxblAmt: toFixed2(taxblAmt),
                    taxAmt: toFixed2(taxAmt),
                    totAmt: toFixed2(totAmt)
                }
            ]
        };
        const kraBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(branchConfig.server_address, branchConfig.server_port);
        const kraEndpoint = `${kraBaseUrl}/trnsSales/saveSales`;
        console.log(`[KRA Sales API] Calling endpoint: ${kraEndpoint}`);
        console.log(`[KRA Sales API] Request payload:`, JSON.stringify(kraPayload, null, 2));
        let kraResponse;
        let httpStatusCode = 200;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 30000);
            const response = await fetch(kraEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...branchConfig.device_token ? {
                        "DeviceSerialNo": branchConfig.device_token
                    } : {}
                },
                body: JSON.stringify(kraPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            httpStatusCode = response.status;
            kraResponse = await response.json();
            console.log(`[KRA Sales API] HTTP Status: ${response.status}`);
            console.log(`[KRA Sales API] KRA Result Code: ${kraResponse.resultCd}`);
            console.log(`[KRA Sales API] KRA Result Message: ${kraResponse.resultMsg}`);
            console.log(`[KRA Sales API] Response body:`, JSON.stringify(kraResponse, null, 2));
        } catch (fetchError) {
            httpStatusCode = 0;
            if (fetchError.name === 'AbortError') {
                kraResponse = {
                    resultCd: "TIMEOUT",
                    resultMsg: "Request timed out after 30 seconds",
                    resultDt: new Date().toISOString()
                };
            } else {
                kraResponse = {
                    resultCd: "NETWORK_ERROR",
                    resultMsg: fetchError.message || "Failed to connect to KRA backend",
                    resultDt: new Date().toISOString()
                };
            }
            console.log(`[KRA Sales API] Network error:`, fetchError.message);
            console.log(`[KRA Sales API] Response (network error):`, JSON.stringify(kraResponse, null, 2));
        }
        const durationMs = Date.now() - startTime;
        const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0";
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logApiCall"])({
            endpoint: "/trnsSales/saveSales",
            method: "POST",
            payload: kraPayload,
            response: kraResponse,
            statusCode: httpStatusCode || 500,
            durationMs,
            branchId: saleData.branch_id,
            externalEndpoint: kraEndpoint
        });
        if (isSuccess) {
            console.log(`[KRA Sales API] saveSales successful, syncing stock in background`);
            // OPTIMIZATION: Run stock sync in background (fire-and-forget) for faster response
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncStockAfterSale"])(saleData.branch_id, [
                {
                    itemCode: itemCd,
                    itemClassCode: itemClsCd,
                    itemName: itemNm,
                    packageUnit: pkgUnitCd,
                    quantityUnit: qtyUnitCd,
                    quantity: qty,
                    unitPrice: prc,
                    taxType: taxTyCd
                }
            ]).then((result)=>{
                if (result.success) {
                    console.log(`[KRA Sales API] Stock sync completed successfully`);
                } else {
                    console.log(`[KRA Sales API] Stock sync failed: ${result.error}`);
                }
            }).catch((err)=>console.error(`[KRA Sales API] Error during stock sync:`, err.message));
        }
        // Return immediately - stock sync happens in background
        return {
            success: isSuccess,
            kraResponse
        };
    } catch (error) {
        const errorResponse = {
            resultCd: "SYSTEM_ERROR",
            resultMsg: error.message || "System error calling KRA API",
            resultDt: new Date().toISOString()
        };
        console.error(`[KRA Sales API] System error:`, error);
        const durationMs = Date.now() - startTime;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logApiCall"])({
            endpoint: "/trnsSales/saveSales",
            method: "POST",
            payload: {
                saleData,
                errorContext: "System error before KRA call"
            },
            response: errorResponse,
            statusCode: 500,
            durationMs,
            branchId: saleData.branch_id,
            error: error.message,
            externalEndpoint: `${DEFAULT_KRA_URL}/trnsSales/saveSales`
        });
        return {
            success: false,
            kraResponse: errorResponse,
            error: error.message
        };
    }
}
async function callKraTestSalesEndpoint(saleData) {
    return callKraSaveSales(saleData);
}
const REFUND_REASON_CODES = {
    'defective': '01',
    'wrong_item': '02',
    'customer_request': '03',
    'price_error': '04',
    'duplicate': '05',
    'other': '06'
};
async function callKraCreditNote(creditNoteData) {
    const startTime = Date.now();
    try {
        const branchConfig = await getBranchConfig(creditNoteData.branch_id);
        if (!branchConfig) {
            return {
                success: false,
                kraResponse: null,
                error: "Branch configuration not found"
            };
        }
        if (!branchConfig.kra_pin) {
            return {
                success: false,
                kraResponse: {
                    resultCd: "CONFIG_ERROR",
                    resultMsg: "KRA PIN not configured for this branch",
                    resultDt: new Date().toISOString()
                },
                error: "KRA PIN not configured"
            };
        }
        const invcNo = await getNextInvoiceNo(creditNoteData.branch_id);
        const trdInvcNo = `CR${invcNo}`;
        const now = new Date();
        const cfmDt = formatKraDateTime(now);
        const salesDt = formatKraDate(now);
        const rfdRsnCd = REFUND_REASON_CODES[creditNoteData.refund_reason_code?.toLowerCase()] || "06";
        let totTaxblAmtB = 0;
        let totTaxAmtB = 0;
        let totAmt = 0;
        const itemList = creditNoteData.items.map((item, index)=>{
            const splyAmt = item.quantity * item.price;
            const taxblAmt = splyAmt / 1.16;
            const taxAmt = splyAmt - taxblAmt;
            totTaxblAmtB += taxblAmt;
            totTaxAmtB += taxAmt;
            totAmt += splyAmt;
            return {
                itemSeq: index + 1,
                itemCd: item.item_code,
                itemClsCd: item.item_class_code || "99013001",
                itemNm: item.item_name,
                bcd: null,
                pkgUnitCd: item.package_unit || "BF",
                pkg: item.quantity,
                qtyUnitCd: item.quantity_unit || "L",
                qty: item.quantity,
                prc: item.price,
                splyAmt: toFixed2(splyAmt),
                dcRt: 0.0,
                dcAmt: 0.0,
                isrccCd: null,
                isrccNm: null,
                isrcRt: null,
                isrcAmt: null,
                taxTyCd: item.tax_type || "B",
                taxblAmt: toFixed2(taxblAmt),
                taxAmt: toFixed2(taxAmt),
                totAmt: toFixed2(splyAmt)
            };
        });
        const kraPayload = {
            tin: branchConfig.kra_pin,
            bhfId: branchConfig.bhf_id || "00",
            trdInvcNo: trdInvcNo,
            invcNo: invcNo,
            orgInvcNo: creditNoteData.original_invoice_no,
            custTin: creditNoteData.customer_tin || null,
            custNm: creditNoteData.customer_name || "Walk-in Customer",
            salesTyCd: "N",
            rcptTyCd: "R",
            pmtTyCd: "01",
            salesSttsCd: "02",
            cfmDt: cfmDt,
            salesDt: salesDt,
            stockRlsDt: cfmDt,
            cnclReqDt: null,
            cnclDt: null,
            rfdDt: cfmDt,
            rfdRsnCd: rfdRsnCd,
            totItemCnt: itemList.length,
            taxblAmtA: "0.00",
            taxblAmtB: toFixed2(totTaxblAmtB),
            taxblAmtC: "0.00",
            taxblAmtD: "0.00",
            taxblAmtE: "0.00",
            taxRtA: "0.00",
            taxRtB: "16.00",
            taxRtC: "0.00",
            taxRtD: "0.00",
            taxRtE: "0.00",
            taxAmtA: "0.00",
            taxAmtB: toFixed2(totTaxAmtB),
            taxAmtC: "0.00",
            taxAmtD: "0.00",
            taxAmtE: "0.00",
            totTaxblAmt: toFixed2(totTaxblAmtB),
            totTaxAmt: toFixed2(totTaxAmtB),
            totAmt: toFixed2(totAmt),
            prchrAcptcYn: "N",
            remark: null,
            regrNm: "Admin",
            regrId: "Admin",
            modrNm: "Admin",
            modrId: "Admin",
            receipt: {
                custTin: creditNoteData.customer_tin || null,
                custMblNo: null,
                rcptPbctDt: cfmDt,
                trdeNm: null,
                adrs: null,
                topMsg: null,
                btmMsg: null,
                prchrAcptcYn: "N"
            },
            itemList: itemList
        };
        const kraBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(branchConfig.server_address, branchConfig.server_port);
        const kraEndpoint = `${kraBaseUrl}/trnsSales/saveSales`;
        console.log(`[KRA Credit Note API] Calling endpoint: ${kraEndpoint}`);
        console.log(`[KRA Credit Note API] Request payload:`, JSON.stringify(kraPayload, null, 2));
        let kraResponse;
        let httpStatusCode = 200;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 30000);
            const response = await fetch(kraEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...branchConfig.device_token ? {
                        "DeviceSerialNo": branchConfig.device_token
                    } : {}
                },
                body: JSON.stringify(kraPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            httpStatusCode = response.status;
            kraResponse = await response.json();
            console.log(`[KRA Credit Note API] HTTP Status: ${response.status}`);
            console.log(`[KRA Credit Note API] Response:`, JSON.stringify(kraResponse, null, 2));
        } catch (fetchError) {
            httpStatusCode = 0;
            kraResponse = {
                resultCd: fetchError.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
                resultMsg: fetchError.message || "Failed to connect to KRA backend",
                resultDt: new Date().toISOString()
            };
            console.log(`[KRA Credit Note API] Network error:`, fetchError.message);
        }
        const durationMs = Date.now() - startTime;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logApiCall"])({
            endpoint: "/trnsSales/saveSales",
            method: "POST",
            payload: kraPayload,
            response: kraResponse,
            statusCode: httpStatusCode || 500,
            durationMs,
            branchId: creditNoteData.branch_id,
            externalEndpoint: kraEndpoint
        });
        const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0";
        if (isSuccess) {
            console.log(`[KRA Credit Note API] saveSales successful for credit note, now syncing stock with KRA`);
            try {
                const stockItems = creditNoteData.items.map((item)=>({
                        itemCode: item.item_code,
                        itemClassCode: item.item_class_code,
                        itemName: item.item_name,
                        packageUnit: item.package_unit,
                        quantityUnit: item.quantity_unit,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        taxType: item.tax_type
                    }));
                const stockSyncResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncStockAfterCreditNote"])(creditNoteData.branch_id, stockItems);
                if (stockSyncResult.success) {
                    console.log(`[KRA Credit Note API] Stock sync completed successfully for credit note`);
                } else {
                    console.log(`[KRA Credit Note API] Stock sync failed for credit note: ${stockSyncResult.error}`);
                }
            } catch (stockError) {
                console.error(`[KRA Credit Note API] Error during stock sync for credit note:`, stockError.message);
            }
        }
        return {
            success: isSuccess,
            kraResponse,
            creditNoteNumber: trdInvcNo,
            invcNo: invcNo
        };
    } catch (error) {
        console.error(`[KRA Credit Note API] System error:`, error);
        return {
            success: false,
            kraResponse: {
                resultCd: "SYSTEM_ERROR",
                resultMsg: error.message || "System error calling KRA API",
                resultDt: new Date().toISOString()
            },
            error: error.message
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/api/mobile/create-sale/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$sales$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-sales-api.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$sales$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$sales$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function POST(request) {
    try {
        const body = await request.json();
        console.log("[Mobile Create Sale] Request body:", JSON.stringify(body, null, 2));
        const { branch_id, user_id, nozzle_id, fuel_type, quantity, unit_price, total_amount, payment_method, customer_name, kra_pin, vehicle_number, is_loyalty_customer, loyalty_customer_name, loyalty_customer_pin } = body;
        if (!branch_id || !fuel_type || !total_amount) {
            console.log("[Mobile Create Sale] Missing required fields - branch_id:", branch_id, "fuel_type:", fuel_type, "total_amount:", total_amount);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Missing required fields: branch_id=${branch_id}, fuel_type=${fuel_type}, total_amount=${total_amount}`
            }, {
                status: 400
            });
        }
        const client = await pool.connect();
        // Validate nozzle has a tank assigned before allowing sale
        if (nozzle_id) {
            const nozzleTankCheck = await client.query(`SELECT n.id, n.tank_id, n.nozzle_number, d.dispenser_number 
         FROM nozzles n 
         JOIN dispensers d ON n.dispenser_id = d.id
         WHERE n.id = $1`, [
                nozzle_id
            ]);
            if (nozzleTankCheck.rows.length === 0) {
                client.release();
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Nozzle not found"
                }, {
                    status: 400
                });
            }
            const nozzle = nozzleTankCheck.rows[0];
            if (!nozzle.tank_id) {
                client.release();
                console.log(`[Mobile Create Sale] Blocked sale - Nozzle D${nozzle.dispenser_number}N${nozzle.nozzle_number} has no tank assigned`);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: `Cannot sell from nozzle D${nozzle.dispenser_number}N${nozzle.nozzle_number} - no tank assigned. Please assign a tank in Manage Nozzles.`
                }, {
                    status: 400
                });
            }
        }
        try {
            const duplicateCheck = await client.query(`SELECT id, invoice_number, kra_status, kra_cu_inv, kra_rcpt_sign, kra_internal_data,
                customer_name, customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin
         FROM sales 
         WHERE branch_id = $1 
           AND fuel_type = $2 
           AND total_amount = $3 
           AND created_at > NOW() - INTERVAL '60 seconds'
           AND kra_status = 'success'
         ORDER BY created_at DESC 
         LIMIT 1`, [
                branch_id,
                fuel_type,
                total_amount
            ]);
            if (duplicateCheck.rows.length > 0) {
                const existingSale = duplicateCheck.rows[0];
                console.log("[Mobile Create Sale] Duplicate sale detected, returning existing:", existingSale.id);
                const branchResult = await client.query(`SELECT name, address, phone, kra_pin, bhf_id FROM branches WHERE id = $1`, [
                    branch_id
                ]);
                const branchData = branchResult.rows[0] || {};
                // Get customer info from the existing sale
                const dupCustomerName = existingSale.is_loyalty_sale ? existingSale.loyalty_customer_name || existingSale.customer_name : existingSale.customer_name;
                const dupCustomerPin = existingSale.is_loyalty_sale ? existingSale.loyalty_customer_pin || existingSale.customer_pin : existingSale.customer_pin;
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    sale_id: existingSale.id,
                    duplicate: true,
                    message: "Sale already submitted to KRA within the last 60 seconds",
                    invoice_number: existingSale.invoice_number,
                    kra_success: true,
                    print_data: {
                        invoice_number: existingSale.kra_cu_inv || existingSale.invoice_number,
                        receipt_no: existingSale.kra_cu_inv?.split('/')[1] || null,
                        cu_serial_number: existingSale.kra_cu_inv?.split('/')[0] || null,
                        cu_invoice_no: existingSale.kra_cu_inv || null,
                        intrl_data: existingSale.kra_internal_data || null,
                        branch_name: branchData.name || null,
                        branch_address: branchData.address || null,
                        branch_phone: branchData.phone || null,
                        branch_pin: branchData.kra_pin || null,
                        receipt_signature: existingSale.kra_rcpt_sign || null,
                        bhf_id: branchData.bhf_id || '03',
                        customer_name: dupCustomerName || null,
                        customer_pin: dupCustomerPin || null,
                        is_loyalty_customer: existingSale.is_loyalty_sale || false
                    }
                });
            }
            const tankCheck = await client.query(`SELECT t.id, t.tank_name, COALESCE(t.kra_item_cd, i.item_code) as kra_item_cd, i.item_name, i.item_code 
         FROM tanks t
         JOIN items i ON t.item_id = i.id
         WHERE t.branch_id = $1 AND UPPER(i.item_name) = UPPER($2) AND t.status = 'active' 
         ORDER BY t.current_stock DESC LIMIT 1`, [
                branch_id,
                fuel_type
            ]);
            if (tankCheck.rows.length > 0 && !tankCheck.rows[0].kra_item_cd && !tankCheck.rows[0].item_code) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: `Tank "${tankCheck.rows[0].tank_name}" is not mapped to an item. Please map the tank to an item in the item list before selling.`
                }, {
                    status: 400
                });
            }
            // Get item price from branch_items (single source of truth)
            const itemPriceResult = await client.query(`SELECT bi.sale_price 
         FROM items i
         JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
         WHERE bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND (UPPER(i.item_name) = UPPER($2) OR i.item_name ILIKE $3)
         ORDER BY bi.updated_at DESC NULLS LAST LIMIT 1`, [
                branch_id,
                fuel_type,
                `%${fuel_type}%`
            ]);
            const correctUnitPrice = itemPriceResult.rows.length > 0 ? parseFloat(itemPriceResult.rows[0].sale_price) : unit_price;
            const correctQuantity = total_amount / correctUnitPrice;
            console.log(`[Mobile Create Sale] Price from items table: ${correctUnitPrice}, Calculated quantity: ${correctQuantity}`);
            const shiftResult = await client.query(`SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`, [
                branch_id
            ]);
            const shiftId = shiftResult.rows[0]?.id || null;
            let staffId = null;
            if (user_id) {
                const staffResult = await client.query(`SELECT id FROM staff WHERE user_id = $1 AND branch_id = $2 LIMIT 1`, [
                    user_id,
                    branch_id
                ]);
                staffId = staffResult.rows[0]?.id || null;
            }
            await client.query('BEGIN');
            const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
            const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
            // Get current meter reading from previous shift's closing reading (not from initial_meter_reading)
            // The meter_reading_after is calculated based on the last known reading + quantity
            let meterReadingAfter = null;
            if (nozzle_id && correctQuantity > 0) {
                // Get the latest meter reading from sales or shift_readings
                const lastReadingResult = await client.query(`SELECT COALESCE(
            (SELECT meter_reading_after FROM sales 
             WHERE nozzle_id = $1 AND meter_reading_after IS NOT NULL 
             ORDER BY created_at DESC LIMIT 1),
            (SELECT sr.closing_reading FROM shift_readings sr 
             JOIN shifts s ON sr.shift_id = s.id 
             WHERE sr.nozzle_id = $1 AND s.status = 'completed' 
             ORDER BY s.end_time DESC NULLS LAST LIMIT 1),
            (SELECT initial_meter_reading FROM nozzles WHERE id = $1),
            0
          ) as last_reading`, [
                    nozzle_id
                ]);
                const currentReading = parseFloat(lastReadingResult.rows[0]?.last_reading) || 0;
                meterReadingAfter = currentReading + correctQuantity;
            // Note: We don't update nozzle's initial_meter_reading - it stays static
            }
            const saleResult = await client.query(`INSERT INTO sales (
          branch_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date,
          customer_pin, is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin,
          meter_reading_after, shift_id, staff_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`, [
                branch_id,
                nozzle_id || null,
                fuel_type,
                correctQuantity,
                correctUnitPrice,
                total_amount,
                payment_method || 'cash',
                customer_name || 'Walk-in Customer',
                vehicle_number || null,
                invoiceNumber,
                receiptNumber,
                kra_pin || null,
                is_loyalty_customer || false,
                loyalty_customer_name || (is_loyalty_customer ? customer_name : null),
                loyalty_customer_pin || (is_loyalty_customer ? kra_pin : null),
                meterReadingAfter,
                shiftId,
                staffId
            ]);
            const sale = saleResult.rows[0];
            if (is_loyalty_customer && customer_name && customer_name !== 'Walk-in Customer') {
                const existingCustomer = await client.query(`SELECT id FROM customers WHERE cust_nm = $1 AND branch_id = $2`, [
                    customer_name,
                    branch_id
                ]);
                if (existingCustomer.rows.length === 0) {
                    // Get branch info for tin and bhf_id (required NOT NULL columns)
                    const branchForCustomer = await client.query(`SELECT kra_pin, bhf_id FROM branches WHERE id = $1`, [
                        branch_id
                    ]);
                    const branchTin = branchForCustomer.rows[0]?.kra_pin || '';
                    const branchBhfId = branchForCustomer.rows[0]?.bhf_id || '00';
                    const custNo = `CUST-${Date.now().toString(36).toUpperCase()}`;
                    await client.query(`INSERT INTO customers (branch_id, tin, bhf_id, cust_nm, cust_tin, cust_no, use_yn)
             VALUES ($1, $2, $3, $4, $5, $6, 'Y')
             ON CONFLICT DO NOTHING`, [
                        branch_id,
                        branchTin,
                        branchBhfId,
                        customer_name,
                        kra_pin || '',
                        custNo
                    ]);
                }
            }
            if (tankCheck.rows.length > 0 && correctQuantity > 0) {
                const tankId = tankCheck.rows[0].id;
                await client.query(`UPDATE tanks SET current_stock = GREATEST(0, current_stock - $1), updated_at = NOW() WHERE id = $2`, [
                    correctQuantity,
                    tankId
                ]);
                console.log(`[Mobile Create Sale] Reduced tank ${tankId} stock by ${correctQuantity} liters`);
            }
            // Create loyalty_transaction record for loyalty sales
            if (is_loyalty_customer) {
                const loyaltyCustomerName = loyalty_customer_name || customer_name || 'Walk-in Customer';
                const loyaltyCustomerPin = loyalty_customer_pin || kra_pin || '';
                const pointsEarned = Math.floor(total_amount / 100) // 1 point per 100 KES
                ;
                await client.query(`INSERT INTO loyalty_transactions 
           (branch_id, sale_id, customer_name, customer_pin, transaction_date, transaction_amount, points_earned, payment_method, fuel_type, quantity)
           VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9)`, [
                    branch_id,
                    sale.id,
                    loyaltyCustomerName,
                    loyaltyCustomerPin,
                    total_amount,
                    pointsEarned,
                    payment_method || 'cash',
                    fuel_type,
                    correctQuantity
                ]);
                console.log(`[Mobile Create Sale] Created loyalty_transaction for sale ${sale.id}, points: ${pointsEarned}`);
            }
            await client.query('COMMIT');
            const branchResult = await client.query(`SELECT name, address, phone, kra_pin, bhf_id, server_address FROM branches WHERE id = $1`, [
                branch_id
            ]);
            const branchData = branchResult.rows[0] || {};
            // Get item code from branch_items (for HQ-assigned items) or legacy items table
            const itemResult = await client.query(`SELECT i.item_code FROM items i
         LEFT JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
         WHERE (i.branch_id = $1 OR (i.branch_id IS NULL AND bi.branch_id = $1))
         AND i.item_name ILIKE $2 LIMIT 1`, [
                branch_id,
                `%${fuel_type}%`
            ]);
            const itemCode = itemResult.rows[0]?.item_code || null;
            // Check if branch has KRA configured (server_address must be set)
            const kraConfigured = !!(branchData.server_address && branchData.server_address.trim());
            // For loyalty customers, look up their KRA PIN from the customers table if not provided
            // Priority: kra_pin (from request) -> loyalty_customer_pin (explicit field) -> DB lookup
            let effectiveCustomerPin = kra_pin || loyalty_customer_pin || '';
            let effectiveCustomerName = loyalty_customer_name || customer_name || 'Walk-in Customer';
            if (is_loyalty_customer && !effectiveCustomerPin && (loyalty_customer_name || customer_name)) {
                const lookupName = loyalty_customer_name || customer_name;
                const loyaltyCustomerLookup = await client.query(`SELECT c.cust_tin, c.cust_nm FROM customers c
           INNER JOIN customer_branches cb ON c.id = cb.customer_id
           WHERE cb.branch_id = $1 AND cb.status = 'active' AND c.cust_nm = $2
           LIMIT 1`, [
                    branch_id,
                    lookupName
                ]);
                if (loyaltyCustomerLookup.rows.length > 0) {
                    effectiveCustomerPin = loyaltyCustomerLookup.rows[0].cust_tin || '';
                    effectiveCustomerName = loyaltyCustomerLookup.rows[0].cust_nm || customer_name;
                    console.log(`[Mobile Create Sale] Found loyalty customer PIN from DB: ${effectiveCustomerPin}`);
                }
            }
            // If KRA is not configured for this branch, skip KRA transmission
            if (!kraConfigured) {
                console.log("[Mobile Create Sale] Branch has no KRA server configured, skipping KRA transmission");
                await client.query(`UPDATE sales SET 
            kra_status = 'not_required',
            customer_pin = COALESCE(customer_pin, $2::text),
            loyalty_customer_pin = CASE WHEN is_loyalty_sale THEN COALESCE(loyalty_customer_pin, $2::text) ELSE loyalty_customer_pin END,
            updated_at = NOW()
          WHERE id = $1`, [
                    sale.id,
                    effectiveCustomerPin || null
                ]);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    sale_id: sale.id,
                    sale: {
                        ...sale,
                        kra_status: 'not_required'
                    },
                    invoice_number: invoiceNumber,
                    receipt_number: receiptNumber,
                    kra_response: null,
                    kra_success: false,
                    kra_not_configured: true,
                    print_data: {
                        invoice_number: invoiceNumber,
                        receipt_no: receiptNumber,
                        cu_serial_number: null,
                        cu_invoice_no: null,
                        intrl_data: null,
                        branch_name: branchData.name || null,
                        branch_address: branchData.address || null,
                        branch_phone: branchData.phone || null,
                        branch_pin: branchData.kra_pin || null,
                        item_code: itemCode,
                        receipt_signature: null,
                        bhf_id: branchData.bhf_id || null,
                        customer_name: effectiveCustomerName,
                        customer_pin: effectiveCustomerPin || null,
                        is_loyalty_customer: is_loyalty_customer || false
                    }
                });
            }
            console.log("[Mobile Create Sale] Sale created successfully, calling KRA endpoint...");
            console.log(`[Mobile Create Sale] is_loyalty_customer: ${is_loyalty_customer}, customer_pin for KRA: ${effectiveCustomerPin}`);
            const kraResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$sales$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callKraSaveSales"])({
                branch_id,
                invoice_number: invoiceNumber,
                receipt_number: receiptNumber,
                fuel_type,
                quantity: correctQuantity,
                unit_price: correctUnitPrice,
                total_amount,
                payment_method: payment_method || 'cash',
                customer_name: effectiveCustomerName,
                customer_pin: effectiveCustomerPin,
                sale_date: new Date().toISOString(),
                tank_id: tankCheck.rows.length > 0 ? tankCheck.rows[0].id : undefined
            });
            console.log("[Mobile Create Sale] KRA API Response:", JSON.stringify(kraResult, null, 2));
            const kraData = kraResult.kraResponse?.data || {};
            const kraStatus = kraResult.success ? 'success' : 'failed';
            // CU invoice number is formatted as sdcId/rcptNo (e.g., KRACU0300003796/378)
            const cuInvNo = kraData.sdcId && kraData.rcptNo ? `${kraData.sdcId}/${kraData.rcptNo}` : null;
            await client.query(`UPDATE sales SET 
          kra_status = $1,
          kra_rcpt_sign = $2,
          kra_scu_id = $3,
          kra_cu_inv = $4,
          kra_internal_data = $5,
          customer_pin = COALESCE(customer_pin, $7::text),
          loyalty_customer_pin = CASE WHEN is_loyalty_sale THEN COALESCE(loyalty_customer_pin, $7::text) ELSE loyalty_customer_pin END,
          updated_at = NOW()
        WHERE id = $6`, [
                kraStatus,
                kraData.rcptSign || null,
                kraData.sdcId || null,
                cuInvNo,
                kraData.intrlData || null,
                sale.id,
                effectiveCustomerPin || null
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                sale_id: sale.id,
                sale: {
                    ...sale,
                    kra_status: kraStatus
                },
                invoice_number: invoiceNumber,
                receipt_number: receiptNumber,
                kra_response: kraResult.kraResponse,
                kra_success: kraResult.success,
                print_data: {
                    invoice_number: cuInvNo || invoiceNumber,
                    receipt_no: kraData.rcptNo?.toString() || null,
                    cu_serial_number: kraData.sdcId || null,
                    cu_invoice_no: cuInvNo,
                    intrl_data: kraData.intrlData || null,
                    branch_name: branchData.name || null,
                    branch_address: branchData.address || null,
                    branch_phone: branchData.phone || null,
                    branch_pin: branchData.kra_pin || null,
                    item_code: itemCode,
                    receipt_signature: kraData.rcptSign || null,
                    bhf_id: branchData.bhf_id || '03',
                    customer_name: effectiveCustomerName,
                    customer_pin: effectiveCustomerPin || null,
                    is_loyalty_customer: is_loyalty_customer || false
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("[Mobile Create Sale API Error]:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || "Failed to create sale"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cb6fac75._.js.map