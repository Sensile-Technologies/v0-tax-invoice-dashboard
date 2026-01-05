module.exports=[3315,e=>e.a(async(t,a)=>{try{var r=e.i(89171),s=e.i(70038),n=e.i(90793),o=e.i(93458),l=t([s,n]);async function i(){try{let e=(await (0,o.cookies)()).get("user_session");if(!e?.value)return null;return JSON.parse(e.value).id||null}catch{return null}}async function u(e){let t=null,a=null,r=await (0,n.query)(`SELECT u.role, v.id as vendor_id FROM users u 
     LEFT JOIN vendors v ON v.email = u.email 
     WHERE u.id = $1`,[e]);if(r&&r.length>0&&(t=r[0].vendor_id,a=r[0].role),!t){let r=await (0,n.query)(`SELECT DISTINCT b.vendor_id, s.role FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,[e]);r&&r.length>0&&(t=r[0].vendor_id,a||(a=r[0].role))}if(!t){let t=await (0,n.query)("SELECT branch_id, role FROM staff WHERE user_id = $1",[e]);return t&&t.length>0?(a||(a=t[0].role),{role:a,vendorId:null,branchIds:t.map(e=>e.branch_id)}):{role:a,vendorId:null,branchIds:[]}}return{role:a,vendorId:t,branchIds:null}}async function d(e){try{let e=await i();if(!e)return r.NextResponse.json({error:"Unauthorized. Please log in."},{status:401});let{role:t,vendorId:a,branchIds:s}=await u(e);if(t&&["supervisor","manager","cashier"].includes(t.toLowerCase()))return r.NextResponse.json({error:"Access denied. You do not have permission to view headquarters data."},{status:403});if(!a&&s&&0===s.length)return r.NextResponse.json({totalRevenue:0,revenueGrowth:0,totalTransactions:0,totalEmployees:0,totalInventory:0,inventoryGrowth:0,branchPerformance:[],monthlyRevenue:[]});let o=new Date,l=new Date(o.getFullYear(),o.getMonth(),1),d=new Date(o.getFullYear(),o.getMonth()-1,1),E=new Date(o.getFullYear(),o.getMonth(),0),c="",p=[];a?(c="AND s.branch_id IN (SELECT id FROM branches WHERE vendor_id = $2)",p=[a]):s&&s.length>0&&(c="AND s.branch_id = ANY($2::uuid[])",p=[s]);let[h,R,_,N,C,O,v]=await Promise.all([n.pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales s
        WHERE created_at >= $1 ${c}
      `,[l,...p]),n.pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales s
        WHERE created_at >= $1 AND created_at <= $2 ${c.replace("$2","$3")}
      `,[d,E,...p]),n.pool.query(`
        SELECT COUNT(*) as total_transactions
        FROM sales s
        WHERE created_at >= $1 ${c}
      `,[l,...p]),a?n.pool.query(`
        SELECT COUNT(DISTINCT u.id) as total_employees
        FROM users u
        JOIN staff st ON st.user_id = u.id
        JOIN branches b ON st.branch_id = b.id
        WHERE b.vendor_id = $1
      `,[a]):s&&s.length>0?n.pool.query(`
        SELECT COUNT(DISTINCT u.id) as total_employees
        FROM users u
        JOIN staff st ON st.user_id = u.id
        WHERE st.branch_id = ANY($1::uuid[])
      `,[s]):n.pool.query("SELECT 0 as total_employees"),a?n.pool.query(`
        SELECT 
          COALESCE(SUM(current_stock), 0) as total_inventory,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%diesel%' THEN current_stock ELSE 0 END), 0) as diesel_stock,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%petrol%' OR LOWER(fuel_type) LIKE '%super%' OR LOWER(fuel_type) LIKE '%unleaded%' THEN current_stock ELSE 0 END), 0) as petrol_stock
        FROM tanks t
        JOIN branches b ON t.branch_id = b.id
        WHERE b.vendor_id = $1 AND (t.status = 'active' OR t.status IS NULL)
      `,[a]):s&&s.length>0?n.pool.query(`
        SELECT 
          COALESCE(SUM(current_stock), 0) as total_inventory,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%diesel%' THEN current_stock ELSE 0 END), 0) as diesel_stock,
          COALESCE(SUM(CASE WHEN LOWER(fuel_type) LIKE '%petrol%' OR LOWER(fuel_type) LIKE '%super%' OR LOWER(fuel_type) LIKE '%unleaded%' THEN current_stock ELSE 0 END), 0) as petrol_stock
        FROM tanks t
        WHERE t.branch_id = ANY($1::uuid[]) AND (t.status = 'active' OR t.status IS NULL)
      `,[s]):n.pool.query("SELECT 0 as total_inventory, 0 as diesel_stock, 0 as petrol_stock"),a?n.pool.query(`
        SELECT 
          b.id,
          b.name,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 THEN s.total_amount ELSE 0 END), 0) as mtd_sales,
          0 as mtd_purchases
        FROM branches b
        LEFT JOIN sales s ON s.branch_id = b.id
        WHERE b.vendor_id = $2 AND (b.status = 'active' OR b.status IS NULL)
        GROUP BY b.id, b.name
        ORDER BY b.name
      `,[l,a]):s&&s.length>0?n.pool.query(`
        SELECT 
          b.id,
          b.name,
          COALESCE(SUM(CASE WHEN s.created_at >= $1 THEN s.total_amount ELSE 0 END), 0) as mtd_sales,
          0 as mtd_purchases
        FROM branches b
        LEFT JOIN sales s ON s.branch_id = b.id
        WHERE b.id = ANY($2::uuid[]) AND (b.status = 'active' OR b.status IS NULL)
        GROUP BY b.id, b.name
        ORDER BY b.name
      `,[l,s]):n.pool.query("SELECT NULL as id, NULL as name, 0 as mtd_sales, 0 as mtd_purchases WHERE false"),a?n.pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') as month,
          COALESCE(SUM(s.total_amount), 0) as revenue
        FROM sales s
        JOIN branches b ON s.branch_id = b.id
        WHERE s.created_at >= NOW() - INTERVAL '6 months' AND b.vendor_id = $1
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY DATE_TRUNC('month', s.created_at)
      `,[a]):s&&s.length>0?n.pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon') as month,
          COALESCE(SUM(s.total_amount), 0) as revenue
        FROM sales s
        WHERE s.created_at >= NOW() - INTERVAL '6 months' AND s.branch_id = ANY($1::uuid[])
        GROUP BY DATE_TRUNC('month', s.created_at)
        ORDER BY DATE_TRUNC('month', s.created_at)
      `,[s]):n.pool.query("SELECT NULL as month, 0 as revenue WHERE false")]),S=parseFloat(h.rows[0]?.total_revenue||0),m=parseFloat(R.rows[0]?.total_revenue||0),T=m>0?((S-m)/m*100).toFixed(1):"0",L=parseFloat(C.rows[0]?.total_inventory||0),b=parseFloat(C.rows[0]?.diesel_stock||0),y=parseFloat(C.rows[0]?.petrol_stock||0),A=O.rows.map(e=>({branch:e.name,sales:parseFloat(e.mtd_sales)/1e3,purchases:parseFloat(e.mtd_purchases)/1e3})),f=v.rows.map(e=>({month:e.month,revenue:parseFloat(e.revenue)}));return r.NextResponse.json({totalRevenue:S,revenueGrowth:parseFloat(T),totalTransactions:parseInt(_.rows[0]?.total_transactions||0),totalEmployees:parseInt(N.rows[0]?.total_employees||0),totalInventory:Math.round(L),dieselStock:Math.round(b),petrolStock:Math.round(y),inventoryGrowth:0,branchPerformance:A,monthlyRevenue:f})}catch(e){return console.error("[HQ Stats] Error:",e),r.NextResponse.json({error:e.message||"Failed to fetch stats"},{status:500})}}[s,n]=l.then?(await l)():l,e.s(["GET",()=>d]),a()}catch(e){a(e)}},!1),9251,e=>e.a(async(t,a)=>{try{var r=e.i(47909),s=e.i(74017),n=e.i(96250),o=e.i(59756),l=e.i(61916),i=e.i(14444),u=e.i(37092),d=e.i(69741),E=e.i(16795),c=e.i(87718),p=e.i(95169),h=e.i(47587),R=e.i(66012),_=e.i(70101),N=e.i(26937),C=e.i(10372),O=e.i(93695);e.i(52474);var v=e.i(220),S=e.i(3315),m=t([S]);[S]=m.then?(await m)():m;let b=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/headquarters/stats/route",pathname:"/api/headquarters/stats",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/headquarters/stats/route.ts",nextConfigOutput:"standalone",userland:S}),{workAsyncStorage:y,workUnitAsyncStorage:A,serverHooks:f}=b;function T(){return(0,n.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:A})}async function L(e,t,a){b.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/headquarters/stats/route";r=r.replace(/\/index$/,"")||"/";let n=await b.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:S,params:m,nextConfig:T,parsedUrl:L,isDraftMode:y,prerenderManifest:A,routerServerContext:f,isOnDemandRevalidate:w,revalidateOnlyGenerated:g,resolvedPathname:I,clientReferenceManifest:M,serverActionsManifest:U}=n,H=(0,d.normalizeAppPath)(r),D=!!(A.dynamicRoutes[H]||A.routes[I]),F=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,L,!1):t.end("This page could not be found"),null);if(D&&!y){let e=!!A.routes[I],t=A.dynamicRoutes[H];if(t&&!1===t.fallback&&!e){if(T.experimental.adapterPath)return await F();throw new O.NoFallbackError}}let q=null;!D||b.isDev||y||(q=I,q="/index"===q?"/":q);let x=!0===b.isDev||!D,W=D&&!x;U&&M&&(0,i.setReferenceManifestsSingleton)({page:r,clientReferenceManifest:M,serverActionsManifest:U,serverModuleMap:(0,u.createServerModuleMap)({serverActionsManifest:U})});let $=e.method||"GET",k=(0,l.getTracer)(),P=k.getActiveScopeSpan(),Y={params:m,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!T.experimental.authInterrupts},cacheComponents:!!T.cacheComponents,supportsDynamicResponse:x,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:T.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>b.onRequestError(e,t,r,f)},sharedContext:{buildId:S}},K=new E.NodeNextRequest(e),B=new E.NodeNextResponse(t),j=c.NextRequestAdapter.fromNodeNextRequest(K,(0,c.signalFromNodeResponse)(t));try{let n=async e=>b.handle(j,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=k.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${$} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${$} ${r}`)}),i=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var l,u;let d=async({previousCacheEntry:s})=>{try{if(!i&&w&&g&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(o);e.fetchMetrics=Y.renderOpts.fetchMetrics;let l=Y.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let u=Y.renderOpts.collectedTags;if(!D)return await (0,R.sendResponse)(K,B,r,Y.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(r.headers);u&&(t[C.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=C.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,s=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=C.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await b.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:W,isOnDemandRevalidate:w})},f),t}},E=await b.handleResponse({req:e,nextConfig:T,cacheKey:q,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:w,revalidateOnlyGenerated:g,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:i});if(!D)return null;if((null==E||null==(l=E.value)?void 0:l.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(u=E.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",w?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),y&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,_.fromNodeOutgoingHttpHeaders)(E.value.headers);return i&&D||c.delete(C.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,R.sendResponse)(K,B,new Response(E.value.body,{headers:c,status:E.value.status||200})),null};P?await u(P):await k.withPropagatedContext(e.headers,()=>k.trace(p.BaseServerSpan.handleRequest,{spanName:`${$} ${r}`,kind:l.SpanKind.SERVER,attributes:{"http.method":$,"http.target":e.url}},u))}catch(t){if(t instanceof O.NoFallbackError||await b.onRequestError(e,t,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:W,isOnDemandRevalidate:w})}),D)throw t;return await (0,R.sendResponse)(K,B,new Response(null,{status:500})),null}}e.s(["handler",()=>L,"patchFetch",()=>T,"routeModule",()=>b,"serverHooks",()=>f,"workAsyncStorage",()=>y,"workUnitAsyncStorage",()=>A]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=_bbe7e474._.js.map