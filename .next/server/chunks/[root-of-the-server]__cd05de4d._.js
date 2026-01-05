module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,a)=>{try{let t=await e.y("pg");e.n(t),a()}catch(e){a(e)}},!0),90793,e=>e.a(async(t,a)=>{try{var r=e.i(30056),n=t([r]);[r]=n.then?(await n)():n;let o=new r.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});async function s(e,t){let a=await o.connect();try{return(await a.query(e,t)).rows}finally{a.release()}}async function i(){return await o.connect()}e.s(["getClient",()=>i,"pool",()=>o,"query",()=>s]),a()}catch(e){a(e)}},!1),70038,e=>e.a(async(t,a)=>{try{var r=e.i(90793),n=t([r]);[r]=n.then?(await n)():n,e.s([]),a()}catch(e){a(e)}},!1),89996,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(70038),s=e.i(90793),i=t([n,s]);async function o(e){try{let t,{searchParams:a}=new URL(e.url),n=a.get("branch_id"),i=a.get("vendor_id"),o=a.get("user_id"),c=i;if(o&&!c){let e=await (0,s.query)(`SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,[o]);e&&e.length>0&&(c=e[0].vendor_id)}return t=n?await (0,s.query)(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.cust_tin as kra_pin,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.branch_id = $1 AND c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `,[n]):c?await (0,s.query)(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.cust_tin as kra_pin,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE b.vendor_id = $1 AND c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `,[c]):await (0,s.query)(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.cust_tin as kra_pin,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `),r.NextResponse.json({customers:t})}catch(e){return console.error("Error fetching customers:",e),r.NextResponse.json({error:"Failed to fetch customers",details:e.message},{status:500})}}[n,s]=i.then?(await i)():i,e.s(["GET",()=>o]),a()}catch(e){a(e)}},!1),16778,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),s=e.i(96250),i=e.i(59756),o=e.i(61916),c=e.i(14444),l=e.i(37092),u=e.i(69741),d=e.i(16795),p=e.i(87718),_=e.i(95169),h=e.i(47587),E=e.i(66012),m=e.i(70101),R=e.i(26937),y=e.i(10372),b=e.i(93695);e.i(52474);var v=e.i(220),x=e.i(89996),C=t([x]);[x]=C.then?(await C)():C;let O=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/customers/list/route",pathname:"/api/customers/list",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/customers/list/route.ts",nextConfigOutput:"standalone",userland:x}),{workAsyncStorage:f,workUnitAsyncStorage:A,serverHooks:N}=O;function w(){return(0,s.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:A})}async function g(e,t,a){O.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/customers/list/route";r=r.replace(/\/index$/,"")||"/";let s=await O.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:x,params:C,nextConfig:w,parsedUrl:g,isDraftMode:f,prerenderManifest:A,routerServerContext:N,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,resolvedPathname:M,clientReferenceManifest:H,serverActionsManifest:L}=s,D=(0,u.normalizeAppPath)(r),q=!!(A.dynamicRoutes[D]||A.routes[M]),F=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,g,!1):t.end("This page could not be found"),null);if(q&&!f){let e=!!A.routes[M],t=A.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await F();throw new b.NoFallbackError}}let U=null;!q||O.isDev||f||(U=M,U="/index"===U?"/":U);let k=!0===O.isDev||!q,P=q&&!k;L&&H&&(0,c.setReferenceManifestsSingleton)({page:r,clientReferenceManifest:H,serverActionsManifest:L,serverModuleMap:(0,l.createServerModuleMap)({serverActionsManifest:L})});let j=e.method||"GET",I=(0,o.getTracer)(),W=I.getActiveScopeSpan(),$={params:C,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:k,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>O.onRequestError(e,t,r,N)},sharedContext:{buildId:x}},B=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),X=p.NextRequestAdapter.fromNodeNextRequest(B,(0,p.signalFromNodeResponse)(t));try{let s=async e=>O.handle(X,$).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=I.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==_.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${j} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${j} ${r}`)}),c=!!(0,i.getRequestMeta)(e,"minimalMode"),l=async i=>{var o,l;let u=async({previousCacheEntry:n})=>{try{if(!c&&T&&S&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(i);e.fetchMetrics=$.renderOpts.fetchMetrics;let o=$.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=$.renderOpts.collectedTags;if(!q)return await (0,E.sendResponse)(B,K,r,$.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[y.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==$.renderOpts.collectedRevalidate&&!($.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&$.renderOpts.collectedRevalidate,n=void 0===$.renderOpts.collectedExpire||$.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:$.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:T})},N),t}},d=await O.handleResponse({req:e,nextConfig:w,cacheKey:U,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:c});if(!q)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});c||t.setHeader("x-nextjs-cache",T?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,m.fromNodeOutgoingHttpHeaders)(d.value.headers);return c&&q||p.delete(y.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,R.getCacheControlHeader)(d.cacheControl)),await (0,E.sendResponse)(B,K,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};W?await l(W):await I.withPropagatedContext(e.headers,()=>I.trace(_.BaseServerSpan.handleRequest,{spanName:`${j} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},l))}catch(t){if(t instanceof b.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:T})}),q)throw t;return await (0,E.sendResponse)(B,K,new Response(null,{status:500})),null}}e.s(["handler",()=>g,"patchFetch",()=>w,"routeModule",()=>O,"serverHooks",()=>N,"workAsyncStorage",()=>f,"workUnitAsyncStorage",()=>A]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__cd05de4d._.js.map