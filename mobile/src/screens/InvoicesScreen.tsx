import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

interface SaleInvoice {
  id: string
  invoice_number: string
  customer_name: string
  sale_date: string
  fuel_type: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_method: string
  status: string
}

type DateFilter = 'today' | 'week' | 'month' | 'all' | 'custom'

export default function InvoicesScreen({ navigation }: any) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<SaleInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')

  const branchId = user?.branch_id || user?.vendor_id

  const getDateRange = useCallback(() => {
    const now = new Date()
    let dateFrom: string | null = null
    let dateTo: string | null = null

    switch (dateFilter) {
      case 'today':
        dateFrom = now.toISOString().split('T')[0]
        dateTo = now.toISOString().split('T')[0]
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFrom = weekAgo.toISOString().split('T')[0]
        dateTo = now.toISOString().split('T')[0]
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFrom = monthAgo.toISOString().split('T')[0]
        dateTo = now.toISOString().split('T')[0]
        break
      case 'custom':
        dateFrom = customDateFrom || null
        dateTo = customDateTo || null
        break
      case 'all':
      default:
        break
    }
    return { dateFrom, dateTo }
  }, [dateFilter, customDateFrom, customDateTo])

  const fetchInvoices = useCallback(async () => {
    try {
      const { dateFrom, dateTo } = getDateRange()
      let url = `/api/mobile/invoices?branch_id=${branchId}`
      if (dateFrom) {
        url += `&date_from=${dateFrom}`
      }
      if (dateTo) {
        url += `&date_to=${dateTo}`
      }
      
      const data = await api.get<{ sales: SaleInvoice[] }>(url)
      setInvoices(data.sales || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [branchId, getDateRange])

  useEffect(() => {
    if (branchId) {
      fetchInvoices()
    }
  }, [branchId, fetchInvoices])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchInvoices()
  }, [fetchInvoices])

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'paid') return inv.payment_method !== 'credit'
    if (statusFilter === 'pending') return inv.payment_method === 'credit'
    return true
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today'
      case 'week': return 'Last 7 Days'
      case 'month': return 'Last 30 Days'
      case 'custom': return customDateFrom || customDateTo ? 'Custom Range' : 'Custom'
      case 'all': return 'All Time'
    }
  }

  const applyDateFilter = (filter: DateFilter) => {
    if (filter !== 'custom') {
      setDateFilter(filter)
      setShowDateFilter(false)
    } else {
      setDateFilter('custom')
    }
  }

  const applyCustomDate = () => {
    setDateFilter('custom')
    setShowDateFilter(false)
  }

  const getStatusColor = (paymentMethod: string) => {
    return paymentMethod === 'credit' ? colors.warning : colors.success
  }

  const getStatusText = (paymentMethod: string) => {
    return paymentMethod === 'credit' ? 'CREDIT' : 'PAID'
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money'
      case 'mpesa': return 'Mobile Money'
      case 'card': return 'Mobile Money'
      case 'cash': return 'Cash'
      case 'credit': return 'Credit'
      default: return method
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
      <View style={styles.header}>
        <Text style={styles.title}>Sales History</Text>
        <TouchableOpacity 
          style={styles.filterIconBtn}
          onPress={() => setShowDateFilter(true)}
        >
          <Ionicons 
            name="calendar-outline" 
            size={24} 
            color={dateFilter !== 'all' ? colors.primary : colors.text} 
          />
          {dateFilter !== 'all' && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {dateFilter !== 'all' && (
        <View style={styles.activeDateFilter}>
          <Text style={styles.activeDateFilterText}>{getDateFilterLabel()}</Text>
          <TouchableOpacity onPress={() => setDateFilter('all')}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filterContainer}>
        {(['all', 'paid', 'pending'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, statusFilter === f && styles.filterButtonActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'pending' ? 'Credit' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No sales found</Text>
            <Text style={styles.emptySubtext}>
              {dateFilter !== 'all' ? 'Try adjusting the date filter' : 'Sales will appear here once recorded'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceNumber}>{item.invoice_number || `SALE-${item.id.slice(0, 8)}`}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.payment_method) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.payment_method) }]}>
                  {getStatusText(item.payment_method)}
                </Text>
              </View>
            </View>
            <View style={styles.invoiceBody}>
              <View style={styles.customerInfo}>
                <Ionicons name="flame-outline" size={16} color={colors.primary} />
                <Text style={styles.fuelType}>{item.fuel_type}</Text>
                <Text style={styles.quantity}>({parseFloat(String(item.quantity || 0)).toFixed(2)} L)</Text>
              </View>
              <Text style={styles.invoiceDate}>{formatDate(item.sale_date)}</Text>
            </View>
            <View style={styles.invoiceDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{item.customer_name || 'Walk-in'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formatTime(item.sale_date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>{getPaymentMethodLabel(item.payment_method)}</Text>
              </View>
            </View>
            <View style={styles.invoiceFooter}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(item.total_amount)}</Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateInvoice')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showDateFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Date</Text>
              <TouchableOpacity onPress={() => setShowDateFilter(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickFilters}>
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Last 7 Days' },
                { key: 'month', label: 'Last 30 Days' },
                { key: 'all', label: 'All Time' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.quickFilterButton,
                    dateFilter === item.key && styles.quickFilterButtonActive
                  ]}
                  onPress={() => applyDateFilter(item.key as DateFilter)}
                >
                  <Text style={[
                    styles.quickFilterText,
                    dateFilter === item.key && styles.quickFilterTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customDateSection}>
              <Text style={styles.customDateTitle}>Custom Date Range</Text>
              <Text style={styles.customDateHint}>Format: YYYY-MM-DD (e.g., 2024-12-01)</Text>
              
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>From</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={customDateFrom}
                    onChangeText={setCustomDateFrom}
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={customDateTo}
                    onChangeText={setCustomDateTo}
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.applyCustomButton}
                onPress={applyCustomDate}
              >
                <Text style={styles.applyCustomButtonText}>Apply Custom Range</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterIconBtn: {
    padding: spacing.sm,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  activeDateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary + '15',
    gap: spacing.sm,
  },
  activeDateFilterText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  invoiceNumber: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  invoiceBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fuelType: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  quantity: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  invoiceDate: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  invoiceDetails: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  detailValue: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '500',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickFilterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickFilterText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  quickFilterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  customDateSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  customDateTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  customDateHint: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    backgroundColor: colors.background,
  },
  applyCustomButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  applyCustomButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
})
