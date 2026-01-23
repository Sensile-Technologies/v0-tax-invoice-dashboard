import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import sunmiPrinter, { setPrintContext } from '../utils/printer'

interface Nozzle {
  id: string
  name: string
  fuel_type: string
  price?: number
}

export default function CreateInvoiceScreen({ navigation }: any) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Step 1: Nozzle selection
  const [nozzles, setNozzles] = useState<Nozzle[]>([])
  const [selectedNozzle, setSelectedNozzle] = useState<string>('')
  const [selectedNozzleData, setSelectedNozzleData] = useState<Nozzle | null>(null)
  const [amount, setAmount] = useState('')
  const [fuelPrices, setFuelPrices] = useState<Record<string, number>>({})
  
  // Discount
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed')
  const [discountValue, setDiscountValue] = useState('')
  
  // Step 2: Customer details
  const [kraPin, setKraPin] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isLoyaltyCustomer, setIsLoyaltyCustomer] = useState(false)
  
  // Step 3: Loyalty verification
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [verifyingLoyalty, setVerifyingLoyalty] = useState(false)
  const [loyaltyVerified, setLoyaltyVerified] = useState(false)
  const [verifiedCustomer, setVerifiedCustomer] = useState<{id: string, name: string, phone: string, cust_tin?: string, point_balance?: number, redemption_rules?: {points_per_ksh: number, min_points: number, max_percent: number}} | null>(null)
  
  // Point Redemption
  const [pointsToRedeem, setPointsToRedeem] = useState('')
  const [redemptionDiscount, setRedemptionDiscount] = useState(0)
  
  // Printing
  const [printing, setPrinting] = useState(false)
  const [printerReady, setPrinterReady] = useState(false)
  const [printerType, setPrinterType] = useState<string>('none')
  
  useEffect(() => {
    console.log('[CreateInvoice] Initializing printer, Platform:', Platform.OS)
    sunmiPrinter.initialize().then(ready => {
      console.log('[CreateInvoice] Printer initialization result:', ready)
      setPrinterReady(ready)
      setPrinterType(ready ? 'sunmi' : 'none')
    }).catch(err => {
      console.log('[CreateInvoice] Printer initialization error:', err)
    })
  }, [])

  useEffect(() => {
    fetchNozzles()
  }, [user?.branch_id])

  async function fetchNozzles() {
    setLoadError(null)
    setLoading(true)
    try {
      if (!user?.branch_id) {
        setLoadError('No branch assigned. Please contact your administrator.')
        setLoading(false)
        return
      }

      const data = await api.get<{ nozzles: Nozzle[], fuel_prices: { fuel_type: string, price: number }[] }>(
        `/api/mobile/nozzles?branch_id=${user.branch_id}`
      )
      
      if (data?.nozzles && data.nozzles.length > 0) {
        setNozzles(data.nozzles)
        const prices: Record<string, number> = {}
        if (data.fuel_prices) {
          data.fuel_prices.forEach(fp => {
            prices[fp.fuel_type] = parseFloat(String(fp.price))
          })
        }
        setFuelPrices(prices)
      } else {
        setLoadError('No nozzles configured for this branch. Please contact your administrator.')
      }
    } catch (error: any) {
      console.log('Error fetching nozzles:', error)
      setLoadError(error.message || 'Failed to load nozzles. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleNozzleChange(nozzleId: string) {
    setSelectedNozzle(nozzleId)
    const nozzle = nozzles.find(n => n.id === nozzleId)
    if (nozzle) {
      setSelectedNozzleData({
        ...nozzle,
        price: nozzle.price || fuelPrices[nozzle.fuel_type] || 0
      })
    } else {
      setSelectedNozzleData(null)
    }
  }

  function getFuelTypeName(fuelType: string): string {
    const names: Record<string, string> = {
      'PMS': 'Super Petrol (PMS)',
      'AGO': 'Diesel (AGO)',
      'DPK': 'Kerosene (DPK)',
      'Petrol': 'Super Petrol (PMS)',
      'Diesel': 'Diesel (AGO)',
      'Kerosene': 'Kerosene (DPK)',
    }
    return names[fuelType] || fuelType
  }

  function handleNext() {
    if (!selectedNozzle) {
      Alert.alert('Error', 'Please select a nozzle')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }
    setStep(2)
  }

  function handleBack() {
    if (step === 3) {
      setStep(2)
    } else {
      setStep(1)
    }
  }
  
  function handleProceedToLoyalty() {
    if (isLoyaltyCustomer) {
      setStep(3)
    } else {
      handleCreateSale()
    }
  }
  
  async function verifyLoyaltyCustomer() {
    if (!loyaltyPhone || loyaltyPhone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number')
      return
    }
    
    setVerifyingLoyalty(true)
    try {
      const response = await api.get<{customer: {id: string, cust_nm: string, tel_no: string, cust_tin?: string, point_balance?: number, redemption_rules?: {points_per_ksh: number, min_points: number, max_percent: number}} | null}>(
        `/api/mobile/verify-loyalty?branch_id=${user?.branch_id}&phone=${loyaltyPhone}`
      )
      
      if (response.customer) {
        setVerifiedCustomer({
          id: response.customer.id,
          name: response.customer.cust_nm,
          phone: response.customer.tel_no,
          cust_tin: response.customer.cust_tin,
          point_balance: response.customer.point_balance,
          redemption_rules: response.customer.redemption_rules
        })
        setLoyaltyVerified(true)
        if (response.customer.cust_tin) {
          setKraPin(response.customer.cust_tin)
        }
        const balanceText = response.customer.point_balance !== undefined ? ` (${response.customer.point_balance} points)` : ''
        Alert.alert('Success', `Customer verified: ${response.customer.cust_nm}${balanceText}`)
      } else {
        Alert.alert('Not Found', 'No customer found with this phone number')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify customer')
    } finally {
      setVerifyingLoyalty(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const grossAmount = parseFloat(amount) || 0
  const unitPrice = selectedNozzleData?.price || 0
  
  // Calculate gross quantity from gross amount (before discount)
  const grossQuantity = unitPrice > 0 ? grossAmount / unitPrice : 0
  
  // Calculate discount with validation
  let discountAmount = 0
  if (discountValue && parseFloat(discountValue) > 0) {
    if (discountType === 'percentage') {
      const pct = Math.min(parseFloat(discountValue), 100)
      discountAmount = (grossAmount * pct) / 100
    } else {
      discountAmount = Math.min(parseFloat(discountValue), grossAmount)
    }
  }
  const totalAmount = Math.max(grossAmount - discountAmount, 0)

  async function printInvoice(saleId: string): Promise<{ success: boolean; message: string }> {
    console.log('[CreateInvoice] printInvoice called, saleId:', saleId, 'printerReady:', printerReady)
    
    setPrintContext({
      branch_id: user?.branch_id,
      vendor_id: user?.vendor_id,
      user_id: user?.id,
      username: user?.username
    })
    setPrinting(true)
    console.log('[CreateInvoice] Fetching receipt image from server...')
    try {
      const response = await api.post<{ 
        success: boolean; 
        receipt_image: string;
        content_type: string;
        width: number;
        error?: string;
      }>('/api/receipt/image', {
        sale_id: saleId,
        branch_id: user?.branch_id
      })
      
      console.log('[CreateInvoice] API response received, success:', response.success)
      
      if (response.success && response.receipt_image) {
        console.log('[CreateInvoice] Receipt image received, length:', response.receipt_image.length)
        
        if (!printerReady) {
          console.log('[CreateInvoice] Printer not ready, cannot print bitmap')
          return { success: false, message: 'Receipt generated but printer not available' }
        }
        
        console.log('[CreateInvoice] Printing bitmap image...')
        const result = await sunmiPrinter.printReceiptImage(response.receipt_image)
        console.log('[CreateInvoice] Print result:', result)
        return result
      } else {
        console.log('[CreateInvoice] Failed to get receipt image from server:', response.error)
        return { success: false, message: response.error || 'Failed to get receipt from server' }
      }
    } catch (error: any) {
      console.log('[CreateInvoice] Print error:', error?.message || error)
      return { success: false, message: error?.message || 'Print failed' }
    } finally {
      setPrinting(false)
    }
  }

  async function handleCreateSale() {
    setSubmitting(true)
    console.log('[CreateInvoice] === SALE CREATION START ===')
    try {
      console.log('[CreateInvoice] Calling create-sale API...')
      const saleResponse = await api.post<{
        sale_id: string;
        print_data?: {
          invoice_number?: string;
          receipt_no?: string;
          cu_serial_number?: string;
          cu_invoice_no?: string;
          intrl_data?: string;
          branch_name?: string;
          branch_address?: string;
          branch_phone?: string;
          branch_pin?: string;
          item_code?: string;
          receipt_signature?: string;
          bhf_id?: string;
        };
      }>('/api/mobile/create-sale', {
        branch_id: user?.branch_id,
        user_id: user?.id,
        nozzle_id: selectedNozzle,
        fuel_type: selectedNozzleData?.fuel_type,
        quantity: grossQuantity,
        unit_price: unitPrice,
        gross_amount: grossAmount,
        discount_type: discountType,
        discount_value: discountValue ? parseFloat(discountValue) : 0,
        discount_amount: discountAmount,
        net_amount: totalAmount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        customer_name: (isLoyaltyCustomer && verifiedCustomer?.name) ? verifiedCustomer.name : (customerName.trim() || 'Walk-in Customer'),
        kra_pin: kraPin,
        vehicle_number: vehicleNumber,
        is_loyalty_customer: isLoyaltyCustomer,
        loyalty_customer_id: verifiedCustomer?.id || null,
        loyalty_customer_name: verifiedCustomer?.name || null,
        loyalty_phone: verifiedCustomer?.phone || null,
        loyalty_customer_pin: verifiedCustomer?.cust_tin || null,
      })
      
      console.log('[CreateInvoice] Sale created, sale_id:', saleResponse.sale_id)
      
      // Post loyalty transaction if verified
      if (isLoyaltyCustomer && loyaltyVerified && verifiedCustomer && saleResponse.sale_id) {
        try {
          await api.post('/api/mobile/loyalty-transaction', {
            branch_id: user?.branch_id,
            sale_id: saleResponse.sale_id,
            customer_name: verifiedCustomer.name,
            customer_pin: verifiedCustomer.phone,
            transaction_amount: totalAmount,
            fuel_type: selectedNozzleData?.fuel_type,
            quantity: grossQuantity,
            payment_method: paymentMethod,
          })
        } catch (loyaltyError) {
          console.log('Loyalty transaction failed:', loyaltyError)
        }
      }
      
      // Print invoice with timeout to prevent hanging
      console.log('[CreateInvoice] printerReady:', printerReady, 'printerType:', printerType)
      let printMessage = ''
      if (saleResponse.sale_id) {
        console.log('[CreateInvoice] Calling printInvoice...')
        try {
          const printPromise = printInvoice(saleResponse.sale_id)
          const timeoutPromise = new Promise<{ success: boolean; message: string }>((_, reject) => 
            setTimeout(() => reject(new Error('Print timeout')), 20000)
          )
          const printResult = await Promise.race([printPromise, timeoutPromise])
          console.log('[CreateInvoice] Print result:', printResult)
          if (printResult.success) {
            printMessage = ' - Receipt printed'
            try {
              await api.post('/api/sales/mark-printed', { sale_id: saleResponse.sale_id })
            } catch (e) {
            }
          } else {
            printMessage = ` - ${printResult.message}`
          }
        } catch (printError: any) {
          console.log('[CreateInvoice] Print error caught:', printError?.message || printError)
          printMessage = ' - Print failed'
        }
      }
      
      console.log('[CreateInvoice] === SHOWING SUCCESS ALERT ===')
      setSubmitting(false)
      Alert.alert('Success', 'Sale created successfully' + printMessage, [
        { text: 'OK', onPress: () => {
          console.log('[CreateInvoice] Navigating back...')
          navigation.goBack()
        }},
      ])
    } catch (error: any) {
      console.log('[CreateInvoice] === SALE CREATION ERROR ===')
      console.log('[CreateInvoice] Error:', error?.message || error)
      setSubmitting(false)
      Alert.alert('Error', error.message || 'Failed to create sale')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNozzles}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Nozzle</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedNozzle}
                onValueChange={handleNozzleChange}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Nozzle --" value="" />
                {nozzles.map((nozzle) => (
                  <Picker.Item
                    key={nozzle.id}
                    label={`${nozzle.name} - ${getFuelTypeName(nozzle.fuel_type)}`}
                    value={nozzle.id}
                  />
                ))}
              </Picker>
            </View>

            {selectedNozzleData && (
              <View style={styles.productInfo}>
                <View style={styles.productRow}>
                  <Ionicons name="flame" size={24} color={colors.primary} />
                  <View style={styles.productDetails}>
                    <Text style={styles.productType}>
                      {getFuelTypeName(selectedNozzleData.fuel_type)}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatCurrency(unitPrice)} per litre
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Enter Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>KES</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {amount && parseFloat(amount) > 0 && selectedNozzleData && (
              <View style={styles.quantityInfo}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <Text style={styles.quantityValue}>
                  {grossQuantity.toFixed(2)} Litres
                </Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Discount (Optional)</Text>
            <View style={styles.discountContainer}>
              <View style={styles.discountTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.discountTypeButton,
                    discountType === 'fixed' && styles.discountTypeButtonActive,
                  ]}
                  onPress={() => setDiscountType('fixed')}
                >
                  <Text
                    style={[
                      styles.discountTypeButtonText,
                      discountType === 'fixed' && styles.discountTypeButtonTextActive,
                    ]}
                  >
                    Fixed (KES)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.discountTypeButton,
                    discountType === 'percentage' && styles.discountTypeButtonActive,
                  ]}
                  onPress={() => setDiscountType('percentage')}
                >
                  <Text
                    style={[
                      styles.discountTypeButtonText,
                      discountType === 'percentage' && styles.discountTypeButtonTextActive,
                    ]}
                  >
                    Percentage (%)
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.discountInputContainer}>
                <Text style={styles.discountSymbol}>
                  {discountType === 'percentage' ? '%' : 'KES'}
                </Text>
                <TextInput
                  style={styles.discountInput}
                  placeholder="0"
                  value={discountValue}
                  onChangeText={setDiscountValue}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              {discountAmount > 0 && (
                <View style={styles.netAmountInfo}>
                  <Text style={styles.netAmountLabel}>Discount:</Text>
                  <Text style={styles.netAmountValue}>-{formatCurrency(discountAmount)}</Text>
                </View>
              )}
              {discountAmount > 0 && (
                <View style={styles.netAmountInfo}>
                  <Text style={styles.netAmountLabel}>Net Amount:</Text>
                  <Text style={styles.netAmountValue}>{formatCurrency(totalAmount)}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, (!selectedNozzle || !amount) && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!selectedNozzle || !amount}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      ) : step === 2 ? (
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            
            <Text style={styles.inputLabel}>KRA PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter KRA PIN (optional)"
              value={kraPin}
              onChangeText={setKraPin}
              autoCapitalize="characters"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>Customer Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter customer name"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>Vehicle Registration Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. KDA 123X"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>Mode of Payment</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={paymentMethod}
                onValueChange={setPaymentMethod}
                style={styles.picker}
              >
                <Picker.Item label="Cash" value="cash" />
                <Picker.Item label="Mobile Money" value="mobile_money" />
                <Picker.Item label="Card" value="card" />
                <Picker.Item label="Credit" value="credit" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                setIsLoyaltyCustomer(!isLoyaltyCustomer)
                setLoyaltyVerified(false)
                setVerifiedCustomer(null)
                setLoyaltyPhone('')
              }}
            >
              <View style={[styles.checkbox, isLoyaltyCustomer && styles.checkboxChecked]}>
                {isLoyaltyCustomer && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Loyalty Customer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Sale Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fuel Type:</Text>
              <Text style={styles.summaryValue}>
                {selectedNozzleData ? getFuelTypeName(selectedNozzleData.fuel_type) : '-'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity:</Text>
              <Text style={styles.summaryValue}>{grossQuantity.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Unit Price:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(unitPrice)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, submitting && styles.buttonDisabled]}
            onPress={handleProceedToLoyalty}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.createButtonText}>{isLoyaltyCustomer ? 'Next: Verify Loyalty' : 'Create Sale'}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : step === 3 ? (
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verify Loyalty Customer</Text>
            <Text style={styles.loyaltyHint}>
              Enter the customer's phone number to verify their loyalty status
            </Text>
            
            <View style={styles.loyaltyInputContainer}>
              <Ionicons name="call" size={20} color={colors.textLight} style={styles.loyaltyInputIcon} />
              <TextInput
                style={styles.loyaltyInput}
                placeholder="Phone Number (e.g. 0712345678)"
                value={loyaltyPhone}
                onChangeText={(text) => {
                  setLoyaltyPhone(text)
                  if (loyaltyVerified) {
                    setLoyaltyVerified(false)
                    setVerifiedCustomer(null)
                  }
                }}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, verifyingLoyalty && styles.buttonDisabled]}
              onPress={verifyLoyaltyCustomer}
              disabled={verifyingLoyalty}
            >
              {verifyingLoyalty ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.verifyButtonText}>Verify Customer</Text>
                </>
              )}
            </TouchableOpacity>

            {loyaltyVerified && verifiedCustomer && (
              <View style={styles.verifiedCustomerCard}>
                <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                <View style={styles.verifiedCustomerInfo}>
                  <Text style={styles.verifiedCustomerName}>{verifiedCustomer.name}</Text>
                  <Text style={styles.verifiedCustomerPhone}>{verifiedCustomer.phone}</Text>
                  {verifiedCustomer.cust_tin && (
                    <Text style={styles.verifiedCustomerPhone}>PIN: {verifiedCustomer.cust_tin}</Text>
                  )}
                  {verifiedCustomer.point_balance !== undefined && (
                    <Text style={[styles.verifiedCustomerPhone, {color: colors.primary, fontWeight: '600'}]}>
                      Points: {verifiedCustomer.point_balance}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Sale Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fuel Type:</Text>
              <Text style={styles.summaryValue}>
                {selectedNozzleData ? getFuelTypeName(selectedNozzleData.fuel_type) : '-'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity:</Text>
              <Text style={styles.summaryValue}>{grossQuantity.toFixed(2)} L</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, (submitting || !loyaltyVerified) && styles.buttonDisabled]}
            onPress={handleCreateSale}
            disabled={submitting || !loyaltyVerified}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Sale</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  picker: {
    height: 50,
  },
  productInfo: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetails: {
    marginLeft: spacing.md,
  },
  productType: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  productPrice: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textLight,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: spacing.md,
  },
  quantityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantityLabel: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  quantityValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    marginLeft: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    backgroundColor: colors.background,
    color: colors.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  summarySection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  createButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  discountContainer: {
    marginTop: spacing.sm,
  },
  discountTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  discountTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  discountTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  discountTypeButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  discountTypeButtonTextActive: {
    color: '#fff',
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  discountSymbol: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textLight,
    marginRight: spacing.sm,
  },
  discountInput: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: spacing.md,
  },
  netAmountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  netAmountLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  netAmountValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  loyaltyHint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  loyaltyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  loyaltyInputIcon: {
    marginRight: spacing.sm,
  },
  loyaltyInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  verifiedCustomerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  verifiedCustomerInfo: {
    marginLeft: spacing.md,
  },
  verifiedCustomerName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  verifiedCustomerPhone: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
})
