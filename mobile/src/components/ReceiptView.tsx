import React, { forwardRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'

export interface ReceiptData {
  invoiceNumber: string
  date: string
  time: string
  branchName: string
  branchAddress?: string
  branchPhone?: string
  branchPin?: string
  customerName?: string
  customerPin?: string
  cashierName: string
  fuelType: string
  quantity: number
  unitPrice: number
  discount?: number
  totalAmount: number
  paymentMethod: string
  taxAmount?: number
  cuSerialNumber?: string
  cuInvoiceNo?: string
  receiptNo?: string
  receiptSign?: string
  intrlData?: string
  mrcNo?: string
  isReprint?: boolean
}

export interface ReceiptViewProps {
  data: ReceiptData
}

const ReceiptViewComponent = forwardRef<View, ReceiptViewProps>(({ data }, ref) => {
  const invoiceType = data.isReprint ? 'INVOICE COPY' : 'ORIGINAL INVOICE'
  const taxAmount = data.taxAmount || Math.round(data.totalAmount * 0.16 / 1.16)
  const taxableAmount = data.totalAmount
  const lineTotal = data.quantity * data.unitPrice - (data.discount || 0)
  
  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <Text style={styles.header}>{invoiceType}</Text>
      <Text style={styles.divider}>--------------------------------</Text>
      
      <Text style={styles.branchName}>{data.branchName}</Text>
      {data.branchAddress && <Text style={styles.text}>{data.branchAddress}</Text>}
      {data.branchPhone && <Text style={styles.text}>Tel: {data.branchPhone}</Text>}
      {data.branchPin && <Text style={styles.boldText}>PIN: {data.branchPin}</Text>}
      <Text style={styles.divider}>--------------------------------</Text>
      
      <Text style={styles.sectionTitle}>BUYER INFORMATION</Text>
      <Text style={styles.boldText}>Buyer PIN: {data.customerPin || 'NOT PROVIDED'}</Text>
      <Text style={styles.boldText}>Buyer Name: {data.customerName || 'Walk-in Customer'}</Text>
      <Text style={styles.divider}>--------------------------------</Text>
      
      <Text style={styles.sectionTitle}>PRODUCT DETAILS</Text>
      <Text style={styles.text}>{data.fuelType}</Text>
      <Text style={styles.text}>KES {data.unitPrice.toFixed(2)} x {data.quantity.toFixed(3)}L</Text>
      {data.discount && data.discount > 0 && (
        <Text style={styles.text}>Discount: -{data.discount.toFixed(2)}</Text>
      )}
      <Text style={styles.boldText}>TOTAL: KES {lineTotal.toFixed(2)}</Text>
      <Text style={styles.divider}>--------------------------------</Text>
      
      <Text style={styles.sectionTitle}>TAX BREAKDOWN</Text>
      <Text style={styles.text}>Rate    Taxable        VAT</Text>
      <Text style={styles.text}>EX      KES 0.00       KES 0.00</Text>
      <Text style={styles.boldText}>16%     KES {taxableAmount.toFixed(2)}  KES {taxAmount.toFixed(2)}</Text>
      <Text style={styles.text}>0%      KES 0.00       KES 0.00</Text>
      <Text style={styles.divider}>--------------------------------</Text>
      
      <Text style={styles.text}>Date: {data.date} {data.time}</Text>
      {data.cuSerialNumber && <Text style={styles.boldText}>SCU ID: {data.cuSerialNumber}</Text>}
      {data.cuInvoiceNo && <Text style={styles.boldText}>CU INV NO: {data.cuInvoiceNo}</Text>}
      {data.intrlData && <Text style={styles.text}>Int Data: {data.intrlData}</Text>}
      <Text style={styles.text}>Receipt No: {data.receiptNo || data.invoiceNumber}</Text>
      <Text style={styles.text}>Served by: {data.cashierName}</Text>
      <Text style={styles.text}>Payment: {data.paymentMethod}</Text>
      <Text style={styles.divider}>--------------------------------</Text>
      
      <Text style={styles.centerText}>Scan to verify with KRA eTIMS</Text>
      <Text style={styles.footer}>END OF LEGAL RECEIPT</Text>
      <Text style={styles.spacer}>{'\n\n\n'}</Text>
    </View>
  )
})

export const ReceiptView = ReceiptViewComponent

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    width: 384,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  divider: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000000',
    marginVertical: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: 4,
  },
  text: {
    fontSize: 14,
    color: '#000000',
  },
  boldText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  centerText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000000',
  },
  footer: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: 8,
  },
  spacer: {
    fontSize: 14,
  },
})
