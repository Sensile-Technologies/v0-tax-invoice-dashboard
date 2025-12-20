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
"[project]/app/api/mobile/invoices/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get("branch_id");
        const dateFrom = searchParams.get("date_from");
        const dateTo = searchParams.get("date_to");
        const limit = parseInt(searchParams.get("limit") || "100");
        const client = await pool.connect();
        try {
            let sql = `
        SELECT 
          s.id,
          s.invoice_number,
          s.customer_name,
          s.customer_pin,
          s.sale_date,
          s.fuel_type,
          s.quantity,
          s.unit_price,
          s.total_amount,
          s.payment_method,
          s.kra_scu_id as cu_serial_number,
          s.kra_cu_inv as cu_invoice_no,
          s.kra_internal_data as intrl_data,
          s.kra_rcpt_sign as receipt_signature,
          b.name as branch_name,
          b.address as branch_address,
          b.phone as branch_phone,
          b.kra_pin as branch_pin,
          b.bhf_id as bhf_id,
          u.username as cashier_name,
          CASE 
            WHEN s.payment_method = 'credit' THEN 'pending'
            ELSE 'paid'
          END as status
        FROM sales s
        LEFT JOIN branches b ON s.branch_id = b.id
        LEFT JOIN users u ON s.staff_id = u.id
        WHERE 1=1
      `;
            const params = [];
            let paramIndex = 1;
            if (branchId) {
                sql += ` AND s.branch_id = $${paramIndex}`;
                params.push(branchId);
                paramIndex++;
            }
            if (dateFrom) {
                sql += ` AND DATE(s.sale_date) >= $${paramIndex}`;
                params.push(dateFrom);
                paramIndex++;
            }
            if (dateTo) {
                sql += ` AND DATE(s.sale_date) <= $${paramIndex}`;
                params.push(dateTo);
                paramIndex++;
            }
            sql += ` ORDER BY s.sale_date DESC LIMIT $${paramIndex}`;
            params.push(limit);
            const result = await client.query(sql, params);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                sales: result.rows
            });
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("Error fetching mobile invoices:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            sales: []
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { customer_name, customer_phone, items, subtotal, tax, total, user_id, branch_id } = body;
        const client = await pool.connect();
        try {
            const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
            const result = await client.query(`
        INSERT INTO invoices (
          invoice_number,
          customer_name,
          customer_phone,
          branch_id,
          subtotal,
          tax_amount,
          total_amount,
          status,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
        RETURNING *
      `, [
                invoiceNumber,
                customer_name || 'Walk-in Customer',
                customer_phone,
                branch_id || null,
                subtotal,
                tax,
                total,
                user_id || null
            ]);
            const invoice = result.rows[0];
            if (items && items.length > 0 && invoice) {
                for (const item of items){
                    await client.query(`
            INSERT INTO invoice_line_items (
              invoice_id,
              product_id,
              product_name,
              quantity,
              unit_price,
              discount,
              total
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
                        invoice.id,
                        item.product_id,
                        item.product_name,
                        item.quantity,
                        item.unit_price,
                        item.discount || 0,
                        item.total
                    ]);
                }
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(invoice);
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("Error creating mobile invoice:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create invoice"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bf23c580._.js.map