import { Platform } from 'react-native';

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

export type PrinterType = 'sunmi' | 'none';

let SunmiPrinter: any = null;

class PrinterService {
  private initialized: boolean = false;
  private initError: string | null = null;

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return SunmiPrinter !== null;
    }

    if (Platform.OS !== 'android') {
      console.log('[PrinterService] Not Android - Sunmi printer not available');
      this.initialized = true;
      return false;
    }

    try {
      console.log('[PrinterService] Loading Sunmi printer module...');
      const module = require('@es-webdev/react-native-sunmi-printer');
      SunmiPrinter = module.default || module;
      
      if (SunmiPrinter && typeof SunmiPrinter.printerInit === 'function') {
        console.log('[PrinterService] Initializing Sunmi printer...');
        SunmiPrinter.printerInit();
        this.initialized = true;
        console.log('[PrinterService] Sunmi printer ready');
        return true;
      } else {
        console.log('[PrinterService] Sunmi printer module invalid');
        this.initError = 'Invalid printer module';
        this.initialized = true;
        return false;
      }
    } catch (error: any) {
      console.error('[PrinterService] Sunmi init failed:', error?.message || error);
      this.initError = error?.message || 'Failed to load printer';
      this.initialized = true;
      SunmiPrinter = null;
      return false;
    }
  }

  isAvailable(): boolean {
    return Platform.OS === 'android' && SunmiPrinter !== null;
  }

  getInitError(): string | null {
    return this.initError;
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  async printInvoice(invoice: InvoiceData): Promise<{ success: boolean; message: string }> {
    console.log('[PrinterService] printInvoice() called');
    
    if (!this.initialized) {
      await this.initialize();
    }

    if (!SunmiPrinter) {
      return { success: false, message: this.initError || 'Printer not available' };
    }

    try {
      SunmiPrinter.enterPrinterBuffer(true);

      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontSize(28);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('FLOW360\n');
      SunmiPrinter.setFontSize(24);
      SunmiPrinter.printerText(`${invoice.branchName}\n`);
      SunmiPrinter.setFontWeight(false);
      
      if (invoice.branchAddress) {
        SunmiPrinter.setFontSize(20);
        SunmiPrinter.printerText(`${invoice.branchAddress}\n`);
      }

      SunmiPrinter.setFontSize(24);
      SunmiPrinter.printerText('--------------------------------\n');

      SunmiPrinter.setAlignment(0);
      SunmiPrinter.printerText(`Invoice: ${invoice.invoiceNumber}\n`);
      SunmiPrinter.printerText(`Date: ${invoice.date} ${invoice.time}\n`);
      SunmiPrinter.printerText(`Cashier: ${invoice.cashierName}\n`);

      if (invoice.customerName) {
        SunmiPrinter.printerText(`Customer: ${invoice.customerName}\n`);
      }
      if (invoice.customerPin) {
        SunmiPrinter.printerText(`PIN: ${invoice.customerPin}\n`);
      }

      SunmiPrinter.printerText('--------------------------------\n');

      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontSize(22);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('TAX INVOICE\n');
      SunmiPrinter.setFontWeight(false);

      SunmiPrinter.setFontSize(24);
      SunmiPrinter.printerText('--------------------------------\n');

      SunmiPrinter.setAlignment(0);
      SunmiPrinter.printerText('ITEM           QTY    AMOUNT\n');
      SunmiPrinter.printerText('--------------------------------\n');

      for (const item of invoice.items) {
        const itemName = item.name.length > 14 ? item.name.substring(0, 14) : item.name;
        const lineTotal = item.quantity * item.unitPrice;
        const itemDiscount = item.discount || 0;

        SunmiPrinter.printerText(`${itemName}\n`);
        SunmiPrinter.printerText(`  ${item.quantity.toFixed(2)} x ${this.formatCurrency(item.unitPrice)}\n`);
        
        SunmiPrinter.setAlignment(2);
        SunmiPrinter.printerText(`${this.formatCurrency(lineTotal)}\n`);
        SunmiPrinter.setAlignment(0);

        if (itemDiscount > 0) {
          SunmiPrinter.printerText(`  Discount: -${this.formatCurrency(itemDiscount)}\n`);
        }
      }

      SunmiPrinter.printerText('--------------------------------\n');

      SunmiPrinter.setAlignment(2);
      SunmiPrinter.printerText(`Subtotal: ${this.formatCurrency(invoice.subtotal)}\n`);

      if (invoice.totalDiscount > 0) {
        SunmiPrinter.printerText(`Total Discount: -${this.formatCurrency(invoice.totalDiscount)}\n`);
      }

      SunmiPrinter.printerText(`Taxable Amount: ${this.formatCurrency(invoice.taxableAmount)}\n`);
      SunmiPrinter.printerText(`VAT (16%): ${this.formatCurrency(invoice.totalTax)}\n`);

      SunmiPrinter.setFontSize(26);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText(`TOTAL: ${this.formatCurrency(invoice.grandTotal)}\n`);
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.setFontSize(24);

      SunmiPrinter.printerText('--------------------------------\n');

      SunmiPrinter.setAlignment(0);
      SunmiPrinter.printerText(`Payment: ${invoice.paymentMethod}\n`);

      if (invoice.amountPaid !== undefined) {
        SunmiPrinter.printerText(`Amount Paid: ${this.formatCurrency(invoice.amountPaid)}\n`);
      }
      if (invoice.change !== undefined && invoice.change > 0) {
        SunmiPrinter.printerText(`Change: ${this.formatCurrency(invoice.change)}\n`);
      }

      SunmiPrinter.printerText('--------------------------------\n');

      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontSize(20);
      SunmiPrinter.setFontWeight(true);
      SunmiPrinter.printerText('KRA TIMS DETAILS\n');
      SunmiPrinter.setFontWeight(false);
      SunmiPrinter.setFontSize(24);

      SunmiPrinter.setAlignment(0);
      if (invoice.kraPin) {
        SunmiPrinter.printerText(`KRA PIN: ${invoice.kraPin}\n`);
      }
      if (invoice.cuSerialNumber) {
        SunmiPrinter.printerText(`CU S/N: ${invoice.cuSerialNumber}\n`);
      }
      if (invoice.receiptSignature) {
        const sig = invoice.receiptSignature.length > 20 
          ? invoice.receiptSignature.substring(0, 20) + '...'
          : invoice.receiptSignature;
        SunmiPrinter.printerText(`Sign: ${sig}\n`);
      }

      if (invoice.qrCodeData) {
        SunmiPrinter.lineWrap(1);
        SunmiPrinter.setAlignment(1);
        SunmiPrinter.printQRCode(invoice.qrCodeData, 6, 1);
        SunmiPrinter.lineWrap(1);
      }

      SunmiPrinter.printerText('--------------------------------\n');
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.printerText('Thank you for your business!\n');
      SunmiPrinter.printerText('Powered by Flow360\n');
      SunmiPrinter.lineWrap(4);

      SunmiPrinter.exitPrinterBuffer(true);
      
      console.log('[PrinterService] Print completed');
      return { success: true, message: 'Receipt printed successfully' };
    } catch (error: any) {
      console.error('[PrinterService] Print error:', error);
      return { success: false, message: error?.message || 'Printing failed' };
    }
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
      receiptSignature: 'ABC123DEF456GHI789JKL'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new PrinterService();
export default sunmiPrinter;
