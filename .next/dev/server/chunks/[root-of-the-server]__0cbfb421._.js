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
"[project]/app/api/purchases/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function getVendorIdFromBranch(branchId) {
    const result = await pool.query(`SELECT vendor_id FROM branches WHERE id = $1`, [
        branchId
    ]);
    return result.rows[0]?.vendor_id || null;
}
async function getVendorIdFromSession() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get("user_session");
        if (!sessionCookie?.value) return null;
        const session = JSON.parse(sessionCookie.value);
        const userId = session.id;
        if (!userId) return null;
        const userVendor = await pool.query(`SELECT v.id FROM users u 
       JOIN vendors v ON v.email = u.email 
       WHERE u.id = $1`, [
            userId
        ]);
        if (userVendor.rows.length > 0) {
            return userVendor.rows[0].id;
        }
        const staffVendor = await pool.query(`SELECT DISTINCT b.vendor_id FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`, [
            userId
        ]);
        if (staffVendor.rows.length > 0) {
            return staffVendor.rows[0].vendor_id;
        }
        return null;
    } catch  {
        return null;
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get("branch_id");
        const vendorIdParam = searchParams.get("vendor_id");
        const status = searchParams.get("status");
        const dateFrom = searchParams.get("date_from");
        const dateTo = searchParams.get("date_to");
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "100");
        let vendorId = vendorIdParam;
        if (!vendorId && branchId) {
            vendorId = await getVendorIdFromBranch(branchId);
        }
        if (!vendorId) {
            vendorId = await getVendorIdFromSession();
        }
        let query = `
      SELECT 
        pt.id,
        pt.branch_id,
        pt.invc_no,
        pt.spplr_nm as supplier_name,
        pt.spplr_tin as supplier_tin,
        pt.pchs_dt as purchase_date,
        pt.tot_item_cnt as item_count,
        pt.tot_amt as total_amount,
        pt.tot_tax_amt as tax_amount,
        pt.tot_taxbl_amt as taxable_amount,
        pt.pchs_stts_cd as status_code,
        pt.pchs_ty_cd as purchase_type,
        pt.pmt_ty_cd as payment_type,
        pt.remark,
        pt.created_at,
        CASE 
          WHEN pt.pchs_stts_cd = '02' THEN 'approved'
          WHEN pt.pchs_stts_cd = '03' THEN 'rejected'
          WHEN pt.pchs_stts_cd = '04' THEN 'cancelled'
          ELSE 'pending'
        END as status
      FROM purchase_transactions pt
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;
        if (branchId) {
            query += ` AND pt.branch_id = $${paramIndex}`;
            params.push(branchId);
            paramIndex++;
        }
        if (status) {
            const statusCode = status === 'approved' ? '02' : status === 'rejected' ? '03' : status === 'cancelled' ? '04' : '01';
            query += ` AND pt.pchs_stts_cd = $${paramIndex}`;
            params.push(statusCode);
            paramIndex++;
        }
        if (dateFrom) {
            query += ` AND pt.pchs_dt >= $${paramIndex}`;
            params.push(dateFrom);
            paramIndex++;
        }
        if (dateTo) {
            query += ` AND pt.pchs_dt <= $${paramIndex}`;
            params.push(dateTo);
            paramIndex++;
        }
        if (search) {
            query += ` AND (pt.spplr_nm ILIKE $${paramIndex} OR CAST(pt.invc_no AS TEXT) ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        query += ` ORDER BY pt.created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);
        const result = await pool.query(query, params);
        const purchases = result.rows.map((row)=>({
                id: row.id,
                po_number: `PO-${String(row.invc_no || '').padStart(4, '0')}`,
                supplier: row.supplier_name || 'Unknown Supplier',
                supplier_tin: row.supplier_tin,
                date: row.purchase_date ? new Date(row.purchase_date).toISOString().split('T')[0] : null,
                items: row.item_count || 0,
                amount: parseFloat(row.total_amount) || 0,
                tax_amount: parseFloat(row.tax_amount) || 0,
                status: row.status,
                purchase_type: row.purchase_type,
                payment_type: row.payment_type,
                remark: row.remark,
                created_at: row.created_at,
                source: 'transaction'
            }));
        // Also fetch accepted purchase orders from purchase_orders table
        let poQuery = `
      SELECT 
        po.id,
        po.po_number,
        po.status,
        po.approval_status,
        po.issued_at,
        po.accepted_at,
        po.notes,
        po.created_at,
        po.branch_id,
        b.name as branch_name,
        vp.name as supplier_name,
        vp.tin as supplier_tin,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount,
        (SELECT COALESCE(SUM(quantity), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_volume
      FROM purchase_orders po
      LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
      LEFT JOIN branches b ON po.branch_id = b.id
      WHERE po.status = 'accepted'
    `;
        const poParams = [];
        let poParamIndex = 1;
        if (vendorId) {
            poQuery += ` AND po.vendor_id = $${poParamIndex}`;
            poParams.push(vendorId);
            poParamIndex++;
        }
        if (branchId) {
            poQuery += ` AND po.branch_id = $${poParamIndex}`;
            poParams.push(branchId);
            poParamIndex++;
        }
        if (search) {
            poQuery += ` AND (po.po_number ILIKE $${poParamIndex} OR vp.name ILIKE $${poParamIndex})`;
            poParams.push(`%${search}%`);
            poParamIndex++;
        }
        poQuery += ` ORDER BY po.accepted_at DESC`;
        const poResult = await pool.query(poQuery, poParams);
        const acceptedPOs = poResult.rows.map((row)=>({
                id: row.id,
                po_number: row.po_number,
                supplier: row.supplier_name || 'Unknown Supplier',
                supplier_tin: row.supplier_tin,
                branch_id: row.branch_id,
                branch_name: row.branch_name,
                date: row.accepted_at ? new Date(row.accepted_at).toISOString().split('T')[0] : row.issued_at ? new Date(row.issued_at).toISOString().split('T')[0] : null,
                items: parseInt(row.item_count) || 0,
                amount: parseFloat(row.total_amount) || 0,
                tax_amount: 0,
                volume: parseFloat(row.total_volume) || 0,
                status: 'accepted',
                purchase_type: 'LOCAL',
                payment_type: null,
                remark: row.notes,
                created_at: row.created_at,
                source: 'purchase_order'
            }));
        // Combine both lists, with accepted POs first
        const allPurchases = [
            ...acceptedPOs,
            ...purchases
        ];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            purchases: allPurchases,
            count: allPurchases.length
        });
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch purchases"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { branch_id, tin, bhf_id, supplier_name, supplier_tin, purchase_date, purchase_type, payment_type, items, total_amount, tax_amount, remark } = body;
        const result = await pool.query(`
      INSERT INTO purchase_transactions (
        branch_id, tin, bhf_id, spplr_nm, spplr_tin, pchs_dt,
        pchs_ty_cd, pmt_ty_cd, tot_item_cnt, tot_amt, tot_tax_amt,
        tot_taxbl_amt, pchs_stts_cd, remark, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '01', $13, NOW(), NOW())
      RETURNING *
    `, [
            branch_id,
            tin,
            bhf_id,
            supplier_name,
            supplier_tin,
            purchase_date,
            purchase_type,
            payment_type,
            items?.length || 0,
            total_amount,
            tax_amount,
            (total_amount || 0) - (tax_amount || 0),
            remark
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            purchase: result.rows[0],
            message: "Purchase order created successfully"
        });
    } catch (error) {
        console.error("Error creating purchase:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to create purchase"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cbfb421._.js.map