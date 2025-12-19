import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Device from 'expo-device';

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
}

export type PrinterType = 'sunmi' | 'pdf' | 'none';

function isSunmiDevice(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  const manufacturer = Device.manufacturer?.toLowerCase() || '';
  const brand = Device.brand?.toLowerCase() || '';
  const modelName = Device.modelName?.toLowerCase() || '';
  
  console.log('[PrinterService] Device info - manufacturer:', manufacturer, 'brand:', brand, 'model:', modelName);
  
  const isSunmi = manufacturer.includes('sunmi') || 
                  brand.includes('sunmi') || 
                  modelName.includes('sunmi') ||
                  modelName.includes('v2s') ||
                  modelName.includes('v2 pro');
  
  console.log('[PrinterService] Is Sunmi device:', isSunmi);
  return isSunmi;
}

class PrinterService {
  private printerType: PrinterType = 'none';
  private SunmiLib: any = null;
  private initialized: boolean = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.printerType !== 'none';
    }

    console.log('[PrinterService] Initializing, Platform:', Platform.OS);
    
    if (Platform.OS !== 'android') {
      console.log('[PrinterService] Not Android, using PDF printing');
      this.printerType = 'pdf';
      this.initialized = true;
      return true;
    }

    if (isSunmiDevice()) {
      const sunmiReady = await this.initSunmiPrinter();
      if (sunmiReady) {
        this.printerType = 'sunmi';
        console.log('[PrinterService] Sunmi printer ready');
        this.initialized = true;
        return true;
      }
    }
    
    this.printerType = 'pdf';
    console.log('[PrinterService] Using PDF printing (Sunmi not available or not a Sunmi device)');
    this.initialized = true;
    return true;
  }

  private async initSunmiPrinter(): Promise<boolean> {
    try {
      console.log('[PrinterService] Loading Sunmi library...');
      const module = require('@es-webdev/react-native-sunmi-printer');
      this.SunmiLib = module.default || module;
      
      if (this.SunmiLib && typeof this.SunmiLib.printerInit === 'function') {
        this.SunmiLib.printerInit();
        console.log('[PrinterService] Sunmi printer initialized successfully');
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('[PrinterService] Sunmi init failed:', error?.message || 'Unknown error');
      this.SunmiLib = null;
      return false;
    }
  }

  getPrinterType(): PrinterType {
    return this.printerType;
  }

  isAvailable(): boolean {
    return this.printerType !== 'none';
  }

  isSunmiPrinter(): boolean {
    return this.printerType === 'sunmi';
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  async printInvoice(invoice: InvoiceData): Promise<{ success: boolean; method: PrinterType; message: string }> {
    console.log('[PrinterService] printInvoice() called, printerType:', this.printerType);
    
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.printerType === 'sunmi' && this.SunmiLib) {
      const success = await this.printWithSunmi(invoice);
      return { 
        success, 
        method: 'sunmi', 
        message: success ? 'Receipt printed successfully' : 'Printing failed' 
      };
    } else {
      return await this.printWithPdf(invoice);
    }
  }

  private async printWithSunmi(invoice: InvoiceData): Promise<boolean> {
    try {
      const P = this.SunmiLib;
      
      P.enterPrinterBuffer(true);

      P.setAlignment(1);
      P.setFontSize(28);
      P.setFontWeight(true);
      P.printerText('FLOW360\n');
      P.setFontSize(24);
      P.printerText(`${invoice.branchName}\n`);
      P.setFontWeight(false);
      
      if (invoice.branchAddress) {
        P.setFontSize(20);
        P.printerText(`${invoice.branchAddress}\n`);
      }

      P.setFontSize(24);
      P.printerText('--------------------------------\n');

      P.setAlignment(0);
      P.printerText(`Invoice: ${invoice.invoiceNumber}\n`);
      P.printerText(`Date: ${invoice.date} ${invoice.time}\n`);
      P.printerText(`Cashier: ${invoice.cashierName}\n`);

      if (invoice.customerName) {
        P.printerText(`Customer: ${invoice.customerName}\n`);
      }
      if (invoice.customerPin) {
        P.printerText(`PIN: ${invoice.customerPin}\n`);
      }

      P.printerText('--------------------------------\n');

      P.setAlignment(1);
      P.setFontSize(22);
      P.setFontWeight(true);
      P.printerText('TAX INVOICE\n');
      P.setFontWeight(false);

      P.setFontSize(24);
      P.printerText('--------------------------------\n');

      P.setAlignment(0);
      P.printerText('ITEM           QTY    AMOUNT\n');
      P.printerText('--------------------------------\n');

      for (const item of invoice.items) {
        const itemName = item.name.length > 14 ? item.name.substring(0, 14) : item.name;
        const lineTotal = item.quantity * item.unitPrice;
        const itemDiscount = item.discount || 0;

        P.printerText(`${itemName}\n`);
        P.printerText(`  ${item.quantity.toFixed(2)} x ${this.formatCurrency(item.unitPrice)}\n`);
        
        P.setAlignment(2);
        P.printerText(`${this.formatCurrency(lineTotal)}\n`);
        P.setAlignment(0);

        if (itemDiscount > 0) {
          P.printerText(`  Discount: -${this.formatCurrency(itemDiscount)}\n`);
        }
      }

      P.printerText('--------------------------------\n');

      P.setAlignment(2);
      P.printerText(`Subtotal: ${this.formatCurrency(invoice.subtotal)}\n`);

      if (invoice.totalDiscount > 0) {
        P.printerText(`Total Discount: -${this.formatCurrency(invoice.totalDiscount)}\n`);
      }

      P.printerText(`Taxable Amount: ${this.formatCurrency(invoice.taxableAmount)}\n`);
      P.printerText(`VAT (16%): ${this.formatCurrency(invoice.totalTax)}\n`);

      P.setFontSize(26);
      P.setFontWeight(true);
      P.printerText(`TOTAL: ${this.formatCurrency(invoice.grandTotal)}\n`);
      P.setFontWeight(false);
      P.setFontSize(24);

      P.printerText('--------------------------------\n');

      P.setAlignment(0);
      P.printerText(`Payment: ${invoice.paymentMethod}\n`);

      if (invoice.amountPaid !== undefined) {
        P.printerText(`Amount Paid: ${this.formatCurrency(invoice.amountPaid)}\n`);
      }
      if (invoice.change !== undefined && invoice.change > 0) {
        P.printerText(`Change: ${this.formatCurrency(invoice.change)}\n`);
      }

      P.printerText('--------------------------------\n');

      P.setAlignment(1);
      P.setFontSize(20);
      P.setFontWeight(true);
      P.printerText('KRA TIMS DETAILS\n');
      P.setFontWeight(false);
      P.setFontSize(24);

      P.setAlignment(0);
      if (invoice.kraPin) {
        P.printerText(`KRA PIN: ${invoice.kraPin}\n`);
      }
      if (invoice.cuSerialNumber) {
        P.printerText(`CU S/N: ${invoice.cuSerialNumber}\n`);
      }
      if (invoice.receiptSignature) {
        const sig = invoice.receiptSignature.length > 20 
          ? invoice.receiptSignature.substring(0, 20) + '...'
          : invoice.receiptSignature;
        P.printerText(`Sign: ${sig}\n`);
      }

      if (invoice.qrCodeData) {
        P.lineWrap(1);
        P.setAlignment(1);
        P.printQRCode(invoice.qrCodeData, 6, 1);
        P.lineWrap(1);
      }

      P.printerText('--------------------------------\n');
      P.setAlignment(1);
      P.printerText('Thank you for your business!\n');
      P.printerText('Powered by Flow360\n');
      P.lineWrap(4);

      P.exitPrinterBuffer(true);
      
      console.log('[PrinterService] Sunmi print completed');
      return true;
    } catch (error) {
      console.error('[PrinterService] Sunmi print error:', error);
      return false;
    }
  }

  private async printWithPdf(invoice: InvoiceData): Promise<{ success: boolean; method: PrinterType; message: string }> {
    try {
      const html = this.generateReceiptHtml(invoice);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      console.log('[PrinterService] PDF generated at:', uri);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Receipt ${invoice.invoiceNumber}`,
          UTI: 'com.adobe.pdf',
        });
        return { 
          success: true, 
          method: 'pdf', 
          message: 'Receipt ready to share/print' 
        };
      } else {
        await Print.printAsync({ uri });
        return { 
          success: true, 
          method: 'pdf', 
          message: 'Receipt sent to printer' 
        };
      }
    } catch (error: any) {
      console.error('[PrinterService] PDF print error:', error);
      return { 
        success: false, 
        method: 'pdf', 
        message: error?.message || 'Failed to generate receipt' 
      };
    }
  }

  private generateReceiptHtml(invoice: InvoiceData): string {
    const itemsHtml = invoice.items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const discountHtml = item.discount && item.discount > 0 
        ? `<div style="font-size: 12px; color: #666;">Discount: -${this.formatCurrency(item.discount)}</div>`
        : '';
      
      return `
        <tr>
          <td style="padding: 4px 0;">${item.name}</td>
          <td style="text-align: center;">${item.quantity.toFixed(2)}</td>
          <td style="text-align: right;">${this.formatCurrency(item.unitPrice)}</td>
          <td style="text-align: right;">${this.formatCurrency(lineTotal)}</td>
        </tr>
        ${discountHtml ? `<tr><td colspan="4">${discountHtml}</td></tr>` : ''}
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .header h1 {
            font-size: 20px;
            margin: 0;
            font-weight: bold;
          }
          .header h2 {
            font-size: 16px;
            margin: 5px 0;
            font-weight: normal;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .tax-invoice {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin: 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 4px 0;
          }
          .totals {
            margin-top: 10px;
          }
          .totals .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .totals .grand-total {
            font-size: 18px;
            font-weight: bold;
            margin: 8px 0;
          }
          .kra-section {
            margin-top: 10px;
            font-size: 12px;
          }
          .kra-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FLOW360</h1>
          <h2>${invoice.branchName}</h2>
          ${invoice.branchAddress ? `<div>${invoice.branchAddress}</div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row"><span>Invoice:</span><span>${invoice.invoiceNumber}</span></div>
        <div class="info-row"><span>Date:</span><span>${invoice.date} ${invoice.time}</span></div>
        <div class="info-row"><span>Cashier:</span><span>${invoice.cashierName}</span></div>
        ${invoice.customerName ? `<div class="info-row"><span>Customer:</span><span>${invoice.customerName}</span></div>` : ''}
        ${invoice.customerPin ? `<div class="info-row"><span>PIN:</span><span>${invoice.customerPin}</span></div>` : ''}
        
        <div class="divider"></div>
        
        <div class="tax-invoice">TAX INVOICE</div>
        
        <div class="divider"></div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amount</th>
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
          <div class="row"><span>Taxable Amount:</span><span>${this.formatCurrency(invoice.taxableAmount)}</span></div>
          <div class="row"><span>VAT (16%):</span><span>${this.formatCurrency(invoice.totalTax)}</span></div>
          <div class="divider"></div>
          <div class="row grand-total"><span>TOTAL:</span><span>${this.formatCurrency(invoice.grandTotal)}</span></div>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row"><span>Payment:</span><span>${invoice.paymentMethod}</span></div>
        ${invoice.amountPaid !== undefined ? `<div class="info-row"><span>Amount Paid:</span><span>${this.formatCurrency(invoice.amountPaid)}</span></div>` : ''}
        ${invoice.change !== undefined && invoice.change > 0 ? `<div class="info-row"><span>Change:</span><span>${this.formatCurrency(invoice.change)}</span></div>` : ''}
        
        <div class="divider"></div>
        
        <div class="kra-section">
          <div class="kra-title">KRA TIMS DETAILS</div>
          ${invoice.kraPin ? `<div class="info-row"><span>KRA PIN:</span><span>${invoice.kraPin}</span></div>` : ''}
          ${invoice.cuSerialNumber ? `<div class="info-row"><span>CU S/N:</span><span>${invoice.cuSerialNumber}</span></div>` : ''}
          ${invoice.receiptSignature ? `<div class="info-row"><span>Signature:</span><span>${invoice.receiptSignature.substring(0, 20)}...</span></div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <div>Thank you for your business!</div>
          <div>Powered by Flow360</div>
        </div>
      </body>
      </html>
    `;
  }

  async printTestReceipt(): Promise<{ success: boolean; method: PrinterType; message: string }> {
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
          discount: 5,
          discountType: 'percentage',
          taxRate: 16
        }
      ],
      subtotal: 9000.00,
      totalDiscount: 450.00,
      taxableAmount: 7370.69,
      totalTax: 1179.31,
      grandTotal: 8550.00,
      paymentMethod: 'Cash',
      amountPaid: 9000.00,
      change: 450.00,
      kraPin: 'P000000000A',
      cuSerialNumber: 'CU123456789',
      receiptSignature: 'ABC123DEF456GHI789JKL'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new PrinterService();
export default sunmiPrinter;
