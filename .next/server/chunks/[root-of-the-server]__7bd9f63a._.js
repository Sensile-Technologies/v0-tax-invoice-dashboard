module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,a)=>{try{let t=await e.y("pg");e.n(t),a()}catch(e){a(e)}},!0),90793,e=>e.a(async(t,a)=>{try{var r=e.i(30056),n=t([r]);[r]=n.then?(await n)():n;let o=new r.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});async function s(e,t){let a=await o.connect();try{return(await a.query(e,t)).rows}finally{a.release()}}async function i(){return await o.connect()}e.s(["getClient",()=>i,"pool",()=>o,"query",()=>s]),a()}catch(e){a(e)}},!1),70038,e=>e.a(async(t,a)=>{try{var r=e.i(90793),n=t([r]);[r]=n.then?(await n)():n,e.s([]),a()}catch(e){a(e)}},!1),15157,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(70038),s=e.i(90793),i=t([n,s]);async function o(e){try{let t,{searchParams:a}=new URL(e.url),n=a.get("vendor_id"),i=a.get("user_id"),o=a.get("branch_id"),l=null;if(n)l=n;else if(i){let e=await (0,s.query)(`SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,[i]);if(e&&e.length>0)l=e[0].vendor_id;else{let e=await (0,s.query)(`SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,[i]);e&&e.length>0&&(l=e[0].vendor_id)}}return t=o?await (0,s.query)(`
        SELECT 
          s.id,
          s.full_name,
          s.username,
          s.email,
          s.phone_number,
          s.role,
          s.status,
          s.branch_id,
          s.attendant_code,
          s.code_generated_at,
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
          s.attendant_code,
          s.code_generated_at,
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
          s.attendant_code,
          s.code_generated_at,
          b.name as branch_name
        FROM staff s
        LEFT JOIN branches b ON s.branch_id = b.id
        ORDER BY s.created_at DESC
      `),r.NextResponse.json({staff:t})}catch(e){return console.error("Error fetching staff:",e),r.NextResponse.json({error:"Failed to fetch staff",details:e.message},{status:500})}}[n,s]=i.then?(await i)():i,e.s(["GET",()=>o]),a()}catch(e){a(e)}},!1),18418,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),s=e.i(96250),i=e.i(59756),o=e.i(61916),l=e.i(14444),d=e.i(37092),u=e.i(69741),c=e.i(16795),p=e.i(87718),h=e.i(95169),f=e.i(47587),R=e.i(66012),E=e.i(70101),v=e.i(26937),x=e.i(10372),m=e.i(93695);e.i(52474);var b=e.i(220),_=e.i(15157),g=t([_]);[_]=g.then?(await g)():g;let C=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/staff/list/route",pathname:"/api/staff/list",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/staff/list/route.ts",nextConfigOutput:"standalone",userland:_}),{workAsyncStorage:O,workUnitAsyncStorage:N,serverHooks:T}=C;function y(){return(0,s.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:N})}async function w(e,t,a){C.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/staff/list/route";r=r.replace(/\/index$/,"")||"/";let s=await C.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:_,params:g,nextConfig:y,parsedUrl:w,isDraftMode:O,prerenderManifest:N,routerServerContext:T,isOnDemandRevalidate:A,revalidateOnlyGenerated:S,resolvedPathname:q,clientReferenceManifest:P,serverActionsManifest:I}=s,D=(0,u.normalizeAppPath)(r),k=!!(N.dynamicRoutes[D]||N.routes[q]),H=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,w,!1):t.end("This page could not be found"),null);if(k&&!O){let e=!!N.routes[q],t=N.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(y.experimental.adapterPath)return await H();throw new m.NoFallbackError}}let M=null;!k||C.isDev||O||(M=q,M="/index"===M?"/":M);let j=!0===C.isDev||!k,U=k&&!j;I&&P&&(0,l.setReferenceManifestsSingleton)({page:r,clientReferenceManifest:P,serverActionsManifest:I,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:I})});let F=e.method||"GET",L=(0,o.getTracer)(),$=L.getActiveScopeSpan(),B={params:g,prerenderManifest:N,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts},cacheComponents:!!y.cacheComponents,supportsDynamicResponse:j,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:y.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>C.onRequestError(e,t,r,T)},sharedContext:{buildId:_}},K=new c.NodeNextRequest(e),W=new c.NodeNextResponse(t),J=p.NextRequestAdapter.fromNodeNextRequest(K,(0,p.signalFromNodeResponse)(t));try{let s=async e=>C.handle(J,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=L.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==h.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${F} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${F} ${r}`)}),l=!!(0,i.getRequestMeta)(e,"minimalMode"),d=async i=>{var o,d;let u=async({previousCacheEntry:n})=>{try{if(!l&&A&&S&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let d=B.renderOpts.collectedTags;if(!k)return await (0,R.sendResponse)(K,W,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(r.headers);d&&(t[x.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:b.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,f.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:A})},T),t}},c=await C.handleResponse({req:e,nextConfig:y,cacheKey:M,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:l});if(!k)return null;if((null==c||null==(o=c.value)?void 0:o.kind)!==b.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",A?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,E.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&k||p.delete(x.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,v.getCacheControlHeader)(c.cacheControl)),await (0,R.sendResponse)(K,W,new Response(c.value.body,{headers:p,status:c.value.status||200})),null};$?await d($):await L.withPropagatedContext(e.headers,()=>L.trace(h.BaseServerSpan.handleRequest,{spanName:`${F} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},d))}catch(t){if(t instanceof m.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,f.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:A})}),k)throw t;return await (0,R.sendResponse)(K,W,new Response(null,{status:500})),null}}e.s(["handler",()=>w,"patchFetch",()=>y,"routeModule",()=>C,"serverHooks",()=>T,"workAsyncStorage",()=>O,"workUnitAsyncStorage",()=>N]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__7bd9f63a._.js.map