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
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

interface Nozzle {
  id: string
  name: string
  fuel_type: string
  current_reading: number
  closing_reading: string | null
}

interface Tank {
  id: string
  name: string
  fuel_type: string
  current_volume: number
  capacity: number
  closing_volume: string | null
}

interface Branch {
  id: string
  name: string
  location: string
  nozzles: Nozzle[]
  tanks: Tank[]
  active_shift: { id: string; status: string; created_at: string } | null
  expanded: boolean
  closing_cash: string
}

export default function EndShiftScreen({ navigation }: any) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    fetchBranches()
  }, [])

  async function fetchBranches() {
    setLoading(true)
    try {
      const isMultiBranch = user?.role === 'vendor' || user?.role === 'merchant'
      const queryParam = isMultiBranch && user?.vendor_id
        ? `vendor_id=${user.vendor_id}`
        : `branch_id=${user?.branch_id}`

      const response = await api.get<{ branches: Branch[] }>(
        `/api/mobile/vendor-branches?${queryParam}`
      )

      if (response.branches) {
        setBranches(
          response.branches.map((b, idx) => ({
            ...b,
            expanded: idx === 0,
            closing_cash: '',
            nozzles: b.nozzles.map((n) => ({ ...n, closing_reading: '' })),
            tanks: b.tanks.map((t) => ({ ...t, closing_volume: '' })),
          }))
        )
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load branch data')
    } finally {
      setLoading(false)
    }
  }

  function toggleBranch(branchId: string) {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, expanded: !b.expanded } : b
      )
    )
  }

  function updateNozzleReading(branchId: string, nozzleId: string, value: string) {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? {
              ...b,
              nozzles: b.nozzles.map((n) =>
                n.id === nozzleId ? { ...n, closing_reading: value } : n
              ),
            }
          : b
      )
    )
  }

  function updateTankVolume(branchId: string, tankId: string, value: string) {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? {
              ...b,
              tanks: b.tanks.map((t) =>
                t.id === tankId ? { ...t, closing_volume: value } : t
              ),
            }
          : b
      )
    )
  }

  function updateClosingCash(branchId: string, value: string) {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, closing_cash: value } : b
      )
    )
  }

  async function handleEndShift() {
    const branchesWithActiveShifts = branches.filter((b) => b.active_shift)

    if (branchesWithActiveShifts.length === 0) {
      Alert.alert('No Active Shifts', 'There are no active shifts to end.')
      return
    }

    const missingData = branchesWithActiveShifts.some((b) => {
      const missingNozzle = b.nozzles.some(
        (n) => !n.closing_reading || n.closing_reading.trim() === ''
      )
      const missingTank = b.tanks.some(
        (t) => !t.closing_volume || t.closing_volume.trim() === ''
      )
      return missingNozzle || missingTank
    })

    if (missingData) {
      Alert.alert(
        'Missing Data',
        'Please fill in all nozzle readings and tank volumes for branches with active shifts.'
      )
      return
    }

    Alert.alert(
      'Confirm End Shift',
      `Are you sure you want to end shifts for ${branchesWithActiveShifts.length} branch(es)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Shifts',
          style: 'destructive',
          onPress: submitEndShift,
        },
      ]
    )
  }

  async function submitEndShift() {
    setSubmitting(true)
    try {
      const branchesWithActiveShifts = branches.filter((b) => b.active_shift)

      for (const branch of branchesWithActiveShifts) {
        await api.post('/api/mobile/end-shift', {
          branch_id: branch.id,
          shift_id: branch.active_shift?.id,
          closing_cash: branch.closing_cash ? parseFloat(branch.closing_cash) : 0,
          nozzle_readings: branch.nozzles.map((n) => ({
            nozzle_id: n.id,
            closing_reading: parseFloat(n.closing_reading || '0'),
          })),
          tank_volumes: branch.tanks.map((t) => ({
            tank_id: t.id,
            closing_volume: parseFloat(t.closing_volume || '0'),
          })),
        })
      }

      Alert.alert('Success', 'All shifts ended successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end shifts')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading branch data...</Text>
      </View>
    )
  }

  const activeBranchCount = branches.filter((b) => b.active_shift).length

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>End Shift</Text>
          <Text style={styles.subtitle}>
            {activeBranchCount} active shift(s) across {branches.length} branch(es)
          </Text>
        </View>

        {branches.map((branch) => (
          <View key={branch.id} style={styles.branchCard}>
            <TouchableOpacity
              style={styles.branchHeader}
              onPress={() => toggleBranch(branch.id)}
            >
              <View style={styles.branchInfo}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <View style={styles.shiftStatus}>
                  {branch.active_shift ? (
                    <View style={styles.activeTag}>
                      <Ionicons name="ellipse" size={8} color="#16a34a" />
                      <Text style={styles.activeText}>Active Shift</Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveTag}>
                      <Ionicons name="ellipse" size={8} color="#9ca3af" />
                      <Text style={styles.inactiveText}>No Active Shift</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons
                name={branch.expanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>

            {branch.expanded && (
              <View style={styles.branchContent}>
                {branch.active_shift && (
                  <View style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>Closing Cash</Text>
                    <View style={styles.cashRow}>
                      <Text style={styles.currencyLabel}>KES</Text>
                      <TextInput
                        style={styles.cashInput}
                        value={branch.closing_cash}
                        onChangeText={(v) => updateClosingCash(branch.id, v)}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                  </View>
                )}

                {branch.nozzles.length > 0 && (
                  <View style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>Nozzle Readings</Text>
                    {branch.nozzles.map((nozzle) => (
                      <View key={nozzle.id} style={styles.readingRow}>
                        <View style={styles.readingInfo}>
                          <Text style={styles.readingLabel}>{nozzle.name}</Text>
                          <Text style={styles.readingCurrent}>
                            Current: {nozzle.current_reading.toFixed(2)} L
                          </Text>
                        </View>
                        <TextInput
                          style={[
                            styles.readingInput,
                            !branch.active_shift && styles.inputDisabled,
                          ]}
                          value={nozzle.closing_reading || ''}
                          onChangeText={(v) =>
                            updateNozzleReading(branch.id, nozzle.id, v)
                          }
                          keyboardType="numeric"
                          placeholder="Closing"
                          placeholderTextColor={colors.textLight}
                          editable={!!branch.active_shift}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {branch.tanks.length > 0 && (
                  <View style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>Tank Volumes</Text>
                    {branch.tanks.map((tank) => (
                      <View key={tank.id} style={styles.readingRow}>
                        <View style={styles.readingInfo}>
                          <Text style={styles.readingLabel}>{tank.name}</Text>
                          <Text style={styles.readingCurrent}>
                            Current: {tank.current_volume.toFixed(0)} / {tank.capacity.toFixed(0)} L
                          </Text>
                        </View>
                        <TextInput
                          style={[
                            styles.readingInput,
                            !branch.active_shift && styles.inputDisabled,
                          ]}
                          value={tank.closing_volume || ''}
                          onChangeText={(v) =>
                            updateTankVolume(branch.id, tank.id, v)
                          }
                          keyboardType="numeric"
                          placeholder="Closing"
                          placeholderTextColor={colors.textLight}
                          editable={!!branch.active_shift}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {branch.nozzles.length === 0 && branch.tanks.length === 0 && (
                  <Text style={styles.noDataText}>
                    No nozzles or tanks configured for this branch
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || activeBranchCount === 0) && styles.buttonDisabled,
          ]}
          onPress={handleEndShift}
          disabled={submitting || activeBranchCount === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="stop-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>End Shift</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textLight,
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: fontSize.lg,
    color: colors.text,
    marginRight: spacing.sm,
    fontWeight: '500',
  },
  cashInput: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  branchCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  shiftStatus: {
    marginTop: spacing.xs,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    fontSize: fontSize.sm,
    color: '#16a34a',
    marginLeft: spacing.xs,
  },
  inactiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inactiveText: {
    fontSize: fontSize.sm,
    color: '#9ca3af',
    marginLeft: spacing.xs,
  },
  branchContent: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subsection: {
    marginTop: spacing.md,
  },
  subsectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readingInfo: {
    flex: 1,
  },
  readingLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  readingCurrent: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  readingInput: {
    width: 100,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  noDataText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    color: '#fff',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
