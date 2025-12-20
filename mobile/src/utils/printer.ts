import { Platform } from 'react-native';
import * as Print from 'expo-print';
import QRCode from 'qrcode';

let SunmiPrinterLibrary: any = null;
try {
  SunmiPrinterLibrary = require('@mitsuharu/react-native-sunmi-printer-library');
} catch (e) {
  console.log('[PrinterService] Sunmi printer library not available');
}

export interface InvoiceItem {
  name: string;
  itemCode?: string;
  dispenser?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'amount';
  taxRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  receiptNo?: string;
  date: string;
  time: string;
  branchName: string;
  branchAddress?: string;
  branchPhone?: string;
  branchPin?: string;
  customerName?: string;
  customerPin?: string;
  cashierName: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalTax: number;
  taxExempt?: number;
  taxZeroRated?: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
  kraPin?: string;
  cuSerialNumber?: string;
  cuInvoiceNo?: string;
  receiptSignature?: string;
  qrCodeData?: string;
  controlCode?: string;
  invoiceDate?: string;
  invoiceTime?: string;
  mrcNo?: string;
  rcptSign?: string;
  intrlData?: string;
  co2PerLitre?: number;
  totalCo2?: number;
  isReprint?: boolean;
}

export type PrinterType = 'sunmi' | 'pdf';

