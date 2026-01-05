module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),35341,e=>e.a(async(t,r)=>{try{var a=e.i(89171),n=e.i(30056),s=t([n]);[n]=s.then?(await s)():s;let l=new n.Pool({connectionString:process.env.DATABASE_URL});async function i(e){try{let{searchParams:t}=new URL(e.url),r=t.get("branch_id"),n=t.get("user_id"),s=t.get("date_from"),i=t.get("date_to"),o=parseInt(t.get("limit")||"100"),d=await l.connect();try{let e=`
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
      `,t=[],l=1;r&&(e+=` AND s.branch_id = $${l}`,t.push(r),l++),n&&(e+=` AND s.staff_id = $${l}`,t.push(n),l++),s&&(e+=` AND DATE(s.sale_date) >= $${l}`,t.push(s),l++),i&&(e+=` AND DATE(s.sale_date) <= $${l}`,t.push(i),l++),e+=` ORDER BY s.sale_date DESC LIMIT $${l}`,t.push(o);let u=await d.query(e,t);return a.NextResponse.json({sales:u.rows})}finally{d.release()}}catch(e){return console.error("Error fetching mobile invoices:",e),a.NextResponse.json({sales:[]})}}async function o(e){try{let{customer_name:t,customer_phone:r,items:n,subtotal:s,tax:i,total:o,user_id:d,branch_id:u}=await e.json(),c=await l.connect();try{let e=`INV-${Date.now().toString(36).toUpperCase()}`,l=(await c.query(`
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
      `,[e,t||"Walk-in Customer",r,u||null,s,i,o,d||null])).rows[0];if(n&&n.length>0&&l)for(let e of n)await c.query(`
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
          `,[l.id,e.product_id,e.product_name,e.quantity,e.unit_price,e.discount||0,e.total]);return a.NextResponse.json(l)}finally{c.release()}}catch(e){return console.error("Error creating mobile invoice:",e),a.NextResponse.json({error:"Failed to create invoice"},{status:500})}}e.s(["GET",()=>i,"POST",()=>o]),r()}catch(e){r(e)}},!1),12390,e=>e.a(async(t,r)=>{try{var a=e.i(47909),n=e.i(74017),s=e.i(96250),i=e.i(59756),o=e.i(61916),l=e.i(14444),d=e.i(37092),u=e.i(69741),c=e.i(16795),p=e.i(87718),h=e.i(95169),_=e.i(47587),m=e.i(66012),R=e.i(70101),v=e.i(26937),x=e.i(10372),E=e.i(93695);e.i(52474);var f=e.i(220),g=e.i(35341),y=t([g]);[g]=y.then?(await y)():y;let N=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/mobile/invoices/route",pathname:"/api/mobile/invoices",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/mobile/invoices/route.ts",nextConfigOutput:"standalone",userland:g}),{workAsyncStorage:A,workUnitAsyncStorage:C,serverHooks:T}=N;function b(){return(0,s.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:C})}async function w(e,t,r){N.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/mobile/invoices/route";a=a.replace(/\/index$/,"")||"/";let s=await N.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:g,params:y,nextConfig:b,parsedUrl:w,isDraftMode:A,prerenderManifest:C,routerServerContext:T,isOnDemandRevalidate:$,revalidateOnlyGenerated:S,resolvedPathname:O,clientReferenceManifest:k,serverActionsManifest:q}=s,I=(0,u.normalizeAppPath)(a),P=!!(C.dynamicRoutes[I]||C.routes[O]),D=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,w,!1):t.end("This page could not be found"),null);if(P&&!A){let e=!!C.routes[O],t=C.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(b.experimental.adapterPath)return await D();throw new E.NoFallbackError}}let j=null;!P||N.isDev||A||(j=O,j="/index"===j?"/":j);let U=!0===N.isDev||!P,H=P&&!U;q&&k&&(0,l.setReferenceManifestsSingleton)({page:a,clientReferenceManifest:k,serverActionsManifest:q,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:q})});let M=e.method||"GET",L=(0,o.getTracer)(),F=L.getActiveScopeSpan(),K={params:y,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!b.experimental.authInterrupts},cacheComponents:!!b.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:b.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a)=>N.onRequestError(e,t,a,T)},sharedContext:{buildId:g}},B=new c.NodeNextRequest(e),V=new c.NodeNextResponse(t),G=p.NextRequestAdapter.fromNodeNextRequest(B,(0,p.signalFromNodeResponse)(t));try{let s=async e=>N.handle(G,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=L.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==h.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${M} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${M} ${a}`)}),l=!!(0,i.getRequestMeta)(e,"minimalMode"),d=async i=>{var o,d;let u=async({previousCacheEntry:n})=>{try{if(!l&&$&&S&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await s(i);e.fetchMetrics=K.renderOpts.fetchMetrics;let o=K.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let d=K.renderOpts.collectedTags;if(!P)return await (0,m.sendResponse)(B,V,a,K.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(a.headers);d&&(t[x.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await N.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,_.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:$})},T),t}},c=await N.handleResponse({req:e,nextConfig:b,cacheKey:j,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:$,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:r.waitUntil,isMinimalMode:l});if(!P)return null;if((null==c||null==(o=c.value)?void 0:o.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",$?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,R.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&P||p.delete(x.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,v.getCacheControlHeader)(c.cacheControl)),await (0,m.sendResponse)(B,V,new Response(c.value.body,{headers:p,status:c.value.status||200})),null};F?await d(F):await L.withPropagatedContext(e.headers,()=>L.trace(h.BaseServerSpan.handleRequest,{spanName:`${M} ${a}`,kind:o.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},d))}catch(t){if(t instanceof E.NoFallbackError||await N.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,_.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:$})}),P)throw t;return await (0,m.sendResponse)(B,V,new Response(null,{status:500})),null}}e.s(["handler",()=>w,"patchFetch",()=>b,"routeModule",()=>N,"serverHooks",()=>T,"workAsyncStorage",()=>A,"workUnitAsyncStorage",()=>C]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0aa70984._.js.map