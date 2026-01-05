module.exports=[74797,e=>e.a(async(t,a)=>{try{var r=e.i(89171),s=e.i(30056),n=e.i(93458),o=t([s]);[s]=o.then?(await o)():o;let l=new s.Pool({connectionString:process.env.DATABASE_URL});async function i(e){try{let t,a=(await (0,n.cookies)()).get("user_session");if(!a)return r.NextResponse.json({error:"Unauthorized"},{status:401});try{t=JSON.parse(a.value)}catch{return r.NextResponse.json({error:"Invalid session"},{status:401})}let{searchParams:s}=new URL(e.url),o=s.get("type")||"x",i=s.get("branch_id")||t.branch_id,u=s.get("from_date"),d=s.get("to_date"),c=s.get("from_time")||"00:00:00",E=s.get("to_time")||"23:59:59",p=s.get("shift_id");if(!i)return r.NextResponse.json({error:"branch_id is required"},{status:400});let _=await l.query(`SELECT b.*, v.name as vendor_name, v.kra_pin as vendor_pin
       FROM branches b
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE b.id = $1`,[i]);if(0===_.rows.length)return r.NextResponse.json({error:"Branch not found"},{status:404});let h=_.rows[0],m="",R=[i],C=2;if(p)m=` AND s.shift_id = $${C}`,R.push(p),C++;else if(u&&d){let e=`${u} ${c}`,t=`${d} ${E}`;m=` AND s.sale_date >= $${C} AND s.sale_date <= $${C+1}`,R.push(e,t),C+=2}else if(u){let e=`${u} ${c}`;m=` AND s.sale_date >= $${C}`,R.push(e),C++}else{let e=new Date().toISOString().split("T")[0];m=` AND DATE(s.sale_date) = $${C}`,R.push(e),C++}let S=`
      SELECT 
        COALESCE(SUM(CASE WHEN NOT COALESCE(s.is_credit_note, false) THEN s.total_amount ELSE 0 END), 0) as gross_sales,
        COALESCE(SUM(CASE WHEN COALESCE(s.is_credit_note, false) THEN s.total_amount ELSE 0 END), 0) as returns,
        COUNT(*) FILTER (WHERE NOT COALESCE(s.is_credit_note, false)) as transaction_count,
        COUNT(*) FILTER (WHERE COALESCE(s.is_credit_note, false)) as voided_count
      FROM sales s
      WHERE s.branch_id = $1 ${m}
    `,A=(await l.query(S,R)).rows[0],N=`
      SELECT 
        COALESCE(s.payment_method, 'Cash') as method,
        COALESCE(SUM(s.total_amount), 0) as amount,
        COUNT(*) as count
      FROM sales s
      WHERE s.branch_id = $1 AND NOT COALESCE(s.is_credit_note, false) ${m}
      GROUP BY s.payment_method
      ORDER BY amount DESC
    `,f=await l.query(N,R),g=`
      WITH sale_tax_types AS (
        SELECT 
          s.id as sale_id,
          s.total_amount,
          COALESCE(
            (SELECT i.tax_type FROM items i 
             WHERE LOWER(i.name) = LOWER(s.fuel_type) 
             AND i.branch_id = s.branch_id 
             LIMIT 1),
            (SELECT i.tax_type FROM items i 
             WHERE LOWER(i.name) = LOWER(s.fuel_type) 
             AND i.branch_id IS NULL 
             LIMIT 1),
            'B'
          ) as tax_type
        FROM sales s
        WHERE s.branch_id = $1 AND NOT COALESCE(s.is_credit_note, false) ${m}
      )
      SELECT 
        CASE 
          WHEN tax_type = 'A' THEN 'A - Exempt'
          WHEN tax_type = 'B' THEN 'B - 16% VAT'
          WHEN tax_type = 'C' THEN 'C - Zero Rated'
          WHEN tax_type = 'D' THEN 'D - Non-VAT'
          ELSE 'B - 16% VAT'
        END as category,
        CASE 
          WHEN tax_type = 'B' THEN COALESCE(SUM(total_amount / 1.16), 0)
          ELSE COALESCE(SUM(total_amount), 0)
        END as taxable_amount,
        CASE 
          WHEN tax_type = 'B' THEN COALESCE(SUM(total_amount - (total_amount / 1.16)), 0)
          ELSE 0
        END as vat_amount,
        COALESCE(SUM(total_amount), 0) as total
      FROM sale_tax_types
      GROUP BY tax_type
      ORDER BY category
    `,v=(await l.query(g,R)).rows.map(e=>({category:e.category,taxableAmount:parseFloat(e.taxable_amount)||0,vatAmount:parseFloat(e.vat_amount)||0,total:parseFloat(e.total)||0}));0===v.length&&(v=[{category:"A - Exempt",taxableAmount:0,vatAmount:0,total:0},{category:"B - 16% VAT",taxableAmount:0,vatAmount:0,total:0},{category:"C - Zero Rated",taxableAmount:0,vatAmount:0,total:0},{category:"D - Non-VAT",taxableAmount:0,vatAmount:0,total:0}]);let T=parseFloat(A.gross_sales)||0,O=parseFloat(A.returns)||0,y=null;if(p){let e=await l.query(`SELECT s.*, st.full_name as cashier_name 
         FROM shifts s 
         LEFT JOIN staff st ON s.staff_id = st.id 
         WHERE s.id = $1`,[p]);e.rows.length>0&&(y=e.rows[0])}else{let e=await l.query(`SELECT s.*, st.full_name as cashier_name 
         FROM shifts s 
         LEFT JOIN staff st ON s.staff_id = st.id 
         WHERE s.branch_id = $1 AND s.status = 'active'
         ORDER BY s.start_time DESC LIMIT 1`,[i]);e.rows.length>0&&(y=e.rows[0])}let w=new Date,x="z"===o?`Z-${w.getFullYear()}-${String(w.getMonth()+1).padStart(3,"0")}-${String(w.getDate()).padStart(3,"0")}`:`X-${w.getFullYear()}-${String(w.getMonth()+1).padStart(3,"0")}-${String(w.getDate()).padStart(2,"0")}`,L=`
      SELECT COALESCE(SUM(total_amount), 0) as cumulative_sales
      FROM sales
      WHERE branch_id = $1 AND NOT COALESCE(is_credit_note, false)
    `,D=await l.query(L,[i]),b=parseFloat(D.rows[0]?.cumulative_sales)||0,H={reportType:o.toUpperCase(),reportNumber:x,fiscalNumber:h.device_token?`${h.device_token}-${x}`:x,date:w.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),time:w.toLocaleTimeString("en-US",{hour12:!1}),deviceSerial:h.device_token||"Not Configured",branchName:h.name,vendorName:h.vendor_name,cashier:y?.cashier_name||"N/A",operator:y?.cashier_name||"Manager",shiftStart:y?new Date(y.start_time).toLocaleTimeString("en-US",{hour12:!1}):"N/A",shiftDuration:y&&y.end_time?`${Math.round((new Date(y.end_time).getTime()-new Date(y.start_time).getTime())/36e5)} hours`:"Active",salesSummary:{grossSales:T,returns:O,netSales:T-O},vatBreakdown:v,paymentMethods:f.rows.map(e=>({method:e.method||"Cash",amount:parseFloat(e.amount)||0,count:parseInt(e.count)||0})),transactionCount:parseInt(A.transaction_count)||0,voidedTransactions:parseInt(A.voided_count)||0,voidedAmount:O,counters:{totalTransactions:parseInt(A.transaction_count)||0,voidedTransactions:parseInt(A.voided_count)||0,cumulativeSales:b}};return r.NextResponse.json({success:!0,data:H})}catch(e){return console.error("[Fiscal Report API] Error:",e),r.NextResponse.json({error:"Failed to generate fiscal report",details:e.message},{status:500})}}e.s(["GET",()=>i]),a()}catch(e){a(e)}},!1),27227,e=>e.a(async(t,a)=>{try{var r=e.i(47909),s=e.i(74017),n=e.i(96250),o=e.i(59756),i=e.i(61916),l=e.i(14444),u=e.i(37092),d=e.i(69741),c=e.i(16795),E=e.i(87718),p=e.i(95169),_=e.i(47587),h=e.i(66012),m=e.i(70101),R=e.i(26937),C=e.i(10372),S=e.i(93695);e.i(52474);var A=e.i(220),N=e.i(74797),f=t([N]);[N]=f.then?(await f)():f;let T=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/reports/fiscal/route",pathname:"/api/reports/fiscal",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/reports/fiscal/route.ts",nextConfigOutput:"standalone",userland:N}),{workAsyncStorage:O,workUnitAsyncStorage:y,serverHooks:w}=T;function g(){return(0,n.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:y})}async function v(e,t,a){T.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/reports/fiscal/route";r=r.replace(/\/index$/,"")||"/";let n=await T.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:N,params:f,nextConfig:g,parsedUrl:v,isDraftMode:O,prerenderManifest:y,routerServerContext:w,isOnDemandRevalidate:x,revalidateOnlyGenerated:L,resolvedPathname:D,clientReferenceManifest:b,serverActionsManifest:H}=n,$=(0,d.normalizeAppPath)(r),M=!!(y.dynamicRoutes[$]||y.routes[D]),U=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,v,!1):t.end("This page could not be found"),null);if(M&&!O){let e=!!y.routes[D],t=y.dynamicRoutes[$];if(t&&!1===t.fallback&&!e){if(g.experimental.adapterPath)return await U();throw new S.NoFallbackError}}let I=null;!M||T.isDev||O||(I=D,I="/index"===I?"/":I);let F=!0===T.isDev||!M,P=M&&!F;H&&b&&(0,l.setReferenceManifestsSingleton)({page:r,clientReferenceManifest:b,serverActionsManifest:H,serverModuleMap:(0,u.createServerModuleMap)({serverActionsManifest:H})});let W=e.method||"GET",q=(0,i.getTracer)(),B=q.getActiveScopeSpan(),k={params:f,prerenderManifest:y,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:F,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:g.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>T.onRequestError(e,t,r,w)},sharedContext:{buildId:N}},j=new c.NodeNextRequest(e),K=new c.NodeNextResponse(t),V=E.NextRequestAdapter.fromNodeNextRequest(j,(0,E.signalFromNodeResponse)(t));try{let n=async e=>T.handle(V,k).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${W} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${W} ${r}`)}),l=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var i,u;let d=async({previousCacheEntry:s})=>{try{if(!l&&x&&L&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(o);e.fetchMetrics=k.renderOpts.fetchMetrics;let i=k.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let u=k.renderOpts.collectedTags;if(!M)return await (0,h.sendResponse)(j,K,r,k.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(r.headers);u&&(t[C.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==k.renderOpts.collectedRevalidate&&!(k.renderOpts.collectedRevalidate>=C.INFINITE_CACHE)&&k.renderOpts.collectedRevalidate,s=void 0===k.renderOpts.collectedExpire||k.renderOpts.collectedExpire>=C.INFINITE_CACHE?void 0:k.renderOpts.collectedExpire;return{value:{kind:A.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await T.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,_.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:x})},w),t}},c=await T.handleResponse({req:e,nextConfig:g,cacheKey:I,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:x,revalidateOnlyGenerated:L,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:l});if(!M)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==A.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(u=c.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",x?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,m.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&M||E.delete(C.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,R.getCacheControlHeader)(c.cacheControl)),await (0,h.sendResponse)(j,K,new Response(c.value.body,{headers:E,status:c.value.status||200})),null};B?await u(B):await q.withPropagatedContext(e.headers,()=>q.trace(p.BaseServerSpan.handleRequest,{spanName:`${W} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":W,"http.target":e.url}},u))}catch(t){if(t instanceof S.NoFallbackError||await T.onRequestError(e,t,{routerKind:"App Router",routePath:$,routeType:"route",revalidateReason:(0,_.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:x})}),M)throw t;return await (0,h.sendResponse)(j,K,new Response(null,{status:500})),null}}e.s(["handler",()=>v,"patchFetch",()=>g,"routeModule",()=>T,"serverHooks",()=>w,"workAsyncStorage",()=>O,"workUnitAsyncStorage",()=>y]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=_8ba64d11._.js.map