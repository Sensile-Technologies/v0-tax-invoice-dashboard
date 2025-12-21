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
  taxableAmount?: number
  cuSerialNumber?: string
  cuInvoiceNo?: string
  receiptNo?: string
  receiptSign?: string
  intrlData?: string
  mrcNo?: string
  isReprint?: boolean
  itemCode?: string
  dispenser?: string
  co2PerLitre?: number
  totalCo2?: number
}

export interface ReceiptViewProps {
  data: ReceiptData
}

const ReceiptViewComponent = forwardRef<View, ReceiptViewProps>(({ data }, ref) => {
  const taxableAmount = data.taxableAmount || Math.round((data.totalAmount / 1.16) * 100) / 100
  const taxAmount = data.taxAmount || Math.round((data.totalAmount - taxableAmount) * 100) / 100
  const lineTotal = data.quantity * data.unitPrice - (data.discount || 0)
  const co2PerLitre = data.co2PerLitre || (data.fuelType?.toLowerCase().includes('diesel') ? 2.68 : 2.31)
  const totalCo2 = data.totalCo2 || (data.quantity * co2PerLitre)
  
  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <Text style={styles.header}>TAX INVOICE</Text>
      <Text style={styles.branchName}>{data.branchName}</Text>
      {data.branchAddress && <Text style={styles.centerText}>{data.branchAddress}</Text>}
      {data.branchPhone && <Text style={styles.centerText}>Tel: {data.branchPhone}</Text>}
      {data.branchPin && <Text style={styles.centerText}>PIN: {data.branchPin}</Text>}
      <Text style={styles.centerText}>{'\n'}Welcome to our shop{'\n'}</Text>
      
      <Text style={styles.sectionTitle}>BUYER INFORMATION</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Buyer PIN:</Text>
        <Text style={styles.value}>{data.customerPin || 'NOT PROVIDED'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Buyer Name:</Text>
        <Text style={styles.value}>{data.customerName || 'Walk-in Customer'}</Text>
      </View>
      
      <Text style={styles.sectionTitle}>{'\n'}PRODUCT DETAILS</Text>
      {data.itemCode && (
        <View style={styles.row}>
          <Text style={styles.label}>Item Code:</Text>
          <Text style={styles.value}>{data.itemCode}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{data.fuelType}</Text>
      </View>
      {data.dispenser && (
        <View style={styles.row}>
          <Text style={styles.label}>Dispenser:</Text>
          <Text style={styles.value}>{data.dispenser}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.label}>Unit Price:</Text>
        <Text style={styles.value}>KES {data.unitPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Quantity:</Text>
        <Text style={styles.value}>{data.quantity.toFixed(3)} L</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Discount:</Text>
        <Text style={styles.value}>({(data.discount || 0).toFixed(2)})</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.boldValue}>KES {lineTotal.toFixed(2)}</Text>
      </View>
      
      <Text style={styles.sectionTitle}>{'\n'}TAX BREAKDOWN</Text>
      <View style={styles.taxHeader}>
        <Text style={styles.taxCol}>Rate</Text>
        <Text style={styles.taxCol}>Taxable</Text>
        <Text style={styles.taxCol}>VAT</Text>
      </View>
      <View style={styles.taxRow}>
        <Text style={styles.taxCol}>EX</Text>
        <Text style={styles.taxCol}>KES 0.00</Text>
        <Text style={styles.taxCol}>KES 0.00</Text>
      </View>
      <View style={styles.taxRow}>
        <Text style={styles.taxColBold}>16%</Text>
        <Text style={styles.taxColBold}>KES {taxableAmount.toFixed(2)}</Text>
        <Text style={styles.taxColBold}>KES {taxAmount.toFixed(2)}</Text>
      </View>
      <View style={styles.taxRow}>
        <Text style={styles.taxCol}>0%</Text>
        <Text style={styles.taxCol}>KES 0.00</Text>
        <Text style={styles.taxCol}>KES 0.00</Text>
      </View>
      
      <Text style={styles.spacerSmall}>{'\n'}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{data.date}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{data.time}</Text>
      </View>
      
      <Text style={styles.spacerSmall}>{'\n'}</Text>
      {data.cuSerialNumber && (
        <View style={styles.row}>
          <Text style={styles.label}>SCU ID:</Text>
          <Text style={styles.boldValue}>{data.cuSerialNumber}</Text>
        </View>
      )}
      {data.cuInvoiceNo && (
        <View style={styles.row}>
          <Text style={styles.label}>CU INV NO:</Text>
          <Text style={styles.boldValue}>{data.cuInvoiceNo}</Text>
        </View>
      )}
      {data.intrlData && (
        <View style={styles.row}>
          <Text style={styles.label}>Internal Data:</Text>
          <Text style={styles.value}>{data.intrlData}</Text>
        </View>
      )}
      
      <Text style={styles.sectionTitle}>{'\n'}KRA eTIMS Verification</Text>
      <Text style={styles.centerText}>{'\n'}Scan to verify with KRA eTIMS{'\n'}</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Receipt No:</Text>
        <Text style={styles.value}>{data.receiptNo || data.invoiceNumber}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Served by:</Text>
        <Text style={styles.value}>{data.cashierName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Payment:</Text>
        <Text style={styles.value}>{data.paymentMethod}</Text>
      </View>
      
      <Text style={styles.sectionTitle}>{'\n'}Carbon Emission Details</Text>
      <View style={styles.row}>
        <Text style={styles.label}>CO2 Per Litre:</Text>
        <Text style={styles.value}>{co2PerLitre.toFixed(2)} kg</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total CO2:</Text>
        <Text style={styles.value}>{totalCo2.toFixed(2)} kg</Text>
      </View>
      
      <Text style={styles.thankYou}>{'\n'}THANK YOU FOR SHOPPING WITH US</Text>
      <Text style={styles.centerText}>Powered by Flow360</Text>
      <Text style={styles.footer}>{'\n'}END OF LEGAL RECEIPT</Text>
      <Text style={styles.spacer}>{'\n\n\n'}</Text>
    </View>
  )
})

export const ReceiptView = ReceiptViewComponent

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    width: 384,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 4,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  centerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  label: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
  },
  value: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
    textAlign: 'right',
  },
  boldValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'right',
  },
  taxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taxCol: {
    fontSize: 11,
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  taxColBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  thankYou: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: 8,
  },
  footer: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: 4,
  },
  spacer: {
    fontSize: 12,
  },
  spacerSmall: {
    fontSize: 4,
  },
})
