module.exports = [
"[project]/lib/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
"use client";
function createClient() {
    return {
        from: (table)=>createQueryBuilder(table),
        auth: createAuthClient()
    };
}
function createQueryBuilder(table) {
    let whereConditions = [];
    let selectColumns = '*';
    let singleResult = false;
    let pendingInsertData = null;
    let pendingUpdateData = null;
    let pendingDelete = false;
    const executeInsert = async ()=>{
        try {
            const response = await fetch(`/api/db/${table}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: pendingInsertData
                })
            });
            const result = await response.json();
            if (!response.ok) return {
                data: null,
                error: {
                    message: result.error
                }
            };
            const data = singleResult ? result[0] || null : result;
            return {
                data,
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
    };
    const executeUpdate = async ()=>{
        try {
            const response = await fetch(`/api/db/${table}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: pendingUpdateData,
                    where: whereConditions
                })
            });
            const result = await response.json();
            if (!response.ok) return {
                data: null,
                error: {
                    message: result.error
                }
            };
            const data = singleResult ? result[0] || null : result;
            return {
                data,
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
    };
    const executeDelete = async ()=>{
        try {
            const response = await fetch(`/api/db/${table}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    where: whereConditions
                })
            });
            const result = await response.json();
            if (!response.ok) return {
                data: null,
                error: {
                    message: result.error
                }
            };
            const data = singleResult ? result[0] || null : result;
            return {
                data,
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
    };
    const executeSelect = async ()=>{
        try {
            const params = new URLSearchParams();
            whereConditions.forEach((cond, i)=>{
                params.append(`filter_${i}`, `${cond.column}:${cond.operator}:${cond.value}`);
            });
            if (singleResult) params.append('single', 'true');
            const response = await fetch(`/api/db/${table}?${params.toString()}`);
            const result = await response.json();
            if (!response.ok) {
                return {
                    data: null,
                    error: {
                        message: result.error
                    }
                };
            }
            const data = singleResult ? result[0] || null : result;
            return {
                data,
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
    };
    const execute = async ()=>{
        if (pendingInsertData !== null) {
            return executeInsert();
        } else if (pendingUpdateData !== null) {
            return executeUpdate();
        } else if (pendingDelete) {
            return executeDelete();
        } else {
            return executeSelect();
        }
    };
    const builder = {
        select: (columns = '*')=>{
            selectColumns = columns;
            return builder;
        },
        insert: (data)=>{
            pendingInsertData = data;
            return builder;
        },
        update: (data)=>{
            pendingUpdateData = data;
            return builder;
        },
        delete: ()=>{
            pendingDelete = true;
            return builder;
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
        single: ()=>{
            singleResult = true;
            return builder;
        },
        maybeSingle: ()=>{
            singleResult = true;
            return builder;
        },
        order: (column, options)=>{
            return builder;
        },
        limit: (count)=>{
            return builder;
        },
        then: (onfulfilled, onrejected)=>{
            return execute().then(onfulfilled, onrejected);
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
}),
];

//# sourceMappingURL=lib_supabase_client_ts_e1ebccdb._.js.map