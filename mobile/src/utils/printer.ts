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
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'amount';
  taxRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  time: string;
  branchName: string;
  branchAddress?: string;
  customerName?: string;
  customerPin?: string;
  cashierName: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalTax: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
  kraPin?: string;
  cuSerialNumber?: string;
  receiptSignature?: string;
  qrCodeData?: string;
  controlCode?: string;
  invoiceDate?: string;
  invoiceTime?: string;
  mrcNo?: string;
  rcptSign?: string;
  intrlData?: string;
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
      
      await SunmiPrinterLibrary.setAlignment(1);
      await SunmiPrinterLibrary.printText('FLOW360\n');
      await SunmiPrinterLibrary.printText(`${invoice.branchName}\n`);
      if (invoice.branchAddress) {
        await SunmiPrinterLibrary.printText(`${invoice.branchAddress}\n`);
      }
      await SunmiPrinterLibrary.printText('--------------------------------\n');
      
      await SunmiPrinterLibrary.setAlignment(0);
      await SunmiPrinterLibrary.printText(`Invoice: ${invoice.invoiceNumber}\n`);
      await SunmiPrinterLibrary.printText(`Date: ${invoice.date} ${invoice.time}\n`);
      await SunmiPrinterLibrary.printText(`Cashier: ${invoice.cashierName}\n`);
      if (invoice.customerName) {
        await SunmiPrinterLibrary.printText(`Customer: ${invoice.customerName}\n`);
      }
      if (invoice.customerPin) {
        await SunmiPrinterLibrary.printText(`PIN: ${invoice.customerPin}\n`);
      }
      
      await SunmiPrinterLibrary.setAlignment(1);
      await SunmiPrinterLibrary.printText('*** TAX INVOICE ***\n');
      await SunmiPrinterLibrary.printText('--------------------------------\n');
      
      await SunmiPrinterLibrary.setAlignment(0);
      for (const item of invoice.items) {
        const lineTotal = item.quantity * item.unitPrice;
        await SunmiPrinterLibrary.printText(`${item.name}\n`);
        await SunmiPrinterLibrary.printText(`  ${item.quantity.toFixed(2)} x ${item.unitPrice.toFixed(2)} = ${lineTotal.toFixed(2)}\n`);
      }
      
      await SunmiPrinterLibrary.printText('--------------------------------\n');
      await SunmiPrinterLibrary.printText(`Subtotal:    ${this.formatCurrency(invoice.subtotal)}\n`);
      if (invoice.totalDiscount > 0) {
        await SunmiPrinterLibrary.printText(`Discount:   -${this.formatCurrency(invoice.totalDiscount)}\n`);
      }
      await SunmiPrinterLibrary.printText(`Taxable:     ${this.formatCurrency(invoice.taxableAmount)}\n`);
      await SunmiPrinterLibrary.printText(`VAT 16%:     ${this.formatCurrency(invoice.totalTax)}\n`);
      await SunmiPrinterLibrary.printText('--------------------------------\n');
      await SunmiPrinterLibrary.setFontSize(28);
      await SunmiPrinterLibrary.printText(`TOTAL: ${this.formatCurrency(invoice.grandTotal)}\n`);
      await SunmiPrinterLibrary.setFontSize(24);
      await SunmiPrinterLibrary.printText('--------------------------------\n');
      
      await SunmiPrinterLibrary.printText(`Payment: ${invoice.paymentMethod}\n`);
      if (invoice.amountPaid !== undefined) {
        await SunmiPrinterLibrary.printText(`Paid: ${this.formatCurrency(invoice.amountPaid)}\n`);
      }
      if (invoice.change !== undefined && invoice.change > 0) {
        await SunmiPrinterLibrary.printText(`Change: ${this.formatCurrency(invoice.change)}\n`);
      }
      
      await SunmiPrinterLibrary.printText('--------------------------------\n');
      await SunmiPrinterLibrary.printText('KRA TIMS DETAILS\n');
      if (invoice.kraPin) {
        await SunmiPrinterLibrary.printText(`KRA PIN: ${invoice.kraPin}\n`);
      }
      if (invoice.cuSerialNumber) {
        await SunmiPrinterLibrary.printText(`CU S/N: ${invoice.cuSerialNumber}\n`);
      }
      if (invoice.mrcNo) {
        await SunmiPrinterLibrary.printText(`MRC: ${invoice.mrcNo}\n`);
      }
      if (invoice.controlCode) {
        await SunmiPrinterLibrary.printText(`Control: ${invoice.controlCode}\n`);
      }
      if (invoice.rcptSign || invoice.receiptSignature) {
        const sign = invoice.rcptSign || invoice.receiptSignature || '';
        await SunmiPrinterLibrary.printText(`Sign: ${sign.substring(0, 20)}...\n`);
      }
      
      const qrData = invoice.qrCodeData || 
        `https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=${invoice.invoiceNumber}`;
      await SunmiPrinterLibrary.setAlignment(1);
      await SunmiPrinterLibrary.printQRCode(qrData, 6);
      await SunmiPrinterLibrary.printText('Scan to verify on KRA\n');
      
      await SunmiPrinterLibrary.printText('\n');
      await SunmiPrinterLibrary.printText('Thank you for your business!\n');
      await SunmiPrinterLibrary.printText('Powered by Flow360\n');
      await SunmiPrinterLibrary.lineWrap(4);
      
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
      let qrCodeBase64 = '';
      if (invoice.qrCodeData) {
        qrCodeBase64 = await this.generateQRCodeBase64(invoice.qrCodeData);
      } else if (invoice.receiptSignature) {
        const qrData = `https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=${invoice.invoiceNumber}`;
        qrCodeBase64 = await this.generateQRCodeBase64(qrData);
      }

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
    const itemsHtml = invoice.items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      return `
        <tr>
          <td style="font-size: 7px; padding: 1px 0;">${item.name}</td>
          <td style="text-align: right; font-size: 7px;">${item.quantity.toFixed(2)}</td>
          <td style="text-align: right; font-size: 7px;">${item.unitPrice.toFixed(2)}</td>
          <td style="text-align: right; font-size: 7px;">${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const qrHtml = qrCodeBase64 ? `
      <div style="text-align: center; margin: 4px 0;">
        <img src="${qrCodeBase64}" style="width: 80px; height: 80px;" />
        <div style="font-size: 5px; margin-top: 2px;">Scan to verify on KRA</div>
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
            line-height: 1.2;
            width: 54mm;
            margin: 1.5mm auto;
            padding: 0;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 3px;
            border-bottom: 1px dashed #000;
            padding-bottom: 3px;
          }
          .header h1 {
            font-size: 10px;
            margin: 0;
            font-weight: bold;
          }
          .header h2 {
            font-size: 7px;
            margin: 1px 0;
            font-weight: normal;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 3px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            font-size: 6px;
            margin: 1px 0;
          }
          .tax-invoice {
            text-align: center;
            font-weight: bold;
            font-size: 8px;
            margin: 3px 0;
            padding: 2px;
            border: 1px solid #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            font-size: 6px;
            border-bottom: 1px solid #000;
            padding: 1px 0;
          }
          .totals .row {
            font-size: 6px;
          }
          .totals .grand-total {
            font-size: 9px;
            font-weight: bold;
            margin: 2px 0;
            padding: 2px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }
          .kra-section {
            margin-top: 3px;
            padding: 3px;
            background: #f5f5f5;
            font-size: 5px;
          }
          .kra-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 2px;
            font-size: 6px;
          }
          .kra-row {
            display: flex;
            justify-content: space-between;
            font-size: 5px;
            margin: 1px 0;
            word-break: break-all;
          }
          .footer {
            text-align: center;
            margin-top: 4px;
            font-size: 6px;
            padding-top: 3px;
            border-top: 1px dashed #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FLOW360</h1>
          <h2>${invoice.branchName}</h2>
          ${invoice.branchAddress ? `<div style="font-size: 6px;">${invoice.branchAddress}</div>` : ''}
        </div>
        
        <div class="row"><span>Invoice:</span><span><b>${invoice.invoiceNumber}</b></span></div>
        <div class="row"><span>Date:</span><span>${invoice.date} ${invoice.time}</span></div>
        <div class="row"><span>Cashier:</span><span>${invoice.cashierName}</span></div>
        ${invoice.customerName ? `<div class="row"><span>Customer:</span><span>${invoice.customerName}</span></div>` : ''}
        ${invoice.customerPin ? `<div class="row"><span>PIN:</span><span>${invoice.customerPin}</span></div>` : ''}
        
        <div class="tax-invoice">TAX INVOICE</div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amt</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div class="totals">
          <div class="row"><span>Subtotal:</span><span>${this.formatCurrency(invoice.subtotal)}</span></div>
          ${invoice.totalDiscount > 0 ? `<div class="row"><span>Discount:</span><span>-${this.formatCurrency(invoice.totalDiscount)}</span></div>` : ''}
          <div class="row"><span>Taxable:</span><span>${this.formatCurrency(invoice.taxableAmount)}</span></div>
          <div class="row"><span>VAT 16%:</span><span>${this.formatCurrency(invoice.totalTax)}</span></div>
          <div class="row grand-total"><span>TOTAL:</span><span>${this.formatCurrency(invoice.grandTotal)}</span></div>
        </div>
        
        <div class="row"><span>Payment:</span><span><b>${invoice.paymentMethod}</b></span></div>
        ${invoice.amountPaid !== undefined ? `<div class="row"><span>Paid:</span><span>${this.formatCurrency(invoice.amountPaid)}</span></div>` : ''}
        ${invoice.change !== undefined && invoice.change > 0 ? `<div class="row"><span>Change:</span><span>${this.formatCurrency(invoice.change)}</span></div>` : ''}
        
        <div class="kra-section">
          <div class="kra-title">KRA TIMS DETAILS</div>
          ${invoice.kraPin ? `<div class="kra-row"><span>KRA PIN:</span><span>${invoice.kraPin}</span></div>` : ''}
          ${invoice.cuSerialNumber ? `<div class="kra-row"><span>CU S/N:</span><span>${invoice.cuSerialNumber}</span></div>` : ''}
          ${invoice.mrcNo ? `<div class="kra-row"><span>MRC No:</span><span>${invoice.mrcNo}</span></div>` : ''}
          ${invoice.controlCode ? `<div class="kra-row"><span>Control:</span><span>${invoice.controlCode}</span></div>` : ''}
          ${invoice.rcptSign ? `<div class="kra-row"><span>Sign:</span><span style="font-size: 4px;">${invoice.rcptSign.substring(0, 32)}...</span></div>` : 
            (invoice.receiptSignature ? `<div class="kra-row"><span>Sign:</span><span style="font-size: 4px;">${invoice.receiptSignature.substring(0, 32)}...</span></div>` : '')}
          ${invoice.intrlData ? `<div class="kra-row"><span>Data:</span><span style="font-size: 4px;">${invoice.intrlData.substring(0, 20)}...</span></div>` : ''}
        </div>
        
        ${qrHtml}
        
        <div class="footer">
          <div>Thank you for your business!</div>
          <div style="margin-top: 2px; font-weight: bold;">Powered by Flow360</div>
        </div>
      </body>
      </html>
    `;
  }

  async printTestReceipt(): Promise<{ success: boolean; message: string }> {
    const testInvoice: InvoiceData = {
      invoiceNumber: 'TEST-001',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      branchName: 'Test Branch',
      branchAddress: '123 Test Street',
      cashierName: 'Test Cashier',
      items: [
        {
          name: 'Diesel',
          quantity: 50,
          unitPrice: 180.00,
          taxRate: 16
        }
      ],
      subtotal: 9000.00,
      totalDiscount: 0,
      taxableAmount: 7758.62,
      totalTax: 1241.38,
      grandTotal: 9000.00,
      paymentMethod: 'Cash',
      amountPaid: 9000.00,
      change: 0,
      kraPin: 'P000000000A',
      cuSerialNumber: 'CU123456789',
      mrcNo: 'MRC-001',
      controlCode: 'CTL-12345',
      rcptSign: 'ABC123DEF456GHI789JKL012MNO345PQR678STU',
      intrlData: 'ABCD1234EFGH5678IJKL',
      qrCodeData: 'https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=TEST-001'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new PrinterService();
export default sunmiPrinter;
