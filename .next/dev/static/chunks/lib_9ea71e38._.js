(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/db/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pg$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pg/esm/index.mjs [app-client] (ecmascript)");
;
const pool = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pg$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pool"]({
    connectionString: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.DATABASE_URL,
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
;
function createClient() {
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
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
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
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
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
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
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
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_9ea71e38._.js.map