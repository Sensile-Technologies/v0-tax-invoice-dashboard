import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

interface Sale {
  id: string
  invoice_number: string
  sale_date: string
  fuel_type: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_method: string
  customer_name?: string
  vehicle_number?: string
}

interface Shift {
  id: string
  start_time: string
  end_time?: string
  status: string
  opening_cash: number
  closing_cash?: number
}

interface Nozzle {
  id: string
  name: string
  fuel_type: string
}

interface FuelPrice {
  fuel_type: string
  price: number
}

export default function SalesScreen() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [nozzles, setNozzles] = useState<Nozzle[]>([])
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [saleForm, setSaleForm] = useState({
    nozzle_id: '',
    fuel_type: '',
    amount: '',
    payment_method: 'cash',
    customer_name: '',
    vehicle_number: '',
  })

  const [shiftForm, setShiftForm] = useState({
    opening_cash: '',
  })

  const branchId = user?.branch_id || user?.vendor_id

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get<{
        sales: Sale[]
        shift: Shift | null
        nozzles: Nozzle[]
        fuel_prices: FuelPrice[]
      }>(`/api/mobile/sales?branch_id=${branchId}`)
      
      setSales(response.sales || [])
      setCurrentShift(response.shift)
      setNozzles(response.nozzles || [])
      setFuelPrices(response.fuel_prices || [])
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [branchId])

  useEffect(() => {
    if (branchId) {
      fetchData()
    }
  }, [branchId, fetchData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  async function handleStartShift() {
    if (!shiftForm.opening_cash) {
      Alert.alert('Error', 'Please enter opening cash amount')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/mobile/sales/shift', {
        action: 'start',
        branch_id: branchId,
        opening_cash: parseFloat(shiftForm.opening_cash),
      })
      
      Alert.alert('Success', 'Shift started successfully')
      setShowShiftModal(false)
      setShiftForm({ opening_cash: '' })
      fetchData()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start shift')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEndShift() {
    Alert.alert(
      'End Shift',
      'Are you sure you want to end the current shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Shift',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true)
            try {
              await api.post('/api/mobile/sales/shift', {
                action: 'end',
                shift_id: currentShift?.id,
              })
              
              Alert.alert('Success', 'Shift ended successfully')
              fetchData()
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to end shift')
            } finally {
              setSubmitting(false)
            }
          },
        },
      ]
    )
  }

  async function handleRecordSale() {
    if (!saleForm.fuel_type || !saleForm.amount) {
      Alert.alert('Error', 'Please fill in fuel type and amount')
      return
    }

    if (!currentShift) {
      Alert.alert('Error', 'Please start a shift first')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/mobile/sales', {
        branch_id: branchId,
        shift_id: currentShift.id,
        nozzle_id: saleForm.nozzle_id || null,
        fuel_type: saleForm.fuel_type,
        amount: parseFloat(saleForm.amount),
        payment_method: saleForm.payment_method,
        customer_name: saleForm.customer_name || null,
        vehicle_number: saleForm.vehicle_number || null,
      })
      
      Alert.alert('Success', 'Sale recorded successfully')
      setShowSaleModal(false)
      setSaleForm({
        nozzle_id: '',
        fuel_type: '',
        amount: '',
        payment_method: 'cash',
        customer_name: '',
        vehicle_number: '',
      })
      fetchData()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record sale')
    } finally {
      setSubmitting(false)
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
  const totalLiters = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0)

  function formatCurrency(amount: number) {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function renderSaleItem({ item }: { item: Sale }) {
    return (
      <View style={styles.saleCard}>
        <View style={styles.saleHeader}>
          <Text style={styles.invoiceNumber}>{item.invoice_number || 'N/A'}</Text>
          <Text style={styles.saleDate}>{formatDate(item.sale_date)}</Text>
        </View>
        <View style={styles.saleDetails}>
          <View style={styles.saleRow}>
            <Text style={styles.fuelType}>{item.fuel_type}</Text>
            <Text style={styles.quantity}>{item.quantity?.toFixed(2)} L</Text>
          </View>
          <View style={styles.saleRow}>
            <Text style={styles.paymentMethod}>{item.payment_method}</Text>
            <Text style={styles.totalAmount}>{formatCurrency(item.total_amount)}</Text>
          </View>
          {item.customer_name && (
            <Text style={styles.customerInfo}>Customer: {item.customer_name}</Text>
          )}
          {item.vehicle_number && (
            <Text style={styles.customerInfo}>Vehicle: {item.vehicle_number}</Text>
          )}
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading sales...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales</Text>
        <View style={styles.shiftStatus}>
          {currentShift ? (
            <TouchableOpacity style={styles.shiftBadgeActive} onPress={handleEndShift}>
              <Ionicons name="time" size={16} color="#16a34a" />
              <Text style={styles.shiftTextActive}>Shift Active</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.shiftBadgeInactive} onPress={() => setShowShiftModal(true)}>
              <Ionicons name="play-circle" size={16} color="#dc2626" />
              <Text style={styles.shiftTextInactive}>Start Shift</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today's Sales</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Liters</Text>
          <Text style={styles.summaryValue}>{totalLiters.toFixed(2)} L</Text>
        </View>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={renderSaleItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No sales recorded today</Text>
            <Text style={styles.emptySubtext}>
              {currentShift ? 'Tap the button below to record a sale' : 'Start a shift to begin recording sales'}
            </Text>
          </View>
        }
      />

      {currentShift && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowSaleModal(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showShiftModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Shift</Text>
            
            <Text style={styles.inputLabel}>Opening Cash (KES)</Text>
            <TextInput
              style={styles.input}
              value={shiftForm.opening_cash}
              onChangeText={(text) => setShiftForm({ opening_cash: text })}
              keyboardType="numeric"
              placeholder="Enter opening cash"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowShiftModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.buttonDisabled]}
                onPress={handleStartShift}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Start Shift</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSaleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Record Sale</Text>

              <Text style={styles.inputLabel}>Fuel Type *</Text>
              <View style={styles.fuelTypeButtons}>
                {['PMS', 'AGO', 'DPK'].map((fuel) => (
                  <TouchableOpacity
                    key={fuel}
                    style={[
                      styles.fuelTypeButton,
                      saleForm.fuel_type === fuel && styles.fuelTypeButtonActive,
                    ]}
                    onPress={() => setSaleForm({ ...saleForm, fuel_type: fuel })}
                  >
                    <Text
                      style={[
                        styles.fuelTypeButtonText,
                        saleForm.fuel_type === fuel && styles.fuelTypeButtonTextActive,
                      ]}
                    >
                      {fuel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Amount (KES) *</Text>
              <TextInput
                style={styles.input}
                value={saleForm.amount}
                onChangeText={(text) => setSaleForm({ ...saleForm, amount: text })}
                keyboardType="numeric"
                placeholder="Enter sale amount"
              />

              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.paymentButtons}>
                {['cash', 'mpesa', 'card', 'credit'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentButton,
                      saleForm.payment_method === method && styles.paymentButtonActive,
                    ]}
                    onPress={() => setSaleForm({ ...saleForm, payment_method: method })}
                  >
                    <Text
                      style={[
                        styles.paymentButtonText,
                        saleForm.payment_method === method && styles.paymentButtonTextActive,
                      ]}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Customer Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={saleForm.customer_name}
                onChangeText={(text) => setSaleForm({ ...saleForm, customer_name: text })}
                placeholder="Enter customer name"
              />

              <Text style={styles.inputLabel}>Vehicle Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={saleForm.vehicle_number}
                onChangeText={(text) => setSaleForm({ ...saleForm, vehicle_number: text })}
                placeholder="e.g., KAA 123B"
                autoCapitalize="characters"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSaleModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.buttonDisabled]}
                  onPress={handleRecordSale}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Record Sale</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  shiftStatus: {},
  shiftBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  shiftTextActive: {
    color: '#16a34a',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  shiftBadgeInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  shiftTextInactive: {
    color: '#dc2626',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  saleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  invoiceNumber: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  saleDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  saleDetails: {},
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fuelType: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  quantity: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  paymentMethod: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  customerInfo: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScroll: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  fuelTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fuelTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  fuelTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  fuelTypeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  fuelTypeButtonTextActive: {
    color: '#fff',
  },
  paymentButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  paymentButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
})
