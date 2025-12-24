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
"[project]/app/api/headquarters/purchase-orders/[id]/pdf/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL
});
async function GET(request, { params }) {
    try {
        const { id } = await params;
        const orderResult = await pool.query(`
      SELECT 
        po.*,
        b.name as branch_name,
        vp.name as supplier_name,
        vp.tin as supplier_tin,
        vp.physical_address as supplier_address,
        vp.phone as supplier_phone,
        tp.name as transporter_name,
        u.username as created_by_name,
        au.username as approved_by_name
      FROM purchase_orders po
      LEFT JOIN branches b ON po.branch_id = b.id
      LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
      LEFT JOIN vendor_partners tp ON po.transporter_id = tp.id
      LEFT JOIN users u ON po.created_by = u.id
      LEFT JOIN users au ON po.approved_by = au.id
      WHERE po.id = $1
    `, [
            id
        ]);
        if (orderResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Purchase order not found"
            }, {
                status: 404
            });
        }
        const order = orderResult.rows[0];
        const itemsResult = await pool.query(`
      SELECT 
        poi.*,
        i.item_name
      FROM purchase_order_items poi
      LEFT JOIN items i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = $1
      ORDER BY poi.created_at
    `, [
            id
        ]);
        const items = itemsResult.rows;
        const acceptanceResult = await pool.query(`
      SELECT 
        poa.*,
        u.username as accepted_by_name
      FROM purchase_order_acceptances poa
      LEFT JOIN users u ON poa.accepted_by = u.id
      WHERE poa.purchase_order_id = $1
      ORDER BY poa.acceptance_timestamp DESC
      LIMIT 1
    `, [
            id
        ]);
        const acceptance = acceptanceResult.rows[0] || null;
        let tankReadings = [];
        let dispenserReadings = [];
        if (acceptance) {
            const tankResult = await pool.query(`
        SELECT 
          ptr.*,
          t.tank_name
        FROM po_acceptance_tank_readings ptr
        LEFT JOIN tanks t ON ptr.tank_id = t.id
        WHERE ptr.acceptance_id = $1
      `, [
                acceptance.id
            ]);
            tankReadings = tankResult.rows;
            const dispenserResult = await pool.query(`
        SELECT 
          pdr.*,
          d.dispenser_number
        FROM po_acceptance_dispenser_readings pdr
        LEFT JOIN dispensers d ON pdr.dispenser_id = d.id
        WHERE pdr.acceptance_id = $1
      `, [
                acceptance.id
            ]);
            dispenserReadings = dispenserResult.rows;
        }
        const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("PURCHASE ORDER", pageWidth / 2, 20, {
            align: "center"
        });
        doc.setFontSize(14);
        doc.text(order.po_number, pageWidth / 2, 28, {
            align: "center"
        });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let yPos = 40;
        const leftCol = 14;
        const rightCol = pageWidth / 2 + 5;
        // Order Details (Left Column)
        doc.setFont("helvetica", "bold");
        doc.text("Order Details", leftCol, yPos);
        // Transport Details (Right Column)
        if (order.transporter_name || order.vehicle_registration || order.driver_name) {
            doc.text("Transport Details", rightCol, yPos);
        }
        yPos += 6;
        doc.setFont("helvetica", "normal");
        const orderDetails = [
            [
                "Branch:",
                order.branch_name || "N/A"
            ],
            [
                "Supplier:",
                order.supplier_name || "N/A"
            ],
            [
                "Supplier TIN:",
                order.supplier_tin || "N/A"
            ],
            [
                "Status:",
                `${order.status} / ${order.approval_status}`
            ],
            [
                "Issued:",
                order.issued_at ? new Date(order.issued_at).toLocaleDateString() : "N/A"
            ],
            [
                "Expected:",
                order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "N/A"
            ],
            [
                "Created By:",
                order.created_by_name || "N/A"
            ]
        ];
        if (order.approved_by_name) {
            orderDetails.push([
                "Approved By:",
                order.approved_by_name
            ]);
        }
        const transportDetails = [];
        if (order.transporter_name) {
            transportDetails.push([
                "Transporter:",
                order.transporter_name
            ]);
        }
        if (order.vehicle_registration) {
            transportDetails.push([
                "Vehicle:",
                order.vehicle_registration
            ]);
        }
        if (order.driver_name) {
            transportDetails.push([
                "Driver:",
                order.driver_name
            ]);
        }
        if (order.driver_phone) {
            transportDetails.push([
                "Driver Phone:",
                order.driver_phone
            ]);
        }
        if (order.transport_cost) {
            transportDetails.push([
                "Transport Cost:",
                `KES ${parseFloat(order.transport_cost).toLocaleString()}`
            ]);
        }
        const maxRows = Math.max(orderDetails.length, transportDetails.length);
        for(let i = 0; i < maxRows; i++){
            if (orderDetails[i]) {
                doc.text(`${orderDetails[i][0]} ${orderDetails[i][1]}`, leftCol, yPos);
            }
            if (transportDetails[i]) {
                doc.text(`${transportDetails[i][0]} ${transportDetails[i][1]}`, rightCol, yPos);
            }
            yPos += 5;
        }
        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Order Items", 14, yPos);
        yPos += 4;
        const totalQuantity = items.reduce((sum, item)=>sum + (parseFloat(item.quantity) || 0), 0);
        const totalAmount = items.reduce((sum, item)=>sum + (parseFloat(item.total_amount) || 0), 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: yPos,
            head: [
                [
                    "Item",
                    "Quantity (L)",
                    "Unit Price",
                    "Total"
                ]
            ],
            body: items.map((item)=>[
                    item.item_name || "Unknown Item",
                    parseFloat(item.quantity).toLocaleString(),
                    `KES ${parseFloat(item.unit_price).toLocaleString()}`,
                    `KES ${parseFloat(item.total_amount).toLocaleString()}`
                ]),
            foot: [
                [
                    "TOTAL",
                    `${totalQuantity.toLocaleString()} L`,
                    "",
                    `KES ${totalAmount.toLocaleString()}`
                ]
            ],
            theme: "striped",
            headStyles: {
                fillColor: [
                    41,
                    128,
                    185
                ]
            },
            footStyles: {
                fillColor: [
                    236,
                    240,
                    241
                ],
                textColor: [
                    0,
                    0,
                    0
                ],
                fontStyle: "bold"
            }
        });
        yPos = doc.lastAutoTable.finalY + 10;
        if (acceptance) {
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("DELIVERY ACCEPTANCE", 14, yPos);
            yPos += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const acceptanceDetails = [
                [
                    "Accepted By:",
                    acceptance.accepted_by_name || "N/A"
                ],
                [
                    "Acceptance Date:",
                    acceptance.acceptance_timestamp ? new Date(acceptance.acceptance_timestamp).toLocaleString() : "N/A"
                ],
                [
                    "Bowser Volume:",
                    `${parseFloat(acceptance.bowser_volume).toLocaleString()} L`
                ],
                [
                    "Total Variance:",
                    `${parseFloat(acceptance.total_variance).toLocaleString()} L`
                ]
            ];
            if (acceptance.dips_mm) {
                acceptanceDetails.push([
                    "Dips (mm):",
                    acceptance.dips_mm.toString()
                ]);
            }
            if (acceptance.remarks) {
                acceptanceDetails.push([
                    "Remarks:",
                    acceptance.remarks
                ]);
            }
            acceptanceDetails.forEach(([label, value])=>{
                doc.text(`${label} ${value}`, 14, yPos);
                yPos += 5;
            });
            if (tankReadings.length > 0) {
                yPos += 5;
                doc.setFont("helvetica", "bold");
                doc.text("Tank Readings", 14, yPos);
                yPos += 4;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(doc, {
                    startY: yPos,
                    head: [
                        [
                            "Tank",
                            "Volume Before (L)",
                            "Volume After (L)",
                            "Received (L)"
                        ]
                    ],
                    body: tankReadings.map((tr)=>[
                            tr.tank_name || "Unknown Tank",
                            parseFloat(tr.volume_before).toLocaleString(),
                            parseFloat(tr.volume_after).toLocaleString(),
                            (parseFloat(tr.volume_after) - parseFloat(tr.volume_before)).toLocaleString()
                        ]),
                    theme: "striped",
                    headStyles: {
                        fillColor: [
                            39,
                            174,
                            96
                        ]
                    }
                });
                yPos = doc.lastAutoTable.finalY + 8;
            }
            if (dispenserReadings.length > 0) {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setFont("helvetica", "bold");
                doc.text("Dispenser Readings", 14, yPos);
                yPos += 4;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(doc, {
                    startY: yPos,
                    head: [
                        [
                            "Dispenser",
                            "Meter Before",
                            "Meter After",
                            "Difference"
                        ]
                    ],
                    body: dispenserReadings.map((dr)=>[
                            `Dispenser ${dr.dispenser_number}`,
                            parseFloat(dr.meter_reading_before).toLocaleString(),
                            parseFloat(dr.meter_reading_after).toLocaleString(),
                            (parseFloat(dr.meter_reading_after) - parseFloat(dr.meter_reading_before)).toLocaleString()
                        ]),
                    theme: "striped",
                    headStyles: {
                        fillColor: [
                            155,
                            89,
                            182
                        ]
                    }
                });
                yPos = doc.lastAutoTable.finalY + 8;
            }
            // Variance Calculation Summary
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }
            const tankIncrease = tankReadings.reduce((sum, tr)=>sum + (parseFloat(tr.volume_after) - parseFloat(tr.volume_before)), 0);
            const dispenserDiff = dispenserReadings.reduce((sum, dr)=>sum + (parseFloat(dr.meter_reading_after) - parseFloat(dr.meter_reading_before)), 0);
            const bowserVolume = parseFloat(acceptance.bowser_volume) || 0;
            const calculatedVariance = tankIncrease + dispenserDiff - bowserVolume;
            yPos += 5;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("Variance Calculation", 14, yPos);
            yPos += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(doc, {
                startY: yPos,
                head: [
                    [
                        "Description",
                        "Volume (L)"
                    ]
                ],
                body: [
                    [
                        "Tank Volume Increase (After - Before)",
                        tankIncrease.toLocaleString()
                    ],
                    [
                        "Dispenser Difference (After - Before)",
                        dispenserDiff.toLocaleString()
                    ],
                    [
                        "Total Received (Tank + Dispenser)",
                        (tankIncrease + dispenserDiff).toLocaleString()
                    ],
                    [
                        "Bowser Volume (Delivered)",
                        bowserVolume.toLocaleString()
                    ]
                ],
                foot: [
                    [
                        "VARIANCE (Received - Delivered)",
                        `${calculatedVariance >= 0 ? "+" : ""}${calculatedVariance.toLocaleString()} L`
                    ]
                ],
                theme: "striped",
                headStyles: {
                    fillColor: [
                        231,
                        76,
                        60
                    ]
                },
                footStyles: {
                    fillColor: calculatedVariance < 0 ? [
                        231,
                        76,
                        60
                    ] : [
                        39,
                        174,
                        96
                    ],
                    textColor: [
                        255,
                        255,
                        255
                    ],
                    fontStyle: "bold"
                }
            });
        }
        if (order.notes) {
            yPos = doc.lastAutoTable?.finalY + 10 || yPos + 10;
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont("helvetica", "bold");
            doc.text("Notes:", 14, yPos);
            yPos += 5;
            doc.setFont("helvetica", "normal");
            doc.text(order.notes, 14, yPos, {
                maxWidth: pageWidth - 28
            });
        }
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++){
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
                align: "center"
            });
        }
        const pdfBuffer = doc.output("arraybuffer");
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${order.po_number}.pdf"`
            }
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to generate PDF"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ddb01559._.js.map