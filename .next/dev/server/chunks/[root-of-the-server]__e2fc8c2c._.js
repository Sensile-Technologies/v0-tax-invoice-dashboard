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
"[project]/app/api/stock/adjust/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
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
;
async function callKraWithRetry(url, payload, maxRetries = 3) {
    let lastError = null;
    for(let attempt = 1; attempt <= maxRetries; attempt++){
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 20000);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            return {
                response: data,
                statusCode: response.status
            };
        } catch (error) {
            lastError = error;
            console.log(`[Stock Adjust] KRA attempt ${attempt}/${maxRetries} failed: ${error.message}`);
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise((resolve)=>setTimeout(resolve, delay));
            }
        }
    }
    const errorResponse = {
        resultCd: lastError?.name === 'AbortError' ? "TIMEOUT" : "NETWORK_ERROR",
        resultMsg: lastError?.name === 'AbortError' ? `Request timed out after ${maxRetries} attempts` : `Network error after ${maxRetries} attempts: ${lastError?.message}`,
        resultDt: new Date().toISOString()
    };
    return {
        response: errorResponse,
        statusCode: 0
    };
}
function formatKraDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
async function POST(request) {
    const client = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClient"])();
    try {
        const body = await request.json();
        const { branch_id, tank_id, adjustment_type, quantity, reason, approved_by, sync_to_kra = true } = body;
        if (!branch_id || !tank_id || !adjustment_type || quantity === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "branch_id, tank_id, adjustment_type, and quantity are required"
            }, {
                status: 400
            });
        }
        if (![
            "increase",
            "decrease",
            "set"
        ].includes(adjustment_type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "adjustment_type must be 'increase', 'decrease', or 'set'"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        const branchResult = await client.query(`
      SELECT b.id, b.kra_pin, b.bhf_id, b.sr_number,
             COALESCE(b.server_address, '5.189.171.160') as server_address,
             COALESCE(b.server_port, '8088') as server_port,
             v.kra_pin as vendor_kra_pin
      FROM branches b
      LEFT JOIN vendors v ON v.id = b.vendor_id
      WHERE b.id = $1
      FOR UPDATE
    `, [
            branch_id
        ]);
        if (branchResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Branch not found"
            }, {
                status: 404
            });
        }
        const branch = branchResult.rows[0];
        const tin = branch.kra_pin || branch.vendor_kra_pin;
        const bhfId = branch.bhf_id || "00";
        const tankResult = await client.query(`
      SELECT t.*, i.item_code, i.class_code, i.item_name, i.package_unit, i.quantity_unit
      FROM tanks t
      LEFT JOIN items i ON t.item_id = i.id
      WHERE t.id = $1
      FOR UPDATE
    `, [
            tank_id
        ]);
        if (tankResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Tank not found"
            }, {
                status: 404
            });
        }
        const tank = tankResult.rows[0];
        const previousStock = parseFloat(tank.current_stock) || 0;
        const tankCapacity = parseFloat(tank.capacity) || 0;
        let newStock;
        if (adjustment_type === "increase") {
            newStock = previousStock + quantity;
        } else if (adjustment_type === "decrease") {
            newStock = Math.max(0, previousStock - quantity);
        } else {
            newStock = quantity;
        }
        // Check if adjustment would exceed tank capacity (100%)
        if (tankCapacity > 0 && newStock > tankCapacity) {
            await client.query('ROLLBACK');
            const availableSpace = tankCapacity - previousStock;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: `Cannot adjust stock. Tank capacity is ${tankCapacity}L. Adjustment would result in ${newStock.toFixed(2)}L which exceeds capacity. Available space: ${availableSpace.toFixed(2)}L`
            }, {
                status: 400
            });
        }
        const actualChange = Math.abs(newStock - previousStock);
        if (actualChange === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: {
                    tankId: tank_id,
                    adjustmentType: adjustment_type,
                    previousStock,
                    adjustedQuantity: 0,
                    newStock: previousStock,
                    fuelType: tank.fuel_type
                },
                kraSync: null,
                message: "No adjustment needed - stock unchanged"
            });
        }
        let kraResult = null;
        let sarNo = null;
        if (sync_to_kra && !tin) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Branch KRA configuration is missing (no KRA PIN). Please configure KRA settings before adjusting stock."
            }, {
                status: 400
            });
        }
        if (sync_to_kra && tin) {
            sarNo = (branch.sr_number || 0) + 1;
            const kraBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$url$2d$helper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKraBaseUrl"])(branch.server_address, branch.server_port);
            const itemCd = tank.item_code || tank.kra_item_cd || `FUEL${tank_id.substring(0, 8)}`;
            const itemClsCd = tank.class_code || "5059690800";
            const itemNm = tank.item_name || tank.fuel_type || "Fuel";
            const saveStockItemsPayload = {
                tin,
                bhfId,
                sarNo,
                orgSarNo: 0,
                regTyCd: "M",
                custTin: null,
                custNm: null,
                custBhfId: null,
                sarTyCd: "06",
                ocrnDt: formatKraDate(),
                totItemCnt: 1,
                totTaxblAmt: 0,
                totTaxAmt: 0,
                totAmt: 0,
                remark: reason || `Stock adjustment: ${previousStock} -> ${newStock}`,
                regrId: "Admin",
                regrNm: "Admin",
                modrNm: "Admin",
                modrId: "Admin",
                itemList: [
                    {
                        itemSeq: 1,
                        itemCd,
                        itemClsCd,
                        itemNm,
                        bcd: null,
                        pkgUnitCd: tank.package_unit || "NT",
                        pkg: Math.ceil(actualChange),
                        qtyUnitCd: tank.quantity_unit || "U",
                        qty: actualChange,
                        itemExprDt: null,
                        prc: 0,
                        splyAmt: 0,
                        totDcAmt: 0,
                        taxblAmt: 0,
                        taxTyCd: "B",
                        taxAmt: 0,
                        totAmt: 0
                    }
                ]
            };
            console.log(`[Stock Adjust] Calling saveStockItems for tank ${tank_id}, sarNo: ${sarNo}`);
            const { response: saveStockItemsResponse, statusCode: saveStockItemsStatus } = await callKraWithRetry(`${kraBaseUrl}/stock/saveStockItems`, saveStockItemsPayload);
            await client.query(`
        INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                branch_id,
                "kra_stock_sync",
                "/stock/saveStockItems",
                JSON.stringify(saveStockItemsPayload),
                JSON.stringify(saveStockItemsResponse),
                saveStockItemsResponse?.resultCd === "000" || saveStockItemsResponse?.resultCd === "0" ? "success" : "error"
            ]);
            const saveStockItemsSuccess = saveStockItemsResponse?.resultCd === "000" || saveStockItemsResponse?.resultCd === "0";
            if (!saveStockItemsSuccess) {
                await client.query('ROLLBACK');
                console.error(`[Stock Adjust] saveStockItems failed:`, saveStockItemsResponse);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: saveStockItemsResponse?.resultMsg || "Failed to sync stock adjustment to KRA",
                    kraResponse: saveStockItemsResponse
                }, {
                    status: 500
                });
            }
            const saveStockMasterPayload = {
                tin,
                bhfId,
                itemCd,
                rsdQty: newStock,
                regrId: "Admin",
                regrNm: "Admin",
                modrNm: "Admin",
                modrId: "Admin"
            };
            console.log(`[Stock Adjust] Calling saveStockMaster for item ${itemCd}, newStock: ${newStock}`);
            const { response: saveStockMasterResponse, statusCode: saveStockMasterStatus } = await callKraWithRetry(`${kraBaseUrl}/stockMaster/saveStockMaster`, saveStockMasterPayload);
            await client.query(`
        INSERT INTO branch_logs (branch_id, log_type, endpoint, request_payload, response_payload, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                branch_id,
                "kra_stock_sync",
                "/stockMaster/saveStockMaster",
                JSON.stringify(saveStockMasterPayload),
                JSON.stringify(saveStockMasterResponse),
                saveStockMasterResponse?.resultCd === "000" || saveStockMasterResponse?.resultCd === "0" ? "success" : "error"
            ]);
            const saveStockMasterSuccess = saveStockMasterResponse?.resultCd === "000" || saveStockMasterResponse?.resultCd === "0";
            kraResult = {
                success: saveStockItemsSuccess && saveStockMasterSuccess,
                saveStockItems: saveStockItemsResponse,
                saveStockMaster: saveStockMasterResponse
            };
            if (!saveStockMasterSuccess) {
                console.warn(`[Stock Adjust] saveStockMaster failed but saveStockItems succeeded - continuing with adjustment`);
            }
            await client.query(`
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
        )
      `, [
                branch_id,
                tin,
                bhfId,
                sarNo,
                0,
                "M",
                null,
                null,
                null,
                "06",
                formatKraDate(),
                1,
                0,
                0,
                0,
                reason || `Stock adjustment: ${previousStock} -> ${newStock}`,
                "Admin",
                "Admin",
                "Admin",
                "Admin",
                saveStockItemsSuccess ? "success" : "failed",
                JSON.stringify(saveStockItemsResponse),
                saveStockItemsSuccess ? new Date() : null
            ]);
        }
        if (sarNo) {
            await client.query(`UPDATE branches SET sr_number = $1, updated_at = NOW() WHERE id = $2`, [
                sarNo,
                branch_id
            ]);
        }
        await client.query(`UPDATE tanks SET current_stock = $1, kra_sync_status = $2, last_kra_synced_stock = $3, updated_at = NOW() WHERE id = $4`, [
            newStock,
            kraResult?.success ? 'synced' : sync_to_kra ? 'failed' : 'pending',
            kraResult?.success ? newStock : tank.last_kra_synced_stock,
            tank_id
        ]);
        await client.query(`INSERT INTO stock_adjustments (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status, kra_sync_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
            branch_id,
            tank_id,
            adjustment_type,
            actualChange,
            previousStock,
            newStock,
            reason || 'Manual adjustment',
            approved_by || 'System',
            'approved',
            kraResult?.success ? 'synced' : 'pending'
        ]);
        await client.query('COMMIT');
        console.log(`[Stock Adjust] Successfully adjusted tank ${tank_id}: ${previousStock} -> ${newStock}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                tankId: tank_id,
                adjustmentType: adjustment_type,
                previousStock,
                adjustedQuantity: actualChange,
                newStock,
                fuelType: tank.fuel_type
            },
            kraSync: kraResult ? {
                synced: kraResult.success,
                error: kraResult.success ? undefined : "KRA sync completed with warnings"
            } : null
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("[Stock Adjust API] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to adjust stock",
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

//# sourceMappingURL=%5Broot-of-the-server%5D__e2fc8c2c._.js.map