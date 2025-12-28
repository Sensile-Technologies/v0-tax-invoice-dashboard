import { NextResponse } from "next/server"
import { Pool } from "pg"
import puppeteer from "puppeteer"
import QRCode from "qrcode"
import { execSync } from "child_process"

function getChromiumPath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }
  try {
    const path = execSync('which chromium').toString().trim()
    if (path) return path
  } catch {}
  try {
    const path = execSync('which chromium-browser').toString().trim()
    if (path) return path
  } catch {}
  try {
    const path = execSync('which google-chrome').toString().trim()
    if (path) return path
  } catch {}
  return '/usr/bin/chromium'
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

function generateReceiptHTML(sale: any, qrCodeDataUrl: string, documentType: 'invoice' | 'credit_note' = 'invoice'): string {
  const unitPrice = parseFloat(sale.unit_price) || 0
  const quantity = parseFloat(sale.quantity) || 0
  const totalAmount = parseFloat(sale.total_amount) || 0
  const discountAmount = parseFloat(sale.discount_amount) || 0
  const taxableAmount = totalAmount / 1.16
  const vatAmount = totalAmount - taxableAmount
  
  const saleDate = new Date(sale.sale_date)
  const dateStr = saleDate.toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const timeStr = saleDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  
  const co2PerLitre = sale.fuel_type?.toLowerCase().includes('diesel') ? 2.68 : 2.31
  const totalCo2 = quantity * co2PerLitre
  
  const kraPin = sale.kra_pin || 'P052344628B'
  
  const receiptNo = sale.kra_cu_inv?.split('/')[1] || sale.invoice_number?.replace('INV-', '') || String(sale.id).substring(0, 8)

  return `
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
    .value { width: 58%; text-align: left; }
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
  <div class="center header">${documentType === 'credit_note' ? 'CREDIT NOTE' : 'TAX INVOICE'}</div>
  <div class="center shop-name">${sale.branch_name || 'Flow360 Station'}</div>
  ${sale.branch_address ? `<div class="center">${sale.branch_address}</div>` : ''}
  ${sale.branch_phone ? `<div class="center">Tel: ${sale.branch_phone}</div>` : ''}
  <div class="center bold">PIN: ${kraPin}</div>
  
  <div class="divider"></div>
  <div class="center" style="font-size: 15px;">Welcome to our shop</div>
  <div class="divider"></div>
  
  <div class="section-title">BUYER INFORMATION</div>
  <div class="row"><span class="label">Buyer PIN:</span><span class="value">${sale.customer_pin || 'NOT PROVIDED'}</span></div>
  <div class="row"><span class="label">Buyer Name:</span><span class="value">${sale.customer_name || 'Walk-in Customer'}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">PRODUCT DETAILS</div>
  <div class="row"><span class="label">Item Code:</span><span class="value">${sale.item_code || sale.fuel_type || 'N/A'}</span></div>
  <div class="row"><span class="label">Description:</span><span class="value">${sale.item_name || sale.fuel_type || 'Fuel'}</span></div>
  <div class="row"><span class="label">Dispenser:</span><span class="value">D${sale.dispenser_number || '0'}N${sale.nozzle_number || '1'}</span></div>
  <div class="row"><span class="label">Unit Price:</span><span class="value">KES ${unitPrice.toFixed(2)}</span></div>
  <div class="row"><span class="label">Quantity:</span><span class="value">${quantity.toFixed(3)} L</span></div>
  <div class="row"><span class="label">Discount:</span><span class="value">(${discountAmount.toFixed(2)})</span></div>
  <div class="row total-row"><span class="label">Total:</span><span class="value">KES ${totalAmount.toFixed(2)}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">TAX BREAKDOWN</div>
  <table class="tax-table">
    <tr><th>Rate</th><th>Taxable</th><th>VAT</th></tr>
    <tr><td>EX</td><td>KES 0.00</td><td>KES 0.00</td></tr>
    <tr><td>16%</td><td>KES ${taxableAmount.toFixed(2)}</td><td>KES ${vatAmount.toFixed(2)}</td></tr>
    <tr><td>0%</td><td>KES 0.00</td><td>KES 0.00</td></tr>
  </table>
  
  <div class="divider"></div>
  <div class="row"><span class="label">Date:</span><span class="value">${dateStr}</span></div>
  <div class="row"><span class="label">Time:</span><span class="value">${timeStr}</span></div>
  
  <div class="divider"></div>
  <div class="row" style="font-size: 15px;"><span class="label">SCU ID:</span><span class="value">${sale.kra_scu_id || 'N/A'}</span></div>
  <div class="row" style="font-size: 15px;"><span class="label">CU INV NO:</span><span class="value">${sale.kra_cu_inv || 'N/A'}</span></div>
  <div class="row" style="font-size: 15px;"><span class="label">Internal Data:</span><span class="value">${sale.kra_internal_data || sale.invoice_number || 'N/A'}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">KRA eTIMS Verification</div>
  <div class="qr-section">
    <img src="${qrCodeDataUrl}" alt="QR Code" />
    <div class="qr-label">Scan to verify with KRA eTIMS</div>
  </div>
  
  <div class="divider"></div>
  <div class="row"><span class="label">Receipt No:</span><span class="value">${receiptNo}</span></div>
  <div class="row"><span class="label">Served by:</span><span class="value">${sale.cashier_name || 'System'}</span></div>
  <div class="row"><span class="label">Payment:</span><span class="value">${sale.payment_method || 'Cash'}</span></div>
  
  <div class="divider"></div>
  <div class="section-title">Carbon Emission Details</div>
  <div class="row"><span class="label">CO2 Per Litre:</span><span class="value">${co2PerLitre.toFixed(2)} kg</span></div>
  <div class="row"><span class="label">Total CO2:</span><span class="value">${totalCo2.toFixed(2)} kg</span></div>
  
  <div class="divider"></div>
  <div class="footer bold">THANK YOU FOR SHOPPING WITH US</div>
  <div class="footer">Powered by Flow360</div>
  <div class="divider"></div>
  <div class="footer bold">END OF LEGAL RECEIPT</div>
</body>
</html>
`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sale_id, branch_id } = body

    if (!sale_id || !branch_id) {
      return NextResponse.json({ error: "Missing sale_id or branch_id" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const saleResult = await client.query(
        `SELECT s.*, b.name as branch_name, b.kra_pin, b.bhf_id, b.address as branch_address,
                b.phone as branch_phone, b.vendor_id,
                n.nozzle_number, d.dispenser_number,
                COALESCE(i.item_name, iv.item_name) as item_name, 
                COALESCE(i.item_code, iv.item_code) as item_code,
                st.full_name as cashier_name
         FROM sales s
         LEFT JOIN branches b ON s.branch_id = b.id
         LEFT JOIN nozzles n ON s.nozzle_id = n.id
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         LEFT JOIN items i ON UPPER(s.fuel_type) = UPPER(i.item_name) AND i.branch_id = s.branch_id
         LEFT JOIN items iv ON UPPER(s.fuel_type) = UPPER(iv.item_name) AND iv.vendor_id = b.vendor_id AND iv.branch_id IS NULL
         LEFT JOIN staff st ON s.staff_id = st.id
         WHERE s.id = $1`,
        [sale_id]
      )

      if (saleResult.rows.length === 0) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 })
      }

      const sale = saleResult.rows[0]
      
      const kraPin = sale.kra_pin || 'P052344628B'
      const bhfId = sale.bhf_id || '03'
      const rcptSign = sale.kra_rcpt_sign || ''
      const qrData = `${kraPin}${bhfId}${rcptSign}`
      const kraPortal = process.env.NODE_ENV === 'production' ? 'etims.kra.go.ke' : 'etims-sbx.kra.go.ke'
      const qrUrl = `https://${kraPortal}/common/link/etims/receipt/indexEtimsReceiptData?Data=${qrData}`
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M'
      })
      
      const html = generateReceiptHTML(sale, qrCodeDataUrl)
      
      const chromiumPath = getChromiumPath()
      console.log('[Receipt Image API] Using Chromium at:', chromiumPath)
      
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: chromiumPath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      })
      
      const page = await browser.newPage()
      await page.setViewport({ width: 384, height: 800 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const bodyHandle = await page.$('body')
      const boundingBox = await bodyHandle?.boundingBox()
      await bodyHandle?.dispose()
      
      const height = boundingBox ? Math.ceil(boundingBox.height) + 20 : 800
      
      await page.setViewport({ width: 384, height })
      
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
        omitBackground: false
      })
      
      await browser.close()
      
      const base64Image = Buffer.from(screenshotBuffer).toString('base64')

      return NextResponse.json({
        success: true,
        receipt_image: base64Image,
        content_type: 'image/png',
        width: 384,
        sale_id: sale_id,
        invoice_number: sale.invoice_number
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Receipt Image API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to generate receipt image" }, { status: 500 })
  }
}
