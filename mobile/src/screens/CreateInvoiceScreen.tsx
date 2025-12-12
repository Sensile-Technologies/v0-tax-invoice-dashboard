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
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

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
  
  // Step 1: Nozzle selection
  const [nozzles, setNozzles] = useState<Nozzle[]>([])
  const [selectedNozzle, setSelectedNozzle] = useState<string>('')
  const [selectedNozzleData, setSelectedNozzleData] = useState<Nozzle | null>(null)
  const [amount, setAmount] = useState('')
  const [fuelPrices, setFuelPrices] = useState<Record<string, number>>({})
  
  // Step 2: Customer details
  const [kraPin, setKraPin] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isLoyaltyCustomer, setIsLoyaltyCustomer] = useState(false)

  useEffect(() => {
    fetchNozzles()
  }, [user?.branch_id])

  async function fetchNozzles() {
    try {
      if (!user?.branch_id) {
        setNozzles([
          { id: '1', name: 'Pump 1 - Nozzle 1', fuel_type: 'Petrol', price: 195 },
          { id: '2', name: 'Pump 1 - Nozzle 2', fuel_type: 'Diesel', price: 180 },
          { id: '3', name: 'Pump 2 - Nozzle 1', fuel_type: 'Kerosene', price: 165 },
        ])
        setFuelPrices({ 'Petrol': 195, 'Diesel': 180, 'Kerosene': 165 })
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
        setNozzles([
          { id: '1', name: 'Pump 1 - Nozzle 1', fuel_type: 'Petrol', price: 195 },
          { id: '2', name: 'Pump 1 - Nozzle 2', fuel_type: 'Diesel', price: 180 },
          { id: '3', name: 'Pump 2 - Nozzle 1', fuel_type: 'Kerosene', price: 165 },
        ])
        setFuelPrices({ 'Petrol': 195, 'Diesel': 180, 'Kerosene': 165 })
      }
    } catch (error) {
      console.log('Error fetching nozzles:', error)
      setNozzles([
        { id: '1', name: 'Pump 1 - Nozzle 1', fuel_type: 'Petrol', price: 195 },
        { id: '2', name: 'Pump 1 - Nozzle 2', fuel_type: 'Diesel', price: 180 },
        { id: '3', name: 'Pump 2 - Nozzle 1', fuel_type: 'Kerosene', price: 165 },
      ])
      setFuelPrices({ 'Petrol': 195, 'Diesel': 180, 'Kerosene': 165 })
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
    setStep(1)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const totalAmount = parseFloat(amount) || 0
  const unitPrice = selectedNozzleData?.price || 0
  const quantity = unitPrice > 0 ? totalAmount / unitPrice : 0

  async function handleCreateSale() {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/mobile/create-sale', {
        branch_id: user?.branch_id,
        user_id: user?.id,
        nozzle_id: selectedNozzle,
        fuel_type: selectedNozzleData?.fuel_type,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        customer_name: customerName,
        kra_pin: kraPin,
        vehicle_number: vehicleNumber,
        is_loyalty_customer: isLoyaltyCustomer,
      })
      
      Alert.alert('Success', 'Sale created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create sale')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
                  {quantity.toFixed(2)} Litres
                </Text>
              </View>
            )}
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
      ) : (
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

            <Text style={styles.inputLabel}>Customer Name *</Text>
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
              onPress={() => setIsLoyaltyCustomer(!isLoyaltyCustomer)}
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
              <Text style={styles.summaryValue}>{quantity.toFixed(2)} L</Text>
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
            onPress={handleCreateSale}
            disabled={submitting}
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
      )}
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
})
