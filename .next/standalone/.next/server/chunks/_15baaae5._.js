module.exports=[18088,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(30056),s=e.i(93458),o=t([n]);[n]=o.then?(await o)():o;let l=new n.Pool({connectionString:process.env.DATABASE_URL});async function i(e){let t=await l.query("SELECT vendor_id FROM branches WHERE id = $1",[e]);return t.rows[0]?.vendor_id||null}async function p(){try{let e=(await (0,s.cookies)()).get("user_session");if(!e?.value)return null;let t=JSON.parse(e.value).id;if(!t)return null;let a=await l.query(`SELECT v.id FROM users u 
       JOIN vendors v ON v.email = u.email 
       WHERE u.id = $1`,[t]);if(a.rows.length>0)return a.rows[0].id;let r=await l.query(`SELECT DISTINCT b.vendor_id FROM staff s
       JOIN branches b ON s.branch_id = b.id
       WHERE s.user_id = $1 AND b.vendor_id IS NOT NULL`,[t]);if(r.rows.length>0)return r.rows[0].vendor_id;return null}catch{return null}}async function u(e){try{let{searchParams:t}=new URL(e.url),a=t.get("branch_id"),n=t.get("vendor_id"),s=t.get("status"),o=t.get("date_from"),u=t.get("date_to"),c=t.get("search"),d=parseInt(t.get("limit")||"100"),_=n;!_&&a&&(_=await i(a)),_||(_=await p());let h=`
      SELECT 
        pt.id,
        pt.branch_id,
        pt.invc_no,
        pt.spplr_nm as supplier_name,
        pt.spplr_tin as supplier_tin,
        pt.pchs_dt as purchase_date,
        pt.tot_item_cnt as item_count,
        pt.tot_amt as total_amount,
        pt.tot_tax_amt as tax_amount,
        pt.tot_taxbl_amt as taxable_amount,
        pt.pchs_stts_cd as status_code,
        pt.pchs_ty_cd as purchase_type,
        pt.pmt_ty_cd as payment_type,
        pt.remark,
        pt.created_at,
        CASE 
          WHEN pt.pchs_stts_cd = '02' THEN 'approved'
          WHEN pt.pchs_stts_cd = '03' THEN 'rejected'
          WHEN pt.pchs_stts_cd = '04' THEN 'cancelled'
          ELSE 'pending'
        END as status
      FROM purchase_transactions pt
      WHERE 1=1
    `,E=[],m=1;a&&(h+=` AND pt.branch_id = $${m}`,E.push(a),m++),s&&(h+=` AND pt.pchs_stts_cd = $${m}`,E.push("approved"===s?"02":"rejected"===s?"03":"cancelled"===s?"04":"01"),m++),o&&(h+=` AND pt.pchs_dt >= $${m}`,E.push(o),m++),u&&(h+=` AND pt.pchs_dt <= $${m}`,E.push(u),m++),c&&(h+=` AND (pt.spplr_nm ILIKE $${m} OR CAST(pt.invc_no AS TEXT) ILIKE $${m})`,E.push(`%${c}%`),m++),h+=` ORDER BY pt.created_at DESC LIMIT $${m}`,E.push(d);let R=(await l.query(h,E)).rows.map(e=>({id:e.id,po_number:`PO-${String(e.invc_no||"").padStart(4,"0")}`,supplier:e.supplier_name||"Unknown Supplier",supplier_tin:e.supplier_tin,date:e.purchase_date?new Date(e.purchase_date).toISOString().split("T")[0]:null,items:e.item_count||0,amount:parseFloat(e.total_amount)||0,tax_amount:parseFloat(e.tax_amount)||0,status:e.status,purchase_type:e.purchase_type,payment_type:e.payment_type,remark:e.remark,created_at:e.created_at,source:"transaction"})),v=`
      SELECT 
        po.id,
        po.po_number,
        po.status,
        po.approval_status,
        po.issued_at,
        po.accepted_at,
        po.notes,
        po.created_at,
        po.branch_id,
        b.name as branch_name,
        vp.name as supplier_name,
        vp.tin as supplier_tin,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount,
        (SELECT COALESCE(SUM(quantity), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_volume
      FROM purchase_orders po
      LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
      LEFT JOIN branches b ON po.branch_id = b.id
      WHERE po.status = 'accepted'
    `,w=[],N=1;_&&(v+=` AND po.vendor_id = $${N}`,w.push(_),N++),a&&(v+=` AND po.branch_id = $${N}`,w.push(a),N++),c&&(v+=` AND (po.po_number ILIKE $${N} OR vp.name ILIKE $${N})`,w.push(`%${c}%`),N++),v+=" ORDER BY po.accepted_at DESC";let y=[...(await l.query(v,w)).rows.map(e=>({id:e.id,po_number:e.po_number,supplier:e.supplier_name||"Unknown Supplier",supplier_tin:e.supplier_tin,branch_id:e.branch_id,branch_name:e.branch_name,date:e.accepted_at?new Date(e.accepted_at).toISOString().split("T")[0]:e.issued_at?new Date(e.issued_at).toISOString().split("T")[0]:null,items:parseInt(e.item_count)||0,amount:parseFloat(e.total_amount)||0,tax_amount:0,volume:parseFloat(e.total_volume)||0,status:"accepted",purchase_type:"LOCAL",payment_type:null,remark:e.notes,created_at:e.created_at,source:"purchase_order"})),...R];return r.NextResponse.json({success:!0,purchases:y,count:y.length})}catch(e){return console.error("Error fetching purchases:",e),r.NextResponse.json({success:!1,error:"Failed to fetch purchases"},{status:500})}}async function c(e){try{let{branch_id:t,tin:a,bhf_id:n,supplier_name:s,supplier_tin:o,purchase_date:i,purchase_type:p,payment_type:u,items:c,total_amount:d,tax_amount:_,remark:h}=await e.json(),E=await l.query(`
      INSERT INTO purchase_transactions (
        branch_id, tin, bhf_id, spplr_nm, spplr_tin, pchs_dt,
        pchs_ty_cd, pmt_ty_cd, tot_item_cnt, tot_amt, tot_tax_amt,
        tot_taxbl_amt, pchs_stts_cd, remark, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '01', $13, NOW(), NOW())
      RETURNING *
    `,[t,a,n,s,o,i,p,u,c?.length||0,d,_,(d||0)-(_||0),h]);return r.NextResponse.json({success:!0,purchase:E.rows[0],message:"Purchase order created successfully"})}catch(e){return console.error("Error creating purchase:",e),r.NextResponse.json({success:!1,error:"Failed to create purchase"},{status:500})}}e.s(["GET",()=>u,"POST",()=>c]),a()}catch(e){a(e)}},!1),1640,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),s=e.i(96250),o=e.i(59756),i=e.i(61916),p=e.i(14444),u=e.i(37092),c=e.i(69741),l=e.i(16795),d=e.i(87718),_=e.i(95169),h=e.i(47587),E=e.i(66012),m=e.i(70101),R=e.i(26937),v=e.i(10372),w=e.i(93695);e.i(52474);var N=e.i(220),y=e.i(18088),g=t([y]);[y]=g.then?(await g)():g;let O=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/purchases/route",pathname:"/api/purchases",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/purchases/route.ts",nextConfigOutput:"standalone",userland:y}),{workAsyncStorage:C,workUnitAsyncStorage:T,serverHooks:b}=O;function f(){return(0,s.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:T})}async function S(e,t,a){O.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/purchases/route";r=r.replace(/\/index$/,"")||"/";let s=await O.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:y,params:g,nextConfig:f,parsedUrl:S,isDraftMode:C,prerenderManifest:T,routerServerContext:b,isOnDemandRevalidate:$,revalidateOnlyGenerated:A,resolvedPathname:x,clientReferenceManifest:I,serverActionsManifest:D}=s,H=(0,c.normalizeAppPath)(r),L=!!(T.dynamicRoutes[H]||T.routes[x]),M=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,S,!1):t.end("This page could not be found"),null);if(L&&!C){let e=!!T.routes[x],t=T.dynamicRoutes[H];if(t&&!1===t.fallback&&!e){if(f.experimental.adapterPath)return await M();throw new w.NoFallbackError}}let P=null;!L||O.isDev||C||(P=x,P="/index"===P?"/":P);let U=!0===O.isDev||!L,F=L&&!U;D&&I&&(0,p.setReferenceManifestsSingleton)({page:r,clientReferenceManifest:I,serverActionsManifest:D,serverModuleMap:(0,u.createServerModuleMap)({serverActionsManifest:D})});let k=e.method||"GET",q=(0,i.getTracer)(),W=q.getActiveScopeSpan(),j={params:g,prerenderManifest:T,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:f.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>O.onRequestError(e,t,r,b)},sharedContext:{buildId:y}},K=new l.NodeNextRequest(e),B=new l.NodeNextResponse(t),G=d.NextRequestAdapter.fromNodeNextRequest(K,(0,d.signalFromNodeResponse)(t));try{let s=async e=>O.handle(G,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==_.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${r}`)}),p=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var i,u;let c=async({previousCacheEntry:n})=>{try{if(!p&&$&&A&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(o);e.fetchMetrics=j.renderOpts.fetchMetrics;let i=j.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let u=j.renderOpts.collectedTags;if(!L)return await (0,E.sendResponse)(K,B,r,j.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(r.headers);u&&(t[v.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=v.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,n=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=v.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:$})},b),t}},l=await O.handleResponse({req:e,nextConfig:f,cacheKey:P,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:$,revalidateOnlyGenerated:A,responseGenerator:c,waitUntil:a.waitUntil,isMinimalMode:p});if(!L)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(u=l.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});p||t.setHeader("x-nextjs-cache",$?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,m.fromNodeOutgoingHttpHeaders)(l.value.headers);return p&&L||d.delete(v.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,R.getCacheControlHeader)(l.cacheControl)),await (0,E.sendResponse)(K,B,new Response(l.value.body,{headers:d,status:l.value.status||200})),null};W?await u(W):await q.withPropagatedContext(e.headers,()=>q.trace(_.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},u))}catch(t){if(t instanceof w.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:$})}),L)throw t;return await (0,E.sendResponse)(K,B,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>f,"routeModule",()=>O,"serverHooks",()=>b,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>T]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=_15baaae5._.js.map