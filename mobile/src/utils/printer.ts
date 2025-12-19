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

class PrinterService {
  private isReady: boolean = false;
  private SunmiLib: any = null;

  async initialize(): Promise<boolean> {
    console.log('[SunmiPrinter] initialize() called, Platform:', Platform.OS);
    
    if (Platform.OS !== 'android') {
      console.log('[SunmiPrinter] Not Android, skipping initialization');
      return false;
    }

    try {
      console.log('[SunmiPrinter] Attempting to load Sunmi library...');
      this.SunmiLib = require('@es-webdev/react-native-sunmi-printer').default;
      
      if (this.SunmiLib && typeof this.SunmiLib.printerInit === 'function') {
        console.log('[SunmiPrinter] Library loaded, calling printerInit()...');
        this.SunmiLib.printerInit();
        this.isReady = true;
        console.log('[SunmiPrinter] Printer initialized successfully');
        return true;
      } else {
        console.log('[SunmiPrinter] Library loaded but printerInit not available');
        return false;
      }
    } catch (error: any) {
      console.log('[SunmiPrinter] Failed to initialize (expected on non-Sunmi devices):', error?.message || error);
      this.isReady = false;
      this.SunmiLib = null;
      return false;
    }
  }

  isAvailable(): boolean {
    return this.isReady && this.SunmiLib !== null;
  }

  async getPrinterStatus(): Promise<string> {
    if (!this.isAvailable()) {
      return 'Printer not available';
    }
    try {
      const status = await this.SunmiLib.updatePrinterState();
      return `Status: ${status}`;
    } catch (error) {
      return 'Error checking status';
    }
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  async printInvoice(invoice: InvoiceData): Promise<boolean> {
    console.log('[SunmiPrinter] printInvoice() called');
    
    if (!this.isAvailable()) {
      console.log('[SunmiPrinter] Printer not available, skipping print');
      return false;
    }

    try {
      console.log('[SunmiPrinter] Starting print job...');
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
        
        const qtyStr = item.quantity.toFixed(2);
        const priceStr = this.formatCurrency(item.unitPrice);
        const totalStr = this.formatCurrency(lineTotal);
        
        P.printerText(`  ${qtyStr} x ${priceStr}\n`);
        
        P.setAlignment(2);
        P.printerText(`${totalStr}\n`);
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

      console.log('[SunmiPrinter] Print job completed successfully');
      return true;
    } catch (error) {
      console.error('[SunmiPrinter] Print error:', error);
      return false;
    }
  }

  async printTestReceipt(): Promise<boolean> {
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
      receiptSignature: 'ABC123DEF456'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new PrinterService();
export default sunmiPrinter;
