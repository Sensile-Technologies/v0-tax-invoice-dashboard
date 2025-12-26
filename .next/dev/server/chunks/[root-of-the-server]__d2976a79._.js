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
"[project]/lib/kra-stock-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SAR_TYPE_CODES",
    ()=>SAR_TYPE_CODES,
    "calculateTaxAmount",
    ()=>calculateTaxAmount,
    "createStockMovementRecord",
    ()=>createStockMovementRecord,
    "formatKraDate",
    ()=>formatKraDate,
    "getBranchKraInfo",
    ()=>getBranchKraInfo,
    "getNextSarNo",
    ()=>getNextSarNo,
    "getTankWithItemInfo",
    ()=>getTankWithItemInfo,
    "logKraApiCall",
    ()=>logKraApiCall,
    "syncStockWithKRA",
    ()=>syncStockWithKRA
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-url-helper.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const DEFAULT_KRA_URL = process.env.KRA_VSCU_URL || "http://5.189.171.160:8088";
const STOCK_ENDPOINT = "/stock/saveStockItems";
async function getBranchKraFullConfig(branchId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT b.kra_pin as tin, b.bhf_id,
           COALESCE(b.server_address, '5.189.171.160') as server_address,
           COALESCE(b.server_port, '8088') as server_port
    FROM branches b
    WHERE b.id = $1
  `, [
        branchId
    ]);
    if (result.length === 0) return null;
    const branch = result[0];
    if (!branch.tin) {
        const vendorResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT v.kra_pin as tin 
      FROM branches b 
      JOIN vendors v ON v.id = b.vendor_id 
      WHERE b.id = $1
    `, [
            branchId
        ]);
        if (vendorResult.length > 0 && vendorResult[0].tin) {
            return {
                tin: vendorResult[0].tin,
                bhfId: branch.bhf_id || "00",
                serverAddress: branch.server_address,
                serverPort: branch.server_port
            };
        }
        return null;
    }
    return {
        tin: branch.tin,
        bhfId: branch.bhf_id || "00",
        serverAddress: branch.server_address,
        serverPort: branch.server_port
    };
}
const SAR_TYPE_CODES = {
    initial_stock: "01",
    stock_receive: "02",
    stock_adjustment: "06",
    stock_transfer: "05",
    sale: "11" // Sale
};
async function getNextSarNo(branchId, endpoint = STOCK_ENDPOINT) {
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
async function getBranchKraInfo(branchId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT b.kra_pin as tin, b.bhf_id 
    FROM branches b 
    WHERE b.id = $1
  `, [
        branchId
    ]);
    if (result.length === 0) return null;
    const branch = result[0];
    if (!branch.tin) {
        const vendorResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT v.kra_pin as tin 
      FROM branches b 
      JOIN vendors v ON v.id = b.vendor_id 
      WHERE b.id = $1
    `, [
            branchId
        ]);
        if (vendorResult.length > 0 && vendorResult[0].tin) {
            return {
                tin: vendorResult[0].tin,
                bhfId: branch.bhf_id || "00"
            };
        }
        return null;
    }
    return {
        tin: branch.tin,
        bhfId: branch.bhf_id || "00"
    };
}
async function getTankWithItemInfo(tankId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT t.*, i.item_code, i.class_code, i.item_name, i.package_unit, 
           i.quantity_unit, i.tax_type, i.sale_price, i.purchase_price,
           fp.price as current_price
    FROM tanks t
    LEFT JOIN items i ON i.item_name ILIKE '%' || t.fuel_type || '%' AND i.branch_id = t.branch_id
    LEFT JOIN fuel_prices fp ON fp.branch_id = t.branch_id AND fp.fuel_type = t.fuel_type
    WHERE t.id = $1
  `, [
        tankId
    ]);
    return result.length > 0 ? result[0] : null;
}
function formatKraDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
function calculateTaxAmount(taxableAmount, taxType = "B") {
    if (taxType === "B") {
        return Math.round(taxableAmount * 0.16 * 100) / 100;
    }
    return 0;
}
async function createStockMovementRecord(branchId, kraPayload, kraResponse, httpStatus, durationMs) {
    const isSuccess = kraResponse?.resultCd === "000" || kraResponse?.resultCd === "0";
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    INSERT INTO stock_movements (
      branch_id, tin, bhf_id, sar_no, org_sar_no, reg_ty_cd, 
      cust_tin, cust_bhf_id, cust_nm, sar_ty_cd, ocrn_dt,
      tot_item_cnt, tot_taxbl_amt, tot_tax_amt, tot_amt, remark,
      regr_id, regr_nm, modr_id, modr_nm,
      kra_status, kra_response, kra_synced_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23
    ) RETURNING id
  `, [
        branchId,
        kraPayload.tin,
        kraPayload.bhfId,
        kraPayload.sarNo,
        kraPayload.orgSarNo,
        kraPayload.regTyCd,
        kraPayload.custTin,
        kraPayload.custBhfId,
        kraPayload.custNm,
        kraPayload.sarTyCd,
        kraPayload.ocrnDt,
        kraPayload.totItemCnt,
        kraPayload.totTaxblAmt,
        kraPayload.totTaxAmt,
        kraPayload.totAmt,
        kraPayload.remark,
        kraPayload.regrId,
        kraPayload.regrNm,
        kraPayload.modrId,
        kraPayload.modrNm,
        isSuccess ? "success" : "failed",
        JSON.stringify(kraResponse),
        isSuccess ? new Date() : null
    ]);
    return result[0].id;
}
async function logKraApiCall(endpoint, payload, response, statusCode, durationMs, branchId, kraBaseUrl) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      INSERT INTO api_logs (endpoint, method, payload, response, status_code, duration_ms, branch_id, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
            endpoint,
            "POST",
            JSON.stringify(payload),
            JSON.stringify(response),
            statusCode,
            durationMs,
            branchId,
            `${kraBaseUrl || DEFAULT_KRA_URL}${endpoint}`
        ]);
    } catch (error) {
        console.error("[KRA Stock Service] Failed to log API call:", error);
    }
}
async function syncStockWithKRA(branchId, movementType, items, options) {
    const startTime = Date.now();
    try {
        const kraConfig = await getBranchKraFullConfig(branchId);
        if (!kraConfig) {
            return {
                success: false,
                kraResponse: null,
                error: "Branch KRA info not configured (missing KRA PIN)"
            };
        }
        const kraInfo = {
            tin: kraConfig.tin,
            bhfId: kraConfig.bhfId
        };
        const kraBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(kraConfig.serverAddress, kraConfig.serverPort);
        const sarNo = await getNextSarNo(branchId);
        const sarTyCd = SAR_TYPE_CODES[movementType] || "06";
        let totTaxblAmt = 0;
        let totTaxAmt = 0;
        let totAmt = 0;
        const itemList = await Promise.all(items.map(async (item, index)=>{
            let tankInfo = await getTankWithItemInfo(item.tankId);
            const itemCd = item.itemCode || tankInfo?.item_code || tankInfo?.kra_item_cd || `KE1NTXU000000${index + 1}`;
            const itemClsCd = item.itemClassCode || tankInfo?.class_code || "5059690800";
            const itemNm = item.itemName || tankInfo?.item_name || tankInfo?.fuel_type || "Fuel Item";
            const isPurchaseMovement = movementType === "stock_receive";
            const price = item.unitPrice || (isPurchaseMovement ? tankInfo?.purchase_price : tankInfo?.current_price) || tankInfo?.sale_price || 0;
            const splyAmt = Math.round(item.quantity * price * 100) / 100;
            const taxAmt = calculateTaxAmount(splyAmt, tankInfo?.tax_type || "B");
            totTaxblAmt += splyAmt;
            totTaxAmt += taxAmt;
            totAmt += splyAmt;
            return {
                itemSeq: index + 1,
                itemCd,
                itemClsCd,
                itemNm,
                bcd: null,
                pkgUnitCd: tankInfo?.package_unit || "NT",
                pkg: Math.ceil(item.quantity),
                qtyUnitCd: tankInfo?.quantity_unit || "U",
                qty: item.quantity,
                itemExprDt: null,
                prc: price,
                splyAmt,
                totDcAmt: 0,
                taxblAmt: splyAmt,
                taxTyCd: tankInfo?.tax_type || "B",
                taxAmt,
                totAmt: splyAmt
            };
        }));
        const payload = {
            tin: kraInfo.tin,
            bhfId: kraInfo.bhfId,
            sarNo,
            orgSarNo: 0,
            regTyCd: "M",
            custTin: options?.customerId || null,
            custNm: options?.customerName || null,
            custBhfId: options?.customerBhfId || null,
            sarTyCd,
            ocrnDt: formatKraDate(),
            totItemCnt: itemList.length,
            totTaxblAmt: Math.round(totTaxblAmt * 100) / 100,
            totTaxAmt: Math.round(totTaxAmt * 100) / 100,
            totAmt: Math.round(totAmt * 100) / 100,
            remark: options?.remark || null,
            regrId: "Admin",
            regrNm: "Admin",
            modrNm: "Admin",
            modrId: "Admin",
            itemList
        };
        console.log(`[KRA Stock Service] Syncing ${movementType} to KRA for branch ${branchId}`);
        console.log(`[KRA Stock Service] Payload:`, JSON.stringify(payload, null, 2));
        let kraResponse;
        let httpStatusCode = 200;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 15000);
            const response = await fetch(`${kraBaseUrl}${STOCK_ENDPOINT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            httpStatusCode = response.status;
            kraResponse = await response.json();
        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                kraResponse = {
                    resultCd: "TIMEOUT",
                    resultMsg: "Request timed out after 15 seconds",
                    resultDt: new Date().toISOString()
                };
            } else {
                kraResponse = {
                    resultCd: "NETWORK_ERROR",
                    resultMsg: `Network error: ${fetchError.message}`,
                    resultDt: new Date().toISOString()
                };
            }
            httpStatusCode = 0;
        }
        const duration = Date.now() - startTime;
        console.log(`[KRA Stock Service] Response (${duration}ms):`, JSON.stringify(kraResponse, null, 2));
        await logKraApiCall(STOCK_ENDPOINT, payload, kraResponse, httpStatusCode, duration, branchId, kraBaseUrl);
        const movementId = await createStockMovementRecord(branchId, payload, kraResponse, httpStatusCode, duration);
        const isSuccess = kraResponse?.resultCd === "000" || kraResponse?.resultCd === "0";
        if (isSuccess) {
            console.log(`[KRA Stock Service] saveStockItems successful, now calling saveStockMaster for each item`);
            for (const item of items){
                const stockMasterStartTime = Date.now();
                let stockMasterResponse = null;
                let stockMasterStatusCode = 0;
                try {
                    const tankInfo = await getTankWithItemInfo(item.tankId);
                    const tankResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT current_stock FROM tanks WHERE id = $1`, [
                        item.tankId
                    ]);
                    const currentStock = tankResult.length > 0 ? parseFloat(tankResult[0].current_stock) || 0 : 0;
                    const itemCd = item.itemCode || tankInfo?.item_code || tankInfo?.kra_item_cd;
                    if (!itemCd) {
                        console.log(`[KRA Stock Service] Skipping saveStockMaster for tank ${item.tankId} - no item code`);
                        continue;
                    }
                    const stockMasterPayload = {
                        tin: kraInfo.tin,
                        bhfId: kraInfo.bhfId,
                        itemCd: itemCd,
                        rsdQty: currentStock,
                        regrId: "Admin",
                        regrNm: "Admin",
                        modrNm: "Admin",
                        modrId: "Admin"
                    };
                    console.log(`[KRA Stock Service] Calling saveStockMaster:`, JSON.stringify(stockMasterPayload, null, 2));
                    try {
                        const stockMasterController = new AbortController();
                        const stockMasterTimeoutId = setTimeout(()=>stockMasterController.abort(), 15000);
                        const response = await fetch(`${kraBaseUrl}/stockMaster/saveStockMaster`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(stockMasterPayload),
                            signal: stockMasterController.signal
                        });
                        clearTimeout(stockMasterTimeoutId);
                        stockMasterStatusCode = response.status;
                        stockMasterResponse = await response.json();
                    } catch (fetchError) {
                        if (fetchError.name === 'AbortError') {
                            stockMasterResponse = {
                                resultCd: "TIMEOUT",
                                resultMsg: "Request timed out after 15 seconds",
                                resultDt: new Date().toISOString()
                            };
                        } else {
                            stockMasterResponse = {
                                resultCd: "NETWORK_ERROR",
                                resultMsg: `Network error: ${fetchError.message}`,
                                resultDt: new Date().toISOString()
                            };
                        }
                    }
                    console.log(`[KRA Stock Service] saveStockMaster response for ${itemCd}:`, JSON.stringify(stockMasterResponse, null, 2));
                    await logKraApiCall("/stockMaster/saveStockMaster", stockMasterPayload, stockMasterResponse, stockMasterStatusCode, Date.now() - stockMasterStartTime, branchId, kraBaseUrl);
                } catch (stockMasterError) {
                    console.error(`[KRA Stock Service] Error calling saveStockMaster for tank ${item.tankId}:`, stockMasterError.message);
                }
            }
        }
        return {
            success: isSuccess,
            kraResponse,
            movementId,
            error: isSuccess ? undefined : kraResponse?.resultMsg || "KRA sync failed"
        };
    } catch (error) {
        console.error("[KRA Stock Service] Error:", error);
        return {
            success: false,
            kraResponse: null,
            error: error.message || "Internal error during KRA sync"
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/api/tanks/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-stock-service.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get("branch_id");
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "branch_id is required"
            }, {
                status: 400
            });
        }
        const tanks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT t.*, i.item_name 
       FROM tanks t 
       LEFT JOIN items i ON t.item_id = i.id 
       WHERE t.branch_id = $1 
       ORDER BY t.tank_name`, [
            branchId
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: tanks
        });
    } catch (error) {
        console.error("Error fetching tanks:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch tanks"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { branch_id, tank_name, fuel_type, capacity, current_stock, status, kra_item_cd, sync_to_kra, unit_price, item_id } = body;
        if (!branch_id || !tank_name || !fuel_type) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "branch_id, tank_name, and fuel_type are required"
            }, {
                status: 400
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO tanks (branch_id, tank_name, fuel_type, capacity, current_stock, status, kra_item_cd, item_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [
            branch_id,
            tank_name,
            fuel_type,
            capacity || 0,
            current_stock || 0,
            status || "active",
            kra_item_cd || null,
            item_id || null
        ]);
        const tank = result[0];
        let kraResult = null;
        if (sync_to_kra && current_stock > 0) {
            console.log(`[Tanks API] Syncing initial stock of ${current_stock} for tank ${tank.id} to KRA`);
            kraResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncStockWithKRA"])(branch_id, "initial_stock", [
                {
                    tankId: tank.id,
                    quantity: current_stock,
                    unitPrice: unit_price || 0,
                    itemCode: kra_item_cd,
                    itemName: fuel_type
                }
            ], {
                remark: `Initial stock for tank: ${tank_name}`
            });
            if (kraResult.success) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE tanks SET kra_sync_status = 'synced', last_kra_synced_stock = $1 WHERE id = $2`, [
                    current_stock,
                    tank.id
                ]);
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE tanks SET kra_sync_status = 'failed' WHERE id = $1`, [
                    tank.id
                ]);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: tank,
            kraSync: kraResult ? {
                synced: kraResult.success,
                movementId: kraResult.movementId,
                error: kraResult.error
            } : null
        });
    } catch (error) {
        console.error("Error creating tank:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to create tank"
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, current_stock, status, sync_to_kra, adjustment_type, unit_price, item_id } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Tank id is required"
            }, {
                status: 400
            });
        }
        const existingTank = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT * FROM tanks WHERE id = $1", [
            id
        ]);
        if (existingTank.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Tank not found"
            }, {
                status: 404
            });
        }
        const tank = existingTank[0];
        const previousStock = tank.current_stock || 0;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (current_stock !== undefined) {
            updates.push(`current_stock = $${paramIndex}`);
            values.push(current_stock);
            paramIndex++;
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        if (item_id !== undefined) {
            updates.push(`item_id = $${paramIndex}`);
            values.push(item_id || null);
            paramIndex++;
            // When item_id is assigned, also sync the kra_item_cd from the item
            if (item_id) {
                const itemResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT item_code FROM items WHERE id = $1", [
                    item_id
                ]);
                if (itemResult.length > 0 && itemResult[0].item_code) {
                    updates.push(`kra_item_cd = $${paramIndex}`);
                    values.push(itemResult[0].item_code);
                    paramIndex++;
                }
            } else {
                // If item_id is being cleared, also clear kra_item_cd
                updates.push(`kra_item_cd = $${paramIndex}`);
                values.push(null);
                paramIndex++;
            }
        }
        if (updates.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "No fields to update"
            }, {
                status: 400
            });
        }
        updates.push(`updated_at = NOW()`);
        values.push(id);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE tanks SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`, values);
        const updatedTank = result[0];
        let kraResult = null;
        if (sync_to_kra && current_stock !== undefined && current_stock !== previousStock) {
            const stockDiff = current_stock - previousStock;
            const movementType = adjustment_type || (stockDiff > 0 ? "stock_receive" : "stock_adjustment");
            console.log(`[Tanks API] Syncing stock ${movementType} of ${Math.abs(stockDiff)} for tank ${id} to KRA`);
            kraResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$stock$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncStockWithKRA"])(tank.branch_id, movementType, [
                {
                    tankId: id,
                    quantity: Math.abs(stockDiff),
                    unitPrice: unit_price || 0,
                    itemCode: tank.kra_item_cd,
                    itemName: tank.fuel_type
                }
            ], {
                remark: `Stock ${movementType}: ${previousStock} -> ${current_stock}`
            });
            if (kraResult.success) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE tanks SET kra_sync_status = 'synced', last_kra_synced_stock = $1 WHERE id = $2`, [
                    current_stock,
                    id
                ]);
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE tanks SET kra_sync_status = 'failed' WHERE id = $1`, [
                    id
                ]);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                tank.branch_id,
                id,
                movementType,
                Math.abs(stockDiff),
                previousStock,
                current_stock,
                `API adjustment`,
                'approved'
            ]);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: updatedTank,
            kraSync: kraResult ? {
                synced: kraResult.success,
                movementId: kraResult.movementId,
                error: kraResult.error
            } : null
        });
    } catch (error) {
        console.error("Error updating tank:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to update tank"
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Tank id is required"
            }, {
                status: 400
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("DELETE FROM tanks WHERE id = $1", [
            id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error("Error deleting tank:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to delete tank"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d2976a79._.js.map