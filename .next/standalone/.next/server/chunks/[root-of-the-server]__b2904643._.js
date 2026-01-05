module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),55503,e=>e.a(async(t,r)=>{try{var a=e.i(89171),n=e.i(30056),i=t([n]);[n]=i.then?(await i)():i;let l=new n.Pool({connectionString:process.env.DATABASE_URL});async function s(e){try{let{searchParams:t}=new URL(e.url),r=t.get("branch_id");if(!r)return a.NextResponse.json({error:"Branch ID required"},{status:400});let n=await l.connect();try{let e=new Date().toISOString().split("T")[0],t=await n.query(`SELECT * FROM sales 
         WHERE branch_id = $1 
         AND sale_date::date = $2::date
         ORDER BY sale_date DESC 
         LIMIT 50`,[r,e]),i=await n.query(`SELECT * FROM shifts 
         WHERE branch_id = $1 AND status = 'active' 
         ORDER BY start_time DESC 
         LIMIT 1`,[r]),s=await n.query(`SELECT n.id, CONCAT('D', d.dispenser_number, 'N', n.nozzle_number) as name, n.fuel_type 
         FROM nozzles n
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         WHERE n.branch_id = $1 AND n.status = 'active'
         ORDER BY d.dispenser_number, n.nozzle_number`,[r]),o=await n.query(`SELECT DISTINCT ON (
           CASE 
             WHEN UPPER(i.item_name) LIKE '%DIESEL%' THEN 'Diesel'
             WHEN UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%' THEN 'Petrol'
             WHEN UPPER(i.item_name) LIKE '%KEROSENE%' THEN 'Kerosene'
             ELSE i.item_name
           END
         )
           CASE 
             WHEN UPPER(i.item_name) LIKE '%DIESEL%' THEN 'Diesel'
             WHEN UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%' THEN 'Petrol'
             WHEN UPPER(i.item_name) LIKE '%KEROSENE%' THEN 'Kerosene'
             ELSE i.item_name
           END as fuel_type,
           bi.sale_price as price
         FROM branch_items bi
         JOIN items i ON bi.item_id = i.id
         WHERE bi.branch_id = $1
           AND bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND (UPPER(i.item_name) IN ('PETROL', 'DIESEL', 'KEROSENE', 'SUPER PETROL', 'V-POWER') 
                OR i.item_name ILIKE '%petrol%' 
                OR i.item_name ILIKE '%diesel%'
                OR i.item_name ILIKE '%kerosene%')
         ORDER BY 
           CASE 
             WHEN UPPER(i.item_name) LIKE '%DIESEL%' THEN 'Diesel'
             WHEN UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%' THEN 'Petrol'
             WHEN UPPER(i.item_name) LIKE '%KEROSENE%' THEN 'Kerosene'
             ELSE i.item_name
           END,
           bi.updated_at DESC NULLS LAST`,[r]);return a.NextResponse.json({sales:t.rows||[],shift:i.rows[0]||null,nozzles:s.rows||[],fuel_prices:o.rows||[]})}finally{n.release()}}catch(e){return console.error("[Mobile Sales API Error]:",e),a.NextResponse.json({error:"Failed to fetch sales data"},{status:500})}}async function o(e){try{let{branch_id:t,shift_id:r,nozzle_id:n,fuel_type:i,amount:s,payment_method:o,customer_name:d,vehicle_number:u,staff_id:E}=await e.json();if(!t||!i||!s)return a.NextResponse.json({error:"Branch ID, fuel type, and amount are required"},{status:400});let c=await l.connect();try{await c.query("BEGIN");let e=await c.query(`SELECT bi.sale_price as price
         FROM branch_items bi
         JOIN items i ON bi.item_id = i.id
         WHERE bi.branch_id = $1
           AND bi.is_available = true
           AND bi.sale_price IS NOT NULL
           AND bi.sale_price > 0
           AND (
             UPPER(i.item_name) = UPPER($2)
             OR i.item_name ILIKE $3
             OR (UPPER($2) = 'PETROL' AND (UPPER(i.item_name) LIKE '%PETROL%' OR UPPER(i.item_name) LIKE '%SUPER%'))
             OR (UPPER($2) = 'DIESEL' AND UPPER(i.item_name) LIKE '%DIESEL%')
             OR (UPPER($2) = 'KEROSENE' AND UPPER(i.item_name) LIKE '%KEROSENE%')
           )
         ORDER BY bi.updated_at DESC NULLS LAST
         LIMIT 1`,[t,i,`%${i}%`]);if(0===e.rows.length)return await c.query("ROLLBACK"),a.NextResponse.json({error:`No price configured for ${i} in branch_items. Please set a price in Inventory Management.`},{status:400});let l=parseFloat(e.rows[0].price),p=parseFloat(s),R=p/l,m=null,N=null,_=0,h=0;if(n){let e=await c.query(`SELECT t.id, t.tank_name, t.current_stock 
           FROM nozzles n
           LEFT JOIN dispensers d ON n.dispenser_id = d.id
           LEFT JOIN tanks t ON d.tank_id = t.id
           WHERE n.id = $1 AND t.id IS NOT NULL`,[n]);e.rows.length>0&&(m=e.rows[0].id,N=e.rows[0].tank_name,_=parseFloat(e.rows[0].current_stock)||0)}if(!m){let e=await c.query(`SELECT id, tank_name, current_stock 
           FROM tanks 
           WHERE branch_id = $1 AND fuel_type ILIKE $2 AND status = 'active'
           ORDER BY current_stock DESC 
           LIMIT 1`,[t,`%${i}%`]);e.rows.length>0&&(m=e.rows[0].id,N=e.rows[0].tank_name,_=parseFloat(e.rows[0].current_stock)||0)}let P=null;m&&(h=Math.max(0,_-R),await c.query("UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2",[h,m]),P={tankId:m,tankName:N,previousStock:_,newStock:h,quantityDeducted:R});let O=`INV-${Date.now()}`,w=`RCP-${Date.now()}`,I=await c.query(`INSERT INTO sales (
          branch_id, shift_id, nozzle_id, fuel_type, quantity, 
          unit_price, total_amount, payment_method, customer_name, 
          vehicle_number, invoice_number, receipt_number, sale_date, staff_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
        RETURNING *`,[t,r||null,n||null,i,R,l,p,o||"cash",d||null,u||null,O,w,E||null]);return await c.query("COMMIT"),a.NextResponse.json({success:!0,sale:I.rows[0],tankUpdate:P})}catch(e){throw await c.query("ROLLBACK"),e}finally{c.release()}}catch(e){return console.error("[Mobile Sales API Error]:",e),a.NextResponse.json({error:"Failed to record sale"},{status:500})}}e.s(["GET",()=>s,"POST",()=>o]),r()}catch(e){r(e)}},!1),60974,e=>e.a(async(t,r)=>{try{var a=e.i(47909),n=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),l=e.i(14444),d=e.i(37092),u=e.i(69741),E=e.i(16795),c=e.i(87718),p=e.i(95169),R=e.i(47587),m=e.i(66012),N=e.i(70101),_=e.i(26937),h=e.i(10372),P=e.i(93695);e.i(52474);var O=e.i(220),w=e.i(55503),I=t([w]);[w]=I.then?(await I)():I;let S=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/mobile/sales/route",pathname:"/api/mobile/sales",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/mobile/sales/route.ts",nextConfigOutput:"standalone",userland:w}),{workAsyncStorage:T,workUnitAsyncStorage:y,serverHooks:b}=S;function L(){return(0,i.patchFetch)({workAsyncStorage:T,workUnitAsyncStorage:y})}async function x(e,t,r){S.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/mobile/sales/route";a=a.replace(/\/index$/,"")||"/";let i=await S.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:w,params:I,nextConfig:L,parsedUrl:x,isDraftMode:T,prerenderManifest:y,routerServerContext:b,isOnDemandRevalidate:f,revalidateOnlyGenerated:v,resolvedPathname:D,clientReferenceManifest:A,serverActionsManifest:C}=i,g=(0,u.normalizeAppPath)(a),U=!!(y.dynamicRoutes[g]||y.routes[D]),H=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,x,!1):t.end("This page could not be found"),null);if(U&&!T){let e=!!y.routes[D],t=y.dynamicRoutes[g];if(t&&!1===t.fallback&&!e){if(L.experimental.adapterPath)return await H();throw new P.NoFallbackError}}let $=null;!U||S.isDev||T||($=D,$="/index"===$?"/":$);let K=!0===S.isDev||!U,q=U&&!K;C&&A&&(0,l.setReferenceManifestsSingleton)({page:a,clientReferenceManifest:A,serverActionsManifest:C,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:C})});let k=e.method||"GET",M=(0,o.getTracer)(),j=M.getActiveScopeSpan(),F={params:I,prerenderManifest:y,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:K,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:L.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a)=>S.onRequestError(e,t,a,b)},sharedContext:{buildId:w}},W=new E.NodeNextRequest(e),B=new E.NodeNextResponse(t),z=c.NextRequestAdapter.fromNodeNextRequest(W,(0,c.signalFromNodeResponse)(t));try{let i=async e=>S.handle(z,F).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${a}`)}),l=!!(0,s.getRequestMeta)(e,"minimalMode"),d=async s=>{var o,d;let u=async({previousCacheEntry:n})=>{try{if(!l&&f&&v&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await i(s);e.fetchMetrics=F.renderOpts.fetchMetrics;let o=F.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let d=F.renderOpts.collectedTags;if(!U)return await (0,m.sendResponse)(W,B,a,F.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,N.toNodeOutgoingHttpHeaders)(a.headers);d&&(t[h.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==F.renderOpts.collectedRevalidate&&!(F.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&F.renderOpts.collectedRevalidate,n=void 0===F.renderOpts.collectedExpire||F.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:F.renderOpts.collectedExpire;return{value:{kind:O.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,R.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:f})},b),t}},E=await S.handleResponse({req:e,nextConfig:L,cacheKey:$,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:v,responseGenerator:u,waitUntil:r.waitUntil,isMinimalMode:l});if(!U)return null;if((null==E||null==(o=E.value)?void 0:o.kind)!==O.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(d=E.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",f?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),T&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,N.fromNodeOutgoingHttpHeaders)(E.value.headers);return l&&U||c.delete(h.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,_.getCacheControlHeader)(E.cacheControl)),await (0,m.sendResponse)(W,B,new Response(E.value.body,{headers:c,status:E.value.status||200})),null};j?await d(j):await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${k} ${a}`,kind:o.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},d))}catch(t){if(t instanceof P.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,R.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:f})}),U)throw t;return await (0,m.sendResponse)(W,B,new Response(null,{status:500})),null}}e.s(["handler",()=>x,"patchFetch",()=>L,"routeModule",()=>S,"serverHooks",()=>b,"workAsyncStorage",()=>T,"workUnitAsyncStorage",()=>y]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__b2904643._.js.map