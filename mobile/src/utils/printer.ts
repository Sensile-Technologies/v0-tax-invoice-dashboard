import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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

export type PrinterType = 'pdf';

class PrinterService {
  private initialized: boolean = false;

  async initialize(): Promise<boolean> {
    this.initialized = true;
    console.log('[PrinterService] PDF printing ready');
    return true;
  }

  isAvailable(): boolean {
    return true;
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  async printInvoice(invoice: InvoiceData): Promise<{ success: boolean; message: string }> {
    console.log('[PrinterService] Generating PDF receipt...');
    
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
          message: 'Receipt ready - select printer or save' 
        };
      } else {
        await Print.printAsync({ uri });
        return { 
          success: true, 
          message: 'Receipt sent to printer' 
        };
      }
    } catch (error: any) {
      console.error('[PrinterService] PDF generation error:', error);
      return { 
        success: false, 
        message: error?.message || 'Failed to generate receipt' 
      };
    }
  }

  private generateReceiptHtml(invoice: InvoiceData): string {
    const itemsHtml = invoice.items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const discountHtml = item.discount && item.discount > 0 
        ? `<div style="font-size: 10px; color: #666; padding-left: 10px;">Discount: -${this.formatCurrency(item.discount)}</div>`
        : '';
      
      return `
        <tr>
          <td style="padding: 3px 0; font-size: 11px;">${item.name}</td>
          <td style="text-align: center; font-size: 11px;">${item.quantity.toFixed(2)}</td>
          <td style="text-align: right; font-size: 11px;">${this.formatCurrency(item.unitPrice)}</td>
          <td style="text-align: right; font-size: 11px;">${this.formatCurrency(lineTotal)}</td>
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
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.3;
            width: 72mm;
            margin: 4mm auto;
            padding: 0;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }
          .header h1 {
            font-size: 18px;
            margin: 0 0 4px 0;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .header h2 {
            font-size: 12px;
            margin: 2px 0;
            font-weight: normal;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 11px;
          }
          .tax-invoice {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin: 8px 0;
            padding: 4px;
            border: 1px solid #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            font-size: 10px;
            border-bottom: 1px solid #000;
            padding: 3px 0;
          }
          .totals {
            margin-top: 8px;
          }
          .totals .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 11px;
          }
          .totals .grand-total {
            font-size: 14px;
            font-weight: bold;
            margin: 6px 0;
            padding: 4px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }
          .kra-section {
            margin-top: 8px;
            padding: 6px;
            background: #f5f5f5;
            font-size: 10px;
          }
          .kra-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 4px;
            font-size: 11px;
          }
          .footer {
            text-align: center;
            margin-top: 12px;
            font-size: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FLOW360</h1>
          <h2>${invoice.branchName}</h2>
          ${invoice.branchAddress ? `<div style="font-size: 10px;">${invoice.branchAddress}</div>` : ''}
        </div>
        
        <div class="info-row"><span>Invoice:</span><span><b>${invoice.invoiceNumber}</b></span></div>
        <div class="info-row"><span>Date:</span><span>${invoice.date} ${invoice.time}</span></div>
        <div class="info-row"><span>Cashier:</span><span>${invoice.cashierName}</span></div>
        ${invoice.customerName ? `<div class="info-row"><span>Customer:</span><span>${invoice.customerName}</span></div>` : ''}
        ${invoice.customerPin ? `<div class="info-row"><span>PIN:</span><span>${invoice.customerPin}</span></div>` : ''}
        
        <div class="tax-invoice">TAX INVOICE</div>
        
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
          <div class="row grand-total"><span>TOTAL:</span><span>${this.formatCurrency(invoice.grandTotal)}</span></div>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row"><span>Payment:</span><span><b>${invoice.paymentMethod}</b></span></div>
        ${invoice.amountPaid !== undefined ? `<div class="info-row"><span>Amount Paid:</span><span>${this.formatCurrency(invoice.amountPaid)}</span></div>` : ''}
        ${invoice.change !== undefined && invoice.change > 0 ? `<div class="info-row"><span>Change:</span><span>${this.formatCurrency(invoice.change)}</span></div>` : ''}
        
        <div class="kra-section">
          <div class="kra-title">KRA TIMS DETAILS</div>
          ${invoice.kraPin ? `<div class="info-row"><span>KRA PIN:</span><span>${invoice.kraPin}</span></div>` : ''}
          ${invoice.cuSerialNumber ? `<div class="info-row"><span>CU S/N:</span><span>${invoice.cuSerialNumber}</span></div>` : ''}
          ${invoice.receiptSignature ? `<div class="info-row"><span>Signature:</span><span style="font-size: 9px;">${invoice.receiptSignature.substring(0, 24)}...</span></div>` : ''}
        </div>
        
        <div class="footer">
          <div>Thank you for your business!</div>
          <div style="margin-top: 4px; font-weight: bold;">Powered by Flow360</div>
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
      receiptSignature: 'ABC123DEF456GHI789JKL012MNO'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new PrinterService();
export default sunmiPrinter;
