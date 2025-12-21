import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'

interface DashboardStats {
  total_sales: number
  total_invoices: number
  pending_invoices: number
  paid_invoices: number
}

interface ShiftData {
  id: number
  status: string
}

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_sales: 0,
    total_invoices: 0,
    pending_invoices: 0,
    paid_invoices: 0,
  })
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchShift = useCallback(async () => {
    try {
      if (!user?.branch_id) return
      const response = await api.get<{ success: boolean, data: ShiftData | null }>(`/api/shifts?branch_id=${user.branch_id}&status=active`)
      const shift = response?.data || null
      setActiveShift(shift)
      return shift
    } catch (error) {
      console.log('Failed to fetch shift')
      setActiveShift(null)
      return null
    }
  }, [user?.branch_id])

  const fetchStats = useCallback(async (shiftId?: number) => {
    try {
      if (!user?.branch_id) return
      let url = `/api/mobile/dashboard?branch_id=${user.branch_id}`
      if (shiftId) {
        url += `&shift_id=${shiftId}`
      }
      const data = await api.get<DashboardStats>(url)
      if (data) setStats(data)
    } catch (error) {
      console.log('Using default stats')
    }
  }, [user?.branch_id])

  useEffect(() => {
    const loadData = async () => {
      const shift = await fetchShift()
      if (shift) {
        await fetchStats(shift.id)
      } else {
        setStats({ total_sales: 0, total_invoices: 0, pending_invoices: 0, paid_invoices: 0 })
      }
    }
    loadData()
  }, [fetchShift, fetchStats])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const shift = await fetchShift()
    if (shift) {
      await fetchStats(shift.id)
    } else {
      setStats({ total_sales: 0, total_invoices: 0, pending_invoices: 0, paid_invoices: 0 })
    }
    setRefreshing(false)
  }, [fetchShift, fetchStats])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.username || user?.name || 'User'}</Text>
          <Text style={styles.branchName}>{user?.branch_name || 'Branch'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {activeShift ? (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Ionicons name="cash-outline" size={28} color="#fff" />
            <Text style={styles.statValue}>{formatCurrency(stats.total_sales)}</Text>
            <Text style={styles.statLabel}>Shift Sales</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={28} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.total_invoices}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Total Invoices
            </Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.pending_invoices}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Pending
            </Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.paid_invoices}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Paid
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noShiftContainer}>
          <Ionicons name="time-outline" size={48} color={colors.textLight} />
          <Text style={styles.noShiftTitle}>No Active Shift</Text>
          <Text style={styles.noShiftText}>Start a shift from the admin dashboard to begin recording sales</Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateInvoice')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>New Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Invoices')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="list-outline" size={28} color={colors.success} />
            </View>
            <Text style={styles.actionText}>View Invoices</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.navBackground,
    paddingTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  logoutText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  greeting: {
    fontSize: fontSize.md,
    color: '#94a3b8',
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: '#fff',
  },
  branchName: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    marginTop: -spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: colors.primary,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  quickActions: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  noShiftContainer: {
    margin: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noShiftTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  noShiftText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
