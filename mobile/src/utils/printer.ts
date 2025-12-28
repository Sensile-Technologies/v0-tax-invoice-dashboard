import { Platform } from 'react-native';
import * as Print from 'expo-print';
import QRCode from 'qrcode';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://flow360.live';

interface PrintLogContext {
  branch_id?: string;
  vendor_id?: string;
  user_id?: string;
  username?: string;
  invoice_number?: string;
}

let currentPrintContext: PrintLogContext = {};

export function setPrintContext(context: PrintLogContext) {
  currentPrintContext = { ...context };
}

function sendPrintLog(step: string, status: 'start' | 'success' | 'error' | 'info', message?: string, errorDetails?: any) {
  try {
    fetch(`${API_BASE_URL}/api/mobile/printer-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentPrintContext,
        step,
        status,
        message,
        error_details: errorDetails
      })
    }).catch(() => {});
  } catch (e) {
  }
}

let SunmiPrinterLibrary: any = null;
try {
  // Use require for compatibility with Expo/React Native bundler
  const lib = require('@mitsuharu/react-native-sunmi-printer-library');
  // Handle both default and named exports
  SunmiPrinterLibrary = lib.default ?? lib;
  console.log('[PrinterService] Sunmi library loaded, methods:', Object.keys(SunmiPrinterLibrary || {}).slice(0, 10));
  console.log('[PrinterService] Has prepare:', typeof SunmiPrinterLibrary?.prepare === 'function');
} catch (e: any) {
  console.log('[PrinterService] Sunmi printer library not available:', e?.message);
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
  documentType?: 'invoice' | 'credit_note';
}

export type PrinterType = 'sunmi' | 'pdf';

class PrinterService {
  private initialized: boolean = false;
  private isSunmiDevice: boolean = false;

  // Sanitize text to remove problematic characters for thermal printers
  private sanitizeText(text: string | undefined | null): string {
    if (!text) return '';
    // Remove or replace problematic Unicode characters
    // Keep basic ASCII, common punctuation, and essential symbols
    return text
      .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular
      .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
      .replace(/[\u2013\u2014]/g, '-') // Em/en dashes
      .replace(/[\u2026]/g, '...') // Ellipsis
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable chars except newline
      .trim();
  }

  // Print receipt as image - best for smooth printing without pulsing
  async printReceiptImage(imageBase64: string): Promise<{ success: boolean; message: string }> {
    sendPrintLog('image_print_start', 'start', 'Starting image print', {
      isSunmiDevice: this.isSunmiDevice,
      hasSunmiLib: !!SunmiPrinterLibrary,
      imageLength: imageBase64?.length || 0
    });

    if (!this.isSunmiDevice || !SunmiPrinterLibrary) {
      console.log('[PrinterService] Sunmi not available for image printing');
      sendPrintLog('image_print_unavailable', 'error', 'Sunmi printer not available', {
        isSunmiDevice: this.isSunmiDevice,
        hasSunmiLib: !!SunmiPrinterLibrary
      });
      return { success: false, message: 'Sunmi printer not available' };
    }

    try {
      console.log('[PrinterService] === IMAGE PRINT START ===');
      console.log('[PrinterService] Image base64 length:', imageBase64.length);
      sendPrintLog('image_print_processing', 'info', `Processing image, length: ${imageBase64.length}`);
      
      // Ensure data URI prefix is present (printImage requires it)
      let imageData = imageBase64;
      if (!imageBase64.startsWith('data:image/')) {
        imageData = `data:image/png;base64,${imageBase64}`;
      }
      
      // Enter printer buffer mode for image printing (recommended for reliability)
      sendPrintLog('image_print_enter_buffer', 'info', 'Entering printer buffer mode');
      try {
        await SunmiPrinterLibrary.enterPrinterBuffer(true);
      } catch (bufferErr: any) {
        sendPrintLog('image_print_buffer_warning', 'info', `Buffer mode optional: ${bufferErr?.message}`);
      }
      
      sendPrintLog('image_print_alignment', 'info', 'Setting alignment');
      await SunmiPrinterLibrary.setAlignment('center');
      
      // Use printImage method with grayscale mode for better compatibility
      sendPrintLog('image_print_sending', 'info', 'Sending image to printer (grayscale mode)');
      await SunmiPrinterLibrary.printImage(imageData, 384, 'grayscale');
      
      // Add some line feeds at the end
      await SunmiPrinterLibrary.lineWrap(3);
      
      // Exit buffer mode to flush print
      sendPrintLog('image_print_exit_buffer', 'info', 'Exiting printer buffer mode');
      try {
        await SunmiPrinterLibrary.exitPrinterBuffer(true);
      } catch (bufferErr: any) {
        sendPrintLog('image_print_buffer_exit_warning', 'info', `Buffer exit optional: ${bufferErr?.message}`);
      }
      
      console.log('[PrinterService] === IMAGE PRINT SUCCESS ===');
      sendPrintLog('image_print_complete', 'success', 'Receipt printed successfully');
      return { success: true, message: 'Receipt printed successfully' };
    } catch (error: any) {
      console.error('[PrinterService] === IMAGE PRINT ERROR ===');
      console.error('[PrinterService] Error:', error?.message || error);
      const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
      sendPrintLog('image_print_error', 'error', error?.message || 'Image print failed', {
        errorName: error?.name,
        errorStack: error?.stack?.substring(0, 500),
        errorFull: errorStr?.substring(0, 800)
      });
      return { success: false, message: error?.message || 'Image print failed' };
    }
  }

  async initialize(): Promise<boolean> {
    console.log('[PrinterService] Initializing... Platform:', Platform.OS, 'SunmiLib available:', !!SunmiPrinterLibrary);
    
    if (Platform.OS === 'android' && SunmiPrinterLibrary) {
      try {
        console.log('[PrinterService] Calling prepare()...');
        // Add timeout to prevent hanging
        const preparePromise = SunmiPrinterLibrary.prepare();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Printer init timeout')), 5000)
        );
        await Promise.race([preparePromise, timeoutPromise]);
        this.isSunmiDevice = true;
        this.initialized = true;
        console.log('[PrinterService] Sunmi printer ready - isSunmiDevice:', this.isSunmiDevice);
        return true;
      } catch (e: any) {
        console.log('[PrinterService] Prepare failed:', e?.message || e);
        this.isSunmiDevice = false;
      }
    }
    this.initialized = true;
    console.log('[PrinterService] Init complete - isSunmiDevice:', this.isSunmiDevice);
    return this.isSunmiDevice;
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
      // Add timeout to prevent hanging during print
      try {
        const printPromise = this.printWithSunmi(invoice);
        const timeoutPromise = new Promise<{ success: boolean; message: string }>((_, reject) => 
          setTimeout(() => reject(new Error('Print timeout after 20s')), 20000)
        );
        return await Promise.race([printPromise, timeoutPromise]);
      } catch (e: any) {
        console.log('[PrinterService] Print timed out or failed:', e?.message);
        return { success: false, message: e?.message || 'Print failed' };
      }
    }
    return this.printWithPdf(invoice);
  }

  private async printWithSunmi(invoice: InvoiceData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[PrinterService] === SUNMI PRINT START (SIMPLE MODE) ===');
      console.log('[PrinterService] Invoice:', invoice.invoiceNumber);
      console.log('[PrinterService] Branch:', invoice.branchName);
      console.log('[PrinterService] Items count:', invoice.items?.length || 0);
      
      currentPrintContext.invoice_number = invoice.invoiceNumber;
      sendPrintLog('sunmi_start', 'start', `Starting print for ${invoice.invoiceNumber}`, {
        branch: invoice.branchName,
        items_count: invoice.items?.length || 0
      });
      
      // Sanitize all text fields to prevent printer issues
      const branchName = this.sanitizeText(invoice.branchName) || 'Flow360 Station';
      const branchAddress = this.sanitizeText(invoice.branchAddress);
      const branchPhone = this.sanitizeText(invoice.branchPhone);
      const branchPin = this.sanitizeText(invoice.branchPin || invoice.kraPin);
      const customerName = this.sanitizeText(invoice.customerName) || 'Walk-in Customer';
      const customerPin = this.sanitizeText(invoice.customerPin) || 'NOT PROVIDED';
      const cashierName = this.sanitizeText(invoice.cashierName) || 'Cashier';
      
      let documentHeader: string;
      if (invoice.documentType === 'credit_note') {
        documentHeader = invoice.isReprint ? 'CREDIT NOTE COPY' : 'CREDIT NOTE';
      } else {
        documentHeader = invoice.isReprint ? 'INVOICE COPY' : 'ORIGINAL INVOICE';
      }
      
      console.log('[PrinterService] Step 1: Header');
      sendPrintLog('step_1_header', 'info', 'Printing header');
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.setFontSize(28);
      await SunmiPrinterLibrary.printText(`${documentHeader}\n`);
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText(`${branchName}\n`);
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      await SunmiPrinterLibrary.setFontSize(26);
      if (branchAddress) {
        await SunmiPrinterLibrary.printText(`${branchAddress}\n`);
      }
      if (branchPhone) {
        await SunmiPrinterLibrary.printText(`Tel: ${branchPhone}\n`);
      }
      if (branchPin) {
        await SunmiPrinterLibrary.setTextStyle('bold', true);
        await SunmiPrinterLibrary.printText(`PIN: ${branchPin}\n`);
        await SunmiPrinterLibrary.setTextStyle('bold', false);
      }
      
      console.log('[PrinterService] Step 2: Buyer Info');
      sendPrintLog('step_2_buyer', 'info', 'Printing buyer info');
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText('BUYER INFORMATION\n');
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.printText(`Buyer PIN: ${customerPin}\n`);
      await SunmiPrinterLibrary.printText(`Buyer Name: ${customerName}\n`);
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      
      console.log('[PrinterService] Step 3: Product Details');
      sendPrintLog('step_3_products', 'info', `Printing ${(invoice.items || []).length} items`);
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText('PRODUCT DETAILS\n');
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(26);
      
      for (let i = 0; i < (invoice.items || []).length; i++) {
        const item = invoice.items[i];
        const itemName = this.sanitizeText(item.name) || 'Item';
        const dispenser = this.sanitizeText(item.dispenser);
        const lineTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
        console.log(`[PrinterService] Printing item ${i + 1}: ${itemName}`);
        await SunmiPrinterLibrary.printText(`${itemName}\n`);
        if (dispenser) {
          await SunmiPrinterLibrary.printText(`Dispenser: ${dispenser}\n`);
        }
        await SunmiPrinterLibrary.printText(`${this.formatCurrency(item.unitPrice)} x ${item.quantity.toFixed(3)}L\n`);
        if (item.discount && item.discount > 0) {
          await SunmiPrinterLibrary.printText(`Discount: -${item.discount.toFixed(2)}\n`);
        }
        await SunmiPrinterLibrary.setTextStyle('bold', true);
        await SunmiPrinterLibrary.setFontSize(26);
        await SunmiPrinterLibrary.printText(`TOTAL: ${this.formatCurrency(lineTotal)}\n`);
        await SunmiPrinterLibrary.setTextStyle('bold', false);
      }
      
      console.log('[PrinterService] Step 4: Tax Breakdown');
      sendPrintLog('step_4_tax', 'info', 'Printing tax breakdown');
      await SunmiPrinterLibrary.setAlignment('center');
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText('TAX BREAKDOWN\n');
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText('Rate    Taxable     VAT\n');
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      
      const taxExempt = invoice.taxExempt || 0;
      const taxZeroRated = invoice.taxZeroRated || 0;
      const taxable16 = invoice.taxableAmount || 0;
      const vat16 = invoice.totalTax || 0;
      
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText(`EX  ${this.formatCurrency(taxExempt).padStart(10)} ${this.formatCurrency(0).padStart(9)}\n`);
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.printText(`16% ${this.formatCurrency(taxable16).padStart(10)} ${this.formatCurrency(vat16).padStart(9)}\n`);
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      await SunmiPrinterLibrary.printText(`0%  ${this.formatCurrency(taxZeroRated).padStart(10)} ${this.formatCurrency(0).padStart(9)}\n`);
      
      console.log('[PrinterService] Step 5: Date/Time & KRA');
      sendPrintLog('step_5_kra', 'info', 'Printing KRA info');
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText(`Date: ${invoice.date || 'N/A'} ${invoice.time || ''}\n`);
      
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      const cuSerial = this.sanitizeText(invoice.cuSerialNumber);
      const cuInvNo = this.sanitizeText(invoice.cuInvoiceNo);
      const intrlData = this.sanitizeText(invoice.intrlData);
      if (cuSerial) {
        await SunmiPrinterLibrary.printText(`SCU ID: ${cuSerial}\n`);
      }
      if (cuInvNo) {
        await SunmiPrinterLibrary.printText(`CU INV NO: ${cuInvNo}\n`);
      } else if (cuSerial && invoice.receiptNo) {
        await SunmiPrinterLibrary.printText(`CU INV NO: ${cuSerial}/${invoice.receiptNo}\n`);
      }
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      if (intrlData) {
        await SunmiPrinterLibrary.printText(`Int Data: ${intrlData}\n`);
      }
      
      console.log('[PrinterService] Step 6: Receipt Footer');
      sendPrintLog('step_6_footer', 'info', 'Printing receipt footer');
      await SunmiPrinterLibrary.setAlignment('left');
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText(`Receipt No: ${invoice.receiptNo || invoice.invoiceNumber || 'N/A'}\n`);
      await SunmiPrinterLibrary.printText(`Served by: ${cashierName}\n`);
      await SunmiPrinterLibrary.printText(`Payment: ${(invoice.paymentMethod || 'cash').toLowerCase()}\n`);
      
      console.log('[PrinterService] Step 7: QR Code');
      sendPrintLog('step_7_qr', 'info', 'Printing QR code');
      await SunmiPrinterLibrary.setAlignment('center');
      const qrData = invoice.qrCodeData || 
        `https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=${invoice.invoiceNumber}`;
      await SunmiPrinterLibrary.printQRCode(qrData, 6, 'middle');
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText('Scan to verify with KRA eTIMS\n');
      await SunmiPrinterLibrary.setTextStyle('bold', true);
      await SunmiPrinterLibrary.setFontSize(26);
      await SunmiPrinterLibrary.printText('END OF LEGAL RECEIPT\n');
      await SunmiPrinterLibrary.setTextStyle('bold', false);
      await SunmiPrinterLibrary.lineWrap(3);
      
      console.log('[PrinterService] === SUNMI PRINT SUCCESS (SIMPLE MODE) ===');
      sendPrintLog('sunmi_complete', 'success', 'Receipt printed successfully');
      return { success: true, message: 'Receipt printed successfully' };
    } catch (error: any) {
      console.error('[PrinterService] === SUNMI PRINT ERROR ===');
      console.error('[PrinterService] Error:', error?.message || error);
      console.error('[PrinterService] Error stack:', error?.stack);
      console.log('[PrinterService] Invoice data that failed:', JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        branchName: invoice.branchName,
        itemsCount: invoice.items?.length
      }));
      sendPrintLog('sunmi_error', 'error', error?.message || 'Print failed', {
        stack: error?.stack,
        invoiceNumber: invoice.invoiceNumber,
        branchName: invoice.branchName
      });
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
    let invoiceType: string;
    if (invoice.documentType === 'credit_note') {
      invoiceType = invoice.isReprint ? 'CREDIT NOTE COPY' : 'CREDIT NOTE';
    } else {
      invoiceType = invoice.isReprint ? 'INVOICE COPY' : 'ORIGINAL INVOICE';
    }

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
