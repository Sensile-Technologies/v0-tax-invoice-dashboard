module.exports=[27145,e=>e.a(async(t,a)=>{try{let t=await e.y("puppeteer");e.n(t),a()}catch(e){a(e)}},!0),33405,(e,t,a)=>{t.exports=e.x("child_process",()=>require("child_process"))},93604,e=>e.a(async(t,a)=>{try{var s=e.i(89171),i=e.i(30056),n=e.i(27145),r=e.i(38026),l=e.i(33405),o=t([i,n]);[i,n]=o.then?(await o)():o;let p=new i.Pool({connectionString:process.env.DATABASE_URL});function d(e){return e?e.replace(/[\u2018\u2019\u201A\u201B]/g,"'").replace(/[\u201C\u201D\u201E\u201F]/g,'"').replace(/[\u2013\u2014\u2015]/g,"-").replace(/[\u2026]/g,"...").replace(/[\u00A0]/g," ").replace(/[\u200B-\u200D\uFEFF]/g,"").replace(/[^\x20-\x7E\n]/g,"").trim():""}async function c(e){try{let{sale_id:t,branch_id:a}=await e.json();if(!t||!a)return s.NextResponse.json({error:"Missing sale_id or branch_id"},{status:400});let i=await p.connect();try{let e=await i.query(`SELECT s.*, b.name as branch_name, b.kra_pin, b.bhf_id, b.address as branch_address,
                b.phone as branch_phone, b.vendor_id,
                n.nozzle_number, d.dispenser_number,
                COALESCE(i.item_name, iv.item_name) as item_name, 
                COALESCE(i.item_code, iv.item_code) as item_code,
                st.full_name as cashier_name,
                c.cust_tin as loyalty_cust_tin,
                c.cust_nm as loyalty_cust_name
         FROM sales s
         LEFT JOIN branches b ON s.branch_id = b.id
         LEFT JOIN nozzles n ON s.nozzle_id = n.id
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         LEFT JOIN items i ON UPPER(s.fuel_type) = UPPER(i.item_name) AND i.branch_id = s.branch_id
         LEFT JOIN items iv ON UPPER(s.fuel_type) = UPPER(iv.item_name) AND iv.vendor_id = b.vendor_id AND iv.branch_id IS NULL
         LEFT JOIN staff st ON s.staff_id = st.id
         LEFT JOIN customer_branches cb ON cb.branch_id = s.branch_id AND cb.status = 'active'
         LEFT JOIN customers c ON c.id = cb.customer_id 
           AND (c.cust_nm = s.loyalty_customer_name 
                OR (s.loyalty_customer_name IS NULL AND s.is_loyalty_sale = true AND c.cust_nm = s.customer_name))
         WHERE s.id = $1`,[t]);if(0===e.rows.length)return s.NextResponse.json({error:"Sale not found"},{status:404});let a=e.rows[0],o=d(a.kra_pin)||"P052344628B",c=d(a.bhf_id)||"03",p=d(a.kra_rcpt_sign)||"",u=`${o}${c}${p}`,v=`https://etims.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=${u}`,h=await r.default.toDataURL(v,{width:200,margin:1,errorCorrectionLevel:"M"}),m="credit_note"===a.sale_type||a.invoice_number?.includes("-CR")||0>parseFloat(a.total_amount),_=function(e,t,a="invoice"){let s=d(e.branch_name)||"Flow360 Station",i=d(e.branch_address),n=d(e.branch_phone),r=d(e.customer_pin)||d(e.loyalty_customer_pin)||d(e.loyalty_cust_tin)||"NOT PROVIDED",l=e.is_loyalty_sale&&e.loyalty_cust_name?d(e.loyalty_cust_name):d(e.loyalty_customer_name)||d(e.customer_name)||"Walk-in Customer",o=d(e.item_code)||d(e.fuel_type)||"N/A",c=d(e.item_name)||d(e.fuel_type)||"Fuel",p=d(e.cashier_name)||d(e.served_by_name)||"Attendant",u=d(e.payment_method)||"Cash",v=d(e.kra_scu_id)||"N/A",h=d(e.kra_cu_inv)||"N/A",m=d(e.kra_internal_data)||d(e.invoice_number)||"N/A";d(e.kra_rcpt_sign);let _=parseFloat(e.unit_price)||0,b=parseFloat(e.quantity)||0,g=parseFloat(e.total_amount)||0,w=parseFloat(e.discount_amount)||0,E=g/1.16,f=g-E,y=new Date(e.sale_date),x=y.toLocaleDateString("en-KE",{year:"numeric",month:"2-digit",day:"2-digit"}),R=y.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),N=e.fuel_type?.toLowerCase().includes("diesel")?2.68:2.31,A=b*N,C=e.kra_pin||"P052344628B",T=e.kra_cu_inv?.split("/")[1]||e.invoice_number?.replace("INV-","")||String(e.id).substring(0,8);return`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      line-height: 1.4;
      width: 384px;
      background: white;
      color: black;
      padding: 8px;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .header { font-size: 24px; font-weight: bold; margin-bottom: 6px; }
    .shop-name { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .label { width: 40%; }
    .value { width: 58%; text-align: left; word-break: break-all; overflow-wrap: anywhere; }
    .section-title { font-weight: bold; text-align: center; margin: 6px 0; font-size: 17px; }
    .tax-table { width: 100%; font-size: 16px; margin: 6px 0; }
    .tax-table th, .tax-table td { text-align: left; padding: 2px 4px; }
    .qr-section { text-align: center; margin: 10px 0; }
    .qr-section img { width: 180px; height: 180px; }
    .qr-label { font-size: 14px; margin-top: 4px; }
    .footer { font-size: 16px; text-align: center; margin-top: 8px; }
    .total-row { font-weight: bold; font-size: 20px; }
  </style>
</head>
<body>
  <div class="center header">${"credit_note"===a?"CREDIT NOTE":"TAX INVOICE"}</div>
  <div class="center shop-name">${s}</div>
  ${i?`<div class="center">${i}</div>`:""}
  ${n?`<div class="center">Tel: ${n}</div>`:""}
  <div class="center bold">PIN: ${C}</div>
  
  <div class="divider"></div>
  <div class="center" style="font-size: 15px;">Welcome to our shop</div>
  <div class="divider"></div>
  
  <div class="section-title">BUYER INFORMATION</div>
  <div class="row"><span class="label">Buyer PIN:</span><span class="value">${r}</span></div>
  <div class="row"><span class="label">Buyer Name:</span><span class="value">${l}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">PRODUCT DETAILS</div>
  <div class="row"><span class="label">Item Code:</span><span class="value">${o}</span></div>
  <div class="row"><span class="label">Description:</span><span class="value">${c}</span></div>
  <div class="row"><span class="label">Dispenser:</span><span class="value">D${e.dispenser_number||"0"}N${e.nozzle_number||"1"}</span></div>
  <div class="row"><span class="label">Unit Price:</span><span class="value">KES ${_.toFixed(2)}</span></div>
  <div class="row"><span class="label">Quantity:</span><span class="value">${b.toFixed(3)} L</span></div>
  <div class="row"><span class="label">Discount:</span><span class="value">(${w.toFixed(2)})</span></div>
  <div class="row total-row"><span class="label">Total:</span><span class="value">KES ${g.toFixed(2)}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">TAX BREAKDOWN</div>
  <table class="tax-table">
    <tr><th>Rate</th><th>Taxable</th><th>VAT</th></tr>
    <tr><td>EX</td><td>KES 0.00</td><td>KES 0.00</td></tr>
    <tr><td>16%</td><td>KES ${E.toFixed(2)}</td><td>KES ${f.toFixed(2)}</td></tr>
    <tr><td>0%</td><td>KES 0.00</td><td>KES 0.00</td></tr>
  </table>
  
  <div class="divider"></div>
  <div class="row"><span class="label">Date:</span><span class="value">${x}</span></div>
  <div class="row"><span class="label">Time:</span><span class="value">${R}</span></div>
  
  <div class="divider"></div>
  <div class="row" style="font-size: 15px;"><span class="label">SCU ID:</span><span class="value">${v}</span></div>
  <div class="row" style="font-size: 15px;"><span class="label">CU INV NO:</span><span class="value">${h}</span></div>
  <div class="row" style="font-size: 15px;"><span class="label">Internal Data:</span><span class="value">${m}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">KRA eTIMS Verification</div>
  <div class="qr-section">
    <img src="${t}" alt="QR Code" />
    <div class="qr-label">Scan to verify with KRA eTIMS</div>
  </div>
  
  <div class="divider"></div>
  <div class="row"><span class="label">Receipt No:</span><span class="value">${T}</span></div>
  <div class="row"><span class="label">Served by:</span><span class="value">${p}</span></div>
  <div class="row"><span class="label">Payment:</span><span class="value">${u}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">Carbon Emission Details</div>
  <div class="row"><span class="label">CO2 Per Litre:</span><span class="value">${N.toFixed(2)} kg</span></div>
  <div class="row"><span class="label">Total CO2:</span><span class="value">${A.toFixed(2)} kg</span></div>
  
  <div class="divider"></div>
  <div class="footer bold">THANK YOU FOR SHOPPING WITH US</div>
  <div class="footer">Powered by Flow360</div>
  <div class="divider"></div>
  <div class="footer bold">END OF LEGAL RECEIPT</div>
</body>
</html>
`}(a,h,m?"credit_note":"invoice"),b=function(){if(process.env.PUPPETEER_EXECUTABLE_PATH)return process.env.PUPPETEER_EXECUTABLE_PATH;try{let e=(0,l.execSync)("which chromium").toString().trim();if(e)return e}catch{}try{let e=(0,l.execSync)("which chromium-browser").toString().trim();if(e)return e}catch{}try{let e=(0,l.execSync)("which google-chrome").toString().trim();if(e)return e}catch{}return"/usr/bin/chromium"}();console.log("[Receipt Image API] Using Chromium at:",b);let g=await n.default.launch({headless:!0,executablePath:b,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]}),w=await g.newPage();await w.setViewport({width:384,height:800}),await w.setContent(_,{waitUntil:"networkidle0"});let E=await w.$("body"),f=await E?.boundingBox();await E?.dispose();let y=f?Math.ceil(f.height)+20:800;await w.setViewport({width:384,height:y});let x=await w.screenshot({type:"png",fullPage:!0,omitBackground:!1});await g.close();let R=Buffer.from(x).toString("base64");return s.NextResponse.json({success:!0,receipt_image:R,content_type:"image/png",width:384,sale_id:t,invoice_number:a.invoice_number})}finally{i.release()}}catch(e){return console.error("[Receipt Image API Error]:",e),s.NextResponse.json({error:e.message||"Failed to generate receipt image"},{status:500})}}e.s(["POST",()=>c]),a()}catch(e){a(e)}},!1),65415,e=>e.a(async(t,a)=>{try{var s=e.i(47909),i=e.i(74017),n=e.i(96250),r=e.i(59756),l=e.i(61916),o=e.i(14444),d=e.i(37092),c=e.i(69741),p=e.i(16795),u=e.i(87718),v=e.i(95169),h=e.i(47587),m=e.i(66012),_=e.i(70101),b=e.i(26937),g=e.i(10372),w=e.i(93695);e.i(52474);var E=e.i(220),f=e.i(93604),y=t([f]);[f]=y.then?(await y)():y;let N=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/receipt/image/route",pathname:"/api/receipt/image",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/receipt/image/route.ts",nextConfigOutput:"standalone",userland:f}),{workAsyncStorage:A,workUnitAsyncStorage:C,serverHooks:T}=N;function x(){return(0,n.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:C})}async function R(e,t,a){N.isDev&&(0,r.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/receipt/image/route";s=s.replace(/\/index$/,"")||"/";let n=await N.prepare(e,t,{srcPage:s,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,params:y,nextConfig:x,parsedUrl:R,isDraftMode:A,prerenderManifest:C,routerServerContext:T,isOnDemandRevalidate:P,revalidateOnlyGenerated:O,resolvedPathname:S,clientReferenceManifest:I,serverActionsManifest:$}=n,D=(0,c.normalizeAppPath)(s),F=!!(C.dynamicRoutes[D]||C.routes[S]),U=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,R,!1):t.end("This page could not be found"),null);if(F&&!A){let e=!!C.routes[S],t=C.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(x.experimental.adapterPath)return await U();throw new w.NoFallbackError}}let k=null;!F||N.isDev||A||(k=S,k="/index"===k?"/":k);let L=!0===N.isDev||!F,H=F&&!L;$&&I&&(0,o.setReferenceManifestsSingleton)({page:s,clientReferenceManifest:I,serverActionsManifest:$,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:$})});let M=e.method||"GET",q=(0,l.getTracer)(),z=q.getActiveScopeSpan(),K={params:y,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,r.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,s)=>N.onRequestError(e,t,s,T)},sharedContext:{buildId:f}},B=new p.NodeNextRequest(e),j=new p.NodeNextResponse(t),V=u.NextRequestAdapter.fromNodeNextRequest(B,(0,u.signalFromNodeResponse)(t));try{let n=async e=>N.handle(V,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==v.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=a.get("next.route");if(i){let t=`${M} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t)}else e.updateName(`${M} ${s}`)}),o=!!(0,r.getRequestMeta)(e,"minimalMode"),d=async r=>{var l,d;let c=async({previousCacheEntry:i})=>{try{if(!o&&P&&O&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await n(r);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let d=K.renderOpts.collectedTags;if(!F)return await (0,m.sendResponse)(B,j,s,K.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,i=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:E.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:i}}}}catch(t){throw(null==i?void 0:i.isStale)&&await N.onRequestError(e,t,{routerKind:"App Router",routePath:s,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:P})},T),t}},p=await N.handleResponse({req:e,nextConfig:x,cacheKey:k,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:P,revalidateOnlyGenerated:O,responseGenerator:c,waitUntil:a.waitUntil,isMinimalMode:o});if(!F)return null;if((null==p||null==(l=p.value)?void 0:l.kind)!==E.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(d=p.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",P?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,_.fromNodeOutgoingHttpHeaders)(p.value.headers);return o&&F||u.delete(g.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,b.getCacheControlHeader)(p.cacheControl)),await (0,m.sendResponse)(B,j,new Response(p.value.body,{headers:u,status:p.value.status||200})),null};z?await d(z):await q.withPropagatedContext(e.headers,()=>q.trace(v.BaseServerSpan.handleRequest,{spanName:`${M} ${s}`,kind:l.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},d))}catch(t){if(t instanceof w.NoFallbackError||await N.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:P})}),F)throw t;return await (0,m.sendResponse)(B,j,new Response(null,{status:500})),null}}e.s(["handler",()=>R,"patchFetch",()=>x,"routeModule",()=>N,"serverHooks",()=>T,"workAsyncStorage",()=>A,"workUnitAsyncStorage",()=>C]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__e1da7348._.js.map