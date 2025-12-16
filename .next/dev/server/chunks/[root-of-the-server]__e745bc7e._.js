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
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function createClient() {
    return {
        from: (table)=>createQueryBuilder(table),
        auth: createAuthClient()
    };
}
function createQueryBuilder(table) {
    let selectColumns = '*';
    let whereConditions = [];
    let orderByColumn = null;
    let orderDirection = 'asc';
    let limitCount = null;
    let singleResult = false;
    const builder = {
        select: (columns = '*')=>{
            selectColumns = columns;
            return builder;
        },
        insert: async (data)=>{
            const rows = Array.isArray(data) ? data : [
                data
            ];
            if (rows.length === 0) return {
                data: [],
                error: null
            };
            const columns = Object.keys(rows[0]);
            const values = rows.map((row, i)=>`(${columns.map((_, j)=>`$${i * columns.length + j + 1}`).join(', ')})`).join(', ');
            const params = rows.flatMap((row)=>columns.map((col)=>row[col]));
            try {
                const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values} RETURNING *`;
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
                return {
                    data: result,
                    error: null
                };
            } catch (error) {
                return {
                    data: null,
                    error: {
                        message: error.message
                    }
                };
            }
        },
        update: async (data)=>{
            const columns = Object.keys(data);
            const setClause = columns.map((col, i)=>`${col} = $${i + 1}`).join(', ');
            const params = columns.map((col)=>data[col]);
            let sql = `UPDATE ${table} SET ${setClause}`;
            let paramIndex = params.length;
            if (whereConditions.length > 0) {
                const whereClauses = whereConditions.map((cond, i)=>{
                    paramIndex++;
                    return `${cond.column} ${cond.operator} $${paramIndex}`;
                });
                sql += ` WHERE ${whereClauses.join(' AND ')}`;
                params.push(...whereConditions.map((c)=>c.value));
            }
            sql += ' RETURNING *';
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
                return {
                    data: result,
                    error: null
                };
            } catch (error) {
                return {
                    data: null,
                    error: {
                        message: error.message
                    }
                };
            }
        },
        delete: async ()=>{
            let sql = `DELETE FROM ${table}`;
            const params = [];
            if (whereConditions.length > 0) {
                const whereClauses = whereConditions.map((cond, i)=>{
                    return `${cond.column} ${cond.operator} $${i + 1}`;
                });
                sql += ` WHERE ${whereClauses.join(' AND ')}`;
                params.push(...whereConditions.map((c)=>c.value));
            }
            sql += ' RETURNING *';
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
                return {
                    data: result,
                    error: null
                };
            } catch (error) {
                return {
                    data: null,
                    error: {
                        message: error.message
                    }
                };
            }
        },
        upsert: async (data, options)=>{
            const rows = Array.isArray(data) ? data : [
                data
            ];
            if (rows.length === 0) return {
                data: [],
                error: null
            };
            const columns = Object.keys(rows[0]);
            const values = rows.map((row, i)=>`(${columns.map((_, j)=>`$${i * columns.length + j + 1}`).join(', ')})`).join(', ');
            const params = rows.flatMap((row)=>columns.map((col)=>row[col]));
            const conflictColumns = options?.onConflict || 'id';
            const updateColumns = columns.filter((c)=>!conflictColumns.split(',').includes(c));
            const updateClause = updateColumns.map((c)=>`${c} = EXCLUDED.${c}`).join(', ');
            try {
                let sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values}`;
                if (updateClause) {
                    sql += ` ON CONFLICT (${conflictColumns}) DO UPDATE SET ${updateClause}`;
                } else {
                    sql += ` ON CONFLICT (${conflictColumns}) DO NOTHING`;
                }
                sql += ' RETURNING *';
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
                return {
                    data: result,
                    error: null
                };
            } catch (error) {
                return {
                    data: null,
                    error: {
                        message: error.message
                    }
                };
            }
        },
        eq: (column, value)=>{
            whereConditions.push({
                column,
                operator: '=',
                value
            });
            return builder;
        },
        neq: (column, value)=>{
            whereConditions.push({
                column,
                operator: '!=',
                value
            });
            return builder;
        },
        gt: (column, value)=>{
            whereConditions.push({
                column,
                operator: '>',
                value
            });
            return builder;
        },
        gte: (column, value)=>{
            whereConditions.push({
                column,
                operator: '>=',
                value
            });
            return builder;
        },
        lt: (column, value)=>{
            whereConditions.push({
                column,
                operator: '<',
                value
            });
            return builder;
        },
        lte: (column, value)=>{
            whereConditions.push({
                column,
                operator: '<=',
                value
            });
            return builder;
        },
        like: (column, value)=>{
            whereConditions.push({
                column,
                operator: 'LIKE',
                value
            });
            return builder;
        },
        ilike: (column, value)=>{
            whereConditions.push({
                column,
                operator: 'ILIKE',
                value
            });
            return builder;
        },
        is: (column, value)=>{
            whereConditions.push({
                column,
                operator: 'IS',
                value
            });
            return builder;
        },
        in: (column, values)=>{
            whereConditions.push({
                column,
                operator: 'IN',
                value: values
            });
            return builder;
        },
        order: (column, options)=>{
            orderByColumn = column;
            orderDirection = options?.ascending === false ? 'desc' : 'asc';
            return builder;
        },
        limit: (count)=>{
            limitCount = count;
            return builder;
        },
        single: ()=>{
            singleResult = true;
            limitCount = 1;
            return builder;
        },
        maybeSingle: ()=>{
            singleResult = true;
            limitCount = 1;
            return builder;
        },
        then: async (resolve, reject)=>{
            try {
                let sql = `SELECT ${selectColumns} FROM ${table}`;
                const params = [];
                let paramIndex = 0;
                if (whereConditions.length > 0) {
                    const whereClauses = whereConditions.map((cond)=>{
                        if (cond.operator === 'IN') {
                            const placeholders = cond.value.map(()=>`$${++paramIndex}`).join(', ');
                            params.push(...cond.value);
                            return `${cond.column} IN (${placeholders})`;
                        } else if (cond.operator === 'IS') {
                            return `${cond.column} IS ${cond.value}`;
                        } else {
                            paramIndex++;
                            params.push(cond.value);
                            return `${cond.column} ${cond.operator} $${paramIndex}`;
                        }
                    });
                    sql += ` WHERE ${whereClauses.join(' AND ')}`;
                }
                if (orderByColumn) {
                    sql += ` ORDER BY ${orderByColumn} ${orderDirection.toUpperCase()}`;
                }
                if (limitCount !== null) {
                    sql += ` LIMIT ${limitCount}`;
                }
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
                const data = singleResult ? result[0] || null : result;
                resolve({
                    data,
                    error: null
                });
            } catch (error) {
                if (reject) {
                    reject(error);
                } else {
                    resolve({
                        data: null,
                        error: {
                            message: error.message
                        }
                    });
                }
            }
        }
    };
    return builder;
}
function createAuthClient() {
    return {
        getUser: async ()=>{
            return {
                data: {
                    user: null
                },
                error: null
            };
        },
        getSession: async ()=>{
            return {
                data: {
                    session: null
                },
                error: null
            };
        },
        signInWithPassword: async (credentials)=>{
            return {
                data: {
                    user: null,
                    session: null
                },
                error: {
                    message: 'Local auth not implemented'
                }
            };
        },
        signUp: async (credentials)=>{
            return {
                data: {
                    user: null,
                    session: null
                },
                error: {
                    message: 'Local auth not implemented'
                }
            };
        },
        signOut: async ()=>{
            return {
                error: null
            };
        },
        onAuthStateChange: (callback)=>{
            return {
                data: {
                    subscription: {
                        unsubscribe: ()=>{}
                    }
                }
            };
        }
    };
}
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
            external_endpoint: entry.externalEndpoint || null
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
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const KRA_BASE_URL = "http://20.224.40.56:8088";
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
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT item_code, class_code, item_name, package_unit, 
           quantity_unit, tax_type, sale_price, purchase_price
    FROM items
    WHERE branch_id = $1 
    AND (UPPER(item_name) = UPPER($2) OR item_name ILIKE $3)
    ORDER BY created_at DESC
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
                    qty: qty,
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
        const kraEndpoint = `${KRA_BASE_URL}/trnsSales/saveSales`;
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
                    "Accept": "application/json"
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
        const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0";
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
            externalEndpoint: `${KRA_BASE_URL}/trnsSales/saveSales`
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
        const kraEndpoint = `${KRA_BASE_URL}/trnsSales/saveSales`;
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
                    "Accept": "application/json"
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
"[project]/app/api/credit-notes/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { sale_id, branch_id, reason, refund_reason_code } = body;
        if (!sale_id || !branch_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing required fields: sale_id and branch_id"
            }, {
                status: 400
            });
        }
        const saleResult = await client.query(`SELECT s.*, i.item_code, i.class_code, i.item_name, i.package_unit, i.quantity_unit, i.tax_type
       FROM sales s
       LEFT JOIN items i ON i.branch_id = s.branch_id AND UPPER(i.item_name) = UPPER(s.fuel_type)
       WHERE s.id = $1`, [
            sale_id
        ]);
        if (saleResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Sale not found"
            }, {
                status: 404
            });
        }
        const originalSale = saleResult.rows[0];
        const invoiceNoMatch = originalSale.invoice_number?.match(/\d+/);
        const originalInvoiceNo = invoiceNoMatch ? parseInt(invoiceNoMatch[0]) : 1;
        const kraResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$sales$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callKraCreditNote"])({
            branch_id: branch_id,
            original_sale_id: sale_id,
            original_invoice_no: originalInvoiceNo,
            refund_reason_code: refund_reason_code || reason || 'other',
            customer_tin: originalSale.customer_pin,
            customer_name: originalSale.customer_name,
            items: [
                {
                    item_code: originalSale.item_code || 'KE2BFLTR0000001',
                    item_class_code: originalSale.class_code || '99013001',
                    item_name: originalSale.item_name || originalSale.fuel_type,
                    package_unit: originalSale.package_unit || 'BF',
                    quantity_unit: originalSale.quantity_unit || 'L',
                    quantity: parseFloat(originalSale.quantity) || 0,
                    price: parseFloat(originalSale.unit_price) || 0,
                    tax_type: originalSale.tax_type || 'B'
                }
            ]
        });
        if (!kraResult.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "KRA credit note submission failed",
                kraResponse: kraResult.kraResponse
            }, {
                status: 400
            });
        }
        const creditNoteInvoiceNumber = `${originalSale.invoice_number}-CR`;
        const kraData = kraResult.kraResponse?.data || {};
        const insertResult = await client.query(`INSERT INTO sales (
        id, branch_id, nozzle_id, fuel_type, quantity, unit_price, total_amount,
        payment_method, customer_name, customer_pin, is_loyalty_sale, 
        meter_reading_after, invoice_number, receipt_number,
        transmission_status, sale_date, is_credit_note, original_sale_id,
        kra_status, kra_rcpt_sign, kra_scu_id, kra_cu_inv
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16, $17, $18, $19, $20
      ) RETURNING *`, [
            branch_id,
            originalSale.nozzle_id,
            originalSale.fuel_type,
            -Math.abs(parseFloat(originalSale.quantity)),
            originalSale.unit_price,
            -Math.abs(parseFloat(originalSale.total_amount)),
            originalSale.payment_method,
            originalSale.customer_name,
            originalSale.customer_pin,
            originalSale.is_loyalty_sale,
            originalSale.meter_reading_after || 0,
            creditNoteInvoiceNumber,
            kraResult.creditNoteNumber,
            'transmitted',
            true,
            sale_id,
            'success',
            kraData.rcptSign || null,
            kraData.sdcId || null,
            kraData.intrlData || `${kraResult.creditNoteNumber}`
        ]);
        await client.query(`UPDATE sales SET has_credit_note = true WHERE id = $1`, [
            sale_id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: insertResult.rows[0],
            kraResponse: kraResult.kraResponse,
            creditNoteNumber: kraResult.creditNoteNumber
        });
    } catch (error) {
        console.error("Error creating credit note:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create credit note",
            details: error.message
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id');
    try {
        let queryStr = `SELECT * FROM sales WHERE is_credit_note = true`;
        const params = [];
        if (branchId) {
            params.push(branchId);
            queryStr += ` AND branch_id = $${params.length}`;
        }
        queryStr += ` ORDER BY sale_date DESC`;
        const result = await pool.query(queryStr, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching credit notes:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch credit notes",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e745bc7e._.js.map