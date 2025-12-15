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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/kra-items-api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resendItemToKra",
    ()=>resendItemToKra,
    "submitItemToKra",
    ()=>submitItemToKra
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
const DEFAULT_KRA_URL = "http://20.224.40.56:8088";
async function getBranchConfig(branchId) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT b.id, b.bhf_id, v.kra_pin, b.device_token, 
             COALESCE(b.server_address, '20.224.40.56') as server_address, 
             COALESCE(b.server_port, '8088') as server_port
      FROM branches b
      JOIN vendors v ON v.id = b.vendor_id
      WHERE b.id = $1
    `, [
            branchId
        ]);
        if (result.length === 0) {
            return null;
        }
        return result[0];
    } catch (error) {
        console.error("[KRA Items API] Error fetching branch config:", error);
        return null;
    }
}
async function submitItemToKra(item) {
    const startTime = Date.now();
    try {
        const branchConfig = await getBranchConfig(item.branch_id);
        if (!branchConfig) {
            const errorMsg = "Branch configuration not found";
            console.log(`[KRA Items API] ${errorMsg}`);
            return {
                success: false,
                kraResponse: null,
                error: errorMsg
            };
        }
        if (!branchConfig.server_address || !branchConfig.server_port) {
            const errorMsg = "KRA server configuration not set for this branch";
            console.log(`[KRA Items API] ${errorMsg}`);
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
        if (!branchConfig.kra_pin) {
            const errorMsg = "Vendor KRA PIN not configured";
            console.log(`[KRA Items API] ${errorMsg}`);
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
        const serverAddress = branchConfig.server_address.replace(/^https?:\/\//, '');
        const kraEndpoint = `http://${serverAddress}:${branchConfig.server_port}/items/saveItems`;
        const kraPayload = {
            tin: branchConfig.kra_pin,
            bhfId: branchConfig.bhf_id || "00",
            itemCd: item.item_code,
            itemClsCd: item.class_code || "99000000",
            itemTyCd: item.item_type || "2",
            itemNm: item.item_name,
            itemStdNm: null,
            orgnNatCd: item.origin || "KE",
            pkgUnitCd: item.package_unit || "NT",
            qtyUnitCd: item.quantity_unit || "U",
            taxTyCd: item.tax_type || "B",
            btchNo: item.batch_number || null,
            bcd: item.sku || null,
            dftPrc: item.sale_price || 0,
            grpPrcL1: item.sale_price || 0,
            grpPrcL2: item.sale_price || 0,
            grpPrcL3: item.sale_price || 0,
            grpPrcL4: item.sale_price || 0,
            grpPrcL5: null,
            addInfo: null,
            sftyQty: null,
            isrcAplcbYn: "N",
            useYn: item.status === "active" ? "Y" : "N",
            regrNm: "Admin",
            regrId: "Admin",
            modrNm: "Admin",
            modrId: "Admin"
        };
        console.log(`[KRA Items API] Calling endpoint: ${kraEndpoint}`);
        console.log(`[KRA Items API] Request payload:`, JSON.stringify(kraPayload, null, 2));
        let kraResponse;
        let httpStatusCode = 200;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 10000);
            const response = await fetch(kraEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(kraPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            httpStatusCode = response.status;
            kraResponse = await response.json();
        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                kraResponse = {
                    resultCd: "TIMEOUT",
                    resultMsg: "Request timed out after 10 seconds",
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
        console.log(`[KRA Items API] Response (${duration}ms):`, JSON.stringify(kraResponse, null, 2));
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logApiCall"])({
            endpoint: kraEndpoint,
            method: "POST",
            payload: {
                ...kraPayload,
                tin: "***MASKED***"
            },
            response: kraResponse,
            statusCode: httpStatusCode,
            durationMs: duration,
            branchId: item.branch_id,
            externalEndpoint: "kra_items_api"
        });
        const isSuccess = kraResponse.resultCd === "000" || kraResponse.resultCd === "0";
        const status = isSuccess ? "success" : "rejected";
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      UPDATE items 
      SET kra_status = $1, 
          kra_response = $2, 
          kra_last_synced_at = NOW()
      WHERE id = $3
    `, [
            status,
            JSON.stringify(kraResponse),
            item.id
        ]);
        return {
            success: isSuccess,
            kraResponse
        };
    } catch (error) {
        console.error("[KRA Items API] Error:", error);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      UPDATE items 
      SET kra_status = 'rejected', 
          kra_response = $1, 
          kra_last_synced_at = NOW()
      WHERE id = $2
    `, [
            JSON.stringify({
                error: error.message
            }),
            item.id
        ]);
        return {
            success: false,
            kraResponse: null,
            error: error.message
        };
    }
}
async function resendItemToKra(itemId) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT id, item_code, item_name, item_type, class_code, origin, 
             package_unit, quantity_unit, tax_type, batch_number, sku,
             sale_price, purchase_price, status, vendor_id, branch_id
      FROM items 
      WHERE id = $1
    `, [
            itemId
        ]);
        if (result.length === 0) {
            return {
                success: false,
                kraResponse: null,
                error: "Item not found"
            };
        }
        const item = result[0];
        return submitItemToKra(item);
    } catch (error) {
        console.error("[KRA Items API] Resend error:", error);
        return {
            success: false,
            kraResponse: null,
            error: error.message
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/api/items/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$items$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kra-items-api.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$items$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$items$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
function generateItemCode(origin, itemType, packageUnit, quantityUnit, itemCount) {
    const paddedCount = String(itemCount).padStart(7, '0');
    return `${origin}${itemType}${packageUnit}${quantityUnit}${paddedCount}`;
}
async function POST(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { vendorId, branchId, itemName, description, itemType, classCode, taxType, origin, batchNumber, purchasePrice, salePrice, sku, quantityUnit, packageUnit } = body;
        if (!vendorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Session expired or vendor not found. Please login again."
            }, {
                status: 401
            });
        }
        if (!branchId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Branch not assigned. Please contact your administrator."
            }, {
                status: 400
            });
        }
        if (!itemName || !itemType || !classCode || !taxType || !origin || !quantityUnit || !packageUnit) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing required fields"
            }, {
                status: 400
            });
        }
        await client.query('BEGIN');
        const vendorResult = await client.query('SELECT item_count FROM vendors WHERE id = $1 FOR UPDATE', [
            vendorId
        ]);
        if (vendorResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Vendor not found"
            }, {
                status: 404
            });
        }
        const currentItemCount = vendorResult.rows[0].item_count || 0;
        const newItemCount = currentItemCount + 1;
        const itemCode = generateItemCode(origin, itemType, packageUnit, quantityUnit, newItemCount);
        const existingItem = await client.query('SELECT id FROM items WHERE item_code = $1', [
            itemCode
        ]);
        if (existingItem.rows.length > 0) {
            await client.query('ROLLBACK');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Item code already exists. Please try again."
            }, {
                status: 409
            });
        }
        const insertResult = await client.query(`INSERT INTO items (
        vendor_id, branch_id, item_code, item_name, description,
        item_type, class_code, tax_type, origin, batch_number,
        purchase_price, sale_price, sku, quantity_unit, package_unit,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        'active', NOW(), NOW()
      ) RETURNING *`, [
            vendorId,
            branchId || null,
            itemCode,
            itemName,
            description || null,
            itemType,
            classCode,
            taxType,
            origin,
            batchNumber || null,
            purchasePrice || 0,
            salePrice || 0,
            sku || null,
            quantityUnit,
            packageUnit
        ]);
        await client.query('UPDATE vendors SET item_count = $1 WHERE id = $2', [
            newItemCount,
            vendorId
        ]);
        await client.query('COMMIT');
        const createdItem = insertResult.rows[0];
        const kraResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kra$2d$items$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["submitItemToKra"])({
            id: createdItem.id,
            item_code: itemCode,
            item_name: itemName,
            item_type: itemType,
            class_code: classCode,
            origin: origin,
            package_unit: packageUnit,
            quantity_unit: quantityUnit,
            tax_type: taxType,
            batch_number: batchNumber,
            sku: sku,
            sale_price: salePrice || 0,
            purchase_price: purchasePrice || 0,
            status: 'active',
            vendor_id: vendorId,
            branch_id: branchId
        });
        console.log(`[Items API] KRA submission result for ${itemCode}:`, kraResult);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            item: createdItem,
            itemCode: itemCode,
            kraSubmission: {
                success: kraResult.success,
                status: kraResult.success ? 'success' : 'rejected',
                response: kraResult.kraResponse
            },
            message: `Item created successfully with code: ${itemCode}. KRA submission: ${kraResult.success ? 'Successful' : 'Pending/Rejected'}`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating item:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create item"
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');
        const branchId = searchParams.get('branchId');
        let query = 'SELECT * FROM items WHERE 1=1';
        const params = [];
        if (vendorId) {
            params.push(vendorId);
            query += ` AND vendor_id = $${params.length}`;
        }
        if (branchId) {
            params.push(branchId);
            query += ` AND branch_id = $${params.length}`;
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            items: result.rows
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch items"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fbf6b582._.js.map