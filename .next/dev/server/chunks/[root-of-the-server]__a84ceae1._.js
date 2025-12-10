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
"[project]/app/api/branches/register-backend/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const body = await request.json();
        const { branchId, name, location, county, address, organization } = body;
        console.log("[v0] Attempting backend registration with data:", {
            name,
            location,
            county,
            address
        });
        const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxMDY3NjgyLCJpYXQiOjE3NjEwNjQwODIsImp0aSI6ImZiMTA2ZDI2YmIwMDQxNTU5NjU0NWViY2U0ZDhkNjgwIiwidXNlcl9pZCI6IjQifQ.uUI2bDV8WA00a9_CIr5DPf7njaO929MZnYbpqIhi3IY";
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 10000) // 10 second timeout
        ;
        try {
            const backendResponse = await fetch("https://flow-360-backend-x6wvex-0ad73a-147-93-155-29.traefik.me/station/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    city: location,
                    county: county || location,
                    created_at: new Date().toISOString(),
                    id: branchId,
                    is_active: true,
                    location: address || location,
                    name: name,
                    organization: organization || "35c7be82-cc63-4e9d-ac34-a79bc2d7633b"
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log("[v0] Backend response status:", backendResponse.status);
            const contentType = backendResponse.headers.get("content-type");
            let responseData;
            if (contentType?.includes("application/json")) {
                responseData = await backendResponse.json();
            } else {
                responseData = await backendResponse.text();
            }
            console.log("[v0] Backend response data:", responseData);
            if (!backendResponse.ok || typeof responseData === "string" && responseData.toLowerCase().includes("invalid")) {
                console.error("[Backend API Error]:", responseData);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Backend registration failed",
                    details: typeof responseData === "string" ? responseData : JSON.stringify(responseData),
                    status: backendResponse.status
                }, {
                    status: backendResponse.ok ? 400 : backendResponse.status
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: responseData
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            let errorMessage = "Network error";
            if (fetchError.name === "AbortError") {
                errorMessage = "Request timed out after 10 seconds";
            } else if (fetchError.message?.includes("certificate")) {
                errorMessage = "SSL certificate validation failed";
            } else if (fetchError.message?.includes("ENOTFOUND") || fetchError.message?.includes("getaddrinfo")) {
                errorMessage = "Backend server not reachable (DNS lookup failed)";
            } else if (fetchError.message?.includes("ECONNREFUSED")) {
                errorMessage = "Backend server refused connection";
            }
            console.error("[Backend API Network Error]:", errorMessage, fetchError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: errorMessage,
                details: fetchError.message || String(fetchError),
                suggestion: "Branch created locally. Backend registration can be retried later."
            }, {
                status: 503
            });
        }
    } catch (error) {
        console.error("[Backend API Exception]:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to process backend registration",
            details: String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a84ceae1._.js.map