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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/app/api/receipt/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-route] (ecmascript)");
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
async function POST(request) {
    try {
        const body = await request.json();
        const { sale_id, branch_id } = body;
        if (!sale_id || !branch_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing sale_id or branch_id"
            }, {
                status: 400
            });
        }
        const client = await pool.connect();
        try {
            const saleResult = await client.query(`SELECT s.*, b.name as branch_name, b.kra_pin, b.bhf_id, b.address as branch_address,
                n.nozzle_number, d.dispenser_number
         FROM sales s
         LEFT JOIN branches b ON s.branch_id = b.id
         LEFT JOIN nozzles n ON s.nozzle_id = n.id
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
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
            const sale = saleResult.rows[0];
            const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                unit: 'mm',
                format: [
                    80,
                    200
                ]
            });
            const pageWidth = 80;
            let y = 5;
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("TAX INVOICE", pageWidth / 2, y, {
                align: "center"
            });
            y += 5;
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(sale.branch_name || "Flow360 Station", pageWidth / 2, y, {
                align: "center"
            });
            y += 4;
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.text(sale.branch_address || "Branch Address", pageWidth / 2, y, {
                align: "center"
            });
            y += 4;
            doc.text(`PIN: ${sale.kra_pin || 'N/A'}`, pageWidth / 2, y, {
                align: "center"
            });
            y += 5;
            doc.setLineWidth(0.1);
            doc.line(3, y, pageWidth - 3, y);
            y += 3;
            doc.text("Welcome to our shop", pageWidth / 2, y, {
                align: "center"
            });
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text("BUYER INFORMATION", pageWidth / 2, y, {
                align: "center"
            });
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.text(`Buyer PIN:     ${sale.customer_pin || 'NOT PROVIDED'}`, 5, y);
            y += 3;
            doc.text(`Buyer Name:    ${sale.customer_name || 'Walk-in Customer'}`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text("PRODUCT DETAILS", pageWidth / 2, y, {
                align: "center"
            });
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.text(`Fuel Type:     ${sale.fuel_type}`, 5, y);
            y += 3;
            doc.text(`Dispenser:     D${sale.dispenser_number || '00'}${sale.nozzle_number ? `N${sale.nozzle_number}` : ''}`, 5, y);
            y += 3;
            doc.text(`Nozzle No:     ${sale.nozzle_number || '1'}`, 5, y);
            y += 3;
            const unitPrice = parseFloat(sale.unit_price) || 0;
            const quantity = parseFloat(sale.quantity) || 0;
            const totalAmount = parseFloat(sale.total_amount) || 0;
            doc.text(`Unit Price:    KES ${unitPrice.toFixed(2)}`, 5, y);
            y += 3;
            doc.text(`Quantity:      ${quantity.toFixed(2)}L`, 5, y);
            y += 4;
            doc.text(`Discount:      (0.00)`, 5, y);
            y += 3;
            doc.setFont("helvetica", "bold");
            doc.text(`Total:         KES ${totalAmount.toFixed(2)}`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text("TAX BREAKDOWN", pageWidth / 2, y, {
                align: "center"
            });
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6);
            doc.text("Rate        Taxable        VAT", 5, y);
            y += 3;
            doc.line(3, y, pageWidth - 3, y);
            y += 3;
            const taxableAmount = totalAmount / 1.16;
            const vatAmount = totalAmount - taxableAmount;
            doc.text(`EX          KES 0.00       KES 0.00`, 5, y);
            y += 3;
            doc.text(`16%         KES ${taxableAmount.toFixed(2)}   KES ${vatAmount.toFixed(2)}`, 5, y);
            y += 3;
            doc.text(`0%          KES 0.00       KES 0.00`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFontSize(7);
            const saleDate = new Date(sale.sale_date);
            const dateStr = saleDate.toISOString().split('T')[0];
            const timeStr = saleDate.toTimeString().split(' ')[0];
            doc.text(`Date:      ${dateStr} ${timeStr.substring(0, 5)}`, 5, y);
            y += 3;
            doc.text(`Time:      ${timeStr}`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.text(`SCU ID: ${sale.kra_scu_id || 'N/A'}`, 5, y);
            y += 3;
            doc.text(`CU INV: ${sale.kra_cu_inv || 'N/A'}`, 5, y);
            y += 3;
            doc.text(`Internal: ${sale.kra_internal_data || sale.invoice_number || 'N/A'}`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text("KRA eTIMS QR Code:", pageWidth / 2, y, {
                align: "center"
            });
            y += 8;
            const kraPin = sale.kra_pin || '';
            const bhfId = sale.bhf_id || '00';
            const rcptSign = sale.kra_rcpt_sign || '';
            const qrData = `${kraPin}${bhfId}${rcptSign}`;
            const qrUrl = `https://etims-sbx.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=${qrData}`;
            const qrSize = 25;
            const qrX = (pageWidth - qrSize) / 2;
            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(qrX, y, qrSize, qrSize, 'FD');
            doc.setFontSize(4);
            doc.setFont("helvetica", "normal");
            const chars = qrData.substring(0, 100);
            const gridSize = 10;
            const cellSize = qrSize / gridSize;
            for(let row = 0; row < gridSize; row++){
                for(let col = 0; col < gridSize; col++){
                    const charIndex = row * gridSize + col;
                    if (charIndex < chars.length) {
                        const charCode = chars.charCodeAt(charIndex);
                        if (charCode % 2 === 0) {
                            doc.setFillColor(0);
                            doc.rect(qrX + col * cellSize, y + row * cellSize, cellSize, cellSize, 'F');
                        }
                    }
                }
            }
            y += qrSize + 4;
            doc.setFontSize(6);
            doc.text("Scan to verify with KRA eTIMS", pageWidth / 2, y, {
                align: "center"
            });
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            const receiptNo = sale.kra_cu_inv?.split('/')[1] || sale.invoice_number?.replace('INV-', '') || 'N/A';
            doc.setFontSize(7);
            doc.text(`Receipt No           ${receiptNo}`, 5, y);
            y += 3;
            doc.text(`Served by            System`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text("Carbon Emission Details", pageWidth / 2, y, {
                align: "center"
            });
            y += 4;
            doc.setFont("helvetica", "normal");
            const co2PerLitre = 2.7;
            const totalCo2 = quantity * co2PerLitre;
            doc.text(`CO2 Per Litre        ${co2PerLitre.toFixed(2)}kg`, 5, y);
            y += 3;
            doc.text(`Total CO2            ${totalCo2.toFixed(2)}kg`, 5, y);
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text("THANK YOU FOR SHOPPING WITH US", pageWidth / 2, y, {
                align: "center"
            });
            y += 5;
            doc.setFont("helvetica", "normal");
            doc.text("Powered by Flow360", pageWidth / 2, y, {
                align: "center"
            });
            y += 5;
            doc.line(3, y, pageWidth - 3, y);
            y += 3;
            doc.text("END OF LEGAL RECEIPT", pageWidth / 2, y, {
                align: "center"
            });
            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](pdfBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="receipt-${sale.invoice_number || sale.id}.pdf"`
                }
            });
        } finally{
            client.release();
        }
    } catch (error) {
        console.error("[Receipt Generate API Error]:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || "Failed to generate receipt"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ac5049c4._.js.map