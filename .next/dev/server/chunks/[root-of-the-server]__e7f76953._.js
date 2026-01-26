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
async function getItemInfoById(branchId, itemId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT i.item_code, i.class_code, i.item_name, i.package_unit, 
           i.quantity_unit, i.tax_type, 
           bi.sale_price, 
           bi.purchase_price
    FROM items i
    INNER JOIN branch_items bi ON i.id = bi.item_id AND bi.branch_id = $1
    WHERE i.id = $2
    AND bi.sale_price IS NOT NULL AND bi.sale_price > 0
    LIMIT 1
  `, [
        branchId,
        itemId
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
        // Prefer item_id lookup over fuel_type name matching for accuracy
        let itemInfo = null;
        if (saleData.item_id) {
            itemInfo = await getItemInfoById(saleData.branch_id, saleData.item_id);
        }
        if (!itemInfo) {
            itemInfo = await getItemInfoByFuelType(saleData.branch_id, saleData.fuel_type);
        }
        // Use provided invcNo if passed (e.g., from bulk sales), otherwise get next from sequence
        const invcNo = saleData.invcNo || await getNextInvoiceNo(saleData.branch_id);
        if (!itemInfo) {
            const errorMsg = `No item found for ${saleData.item_id ? 'item_id: ' + saleData.item_id : 'fuel type: ' + saleData.fuel_type}`;
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
            kraResponse,
            invcNo
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
"[project]/app/api/shifts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
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
function splitIntoAmountDenominations(totalAmount) {
    const denominations = [];
    let remaining = totalAmount;
    const validDenoms = [
        2500,
        2000,
        1500,
        1000,
        500,
        300,
        200,
        100
    ];
    while(remaining >= 100){
        const maxDenom = validDenoms.find((d)=>d <= remaining) || 100;
        const availableDenoms = validDenoms.filter((d)=>d >= 100 && d <= maxDenom && d <= remaining);
        if (availableDenoms.length === 0) break;
        const randomDenom = availableDenoms[Math.floor(Math.random() * availableDenoms.length)];
        denominations.push(randomDenom);
        remaining -= randomDenom;
    }
    if (remaining > 0 && remaining < 100 && denominations.length > 0) {
        denominations[denominations.length - 1] += remaining;
    }
    return denominations;
}
async function generateBulkSalesFromMeterDiff(client, shiftId, branchId, staffId, branchName, nozzleReadings) {
    let invoicesCreated = 0;
    let totalVolume = 0;
    let totalAmount = 0;
    const salesForKra = [];
    // Get current branch invoice number counter
    const branchConfigResult = await client.query(`SELECT invoice_number FROM branches WHERE id = $1`, [
        branchId
    ]);
    let currentInvoiceNumber = branchConfigResult.rows[0]?.invoice_number || 0;
    for (const reading of nozzleReadings){
        const openingReading = parseFloat(String(reading.opening_reading)) || 0;
        const closingReading = parseFloat(String(reading.closing_reading)) || 0;
        const meterDifference = closingReading - openingReading;
        if (meterDifference <= 0) continue;
        const nozzleInfo = await client.query(`SELECT i.item_name as fuel_type, n.item_id, COALESCE(bi.sale_price, 0) as sale_price
       FROM nozzles n
       JOIN items i ON n.item_id = i.id
       LEFT JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = $1
       WHERE n.id = $2`, [
            branchId,
            reading.nozzle_id
        ]);
        if (nozzleInfo.rows.length === 0) continue;
        const { fuel_type, sale_price, item_id: nozzleItemId } = nozzleInfo.rows[0];
        const unitPrice = parseFloat(sale_price) || 0;
        if (unitPrice <= 0) {
            console.log(`[BULK SALES] Skipping nozzle ${reading.nozzle_id} - no price configured`);
            continue;
        }
        // Get invoiced quantity: sum of sales already created on APK for this nozzle during this shift
        const invoicedResult = await client.query(`SELECT COALESCE(SUM(quantity), 0) as invoiced_quantity
       FROM sales
       WHERE shift_id = $1 AND nozzle_id = $2 AND is_automated = false`, [
            shiftId,
            reading.nozzle_id
        ]);
        const invoicedQuantity = parseFloat(invoicedResult.rows[0]?.invoiced_quantity) || 0;
        // Bulk volume = meter difference - invoiced quantity (what was already sold via APK)
        const bulkVolume = meterDifference - invoicedQuantity;
        if (bulkVolume <= 0) {
            console.log(`[BULK SALES] Nozzle ${reading.nozzle_id}: meter diff ${meterDifference}L, invoiced ${invoicedQuantity}L, no bulk needed`);
            continue;
        }
        console.log(`[BULK SALES] Nozzle ${reading.nozzle_id}: meter diff ${meterDifference}L - invoiced ${invoicedQuantity}L = bulk ${bulkVolume}L`);
        // Bulk sale = bulk volume × price per litre
        const nozzleTotalAmount = bulkVolume * unitPrice;
        const amountDenominations = splitIntoAmountDenominations(Math.floor(nozzleTotalAmount));
        for (const invoiceAmount of amountDenominations){
            const quantity = invoiceAmount / unitPrice;
            // Use branch invoice number counter (same as regular sales)
            currentInvoiceNumber++;
            const invoiceNumber = `CIV-${String(currentInvoiceNumber).padStart(6, '0')}`;
            const receiptNumber = invoiceNumber;
            const saleResult = await client.query(`INSERT INTO sales (
          branch_id, shift_id, staff_id, nozzle_id, item_id,
          invoice_number, receipt_number, sale_date,
          fuel_type, quantity, unit_price, total_amount,
          payment_method, is_automated, source_system,
          transmission_status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(),
          $8, $9, $10, $11,
          'cash', true, 'meter_diff_bulk',
          'pending', NOW()
        ) RETURNING id`, [
                branchId,
                shiftId,
                staffId,
                reading.nozzle_id,
                nozzleItemId,
                invoiceNumber,
                receiptNumber,
                fuel_type,
                parseFloat(quantity.toFixed(2)),
                unitPrice,
                invoiceAmount
            ]);
            salesForKra.push({
                id: saleResult.rows[0]?.id,
                branch_id: branchId,
                invoice_number: invoiceNumber,
                receipt_number: receiptNumber,
                fuel_type,
                quantity: parseFloat(quantity.toFixed(2)),
                unit_price: unitPrice,
                total_amount: invoiceAmount,
                item_id: nozzleItemId,
                invcNo: currentInvoiceNumber
            });
            invoicesCreated++;
            totalVolume += quantity;
            totalAmount += invoiceAmount;
        }
    }
    // Update branch invoice counter
    if (invoicesCreated > 0) {
        await client.query(`UPDATE branches SET invoice_number = $1 WHERE id = $2`, [
            currentInvoiceNumber,
            branchId
        ]);
    }
    console.log(`[BULK SALES] Generated ${invoicesCreated} invoices, ${totalVolume.toFixed(2)}L, KES ${totalAmount}`);
    return {
        invoicesCreated,
        totalVolume,
        totalAmount,
        salesForKra
    };
}
async function POST(request) {
    try {
        const body = await request.json();
        const { branch_id, start_time, opening_cash, notes, staff_id, user_id } = body;
        if (!branch_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Branch ID is required"
            }, {
                status: 400
            });
        }
        const existingShift = await pool.query(`SELECT id FROM shifts WHERE branch_id = $1 AND status = 'active'`, [
            branch_id
        ]);
        if (existingShift.rows.length > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "An active shift already exists for this branch"
            }, {
                status: 400
            });
        }
        let resolvedStaffId = staff_id;
        if (!resolvedStaffId && user_id) {
            const staffResult = await pool.query(`SELECT id FROM staff WHERE user_id = $1`, [
                user_id
            ]);
            if (staffResult.rows.length > 0) {
                resolvedStaffId = staffResult.rows[0].id;
            }
        }
        const result = await pool.query(`INSERT INTO shifts (branch_id, staff_id, start_time, status, opening_cash, notes, created_at)
       VALUES ($1, $2, $3, 'active', $4, $5, NOW())
       RETURNING *`, [
            branch_id,
            resolvedStaffId || null,
            start_time || new Date().toISOString(),
            opening_cash || 0,
            notes || null
        ]);
        const shiftId = result.rows[0].id;
        // Record tank opening readings at shift start
        // STRICTLY use the PREVIOUS shift's closing reading as this shift's opening
        // This ensures continuity: Shift A closing = Shift B opening
        const tanksResult = await pool.query(`SELECT id FROM tanks WHERE branch_id = $1`, [
            branch_id
        ]);
        // Get the most recent closing reading for each tank from previous shifts
        const prevTankReadingsResult = await pool.query(`SELECT DISTINCT ON (tank_id) tank_id, closing_reading
       FROM shift_readings
       WHERE branch_id = $1 AND reading_type = 'tank' AND tank_id IS NOT NULL AND closing_reading IS NOT NULL
       ORDER BY tank_id, created_at DESC`, [
            branch_id
        ]);
        const prevTankClosings = {};
        for (const r of prevTankReadingsResult.rows){
            prevTankClosings[r.tank_id] = parseFloat(r.closing_reading) || 0;
        }
        for (const tank of tanksResult.rows){
            // STRICTLY use previous shift's closing reading - no fallback
            // If no previous reading exists (brand new tank), opening defaults to 0
            const openingReading = prevTankClosings[tank.id] ?? 0;
            await pool.query(`INSERT INTO shift_readings (shift_id, branch_id, reading_type, tank_id, opening_reading)
         VALUES ($1, $2, 'tank', $3, $4)`, [
                shiftId,
                branch_id,
                tank.id,
                openingReading
            ]);
        }
        // Record nozzle opening readings at shift start (capture initial_meter_reading)
        const nozzlesResult = await pool.query(`SELECT id, initial_meter_reading FROM nozzles WHERE branch_id = $1 AND tank_id IS NOT NULL`, [
            branch_id
        ]);
        for (const nozzle of nozzlesResult.rows){
            await pool.query(`INSERT INTO shift_readings (shift_id, branch_id, reading_type, nozzle_id, opening_reading)
         VALUES ($1, $2, 'nozzle', $3, $4)`, [
                shiftId,
                branch_id,
                nozzle.id,
                parseFloat(nozzle.initial_meter_reading) || 0
            ]);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error starting shift:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to start shift",
            details: error.message
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get('branch_id');
        const status = searchParams.get('status');
        let query = 'SELECT * FROM shifts WHERE 1=1';
        const params = [];
        if (branchId) {
            params.push(branchId);
            query += ` AND branch_id = $${params.length}`;
        }
        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        query += ' ORDER BY created_at DESC LIMIT 1';
        const result = await pool.query(query, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows[0] || null
        });
    } catch (error) {
        console.error("Error fetching shift:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch shift",
            details: error.message
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { id, end_time, total_sales, notes, status, nozzle_readings, tank_stocks, attendant_collections, expenses, banking } = body;
        if (!id) {
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift ID is required"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        // Check if this is an active shift being ended
        const shiftStatusCheck = await client.query(`SELECT status FROM shifts WHERE id = $1`, [
            id
        ]);
        if (shiftStatusCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift not found"
            }, {
                status: 404
            });
        }
        const currentStatus = shiftStatusCheck.rows[0].status;
        const targetStatus = status || 'completed';
        // Require nozzle readings when ending an active shift (transitioning to completed)
        if (currentStatus === 'active' && targetStatus === 'completed') {
            if (!nozzle_readings || !Array.isArray(nozzle_readings) || nozzle_readings.length === 0) {
                await client.query('ROLLBACK');
                client.release();
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Nozzle meter readings are required to end a shift. Please enter closing readings for all nozzles."
                }, {
                    status: 400
                });
            }
            // Get the branch_id from shift to find active nozzles
            const shiftBranchResult = await client.query(`SELECT branch_id FROM shifts WHERE id = $1`, [
                id
            ]);
            const shiftBranchId = shiftBranchResult.rows[0]?.branch_id;
            if (shiftBranchId) {
                // Get all active nozzles with assigned tanks for this branch
                const activeNozzlesResult = await client.query(`SELECT n.id, n.nozzle_number, i.item_name as fuel_type
           FROM nozzles n
           LEFT JOIN items i ON n.item_id = i.id
           WHERE n.branch_id = $1 AND n.status = 'active' AND n.tank_id IS NOT NULL`, [
                    shiftBranchId
                ]);
                const activeNozzleIds = new Set(activeNozzlesResult.rows.map((n)=>n.id));
                const isValidNumeric = (val)=>val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
                const submittedNozzleIds = new Set(nozzle_readings.filter((r)=>r.nozzle_id && isValidNumeric(r.closing_reading)).map((r)=>r.nozzle_id));
                // Find nozzles that are active but missing readings
                const missingNozzles = activeNozzlesResult.rows.filter((n)=>!submittedNozzleIds.has(n.id));
                if (missingNozzles.length > 0) {
                    const missingList = missingNozzles.map((n)=>`Nozzle ${n.nozzle_number} (${n.fuel_type || 'Unknown'})`).join(', ');
                    await client.query('ROLLBACK');
                    client.release();
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: `Cannot close shift: missing readings for ${missingNozzles.length} active nozzle(s): ${missingList}. Please enter closing readings for all nozzles.`,
                        missingNozzles: missingNozzles.map((n)=>({
                                id: n.id,
                                number: n.nozzle_number,
                                fuel_type: n.fuel_type
                            }))
                    }, {
                        status: 400
                    });
                }
                const nozzlesWithoutAttendants = nozzle_readings.filter((r)=>r.nozzle_id && isValidNumeric(r.closing_reading) && !r.incoming_attendant_id);
                if (nozzlesWithoutAttendants.length > 0) {
                    const missingAttendantNozzles = activeNozzlesResult.rows.filter((n)=>nozzlesWithoutAttendants.some((r)=>r.nozzle_id === n.id));
                    const missingList = missingAttendantNozzles.map((n)=>`Nozzle ${n.nozzle_number} (${n.fuel_type || 'Unknown'})`).join(', ');
                    await client.query('ROLLBACK');
                    client.release();
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: `Cannot close shift: missing incoming attendant for nozzle(s): ${missingList}. Please select an incoming attendant for each nozzle.`
                    }, {
                        status: 400
                    });
                }
            }
        }
        const shiftCheck = await client.query(`SELECT s.*, b.name as branch_name FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1`, [
            id
        ]);
        if (shiftCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift not found"
            }, {
                status: 404
            });
        }
        const currentShift = shiftCheck.rows[0];
        const branchId = currentShift.branch_id;
        const branchName = currentShift.branch_name || 'BRN';
        const staffId = currentShift.staff_id;
        const endTimeValue = end_time || new Date().toISOString();
        // Only include nozzles that have a tank assigned
        const nozzlesResult = await client.query(`SELECT id, initial_meter_reading FROM nozzles WHERE branch_id = $1 AND tank_id IS NOT NULL`, [
            branchId
        ]);
        const nozzleBaseReadings = {};
        for (const n of nozzlesResult.rows){
            nozzleBaseReadings[n.id] = parseFloat(n.initial_meter_reading) || 0;
        }
        const prevNozzleReadings = await client.query(`SELECT nozzle_id, closing_reading FROM shift_readings 
       WHERE branch_id = $1 AND reading_type = 'nozzle' AND nozzle_id IS NOT NULL
       ORDER BY created_at DESC`, [
            branchId
        ]);
        for (const r of prevNozzleReadings.rows){
            // Only update baselines for nozzles that have a tank assigned (already in nozzleBaseReadings)
            if (nozzleBaseReadings.hasOwnProperty(r.nozzle_id)) {
                if (parseFloat(r.closing_reading) > nozzleBaseReadings[r.nozzle_id]) {
                    nozzleBaseReadings[r.nozzle_id] = parseFloat(r.closing_reading);
                }
            }
        }
        // Get tank opening readings from shift_readings (recorded at shift start)
        // Fall back to tanks.current_stock for legacy shifts that started before this fix
        const tankOpeningsResult = await client.query(`SELECT sr.tank_id, sr.opening_reading
       FROM shift_readings sr
       WHERE sr.shift_id = $1 AND sr.reading_type = 'tank' AND sr.tank_id IS NOT NULL`, [
            id
        ]);
        const tankBaseStocks = {};
        for (const r of tankOpeningsResult.rows){
            tankBaseStocks[r.tank_id] = parseFloat(r.opening_reading) || 0;
        }
        // For legacy shifts without opening readings, fall back to current_stock
        const tanksResult = await client.query(`SELECT id, current_stock FROM tanks WHERE branch_id = $1`, [
            branchId
        ]);
        for (const t of tanksResult.rows){
            if (!tankBaseStocks.hasOwnProperty(t.id)) {
                tankBaseStocks[t.id] = parseFloat(t.current_stock) || 0;
            }
        }
        if (nozzle_readings && nozzle_readings.length > 0) {
            for (const reading of nozzle_readings){
                if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
                    const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0;
                    if (reading.closing_reading < openingReading) {
                        await client.query('ROLLBACK');
                        client.release();
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            error: `Nozzle closing reading (${reading.closing_reading}) cannot be less than opening reading (${openingReading})`
                        }, {
                            status: 400
                        });
                    }
                }
            }
        }
        const result = await client.query(`UPDATE shifts 
       SET end_time = $1, total_sales = $2, notes = $3, status = $4, reconciliation_status = 'pending', updated_at = NOW()
       WHERE id = $5
       RETURNING *`, [
            endTimeValue,
            total_sales || 0,
            notes || null,
            status || 'completed',
            id
        ]);
        const shift = result.rows[0];
        // Update nozzle readings - use UPSERT to preserve opening readings recorded at shift start
        const savedNozzleReadings = [];
        if (nozzle_readings && nozzle_readings.length > 0) {
            for (const reading of nozzle_readings){
                if (reading.nozzle_id && !isNaN(reading.closing_reading)) {
                    const openingReading = nozzleBaseReadings[reading.nozzle_id] || 0;
                    const outgoingAttendantId = reading.outgoing_attendant_id || null;
                    const incomingAttendantId = reading.incoming_attendant_id || null;
                    const rtt = parseFloat(reading.rtt) || 0;
                    const selfFueling = parseFloat(reading.self_fueling) || 0;
                    const prepaidSale = parseFloat(reading.prepaid_sale) || 0;
                    // Try to update existing record first, then insert if none exists
                    const updateResult = await client.query(`UPDATE shift_readings 
             SET closing_reading = $1, outgoing_attendant_id = $2, incoming_attendant_id = $3, 
                 rtt = $4, self_fueling = $5, prepaid_sale = $6
             WHERE shift_id = $7 AND nozzle_id = $8 AND reading_type = 'nozzle'
             RETURNING id`, [
                        reading.closing_reading,
                        outgoingAttendantId,
                        incomingAttendantId,
                        rtt,
                        selfFueling,
                        prepaidSale,
                        id,
                        reading.nozzle_id
                    ]);
                    if (updateResult.rows.length === 0) {
                        await client.query(`INSERT INTO shift_readings (shift_id, branch_id, reading_type, nozzle_id, opening_reading, closing_reading, outgoing_attendant_id, incoming_attendant_id, rtt, self_fueling, prepaid_sale)
               VALUES ($1, $2, 'nozzle', $3, $4, $5, $6, $7, $8, $9, $10)`, [
                            id,
                            branchId,
                            reading.nozzle_id,
                            openingReading,
                            reading.closing_reading,
                            outgoingAttendantId,
                            incomingAttendantId,
                            rtt,
                            selfFueling,
                            prepaidSale
                        ]);
                    }
                    savedNozzleReadings.push({
                        nozzle_id: reading.nozzle_id,
                        opening_reading: openingReading,
                        closing_reading: reading.closing_reading
                    });
                }
            }
        }
        let bulkSalesResult = {
            invoicesCreated: 0,
            totalVolume: 0,
            totalAmount: 0,
            salesForKra: []
        };
        if (savedNozzleReadings.length > 0) {
            bulkSalesResult = await generateBulkSalesFromMeterDiff(client, id, branchId, staffId, branchName, savedNozzleReadings);
            if (bulkSalesResult.totalAmount > 0) {
                await client.query(`UPDATE shifts SET total_sales = $1 WHERE id = $2`, [
                    bulkSalesResult.totalAmount,
                    id
                ]);
            }
        }
        if (tank_stocks && tank_stocks.length > 0) {
            for (const stock of tank_stocks){
                const closingStock = stock.closing_stock ?? stock.closing_reading;
                if (stock.tank_id && !isNaN(closingStock)) {
                    const openingStock = tankBaseStocks[stock.tank_id] || 0;
                    const stockReceived = stock.stock_received || 0;
                    // Try to update existing record first, then insert if none exists
                    const updateResult = await client.query(`UPDATE shift_readings 
             SET closing_reading = $1, stock_received = $2
             WHERE shift_id = $3 AND tank_id = $4 AND reading_type = 'tank'
             RETURNING id`, [
                        closingStock,
                        stockReceived,
                        id,
                        stock.tank_id
                    ]);
                    if (updateResult.rows.length === 0) {
                        await client.query(`INSERT INTO shift_readings (shift_id, branch_id, reading_type, tank_id, opening_reading, closing_reading, stock_received)
               VALUES ($1, $2, 'tank', $3, $4, $5, $6)`, [
                            id,
                            branchId,
                            stock.tank_id,
                            openingStock,
                            closingStock,
                            stockReceived
                        ]);
                    }
                    await client.query(`UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`, [
                        closingStock,
                        stock.tank_id
                    ]);
                }
            }
        }
        await client.query(`DELETE FROM attendant_collections WHERE shift_id = $1`, [
            id
        ]);
        if (attendant_collections && attendant_collections.length > 0) {
            for (const collection of attendant_collections){
                if (collection.staff_id && collection.payment_method && collection.amount > 0) {
                    await client.query(`INSERT INTO attendant_collections (shift_id, branch_id, staff_id, payment_method, amount, is_app_payment)
             VALUES ($1, $2, $3, $4, $5, false)`, [
                        id,
                        branchId,
                        collection.staff_id,
                        collection.payment_method,
                        collection.amount
                    ]);
                }
                // Handle nested payments format from frontend
                if (collection.attendant_id && collection.payments && Array.isArray(collection.payments)) {
                    for (const payment of collection.payments){
                        if (payment.payment_method && payment.amount > 0) {
                            await client.query(`INSERT INTO attendant_collections (shift_id, branch_id, staff_id, payment_method, amount, is_app_payment)
                 VALUES ($1, $2, $3, $4, $5, false)`, [
                                id,
                                branchId,
                                collection.attendant_id,
                                payment.payment_method,
                                payment.amount
                            ]);
                        }
                    }
                }
            }
        }
        // Save shift expenses with vendor validation
        if (expenses && expenses.length > 0) {
            // Get vendor_id for the branch to validate expense accounts
            const branchVendorResult = await client.query('SELECT vendor_id FROM branches WHERE id = $1', [
                branchId
            ]);
            const vendorId = branchVendorResult.rows[0]?.vendor_id;
            for (const expense of expenses){
                if (expense.expense_account_id && expense.amount > 0) {
                    // Validate expense account belongs to the same vendor
                    const accountCheck = await client.query('SELECT id FROM expense_accounts WHERE id = $1 AND vendor_id = $2', [
                        expense.expense_account_id,
                        vendorId
                    ]);
                    if (accountCheck.rows.length === 0) {
                        console.warn(`[Shift Expenses] Skipping invalid expense account ${expense.expense_account_id} - not found for vendor`);
                        continue;
                    }
                    await client.query(`INSERT INTO shift_expenses (shift_id, branch_id, expense_account_id, amount, description)
             VALUES ($1, $2, $3, $4, $5)`, [
                        id,
                        branchId,
                        expense.expense_account_id,
                        expense.amount,
                        expense.description || null
                    ]);
                }
            }
        }
        // Save shift banking entries with vendor validation
        if (banking && banking.length > 0) {
            // Get vendor_id for the branch to validate banking accounts
            const branchVendorResultForBanking = await client.query('SELECT vendor_id FROM branches WHERE id = $1', [
                branchId
            ]);
            const vendorIdForBanking = branchVendorResultForBanking.rows[0]?.vendor_id;
            for (const entry of banking){
                if (entry.banking_account_id && entry.amount > 0) {
                    // Validate banking account belongs to the same vendor
                    const accountCheck = await client.query('SELECT id FROM banking_accounts WHERE id = $1 AND vendor_id = $2', [
                        entry.banking_account_id,
                        vendorIdForBanking
                    ]);
                    if (accountCheck.rows.length === 0) {
                        console.warn(`[Shift Banking] Skipping invalid banking account ${entry.banking_account_id} - not found for vendor`);
                        continue;
                    }
                    await client.query(`INSERT INTO shift_banking (shift_id, banking_account_id, amount, notes)
             VALUES ($1, $2, $3, $4)`, [
                        id,
                        entry.banking_account_id,
                        entry.amount,
                        entry.notes || null
                    ]);
                }
            }
        }
        const newShiftResult = await client.query(`INSERT INTO shifts (branch_id, start_time, status, opening_cash, notes, created_at)
       VALUES ($1, $2, 'active', 0, NULL, NOW())
       RETURNING *`, [
            branchId,
            endTimeValue
        ]);
        const newShift = newShiftResult.rows[0];
        await client.query('COMMIT');
        // Submit bulk sales to KRA with parallel processing for speed
        let kraSuccessCount = 0;
        let kraFailCount = 0;
        if (bulkSalesResult.salesForKra.length > 0) {
            console.log(`[BULK SALES] Submitting ${bulkSalesResult.salesForKra.length} invoices to KRA in parallel...`);
            const BATCH_SIZE = 5 // Process 5 invoices at a time to avoid overwhelming the KRA server
            ;
            const salesBatches = [];
            for(let i = 0; i < bulkSalesResult.salesForKra.length; i += BATCH_SIZE){
                salesBatches.push(bulkSalesResult.salesForKra.slice(i, i + BATCH_SIZE));
            }
            for (const batch of salesBatches){
                const batchResults = await Promise.allSettled(batch.map(async (sale)=>{
                    const kraResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$sales$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callKraSaveSales"])({
                        branch_id: sale.branch_id,
                        invoice_number: sale.invoice_number,
                        receipt_number: sale.receipt_number,
                        fuel_type: sale.fuel_type,
                        quantity: sale.quantity,
                        unit_price: sale.unit_price,
                        total_amount: sale.total_amount,
                        payment_method: 'cash',
                        sale_date: new Date().toISOString(),
                        item_id: sale.item_id,
                        invcNo: sale.invcNo
                    });
                    return {
                        sale,
                        kraResult
                    };
                }));
                // Process batch results and update database
                for (const result of batchResults){
                    if (result.status === 'fulfilled') {
                        const { sale, kraResult } = result.value;
                        if (kraResult.success && kraResult.kraResponse) {
                            const sdcId = kraResult.kraResponse.data?.sdcId || '';
                            const rcptSign = kraResult.kraResponse.data?.rcptSign || '';
                            const cuInvNo = sdcId && sale.invcNo ? `${sdcId}/${sale.invcNo}` : null;
                            await pool.query(`UPDATE sales SET 
                  kra_status = 'transmitted',
                  transmission_status = 'sent',
                  kra_scu_id = $2,
                  kra_cu_inv = $3,
                  kra_rcpt_sign = $4,
                  updated_at = NOW()
                WHERE id = $1`, [
                                sale.id,
                                sdcId,
                                cuInvNo,
                                rcptSign
                            ]);
                            kraSuccessCount++;
                        } else {
                            const errorMsg = kraResult.error || kraResult.kraResponse?.resultMsg || 'Unknown error';
                            await pool.query(`UPDATE sales SET 
                  kra_status = 'failed',
                  transmission_status = 'failed',
                  kra_error = $2,
                  updated_at = NOW()
                WHERE id = $1`, [
                                sale.id,
                                errorMsg
                            ]);
                            kraFailCount++;
                            console.error(`[BULK SALES] KRA failed for sale ${sale.id}: ${errorMsg}`);
                        }
                    } else {
                        // Promise was rejected
                        const sale = batch[batchResults.indexOf(result)];
                        await pool.query(`UPDATE sales SET 
                kra_status = 'failed',
                transmission_status = 'failed',
                kra_error = $2,
                updated_at = NOW()
              WHERE id = $1`, [
                            sale.id,
                            result.reason?.message || 'Unknown error'
                        ]);
                        kraFailCount++;
                        console.error(`[BULK SALES] KRA error for sale ${sale.id}:`, result.reason?.message);
                    }
                }
            }
            console.log(`[BULK SALES] KRA transmission complete: ${kraSuccessCount} success, ${kraFailCount} failed`);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: shift,
            newShift: newShift,
            bulkSales: {
                invoicesCreated: bulkSalesResult.invoicesCreated,
                totalVolume: bulkSalesResult.totalVolume,
                totalAmount: bulkSalesResult.totalAmount
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating shift:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update shift",
            details: error.message
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

//# sourceMappingURL=%5Broot-of-the-server%5D__e7f76953._.js.map