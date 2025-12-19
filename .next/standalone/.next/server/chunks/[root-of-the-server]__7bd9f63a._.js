module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),90793,e=>e.a(async(t,r)=>{try{var a=e.i(30056),n=t([a]);[a]=n.then?(await n)():n;let i=new a.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});async function s(e,t){let r=await i.connect();try{return(await r.query(e,t)).rows}finally{r.release()}}e.s(["pool",()=>i,"query",()=>s]),r()}catch(e){r(e)}},!1),70038,e=>e.a(async(t,r)=>{try{var a=e.i(90793),n=t([a]);[a]=n.then?(await n)():n,e.s([]),r()}catch(e){r(e)}},!1),15157,e=>e.a(async(t,r)=>{try{var a=e.i(89171),n=e.i(70038),s=e.i(90793),i=t([n,s]);async function o(e){try{let t,{searchParams:r}=new URL(e.url),n=r.get("vendor_id"),i=r.get("user_id"),o=r.get("branch_id"),l=null;if(n)l=n;else if(i){let e=await (0,s.query)(`SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,[i]);e&&e.length>0&&(l=e[0].vendor_id)}return t=o?await (0,s.query)(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE s.branch_id = $1
        ORDER BY s.created_at DESC
      `,[o]):l?await (0,s.query)(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE b.vendor_id = $1
        ORDER BY s.created_at DESC
      `,[l]):await (0,s.query)(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        ORDER BY s.created_at DESC
      `),a.NextResponse.json({staff:t})}catch(e){return console.error("Error fetching staff:",e),a.NextResponse.json({error:"Failed to fetch staff",details:e.message},{status:500})}}[n,s]=i.then?(await i)():i,e.s(["GET",()=>o]),r()}catch(e){r(e)}},!1),18418,e=>e.a(async(t,r)=>{try{var a=e.i(47909),n=e.i(74017),s=e.i(96250),i=e.i(59756),o=e.i(61916),l=e.i(14444),d=e.i(37092),u=e.i(69741),c=e.i(16795),p=e.i(87718),h=e.i(95169),f=e.i(47587),R=e.i(66012),x=e.i(70101),E=e.i(26937),v=e.i(10372),m=e.i(93695);e.i(52474);var y=e.i(220),b=e.i(15157),w=t([b]);[b]=w.then?(await w)():w;let C=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/staff/list/route",pathname:"/api/staff/list",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/staff/list/route.ts",nextConfigOutput:"standalone",userland:b}),{workAsyncStorage:O,workUnitAsyncStorage:N,serverHooks:T}=C;function g(){return(0,s.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:N})}async function _(e,t,r){C.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/staff/list/route";a=a.replace(/\/index$/,"")||"/";let s=await C.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:b,params:w,nextConfig:g,parsedUrl:_,isDraftMode:O,prerenderManifest:N,routerServerContext:T,isOnDemandRevalidate:A,revalidateOnlyGenerated:S,resolvedPathname:q,clientReferenceManifest:P,serverActionsManifest:k}=s,j=(0,u.normalizeAppPath)(a),D=!!(N.dynamicRoutes[j]||N.routes[q]),H=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,_,!1):t.end("This page could not be found"),null);if(D&&!O){let e=!!N.routes[q],t=N.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(g.experimental.adapterPath)return await H();throw new m.NoFallbackError}}let M=null;!D||C.isDev||O||(M=q,M="/index"===M?"/":M);let I=!0===C.isDev||!D,U=D&&!I;k&&P&&(0,l.setReferenceManifestsSingleton)({page:a,clientReferenceManifest:P,serverActionsManifest:k,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:k})});let F=e.method||"GET",L=(0,o.getTracer)(),$=L.getActiveScopeSpan(),B={params:w,prerenderManifest:N,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:I,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:g.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a)=>C.onRequestError(e,t,a,T)},sharedContext:{buildId:b}},K=new c.NodeNextRequest(e),W=new c.NodeNextResponse(t),G=p.NextRequestAdapter.fromNodeNextRequest(K,(0,p.signalFromNodeResponse)(t));try{let s=async e=>C.handle(G,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=L.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==h.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${F} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${F} ${a}`)}),l=!!(0,i.getRequestMeta)(e,"minimalMode"),d=async i=>{var o,d;let u=async({previousCacheEntry:n})=>{try{if(!l&&A&&S&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let d=B.renderOpts.collectedTags;if(!D)return await (0,R.sendResponse)(K,W,a,B.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,x.toNodeOutgoingHttpHeaders)(a.headers);d&&(t[v.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=v.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=v.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,f.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:A})},T),t}},c=await C.handleResponse({req:e,nextConfig:g,cacheKey:M,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:r.waitUntil,isMinimalMode:l});if(!D)return null;if((null==c||null==(o=c.value)?void 0:o.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",A?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,x.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&D||p.delete(v.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,E.getCacheControlHeader)(c.cacheControl)),await (0,R.sendResponse)(K,W,new Response(c.value.body,{headers:p,status:c.value.status||200})),null};$?await d($):await L.withPropagatedContext(e.headers,()=>L.trace(h.BaseServerSpan.handleRequest,{spanName:`${F} ${a}`,kind:o.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},d))}catch(t){if(t instanceof m.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,f.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:A})}),D)throw t;return await (0,R.sendResponse)(K,W,new Response(null,{status:500})),null}}e.s(["handler",()=>_,"patchFetch",()=>g,"routeModule",()=>C,"serverHooks",()=>T,"workAsyncStorage",()=>O,"workUnitAsyncStorage",()=>N]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__7bd9f63a._.js.map