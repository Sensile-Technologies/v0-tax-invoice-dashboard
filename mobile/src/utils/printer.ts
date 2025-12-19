import { Platform } from 'react-native';
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library';

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

class SunmiPrinter {
  private isReady: boolean = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('Sunmi printer only available on Android');
      return false;
    }

    try {
      await SunmiPrinterLibrary.prepare();
      this.isReady = true;
      return true;
    } catch (error) {
      console.warn('Sunmi printer not available:', error);
      this.isReady = false;
      return false;
    }
  }

  async getPrinterStatus(): Promise<string> {
    if (!this.isReady) {
      return 'Not initialized';
    }
    try {
      const status = await SunmiPrinterLibrary.getPrinterState();
      return status.description || `Status: ${status.value}`;
    } catch (error) {
      return 'Error checking status';
    }
  }

  calculateItemDiscount(item: InvoiceItem): number {
    if (!item.discount || item.discount <= 0) return 0;
    
    const lineTotal = item.quantity * item.unitPrice;
    
    if (item.discountType === 'percentage') {
      return (lineTotal * item.discount) / 100;
    } else {
      return Math.min(item.discount, lineTotal);
    }
  }

  calculateItemTax(item: InvoiceItem): { taxableAmount: number; taxAmount: number } {
    const lineTotal = item.quantity * item.unitPrice;
    const discount = this.calculateItemDiscount(item);
    const taxableAmount = lineTotal - discount;
    const taxAmount = (taxableAmount * item.taxRate) / 100;
    
    return { taxableAmount, taxAmount };
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  formatLine(left: string, right: string, width: number = 32): string {
    const spaces = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaces) + right;
  }

  async printInvoice(invoice: InvoiceData): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('Printing not available on this platform');
      return false;
    }

    if (!this.isReady) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.log('Failed to initialize printer');
        return false;
      }
    }

    try {
      await SunmiPrinterLibrary.enterPrinterBuffer(true);

      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.printTextWithFont('FLOW360', 'default', 28);
      await SunmiPrinterLibrary.lineWrap(1);
      await SunmiPrinterLibrary.printTextWithFont(invoice.branchName, 'default', 24);
      await SunmiPrinterLibrary.lineWrap(1);
      
      if (invoice.branchAddress) {
        await SunmiPrinterLibrary.printTextWithFont(invoice.branchAddress, 'default', 20);
        await SunmiPrinterLibrary.lineWrap(1);
      }

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.printText(`Invoice: ${invoice.invoiceNumber}`);
      await SunmiPrinterLibrary.lineWrap(1);
      await SunmiPrinterLibrary.printText(`Date: ${invoice.date} ${invoice.time}`);
      await SunmiPrinterLibrary.lineWrap(1);
      await SunmiPrinterLibrary.printText(`Cashier: ${invoice.cashierName}`);
      await SunmiPrinterLibrary.lineWrap(1);

      if (invoice.customerName) {
        await SunmiPrinterLibrary.printText(`Customer: ${invoice.customerName}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }
      if (invoice.customerPin) {
        await SunmiPrinterLibrary.printText(`PIN: ${invoice.customerPin}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.printTextWithFont('TAX INVOICE', 'default', 22);
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.printText('ITEM           QTY    AMOUNT');
      await SunmiPrinterLibrary.lineWrap(1);
      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      for (const item of invoice.items) {
        const itemName = item.name.length > 14 ? item.name.substring(0, 14) : item.name;
        const lineTotal = item.quantity * item.unitPrice;
        const itemDiscount = item.discount || 0;

        await SunmiPrinterLibrary.printText(itemName);
        await SunmiPrinterLibrary.lineWrap(1);
        
        const qtyStr = item.quantity.toFixed(2);
        const priceStr = this.formatCurrency(item.unitPrice);
        const totalStr = this.formatCurrency(lineTotal);
        
        await SunmiPrinterLibrary.printText(`  ${qtyStr} x ${priceStr}`);
        await SunmiPrinterLibrary.lineWrap(1);
        
        await SunmiPrinterLibrary.setAlignment('right');
        await SunmiPrinterLibrary.printText(totalStr);
        await SunmiPrinterLibrary.lineWrap(1);
        await SunmiPrinterLibrary.setAlignment('left');

        if (itemDiscount > 0) {
          await SunmiPrinterLibrary.printText(`  Discount: -${this.formatCurrency(itemDiscount)}`);
          await SunmiPrinterLibrary.lineWrap(1);
        }
      }

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('right');
      
      await SunmiPrinterLibrary.printText(`Subtotal: ${this.formatCurrency(invoice.subtotal)}`);
      await SunmiPrinterLibrary.lineWrap(1);

      if (invoice.totalDiscount > 0) {
        await SunmiPrinterLibrary.printText(`Total Discount: -${this.formatCurrency(invoice.totalDiscount)}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }

      await SunmiPrinterLibrary.printText(`Taxable Amount: ${this.formatCurrency(invoice.taxableAmount)}`);
      await SunmiPrinterLibrary.lineWrap(1);
      
      await SunmiPrinterLibrary.printText(`VAT (16%): ${this.formatCurrency(invoice.totalTax)}`);
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.printTextWithFont(`TOTAL: ${this.formatCurrency(invoice.grandTotal)}`, 'default', 24);
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.printText(`Payment: ${invoice.paymentMethod}`);
      await SunmiPrinterLibrary.lineWrap(1);

      if (invoice.amountPaid !== undefined) {
        await SunmiPrinterLibrary.printText(`Amount Paid: ${this.formatCurrency(invoice.amountPaid)}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }
      if (invoice.change !== undefined && invoice.change > 0) {
        await SunmiPrinterLibrary.printText(`Change: ${this.formatCurrency(invoice.change)}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.printTextWithFont('KRA TIMS DETAILS', 'default', 20);
      await SunmiPrinterLibrary.lineWrap(1);

      await SunmiPrinterLibrary.setAlignment('left');
      if (invoice.kraPin) {
        await SunmiPrinterLibrary.printText(`KRA PIN: ${invoice.kraPin}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }
      if (invoice.cuSerialNumber) {
        await SunmiPrinterLibrary.printText(`CU S/N: ${invoice.cuSerialNumber}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }
      if (invoice.receiptSignature) {
        const sig = invoice.receiptSignature.length > 20 
          ? invoice.receiptSignature.substring(0, 20) + '...'
          : invoice.receiptSignature;
        await SunmiPrinterLibrary.printText(`Sign: ${sig}`);
        await SunmiPrinterLibrary.lineWrap(1);
      }

      if (invoice.qrCodeData) {
        await SunmiPrinterLibrary.lineWrap(1);
        await SunmiPrinterLibrary.setAlignment('center');
        await SunmiPrinterLibrary.printQRCode(invoice.qrCodeData, 6, 'middle');
        await SunmiPrinterLibrary.lineWrap(1);
      }

      await SunmiPrinterLibrary.printText('--------------------------------');
      await SunmiPrinterLibrary.lineWrap(1);
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.printText('Thank you for your business!');
      await SunmiPrinterLibrary.lineWrap(1);
      await SunmiPrinterLibrary.printText('Powered by Flow360');
      await SunmiPrinterLibrary.lineWrap(4);

      await SunmiPrinterLibrary.exitPrinterBuffer(true);

      return true;
    } catch (error) {
      console.error('Print error:', error);
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
        },
        {
          name: 'Petrol',
          quantity: 30,
          unitPrice: 200.00,
          taxRate: 16
        }
      ],
      subtotal: 15000.00,
      totalDiscount: 450.00,
      taxableAmount: 14550.00,
      totalTax: 2328.00,
      grandTotal: 16878.00,
      paymentMethod: 'Cash',
      amountPaid: 17000.00,
      change: 122.00,
      kraPin: 'P000000000A',
      cuSerialNumber: 'CU123456789',
      receiptSignature: 'ABC123DEF456'
    };

    return this.printInvoice(testInvoice);
  }
}

export const sunmiPrinter = new SunmiPrinter();
export default sunmiPrinter;