class PrinterService {
  private initialized: boolean = false;
  private isSunmiDevice: boolean = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS === 'android' && SunmiPrinterLibrary) {
      try {
        await SunmiPrinterLibrary.prepare();
        this.isSunmiDevice = true;
        console.log('[PrinterService] Sunmi printer ready');
      } catch (e) {
        console.log('[PrinterService] Not a Sunmi device, using PDF fallback');
        this.isSunmiDevice = false;
      }
    }
    this.initialized = true;
    return true;
  }

  isAvailable(): boolean {
    return true;
  }

  isSunmiPrinterAvailable(): boolean {
    return this.isSunmiDevice;
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  async generateQRCodeBase64(data: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: 120,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
      return qrDataUrl;
    } catch (error) {
      console.error('[PrinterService] QR generation error:', error);
      return '';
    }
  }

  async printInvoice(invoice: InvoiceData): Promise<{ success: boolean; message: string }> {
    if (this.isSunmiDevice && SunmiPrinterLibrary) {
      return this.printWithSunmi(invoice);
    }
    return this.printWithPdf(invoice);
  }

  private async printWithSunmi(invoice: InvoiceData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[PrinterService] Printing with Sunmi native printer...');
      
      await SunmiPrinterLibrary.prepare();
      const invoiceType = invoice.isReprint ? 'INVOICE COPY' : 'ORIGINAL INVOICE';
      
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.setFontWeight(true);
      await SunmiPrinterLibrary.setFontSize(28);
      await SunmiPrinterLibrary.printText(`${invoiceType}\n`);
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText(`${invoice.branchName}\n`);
      await SunmiPrinterLibrary.setFontWeight(false);
      if (invoice.branchAddress) {
        await SunmiPrinterLibrary.setFontSize(22);
        await SunmiPrinterLibrary.printText(`${invoice.branchAddress}\n`);
      }
      if (invoice.branchPhone) {
        await SunmiPrinterLibrary.printText(`Tel: ${invoice.branchPhone}\n`);
      }
      if (invoice.branchPin || invoice.kraPin) {
        await SunmiPrinterLibrary.setFontWeight(true);
        await SunmiPrinterLibrary.printText(`PIN: ${invoice.branchPin || invoice.kraPin}\n`);
        await SunmiPrinterLibrary.setFontWeight(false);
      }
      
      await SunmiPrinterLibrary.setFontWeight(true);
      await SunmiPrinterLibrary.setFontSize(24);
      await SunmiPrinterLibrary.printText('BUYER INFORMATION\n');
      await SunmiPrinterLibrary.setFontWeight(false);
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(22);
      await SunmiPrinterLibrary.printText(`Buyer PIN: ${invoice.customerPin || 'NOT PROVIDED'}\n`);
      await SunmiPrinterLibrary.printText(`Buyer Name: ${invoice.customerName || 'Walk-in Customer'}\n`);
      
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.setFontWeight(true);
      await SunmiPrinterLibrary.setFontSize(24);
      await SunmiPrinterLibrary.printText('PRODUCT DETAILS\n');
      await SunmiPrinterLibrary.setFontWeight(false);
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(22);
      
      for (const item of invoice.items) {
        const lineTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
        await SunmiPrinterLibrary.printText(`${item.name}\n`);
        if (item.dispenser) {
          await SunmiPrinterLibrary.printText(`Dispenser: ${item.dispenser}\n`);
        }
        await SunmiPrinterLibrary.printText(`${this.formatCurrency(item.unitPrice)} x ${item.quantity.toFixed(3)}L\n`);
        if (item.discount && item.discount > 0) {
          await SunmiPrinterLibrary.printText(`Discount: -${item.discount.toFixed(2)}\n`);
        }
        await SunmiPrinterLibrary.setFontWeight(true);
        await SunmiPrinterLibrary.setFontSize(24);
        await SunmiPrinterLibrary.printText(`TOTAL: ${this.formatCurrency(lineTotal)}\n`);
        await SunmiPrinterLibrary.setFontWeight(false);
        await SunmiPrinterLibrary.setFontSize(22);
      }
      
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.setFontWeight(true);
      await SunmiPrinterLibrary.setFontSize(24);
      await SunmiPrinterLibrary.printText('TAX BREAKDOWN\n');
      await SunmiPrinterLibrary.setFontWeight(false);
      await SunmiPrinterLibrary.setFontSize(20);
      await SunmiPrinterLibrary.printText('Rate    Taxable     VAT\n');
      
      const taxExempt = invoice.taxExempt || 0;
      const taxZeroRated = invoice.taxZeroRated || 0;
      const taxable16 = invoice.taxableAmount || 0;
      const vat16 = invoice.totalTax || 0;
      
      await SunmiPrinterLibrary.printText(`EX  ${this.formatCurrency(taxExempt).padStart(10)} ${this.formatCurrency(0).padStart(9)}\n`);
      await SunmiPrinterLibrary.printText(`16% ${this.formatCurrency(taxable16).padStart(10)} ${this.formatCurrency(vat16).padStart(9)}\n`);
      await SunmiPrinterLibrary.printText(`0%  ${this.formatCurrency(taxZeroRated).padStart(10)} ${this.formatCurrency(0).padStart(9)}\n`);
      
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(22);
      await SunmiPrinterLibrary.printText(`Date: ${invoice.date} ${invoice.time}\n`);
      
      await SunmiPrinterLibrary.setFontSize(20);
      if (invoice.cuSerialNumber) {
        await SunmiPrinterLibrary.printText(`SCU ID: ${invoice.cuSerialNumber}\n`);
      }
      if (invoice.cuInvoiceNo) {
        await SunmiPrinterLibrary.printText(`CU INV NO: ${invoice.cuInvoiceNo}\n`);
      } else if (invoice.cuSerialNumber && invoice.receiptNo) {
        await SunmiPrinterLibrary.printText(`CU INV NO: ${invoice.cuSerialNumber}/${invoice.receiptNo}\n`);
      }
      if (invoice.intrlData) {
        await SunmiPrinterLibrary.printText(`Int Data: ${invoice.intrlData}\n`);
      }
      
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(22);
      await SunmiPrinterLibrary.printText(`Receipt No: ${invoice.receiptNo || invoice.invoiceNumber}\n`);
      await SunmiPrinterLibrary.printText(`Served by: ${invoice.cashierName}\n`);
      await SunmiPrinterLibrary.printText(`Payment: ${invoice.paymentMethod.toLowerCase()}\n`);
      
      await SunmiPrinterLibrary.setAlignment('center');
      const qrData = invoice.qrCodeData || 
        `https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=${invoice.invoiceNumber}`;
      await SunmiPrinterLibrary.printQRCode(qrData, 6, 'middle');
      await SunmiPrinterLibrary.setFontSize(20);
      await SunmiPrinterLibrary.printText('Scan to verify with KRA eTIMS\n');
      await SunmiPrinterLibrary.setFontWeight(true);
      await SunmiPrinterLibrary.setFontSize(22);
      await SunmiPrinterLibrary.printText('END OF LEGAL RECEIPT\n');
      await SunmiPrinterLibrary.setFontWeight(false);
      await SunmiPrinterLibrary.lineWrap(2);
      
      return { success: true, message: 'Receipt printed successfully' };
    } catch (error: any) {
      console.error('[PrinterService] Sunmi print error:', error);
      console.log('[PrinterService] Falling back to PDF...');
      return this.printWithPdf(invoice);
    }
  }

  private async printWithPdf(invoice: InvoiceData): Promise<{ success: boolean; message: string }> {
    console.log('[PrinterService] Generating PDF receipt...');
    
    try {
      const qrData = invoice.qrCodeData || 
        `https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=${invoice.invoiceNumber}`;
      const qrCodeBase64 = await this.generateQRCodeBase64(qrData);

      const html = this.generateReceiptHtml(invoice, qrCodeBase64);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      console.log('[PrinterService] PDF generated at:', uri);

      if (Platform.OS === 'android') {
        await Print.printAsync({ uri });
        return { 
          success: true, 
          message: 'Receipt sent to printer' 
        };
      }
      
      return { 
        success: true, 
        message: 'PDF saved' 
      };
    } catch (error: any) {
      console.error('[PrinterService] PDF generation error:', error);
      return { 
        success: false, 
        message: error?.message || 'Failed to generate receipt' 
      };
    }
  }

  private generateReceiptHtml(invoice: InvoiceData, qrCodeBase64: string): string {
    const taxExempt = invoice.taxExempt || 0;
    const taxZeroRated = invoice.taxZeroRated || 0;
    const taxable16 = invoice.taxableAmount || 0;
    const vat16 = invoice.totalTax || 0;
    const invoiceType = invoice.isReprint ? 'INVOICE COPY' : 'ORIGINAL INVOICE';

    const itemsHtml = invoice.items.map(item => {
      const lineTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
      return `
        <div class="product-detail">
          ${item.itemCode ? `<div class="row"><span>Item Code:</span><span>${item.itemCode}</span></div>` : ''}
          <div class="row"><span>Description:</span><span>${item.name}</span></div>
          ${item.dispenser ? `<div class="row"><span>Dispenser:</span><span>${item.dispenser}</span></div>` : ''}
          <div class="row"><span>Unit Price:</span><span>${this.formatCurrency(item.unitPrice)}</span></div>
          <div class="row"><span>Quantity:</span><span>${item.quantity.toFixed(3)} L</span></div>
          <div class="row"><span>Discount:</span><span>(${(item.discount || 0).toFixed(2)})</span></div>
          <div class="row"><span>Total:</span><span><b>${this.formatCurrency(lineTotal)}</b></span></div>
        </div>
      `;
    }).join('');

    const carbonHtml = (invoice.co2PerLitre || invoice.totalCo2) ? `
      <div class="section">
        <div class="section-title">Carbon Emission Details</div>
        ${invoice.co2PerLitre ? `<div class="row"><span>CO2 Per Litre:</span><span>${invoice.co2PerLitre.toFixed(2)} kg</span></div>` : ''}
        ${invoice.totalCo2 ? `<div class="row"><span>Total CO2:</span><span>${invoice.totalCo2.toFixed(2)} kg</span></div>` : ''}
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page {
            size: 57mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 7px;
            line-height: 1.3;
            width: 54mm;
            margin: 1.5mm auto;
            padding: 0;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 4px;
          }
          .header h1 {
            font-size: 10px;
            margin: 0 0 2px 0;
            font-weight: bold;
          }
          .header .branch-name {
            font-size: 9px;
            font-weight: bold;
          }
          .header .address {
            font-size: 7px;
          }
          .welcome {
            text-align: center;
            margin: 4px 0;
            font-size: 7px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
          .section-title {
            text-align: center;
            font-weight: bold;
            font-size: 8px;
            margin: 4px 0 2px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            font-size: 6px;
            margin: 1px 0;
          }
          .row span:first-child {
            min-width: 60px;
          }
          .product-detail {
            margin: 4px 0;
          }
          .tax-table {
            width: 100%;
            font-size: 6px;
            margin: 4px 0;
          }
          .tax-table th {
            text-align: center;
            font-weight: bold;
            padding: 2px;
          }
          .tax-table td {
            text-align: right;
            padding: 2px;
          }
          .tax-table td:first-child {
            text-align: left;
          }
          .kra-section {
            margin: 4px 0;
            text-align: center;
          }
          .qr-section {
            text-align: center;
            margin: 6px 0;
          }
          .qr-section img {
            width: 90px;
            height: 90px;
          }
          .qr-label {
            font-size: 6px;
            margin-top: 2px;
          }
          .footer {
            text-align: center;
            margin-top: 6px;
            font-size: 7px;
          }
          .end-receipt {
            text-align: center;
            font-weight: bold;
            font-size: 7px;
            margin-top: 6px;
            padding-top: 4px;
            border-top: 1px dashed #000;
          }
          .section {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${invoiceType}</h1>
          <div class="branch-name">${invoice.branchName}</div>
          ${invoice.branchAddress ? `<div class="address">${invoice.branchAddress}</div>` : ''}
          ${invoice.branchPhone ? `<div class="address">Tel: ${invoice.branchPhone}</div>` : ''}
          ${(invoice.branchPin || invoice.kraPin) ? `<div class="address">PIN: ${invoice.branchPin || invoice.kraPin}</div>` : ''}
        </div>
        
        <div class="welcome">Welcome to our shop</div>
        
        <div class="divider"></div>
        
        <div class="section-title">BUYER INFORMATION</div>
        <div class="row"><span>Buyer PIN:</span><span>${invoice.customerPin || 'NOT PROVIDED'}</span></div>
        <div class="row"><span>Buyer Name:</span><span>${invoice.customerName || 'Walk-in Customer'}</span></div>
        
        <div class="divider"></div>
        
        <div class="section-title">PRODUCT DETAILS</div>
        ${itemsHtml}
        
        <div class="divider"></div>
        
        <div class="section-title">TAX BREAKDOWN</div>
        <table class="tax-table">
          <tr>
            <th>Rate</th>
            <th>Taxable</th>
            <th>VAT</th>
          </tr>
          <tr>
            <td>EX</td>
            <td>${this.formatCurrency(taxExempt)}</td>
            <td>${this.formatCurrency(0)}</td>
          </tr>
          <tr>
            <td>16%</td>
            <td>${this.formatCurrency(taxable16)}</td>
            <td>${this.formatCurrency(vat16)}</td>
          </tr>
          <tr>
            <td>0%</td>
            <td>${this.formatCurrency(taxZeroRated)}</td>
            <td>${this.formatCurrency(0)}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <div class="row"><span>Date:</span><span>${invoice.date}</span></div>
        <div class="row"><span>Time:</span><span>${invoice.time}</span></div>
        
        <div class="divider"></div>
        
        <div class="kra-section">
          ${invoice.cuSerialNumber ? `<div class="row"><span>SCU ID:</span><span>${invoice.cuSerialNumber}</span></div>` : ''}
          ${invoice.cuInvoiceNo ? `<div class="row"><span>CU INV NO:</span><span>${invoice.cuInvoiceNo}</span></div>` : 
            (invoice.cuSerialNumber && invoice.receiptNo ? `<div class="row"><span>CU INV NO:</span><span>${invoice.cuSerialNumber}/${invoice.receiptNo}</span></div>` : '')}
          ${invoice.intrlData ? `<div class="row"><span>Internal Data:</span><span style="font-size:5px;">${invoice.intrlData}</span></div>` : ''}
        </div>
        
        <div class="section-title">KRA eTIMS Verification</div>
        
        <div class="qr-section">
          <img src="${qrCodeBase64}" />
          <div class="qr-label">Scan to verify with KRA eTIMS</div>
        </div>
        
        <div class="row"><span>Receipt No:</span><span>${invoice.receiptNo || invoice.invoiceNumber}</span></div>
        <div class="row"><span>Served by:</span><span>${invoice.cashierName}</span></div>
        <div class="row"><span>Payment:</span><span>${invoice.paymentMethod.toLowerCase()}</span></div>
        
        ${carbonHtml}
        
        <div class="footer">
          <div><b>THANK YOU FOR SHOPPING WITH US</b></div>
          <div style="margin-top: 2px;">Powered by Flow360</div>
        </div>
        
        <div class="end-receipt">END OF LEGAL RECEIPT</div>
      </body>
      </html>
    `;
  }

  async printTestReceipt(): Promise<{ success: boolean; message: string }> {
    const testInvoice: InvoiceData = {
      invoiceNumber: 'INV-TEST001',
      receiptNo: '40',
      date: new Date().toLocaleDateString('en-KE'),
      time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      branchName: 'Thika Greens',
      branchAddress: 'Thika, Kenya',
      branchPhone: '+254712345678',
      branchPin: 'P052344628B',
      customerName: 'Walk-in Customer',
      customerPin: undefined,
      cashierName: 'System',
      items: [
        {
          name: 'DIESEL',
          itemCode: 'KE2NTL0000002',
          dispenser: 'D1N2',
          quantity: 4.750,
          unitPrice: 168.50,
          discount: 0,
          taxRate: 16
        }
      ],
      subtotal: 800.00,
      totalDiscount: 0,
      taxableAmount: 689.66,
      totalTax: 110.34,
      taxExempt: 0,
      taxZeroRated: 0,
      grandTotal: 800.00,
      paymentMethod: 'cash',
      cuSerialNumber: 'KRACU0300003796',
      cuInvoiceNo: 'KRACU0300003796/40',
      intrlData: 'FT5OUZPTMHT36C6B5PZBWGTQ34',
      co2PerLitre: 2.68,
      totalCo2: 12.73,
      qrCodeData: 'https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=KRACU0300003796/40'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new PrinterService();
export default sunmiPrinter;
