module.exports=[82865,e=>e.a(async(t,n)=>{try{var a=e.i(89171),i=e.i(30056),r=t([i]);[i]=r.then?(await r)():r;let d=new i.Pool({connectionString:process.env.DATABASE_URL});async function s(e){try{let{searchParams:t}=new URL(e.url),n=t.get("shift_id"),i=t.get("branch_id"),r=t.get("date"),s=t.get("user_id"),u=null;if(s){let e=await d.query(`SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,[s]);if(e.rows.length>0)u=e.rows[0].vendor_id;else{let e=await d.query(`SELECT DISTINCT b.vendor_id FROM staff s
           JOIN branches b ON s.branch_id = b.id
           WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,[s]);e.rows.length>0&&(u=e.rows[0].vendor_id)}}if(n){let e=await o(n,u);return a.NextResponse.json({success:!0,data:e})}if(i&&r){let e=await l(i,r,u);return a.NextResponse.json({success:!0,data:e})}return a.NextResponse.json({error:"Either shift_id or (branch_id and date) are required"},{status:400})}catch(e){return console.error("Error fetching nozzle report:",e),a.NextResponse.json({error:"Failed to fetch nozzle report",details:e.message},{status:500})}}async function o(e,t){let n=`
    SELECT s.*, b.name as branch_name, st.full_name as cashier_name
    FROM shifts s
    LEFT JOIN branches b ON s.branch_id = b.id
    LEFT JOIN staff st ON s.staff_id = st.id
    WHERE s.id = $1
    ${t?"AND b.vendor_id = $2":""}
  `,a=t?[e,t]:[e],i=await d.query(n,a);if(0===i.rows.length)return{shift:null,nozzles:[],totals:null};let r=i.rows[0],s=`
    SELECT 
      sr.nozzle_id,
      sr.opening_reading,
      sr.closing_reading,
      n.nozzle_number,
      n.fuel_type,
      'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name
    FROM shift_readings sr
    JOIN nozzles n ON sr.nozzle_id = n.id
    LEFT JOIN dispensers d ON n.dispenser_id = d.id
    WHERE sr.shift_id = $1 AND sr.reading_type = 'nozzle'
  `,o=await d.query(s,[e]),l=`
    SELECT 
      nozzle_id,
      SUM(quantity) as invoiced_quantity,
      SUM(total_amount) as invoiced_amount
    FROM sales
    WHERE shift_id = $1 AND nozzle_id IS NOT NULL
      AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
    GROUP BY nozzle_id
  `,u=await d.query(l,[e]),c=new Map(u.rows.map(e=>[e.nozzle_id,e])),_=o.rows.map(e=>{let t=parseFloat(e.opening_reading)||0,n=parseFloat(e.closing_reading)||0,a=n-t,i=c.get(e.nozzle_id),r=parseFloat(i?.invoiced_quantity)||0,s=parseFloat(i?.invoiced_amount)||0;return{nozzle_id:e.nozzle_id,nozzle_name:e.nozzle_name||`Nozzle ${e.nozzle_number}`,fuel_type:e.fuel_type,opening_reading:t,closing_reading:n,meter_difference:a,invoiced_quantity:r,invoiced_amount:s,variance:a-r}}),p={total_meter_difference:_.reduce((e,t)=>e+t.meter_difference,0),total_invoiced_quantity:_.reduce((e,t)=>e+t.invoiced_quantity,0),total_invoiced_amount:_.reduce((e,t)=>e+t.invoiced_amount,0),total_variance:_.reduce((e,t)=>e+t.variance,0)};return{shift:{id:r.id,branch_name:r.branch_name,cashier_name:r.cashier_name,start_time:r.start_time,end_time:r.end_time,status:r.status,opening_cash:parseFloat(r.opening_cash)||0,closing_cash:parseFloat(r.closing_cash)||0},nozzles:_,totals:p}}async function l(e,t,n){let a=await d.query(n?"SELECT id, name FROM branches WHERE id = $1 AND vendor_id = $2":"SELECT id, name FROM branches WHERE id = $1",n?[e,n]:[e]);if(0===a.rows.length)return{branch:null,shifts:[],nozzles:[],totals:null};let i=a.rows[0],r=`
    SELECT s.id, s.start_time, s.end_time, s.status, st.full_name as cashier_name
    FROM shifts s
    LEFT JOIN staff st ON s.staff_id = st.id
    WHERE s.branch_id = $1 
    AND DATE(s.start_time) = $2
    ORDER BY s.start_time
  `,s=await d.query(r,[e,t]),o=s.rows.map(e=>e.id);if(0===o.length){let n=`
      SELECT n.id, n.nozzle_number, n.fuel_type, n.initial_meter_reading,
        'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name
      FROM nozzles n
      LEFT JOIN dispensers d ON n.dispenser_id = d.id
      WHERE n.branch_id = $1 AND n.status = 'active'
      ORDER BY n.nozzle_number
    `,a=await d.query(n,[e]);return{branch:{id:i.id,name:i.name},date:t,shifts:[],nozzles:a.rows.map(e=>({nozzle_id:e.id,nozzle_name:e.nozzle_name,fuel_type:e.fuel_type,opening_reading:parseFloat(e.initial_meter_reading)||0,closing_reading:parseFloat(e.initial_meter_reading)||0,meter_difference:0,invoiced_quantity:0,invoiced_amount:0,variance:0})),totals:{total_meter_difference:0,total_invoiced_quantity:0,total_invoiced_amount:0,total_variance:0}}}let l=`
    SELECT 
      sr.nozzle_id,
      n.nozzle_number,
      n.fuel_type,
      'Dispenser ' || COALESCE(d.dispenser_number::text, '') || ' - Nozzle ' || COALESCE(n.nozzle_number::text, '') as nozzle_name,
      MIN(sr.opening_reading) as day_opening,
      MAX(sr.closing_reading) as day_closing
    FROM shift_readings sr
    JOIN nozzles n ON sr.nozzle_id = n.id
    LEFT JOIN dispensers d ON n.dispenser_id = d.id
    WHERE sr.shift_id = ANY($1) AND sr.reading_type = 'nozzle'
    GROUP BY sr.nozzle_id, n.nozzle_number, n.fuel_type, d.dispenser_number
  `,u=await d.query(l,[o]),c=`
    SELECT 
      nozzle_id,
      SUM(quantity) as invoiced_quantity,
      SUM(total_amount) as invoiced_amount
    FROM sales
    WHERE shift_id = ANY($1) AND nozzle_id IS NOT NULL
      AND (source_system IS NULL OR source_system NOT IN ('meter_diff_bulk', 'PTS'))
    GROUP BY nozzle_id
  `,_=await d.query(c,[o]),p=new Map(_.rows.map(e=>[e.nozzle_id,e])),m=u.rows.map(e=>{let t=parseFloat(e.day_opening)||0,n=parseFloat(e.day_closing)||0,a=n-t,i=p.get(e.nozzle_id),r=parseFloat(i?.invoiced_quantity)||0,s=parseFloat(i?.invoiced_amount)||0;return{nozzle_id:e.nozzle_id,nozzle_name:e.nozzle_name||`Nozzle ${e.nozzle_number}`,fuel_type:e.fuel_type,opening_reading:t,closing_reading:n,meter_difference:a,invoiced_quantity:r,invoiced_amount:s,variance:a-r}}),h={total_meter_difference:m.reduce((e,t)=>e+t.meter_difference,0),total_invoiced_quantity:m.reduce((e,t)=>e+t.invoiced_quantity,0),total_invoiced_amount:m.reduce((e,t)=>e+t.invoiced_amount,0),total_variance:m.reduce((e,t)=>e+t.variance,0)};return{branch:{id:i.id,name:i.name},date:t,shifts:s.rows,nozzles:m,totals:h}}e.s(["GET",()=>s]),n()}catch(e){n(e)}},!1),22860,e=>e.a(async(t,n)=>{try{var a=e.i(47909),i=e.i(74017),r=e.i(96250),s=e.i(59756),o=e.i(61916),l=e.i(14444),d=e.i(37092),u=e.i(69741),c=e.i(16795),_=e.i(87718),p=e.i(95169),m=e.i(47587),h=e.i(66012),z=e.i(70101),f=e.i(26937),E=e.i(10372),R=e.i(93695);e.i(52474);var v=e.i(220),g=e.i(82865),N=t([g]);[g]=N.then?(await N)():N;let w=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/shifts/nozzle-report/route",pathname:"/api/shifts/nozzle-report",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/shifts/nozzle-report/route.ts",nextConfigOutput:"standalone",userland:g}),{workAsyncStorage:b,workUnitAsyncStorage:C,serverHooks:A}=w;function y(){return(0,r.patchFetch)({workAsyncStorage:b,workUnitAsyncStorage:C})}async function O(e,t,n){w.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/shifts/nozzle-report/route";a=a.replace(/\/index$/,"")||"/";let r=await w.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!r)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:g,params:N,nextConfig:y,parsedUrl:O,isDraftMode:b,prerenderManifest:C,routerServerContext:A,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,resolvedPathname:x,clientReferenceManifest:L,serverActionsManifest:q}=r,F=(0,u.normalizeAppPath)(a),I=!!(C.dynamicRoutes[F]||C.routes[x]),M=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,O,!1):t.end("This page could not be found"),null);if(I&&!b){let e=!!C.routes[x],t=C.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(y.experimental.adapterPath)return await M();throw new R.NoFallbackError}}let D=null;!I||w.isDev||b||(D=x,D="/index"===D?"/":D);let U=!0===w.isDev||!I,P=I&&!U;q&&L&&(0,l.setReferenceManifestsSingleton)({page:a,clientReferenceManifest:L,serverActionsManifest:q,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:q})});let H=e.method||"GET",$=(0,o.getTracer)(),k=$.getActiveScopeSpan(),W={params:N,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts},cacheComponents:!!y.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:y.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,n,a)=>w.onRequestError(e,t,a,A)},sharedContext:{buildId:g}},j=new c.NodeNextRequest(e),B=new c.NodeNextResponse(t),J=_.NextRequestAdapter.fromNodeNextRequest(j,(0,_.signalFromNodeResponse)(t));try{let r=async e=>w.handle(J,W).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let n=$.getRootSpanAttributes();if(!n)return;if(n.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${n.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=n.get("next.route");if(i){let t=`${H} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${a}`)}),l=!!(0,s.getRequestMeta)(e,"minimalMode"),d=async s=>{var o,d;let u=async({previousCacheEntry:i})=>{try{if(!l&&T&&S&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await r(s);e.fetchMetrics=W.renderOpts.fetchMetrics;let o=W.renderOpts.pendingWaitUntil;o&&n.waitUntil&&(n.waitUntil(o),o=void 0);let d=W.renderOpts.collectedTags;if(!I)return await (0,h.sendResponse)(j,B,a,W.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,z.toNodeOutgoingHttpHeaders)(a.headers);d&&(t[E.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let n=void 0!==W.renderOpts.collectedRevalidate&&!(W.renderOpts.collectedRevalidate>=E.INFINITE_CACHE)&&W.renderOpts.collectedRevalidate,i=void 0===W.renderOpts.collectedExpire||W.renderOpts.collectedExpire>=E.INFINITE_CACHE?void 0:W.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:n,expire:i}}}}catch(t){throw(null==i?void 0:i.isStale)&&await w.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:T})},A),t}},c=await w.handleResponse({req:e,nextConfig:y,cacheKey:D,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:n.waitUntil,isMinimalMode:l});if(!I)return null;if((null==c||null==(o=c.value)?void 0:o.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",T?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),b&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let _=(0,z.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&I||_.delete(E.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||_.get("Cache-Control")||_.set("Cache-Control",(0,f.getCacheControlHeader)(c.cacheControl)),await (0,h.sendResponse)(j,B,new Response(c.value.body,{headers:_,status:c.value.status||200})),null};k?await d(k):await $.withPropagatedContext(e.headers,()=>$.trace(p.BaseServerSpan.handleRequest,{spanName:`${H} ${a}`,kind:o.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},d))}catch(t){if(t instanceof R.NoFallbackError||await w.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:T})}),I)throw t;return await (0,h.sendResponse)(j,B,new Response(null,{status:500})),null}}e.s(["handler",()=>O,"patchFetch",()=>y,"routeModule",()=>w,"serverHooks",()=>A,"workAsyncStorage",()=>b,"workUnitAsyncStorage",()=>C]),n()}catch(e){n(e)}},!1)];

//# sourceMappingURL=_2b35ee1e._.js.map