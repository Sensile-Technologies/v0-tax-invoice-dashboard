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

let SunmiPrinterLib: any = null;

async function loadSunmiLibrary(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.log('[SunmiPrinter] Not Android, skipping library load');
    return false;
  }
  
  if (SunmiPrinterLib !== null) {
    return true;
  }
  
  try {
    console.log('[SunmiPrinter] Loading Sunmi library...');
    const module = require('@es-webdev/react-native-sunmi-printer');
    SunmiPrinterLib = module.default || module;
    console.log('[SunmiPrinter] Library loaded successfully');
    return true;
  } catch (error) {
    console.warn('[SunmiPrinter] Failed to load library:', error);
    return false;
  }
}

class PrinterService {
  private isReady: boolean = false;
  private libraryLoaded: boolean = false;

  async initialize(): Promise<boolean> {
    console.log('[SunmiPrinter] initialize() called, Platform:', Platform.OS);
    
    if (Platform.OS !== 'android') {
      console.log('[SunmiPrinter] Not Android, skipping initialization');
      return false;
    }

    try {
      this.libraryLoaded = await loadSunmiLibrary();
      if (!this.libraryLoaded || !SunmiPrinterLib) {
        console.log('[SunmiPrinter] Library not available');
        return false;
      }
      
      console.log('[SunmiPrinter] Calling printerInit()...');
      SunmiPrinterLib.printerInit();
      this.isReady = true;
      console.log('[SunmiPrinter] Initialization successful, printer ready');
      return true;
    } catch (error) {
      console.warn('[SunmiPrinter] Initialization failed:', error);
      this.isReady = false;
      return false;
    }
  }

