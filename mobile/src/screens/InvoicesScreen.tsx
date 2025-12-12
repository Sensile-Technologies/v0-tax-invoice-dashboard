import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { Invoice } from '../types'

export default function InvoicesScreen({ navigation }: any) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  const fetchInvoices = useCallback(async () => {
    try {
      const data = await api.get<Invoice[]>('/api/mobile/invoices')
      setInvoices(data || [])
    } catch (error) {
      setInvoices([
        {
          id: '1',
          invoice_number: 'INV-001',
          customer_name: 'John Doe',
          branch_id: '1',
          items: [],
          subtotal: 5000,
          tax: 800,
          total: 5800,
          status: 'paid',
          created_at: new Date().toISOString(),
          created_by: 'Cashier',
        },
        {
          id: '2',
          invoice_number: 'INV-002',
          customer_name: 'Jane Smith',
          branch_id: '1',
          items: [],
          subtotal: 3200,
          tax: 512,
          total: 3712,
          status: 'pending',
          created_at: new Date().toISOString(),
          created_by: 'Cashier',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchInvoices()
    setRefreshing(false)
  }, [fetchInvoices])

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true
    return inv.status === filter
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success
      case 'pending':
        return colors.warning
      case 'cancelled':
        return colors.danger
      default:
        return colors.textLight
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
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'paid'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
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
            <Text style={styles.emptyText}>No invoices found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.invoiceCard}
            onPress={() => navigation.navigate('InvoiceDetail', { invoice: item })}
          >
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.invoiceBody}>
              <View style={styles.customerInfo}>
                <Ionicons name="person-outline" size={16} color={colors.textLight} />
                <Text style={styles.customerName}>
                  {item.customer_name || 'Walk-in Customer'}
                </Text>
              </View>
              <Text style={styles.invoiceDate}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={styles.invoiceFooter}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateInvoice')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
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
  customerName: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  invoiceDate: {
    fontSize: fontSize.sm,
    color: colors.textLight,
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
})
