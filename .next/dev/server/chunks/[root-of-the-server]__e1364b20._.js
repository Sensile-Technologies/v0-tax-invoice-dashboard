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
"[project]/app/api/shifts/generate-bulk-sales/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
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
function splitIntoDenominations(totalVolume) {
    const denominations = [];
    let remaining = totalVolume;
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
        const minDenom = 100;
        const availableDenoms = validDenoms.filter((d)=>d >= minDenom && d <= maxDenom && d <= remaining);
        if (availableDenoms.length === 0) break;
        const randomDenom = availableDenoms[Math.floor(Math.random() * availableDenoms.length)];
        denominations.push(randomDenom);
        remaining -= randomDenom;
    }
    if (remaining > 0 && remaining < 100 && denominations.length > 0) {
        denominations[denominations.length - 1] += remaining;
        remaining = 0;
    }
    return denominations;
}
function generateInvoiceNumber(branchCode, index) {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `BLK-${branchCode}-${timestamp}-${String(index).padStart(4, '0')}`;
}
function generateReceiptNumber() {
    return `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
async function POST(request) {
    const client = await pool.connect();
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get("user_session");
        if (!sessionCookie?.value) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const session = JSON.parse(sessionCookie.value);
        const { user_id, vendor_id, branch_id: userBranchId } = session;
        const body = await request.json();
        const { shift_id, nozzle_ids } = body;
        if (!shift_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "shift_id is required"
            }, {
                status: 400
            });
        }
        const shiftResult = await client.query(`SELECT s.id, s.branch_id, s.staff_id, s.status, b.name as branch_name, b.vendor_id
       FROM shifts s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = $1`, [
            shift_id
        ]);
        if (shiftResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shift not found"
            }, {
                status: 404
            });
        }
        const shift = shiftResult.rows[0];
        if (vendor_id && shift.vendor_id !== vendor_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Access denied"
            }, {
                status: 403
            });
        }
        let nozzleQuery = `
      SELECT 
        sr.nozzle_id,
        sr.opening_reading,
        sr.closing_reading,
        n.fuel_type,
        n.item_id,
        COALESCE(bi.sale_price, i.sale_price, 0) as sale_price
      FROM shift_readings sr
      JOIN nozzles n ON sr.nozzle_id = n.id
      LEFT JOIN items i ON n.item_id = i.id
      LEFT JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = $1
      WHERE sr.shift_id = $2 AND sr.reading_type = 'nozzle'
    `;
        const params = [
            shift.branch_id,
            shift_id
        ];
        if (nozzle_ids && nozzle_ids.length > 0) {
            nozzleQuery += ` AND sr.nozzle_id = ANY($3)`;
            params.push(nozzle_ids);
        }
        const nozzleResult = await client.query(nozzleQuery, params);
        const nozzleReadings = nozzleResult.rows;
        if (nozzleReadings.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No nozzle readings found for this shift"
            }, {
                status: 400
            });
        }
        const branchCode = shift.branch_name.substring(0, 3).toUpperCase().replace(/\s/g, '');
        await client.query('BEGIN');
        const salesCreated = [];
        let invoiceIndex = 1;
        for (const reading of nozzleReadings){
            const openingReading = parseFloat(String(reading.opening_reading)) || 0;
            const closingReading = parseFloat(String(reading.closing_reading)) || 0;
            const meterDifference = closingReading - openingReading;
            if (meterDifference <= 0) {
                continue;
            }
            const unitPrice = parseFloat(String(reading.sale_price)) || 0;
            if (unitPrice <= 0) {
                console.log(`Skipping nozzle ${reading.nozzle_id} - no price configured`);
                continue;
            }
            const denominations = splitIntoDenominations(meterDifference);
            for (const quantity of denominations){
                const totalAmount = quantity * unitPrice;
                const invoiceNumber = generateInvoiceNumber(branchCode, invoiceIndex);
                const receiptNumber = generateReceiptNumber();
                const insertResult = await client.query(`INSERT INTO sales (
            branch_id, shift_id, staff_id, nozzle_id,
            invoice_number, receipt_number, sale_date,
            fuel_type, quantity, unit_price, total_amount,
            payment_method, is_automated, source_system,
            transmission_status, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, NOW(),
            $7, $8, $9, $10,
            'cash', true, 'meter_diff_bulk',
            'pending', NOW()
          ) RETURNING id, invoice_number, quantity, total_amount`, [
                    shift.branch_id,
                    shift_id,
                    shift.staff_id,
                    reading.nozzle_id,
                    invoiceNumber,
                    receiptNumber,
                    reading.fuel_type,
                    quantity,
                    unitPrice,
                    totalAmount
                ]);
                salesCreated.push({
                    id: insertResult.rows[0].id,
                    invoice_number: insertResult.rows[0].invoice_number,
                    fuel_type: reading.fuel_type,
                    quantity: quantity,
                    unit_price: unitPrice,
                    total_amount: totalAmount
                });
                invoiceIndex++;
            }
        }
        await client.query('COMMIT');
        const totalQuantity = salesCreated.reduce((sum, s)=>sum + s.quantity, 0);
        const totalAmount = salesCreated.reduce((sum, s)=>sum + s.total_amount, 0);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Generated ${salesCreated.length} invoices from meter difference`,
            summary: {
                total_invoices: salesCreated.length,
                total_quantity: totalQuantity,
                total_amount: totalAmount
            },
            sales: salesCreated
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error generating bulk sales:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    } finally{
        client.release();
    }
}
async function GET(request) {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get("user_session");
        if (!sessionCookie?.value) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(request.url);
        const shift_id = searchParams.get("shift_id");
        if (!shift_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "shift_id is required"
            }, {
                status: 400
            });
        }
        const result = await pool.query(`SELECT 
        sr.nozzle_id,
        n.nozzle_number,
        n.fuel_type,
        sr.opening_reading,
        sr.closing_reading,
        (CAST(sr.closing_reading AS numeric) - CAST(sr.opening_reading AS numeric)) as meter_difference,
        COALESCE(bi.sale_price, i.sale_price, 0) as sale_price,
        (CAST(sr.closing_reading AS numeric) - CAST(sr.opening_reading AS numeric)) * COALESCE(bi.sale_price, i.sale_price, 0) as potential_sales_value
      FROM shift_readings sr
      JOIN nozzles n ON sr.nozzle_id = n.id
      JOIN shifts s ON sr.shift_id = s.id
      LEFT JOIN items i ON n.item_id = i.id
      LEFT JOIN branch_items bi ON bi.item_id = n.item_id AND bi.branch_id = s.branch_id
      WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
      ORDER BY n.fuel_type, n.nozzle_number`, [
            shift_id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            nozzles: result.rows,
            total_meter_difference: result.rows.reduce((sum, r)=>sum + (parseFloat(r.meter_difference) || 0), 0),
            total_potential_value: result.rows.reduce((sum, r)=>sum + (parseFloat(r.potential_sales_value) || 0), 0)
        });
    } catch (error) {
        console.error("Error fetching shift nozzle data:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e1364b20._.js.map