  async getPrinterStatus(): Promise<string> {
    if (!this.isReady || !SunmiPrinterLib) {
      return 'Not initialized';
    }
    try {
      const status = await SunmiPrinterLib.updatePrinterState();
      return `Status: ${status}`;
    } catch (error) {
      return 'Error checking status';
    }
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  async printInvoice(invoice: InvoiceData): Promise<boolean> {
    console.log('[SunmiPrinter] printInvoice() called, isReady:', this.isReady);
    
    if (Platform.OS !== 'android') {
      console.log('[SunmiPrinter] Not Android, skipping print');
      return false;
    }

    if (!this.isReady) {
      console.log('[SunmiPrinter] Printer not ready, attempting re-init...');
      const ready = await this.initialize();
      if (!ready) {
        console.log('[SunmiPrinter] Re-init failed, cannot print');
        return false;
      }
    }

    if (!SunmiPrinterLib) {
      console.log('[SunmiPrinter] Library not available');
      return false;
    }

    try {
      console.log('[SunmiPrinter] Starting print job...');
      
      SunmiPrinterLib.enterPrinterBuffer(true);

      SunmiPrinterLib.setAlignment(1);
      SunmiPrinterLib.setFontSize(28);
      SunmiPrinterLib.setFontWeight(true);
      SunmiPrinterLib.printerText('FLOW360\n');
      SunmiPrinterLib.setFontSize(24);
      SunmiPrinterLib.printerText(`${invoice.branchName}\n`);
      SunmiPrinterLib.setFontWeight(false);
      
      if (invoice.branchAddress) {
        SunmiPrinterLib.setFontSize(20);
        SunmiPrinterLib.printerText(`${invoice.branchAddress}\n`);
      }

      SunmiPrinterLib.setFontSize(24);
      SunmiPrinterLib.printerText('--------------------------------\n');

      SunmiPrinterLib.setAlignment(0);
      SunmiPrinterLib.printerText(`Invoice: ${invoice.invoiceNumber}\n`);
      SunmiPrinterLib.printerText(`Date: ${invoice.date} ${invoice.time}\n`);
      SunmiPrinterLib.printerText(`Cashier: ${invoice.cashierName}\n`);

      if (invoice.customerName) {
        SunmiPrinterLib.printerText(`Customer: ${invoice.customerName}\n`);
      }
      if (invoice.customerPin) {
        SunmiPrinterLib.printerText(`PIN: ${invoice.customerPin}\n`);
      }

      SunmiPrinterLib.printerText('--------------------------------\n');

      SunmiPrinterLib.setAlignment(1);
      SunmiPrinterLib.setFontSize(22);
      SunmiPrinterLib.setFontWeight(true);
      SunmiPrinterLib.printerText('TAX INVOICE\n');
      SunmiPrinterLib.setFontWeight(false);

      SunmiPrinterLib.setFontSize(24);
      SunmiPrinterLib.printerText('--------------------------------\n');

      SunmiPrinterLib.setAlignment(0);
      SunmiPrinterLib.printerText('ITEM           QTY    AMOUNT\n');
      SunmiPrinterLib.printerText('--------------------------------\n');

      for (const item of invoice.items) {
        const itemName = item.name.length > 14 ? item.name.substring(0, 14) : item.name;
        const lineTotal = item.quantity * item.unitPrice;
        const itemDiscount = item.discount || 0;

        SunmiPrinterLib.printerText(`${itemName}\n`);
        
        const qtyStr = item.quantity.toFixed(2);
        const priceStr = this.formatCurrency(item.unitPrice);
        const totalStr = this.formatCurrency(lineTotal);
        
        SunmiPrinterLib.printerText(`  ${qtyStr} x ${priceStr}\n`);
        
        SunmiPrinterLib.setAlignment(2);
        SunmiPrinterLib.printerText(`${totalStr}\n`);
        SunmiPrinterLib.setAlignment(0);

        if (itemDiscount > 0) {
          SunmiPrinterLib.printerText(`  Discount: -${this.formatCurrency(itemDiscount)}\n`);
        }
      }

      SunmiPrinterLib.printerText('--------------------------------\n');

      SunmiPrinterLib.setAlignment(2);
      
      SunmiPrinterLib.printerText(`Subtotal: ${this.formatCurrency(invoice.subtotal)}\n`);

      if (invoice.totalDiscount > 0) {
        SunmiPrinterLib.printerText(`Total Discount: -${this.formatCurrency(invoice.totalDiscount)}\n`);
      }

      SunmiPrinterLib.printerText(`Taxable Amount: ${this.formatCurrency(invoice.taxableAmount)}\n`);
      SunmiPrinterLib.printerText(`VAT (16%): ${this.formatCurrency(invoice.totalTax)}\n`);

      SunmiPrinterLib.setFontSize(26);
      SunmiPrinterLib.setFontWeight(true);
      SunmiPrinterLib.printerText(`TOTAL: ${this.formatCurrency(invoice.grandTotal)}\n`);
      SunmiPrinterLib.setFontWeight(false);
      SunmiPrinterLib.setFontSize(24);

      SunmiPrinterLib.printerText('--------------------------------\n');

      SunmiPrinterLib.setAlignment(0);
      SunmiPrinterLib.printerText(`Payment: ${invoice.paymentMethod}\n`);

      if (invoice.amountPaid !== undefined) {
        SunmiPrinterLib.printerText(`Amount Paid: ${this.formatCurrency(invoice.amountPaid)}\n`);
      }
      if (invoice.change !== undefined && invoice.change > 0) {
        SunmiPrinterLib.printerText(`Change: ${this.formatCurrency(invoice.change)}\n`);
      }

      SunmiPrinterLib.printerText('--------------------------------\n');

      SunmiPrinterLib.setAlignment(1);
      SunmiPrinterLib.setFontSize(20);
      SunmiPrinterLib.setFontWeight(true);
      SunmiPrinterLib.printerText('KRA TIMS DETAILS\n');
      SunmiPrinterLib.setFontWeight(false);
      SunmiPrinterLib.setFontSize(24);

      SunmiPrinterLib.setAlignment(0);
      if (invoice.kraPin) {
        SunmiPrinterLib.printerText(`KRA PIN: ${invoice.kraPin}\n`);
      }
      if (invoice.cuSerialNumber) {
        SunmiPrinterLib.printerText(`CU S/N: ${invoice.cuSerialNumber}\n`);
      }
      if (invoice.receiptSignature) {
        const sig = invoice.receiptSignature.length > 20 
          ? invoice.receiptSignature.substring(0, 20) + '...'
          : invoice.receiptSignature;
        SunmiPrinterLib.printerText(`Sign: ${sig}\n`);
      }

      if (invoice.qrCodeData) {
        SunmiPrinterLib.lineWrap(1);
        SunmiPrinterLib.setAlignment(1);
        SunmiPrinterLib.printQRCode(invoice.qrCodeData, 6, 1);
        SunmiPrinterLib.lineWrap(1);
      }

      SunmiPrinterLib.printerText('--------------------------------\n');
      SunmiPrinterLib.setAlignment(1);
      SunmiPrinterLib.printerText('Thank you for your business!\n');
      SunmiPrinterLib.printerText('Powered by Flow360\n');
      SunmiPrinterLib.lineWrap(4);

      SunmiPrinterLib.exitPrinterBuffer(true);

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
