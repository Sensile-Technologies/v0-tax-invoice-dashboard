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
"[project]/app/api/mobile/create-sale/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function POST(request) {
    try {
        const body = await request.json();
        const { branch_id, user_id, nozzle_id, fuel_type, quantity, unit_price, total_amount, payment_method, customer_name, kra_pin, vehicle_number, is_loyalty_customer } = body;
        if (!branch_id || !fuel_type || !total_amount) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Branch ID, fuel type, and amount are required"
            }, {
                status: 400
            });
        }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
            const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
            const saleResult = await client.query(`INSERT INTO sales (
          branch_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)
        RETURNING *`, [
                branch_id,
                nozzle_id || null,
                fuel_type,
                quantity,
                unit_price,
                total_amount,
                payment_method || 'cash',
                customer_name || 'Walk-in Customer',
                vehicle_number || null,
                invoiceNumber,
                receiptNumber,
                user_id || null
            ]);
            const sale = saleResult.rows[0];
            const invoiceResult = await client.query(`INSERT INTO invoices (
          invoice_number,
          branch_id,
          customer_name,
          customer_phone,
          subtotal,
          tax_amount,
          total_amount,
          status,
          created_by,
          kra_pin,
          payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', $8, $9, $10)
        RETURNING *`, [
                invoiceNumber,
                branch_id,
                customer_name || 'Walk-in Customer',
                null,
                total_amount,
                total_amount * 0.16,
                total_amount * 1.16,
                user_id || null,
                kra_pin || null,
                payment_method || 'cash'
            ]);
            const invoice = invoiceResult.rows[0];
            if (invoice) {
                await client.query(`INSERT INTO invoice_line_items (
            invoice_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount,
            total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                    invoice.id,
                    nozzle_id || fuel_type,
                    fuel_type,
                    quantity,
                    unit_price,
                    0,
                    total_amount
                ]);
            }
            if (is_loyalty_customer && customer_name) {
                const existingCustomer = await client.query(`SELECT id FROM customers WHERE name = $1 AND branch_id = $2`, [
                    customer_name,
                    branch_id
                ]);
                if (existingCustomer.rows.length === 0) {
                    await client.query(`INSERT INTO customers (branch_id, name, kra_pin, is_loyalty)
             VALUES ($1, $2, $3, true)
             ON CONFLICT DO NOTHING`, [
                        branch_id,
                        customer_name,
                        kra_pin || null
                    ]);
                }
            }
            await client.query('COMMIT');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                sale: sale,
                invoice: invoice,
                invoice_number: invoiceNumber,
                receipt_number: receiptNumber
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
            error: "Failed to create sale"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e27c0487._.js.map