"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Clock, Fuel, Users, CreditCard, Receipt, Plus, Trash2, Landmark, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function EndShiftPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [unreconciledShift, setUnreconciledShift] = useState<any | null>(null)
  const [isReconcileMode, setIsReconcileMode] = useState(false)

  const [currentShift, setCurrentShift] = useState<any | null>(null)
  const [nozzles, setNozzles] = useState<any[]>([])
  const [tanks, setTanks] = useState<any[]>([])
  const [dispensers, setDispensers] = useState<any[]>([])
  const [cashiers, setCashiers] = useState<Array<{ id: string; name: string }>>([])
  const [sales, setSales] = useState<any[]>([])
  const [branchId, setBranchId] = useState<string | null>(null)

  const [nozzleBaselines, setNozzleBaselines] = useState<Record<string, number>>({})
  const [tankBaselines, setTankBaselines] = useState<Record<string, number>>({})
  const [nozzleReadings, setNozzleReadings] = useState<Record<string, string>>({})
  const [tankStocks, setTankStocks] = useState<Record<string, string>>({})
  const [tankStockReceived, setTankStockReceived] = useState<Record<string, string>>({})
  const [incomingAttendants, setIncomingAttendants] = useState<Record<string, string>>({})
  const [nozzleRtt, setNozzleRtt] = useState<Record<string, string>>({})
  const [nozzleSelfFueling, setNozzleSelfFueling] = useState<Record<string, string>>({})
  const [nozzlePrepaidSale, setNozzlePrepaidSale] = useState<Record<string, string>>({})
  const [outgoingAttendants, setOutgoingAttendants] = useState<Array<{ id: string; name: string }>>([])
  const [attendantCollections, setAttendantCollections] = useState<Record<string, Array<{ payment_method: string; amount: string }>>>({})
  const [nozzleAttendantMap, setNozzleAttendantMap] = useState<Record<string, string>>({})
  const [nozzlePrices, setNozzlePrices] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState("")
  const [expenseAccounts, setExpenseAccounts] = useState<Array<{ id: string; account_name: string }>>([])
  const [shiftExpenses, setShiftExpenses] = useState<Array<{ expense_account_id: string; amount: string; description: string }>>([])
  const [bankingAccounts, setBankingAccounts] = useState<Array<{ id: string; account_name: string; bank_name: string | null; is_default: boolean }>>([])
  const [shiftBanking, setShiftBanking] = useState<Array<{ banking_account_id: string; amount: string; notes: string }>>([])


  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' })
        if (!sessionRes.ok) {
          router.push('/login')
          return
        }
        const sessionData = await sessionRes.json()
        const user = sessionData.user
        if (!user) {
          router.push('/login')
          return
        }

        const role = (user.role || '').toLowerCase()
        const isRestrictedRole = ['supervisor', 'manager', 'cashier'].includes(role)
        let currentBranchId = user.assigned_branch_id
        
        if (!isRestrictedRole) {
          // First check URL params
          const urlBranchId = searchParams.get('branch')
          if (urlBranchId) {
            currentBranchId = urlBranchId
          } else {
            // Then check localStorage
            const stored = localStorage.getItem('selected_branch')
            if (stored) {
              try {
                const parsed = JSON.parse(stored)
                currentBranchId = parsed.id
              } catch {}
            }
          }
        }
        
        if (!currentBranchId) {
          setLoadError("No branch selected. Please select a branch first.")
          setLoading(false)
          return
        }
        
        setBranchId(currentBranchId)

        let hasUnreconciled = false
        let unreconciledShiftData: any = null
        const unreconciledRes = await fetch(`/api/shifts/unreconciled?branch_id=${currentBranchId}`, { credentials: 'include' })
        if (unreconciledRes.ok) {
          const unreconciledData = await unreconciledRes.json()
          if (unreconciledData.has_unreconciled && unreconciledData.shift) {
            hasUnreconciled = true
            unreconciledShiftData = unreconciledData.shift
            setUnreconciledShift(unreconciledData.shift)
            setCurrentShift(unreconciledData.shift)
            setIsReconcileMode(true)
            setStep(2)
          }
        }

        const [shiftRes, nozzlesRes, tanksRes, dispensersRes, staffRes, salesRes, baselinesRes] = await Promise.all([
          fetch(`/api/shifts?branch_id=${currentBranchId}&status=active`, { credentials: 'include' }),
          fetch(`/api/nozzles?branch_id=${currentBranchId}`, { credentials: 'include' }),
          fetch(`/api/tanks?branch_id=${currentBranchId}`, { credentials: 'include' }),
          fetch(`/api/dispensers?branch_id=${currentBranchId}`, { credentials: 'include' }),
          fetch(`/api/staff/list?branch_id=${currentBranchId}`, { credentials: 'include' }),
          fetch(`/api/sales?branch_id=${currentBranchId}&limit=1000`, { credentials: 'include' }),
          fetch(`/api/shifts/baselines?branch_id=${currentBranchId}`, { credentials: 'include' }),
        ])

        const [shiftData, nozzlesData, tanksData, dispensersData, staffData, salesData, baselinesData] = await Promise.all([
          shiftRes.json(),
          nozzlesRes.json(),
          tanksRes.json(),
          dispensersRes.json(),
          staffRes.json(),
          salesRes.json(),
          baselinesRes.json(),
        ])

        if (!shiftData.data && !hasUnreconciled) {
          setLoadError("No active shift to end. Please start a shift first.")
          setLoading(false)
          return
        }

        if (!hasUnreconciled && shiftData.data) {
          setCurrentShift(shiftData.data)
        }
        setNozzles(nozzlesData.data || [])
        setTanks(tanksData.data || [])
        setDispensers(dispensersData.data || [])
        
        const allStaff = Array.isArray(staffData.staff) ? staffData.staff : (Array.isArray(staffData.data) ? staffData.data : [])
        const branchCashiers = allStaff
          .filter((s: any) => s.role?.toLowerCase() === 'cashier' && s.status === 'active')
          .map((s: any) => ({ id: s.id, name: s.full_name || s.username || 'Unknown' }))
        setCashiers(branchCashiers)
        
        const activeShiftId = hasUnreconciled ? unreconciledShiftData?.id : shiftData.data?.id
        const shiftSales = (salesData.data || []).filter((s: any) => 
          s.shift_id === activeShiftId
        )
        setSales(shiftSales)

        if (baselinesData.success && baselinesData.nozzleBaselines) {
          setNozzleBaselines(baselinesData.nozzleBaselines)
        } else {
          const baselines: Record<string, number> = {}
          for (const nozzle of nozzlesData.data || []) {
            baselines[nozzle.id] = nozzle.initial_meter_reading || 0
          }
          setNozzleBaselines(baselines)
        }

        if (baselinesData.success && baselinesData.tankBaselines) {
          setTankBaselines(baselinesData.tankBaselines)
        } else {
          const tankBl: Record<string, number> = {}
          for (const tank of tanksData.data || []) {
            tankBl[tank.id] = tank.current_stock || 0
          }
          setTankBaselines(tankBl)
        }

        let incomingAttendantIds: string[] = []
        let nozzleAttendantMapping: Record<string, string> = {}
        
        if (hasUnreconciled && unreconciledShiftData) {
          try {
            const shiftReadingsRes = await fetch(`/api/shifts/readings?shift_id=${unreconciledShiftData.id}`)
            if (shiftReadingsRes.ok) {
              const readingsData = await shiftReadingsRes.json()
              const readings = readingsData.data || []
              const attendantIds = new Set<string>()
              for (const r of readings) {
                if (r.incoming_attendant_id) {
                  attendantIds.add(r.incoming_attendant_id)
                  nozzleAttendantMapping[r.nozzle_id] = r.incoming_attendant_id
                }
              }
              incomingAttendantIds = Array.from(attendantIds)
              setNozzleAttendantMap(nozzleAttendantMapping)
            }
          } catch (e) {
            console.error("Failed to fetch shift readings for reconciliation:", e)
          }
        } else if (currentBranchId) {
          try {
            const prevShiftRes = await fetch(`/api/shifts/incoming-attendants?branch_id=${currentBranchId}`)
            if (prevShiftRes.ok) {
              const prevData = await prevShiftRes.json()
              if (prevData.incoming_attendant_ids) {
                incomingAttendantIds = prevData.incoming_attendant_ids
              }
              if (prevData.nozzle_attendant_map) {
                nozzleAttendantMapping = prevData.nozzle_attendant_map
                setNozzleAttendantMap(nozzleAttendantMapping)
              }
            }
          } catch (e) {
            console.error("Failed to fetch previous shift incoming attendants:", e)
          }
        }
        
        // Build nozzle prices from branch_items
        const prices: Record<string, number> = {}
        try {
          const branchItemsRes = await fetch(`/api/branch-items?branchId=${currentBranchId}`)
          if (branchItemsRes.ok) {
            const branchItemsData = await branchItemsRes.json()
            const branchItems = branchItemsData.items || branchItemsData.data || []
            for (const nozzle of nozzlesData.data || []) {
              const branchItem = branchItems.find((bi: any) => bi.item_id === nozzle.item_id)
              if (branchItem?.branch_sale_price || branchItem?.sale_price) {
                prices[nozzle.id] = parseFloat(branchItem.branch_sale_price || branchItem.sale_price)
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch branch items for pricing:", e)
        }
        setNozzlePrices(prices)
        
        // Outgoing attendants are those who were assigned as incoming attendants when the shift started
        // They worked the nozzles during the shift and now need to reconcile their collections
        const outgoing = allStaff
          .filter((s: any) => incomingAttendantIds.includes(s.id))
          .map((s: any) => ({ id: s.id, name: s.full_name || s.username || 'Unknown' }))
        setOutgoingAttendants(outgoing)

        const collections: Record<string, Array<{ payment_method: string; amount: string }>> = {}
        for (const att of outgoing) {
          const attSales = shiftSales.filter((s: any) => s.staff_id === att.id)
          const cardTotal = attSales.filter((s: any) => s.payment_method === 'card').reduce((sum: number, s: any) => sum + parseFloat(s.total_amount || 0), 0)
          const mobileMoneyTotal = attSales.filter((s: any) => ['mpesa', 'mobile_money'].includes(s.payment_method)).reduce((sum: number, s: any) => sum + parseFloat(s.total_amount || 0), 0)
          
          collections[att.id] = [
            { payment_method: 'cash', amount: '' },
            { payment_method: 'mobile_money', amount: mobileMoneyTotal.toFixed(2) },
            { payment_method: 'card', amount: cardTotal.toFixed(2) },
            { payment_method: 'credit', amount: '' },
          ]
        }
        setAttendantCollections(collections)

        // Fetch expense accounts
        try {
          const expenseRes = await fetch('/api/expense-accounts')
          if (expenseRes.ok) {
            const expenseData = await expenseRes.json()
            setExpenseAccounts(expenseData.data || [])
          }
        } catch (e) {
          console.error("Failed to fetch expense accounts:", e)
        }

        // Fetch banking accounts
        try {
          const bankingRes = await fetch('/api/banking-accounts')
          if (bankingRes.ok) {
            const bankingData = await bankingRes.json()
            const activeAccounts = (bankingData.data || []).filter((a: any) => a.is_active)
            setBankingAccounts(activeAccounts)
          }
        } catch (e) {
          console.error("Failed to fetch banking accounts:", e)
        }

      } catch (error: any) {
        console.error("Error loading end shift data:", error)
        setLoadError(error?.message || "Failed to load shift data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, searchParams])

  const validateStep1 = () => {
    const missingReadings = nozzles.filter(n => !nozzleReadings[n.id])
    if (missingReadings.length > 0) {
      toast.error("Please enter closing readings for all nozzles")
      return false
    }
    const missingAttendants = nozzles.filter(n => !incomingAttendants[n.id])
    if (missingAttendants.length > 0) {
      toast.error("Please select an incoming attendant for each nozzle")
      return false
    }
    for (const nozzle of nozzles) {
      const opening = nozzleBaselines[nozzle.id] || 0
      const closing = parseFloat(nozzleReadings[nozzle.id] || "0")
      if (closing < opening) {
        toast.error(`Closing reading cannot be less than opening for ${nozzle.nozzle_number}`)
        return false
      }
    }
    // Tank closing reading is mandatory
    const missingTankReadings = tanks.filter(t => !tankStocks[t.id])
    if (missingTankReadings.length > 0) {
      toast.error("Please enter closing stock for all tanks")
      return false
    }
    for (const tank of tanks) {
      const openingStock = tankBaselines[tank.id] || 0
      const closingStock = parseFloat(tankStocks[tank.id] || "0") || 0
      const stockReceived = parseFloat(tankStockReceived[tank.id] || "0") || 0
      
      // Check if nozzle sales would cause negative stock without offload
      const { requiresOffload } = calculateTankVolumeVariance(tank.id, tank)
      if (requiresOffload && stockReceived <= 0) {
        toast.error(`Please enter fuel offloaded for ${tank.tank_name || 'tank'} (nozzle sales exceed opening stock)`)
        return false
      }
      
      if (closingStock > openingStock && !requiresOffload) {
        if (stockReceived <= 0) {
          toast.error(`Please enter stock received for ${tank.tank_name || 'tank'} (closing stock is higher than opening)`)
          return false
        }
      }
    }
    return true
  }

  const calculateAttendantSales = (attendantId: string) => {
    // Calculate total sales from meter readings for nozzles assigned to this attendant
    let totalSales = 0
    for (const nozzle of nozzles) {
      const assignedAttendant = nozzleAttendantMap[nozzle.id]
      if (assignedAttendant === attendantId) {
        const opening = nozzleBaselines[nozzle.id] || 0
        const closing = parseFloat(nozzleReadings[nozzle.id] || "0")
        const unitPrice = nozzlePrices[nozzle.id] || 0
        const quantity = Math.max(0, closing - opening)
        totalSales += quantity * unitPrice
      }
    }
    return totalSales
  }

  const calculateVariance = (attendantId: string) => {
    const totalSales = calculateAttendantSales(attendantId)
    const collections = attendantCollections[attendantId] || []
    const totalCollected = collections.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
    return totalSales - totalCollected
  }

  const calculateTankVolumeVariance = (tankId: string, tank: any) => {
    const openingStock = tankBaselines[tankId] || 0
    const closingStock = parseFloat(tankStocks[tankId] || "0") || 0
    const offloaded = parseFloat(tankStockReceived[tankId] || "0") || 0
    
    // Find nozzles linked to this tank (matching item_id)
    const linkedNozzles = nozzles.filter(n => n.item_id === tank.item_id)
    
    // Calculate total volume dispensed through linked nozzles
    let totalNozzleSales = 0
    for (const nozzle of linkedNozzles) {
      const opening = nozzleBaselines[nozzle.id] || 0
      const closing = parseFloat(nozzleReadings[nozzle.id] || "0")
      const rtt = parseFloat(nozzleRtt[nozzle.id] || "0") || 0
      const selfFueling = parseFloat(nozzleSelfFueling[nozzle.id] || "0") || 0
      const prepaidSale = parseFloat(nozzlePrepaidSale[nozzle.id] || "0") || 0
      // Net dispensed = meter difference - RTT (RTT goes back to tank)
      const netDispensed = Math.max(0, closing - opening) - rtt + selfFueling + prepaidSale
      totalNozzleSales += netDispensed
    }
    
    // Check if nozzle sales would draw stock to negative (requires offload)
    const stockBeforeOffload = openingStock - totalNozzleSales
    const requiresOffload = stockBeforeOffload < 0
    
    // Expected closing stock = opening + offloaded - nozzle sales (minimum 0)
    const expectedClosing = Math.max(0, openingStock + offloaded - totalNozzleSales)
    
    // Variance = actual - expected (positive = gain/more than expected, negative = loss/less than expected)
    const variance = closingStock - expectedClosing
    
    return { variance, totalNozzleSales, expectedClosing, requiresOffload, stockBeforeOffload }
  }

  const validateStep2 = () => {
    // Mobile Money and Cash are mandatory for each attendant
    for (const attendant of outgoingAttendants) {
      const collections = attendantCollections[attendant.id] || []
      const mobileMoneyEntry = collections.find(c => c.payment_method === 'mobile_money')
      const cashEntry = collections.find(c => c.payment_method === 'cash')
      
      if (!mobileMoneyEntry || mobileMoneyEntry.amount === '') {
        toast.error(`Please enter Mobile Money amount for ${attendant.name}`)
        return false
      }
      if (!cashEntry || cashEntry.amount === '') {
        toast.error(`Please enter Cash amount for ${attendant.name}`)
        return false
      }
      
      // Check variance - cannot close shift if variance > 1000
      const variance = calculateVariance(attendant.id)
      if (Math.abs(variance) > 1000) {
        toast.error(`Variance for ${attendant.name} is KES ${Math.abs(variance).toFixed(2)}. Cannot close shift with variance greater than KES 1,000.`)
        return false
      }
    }
    return true
  }

  const handleEndShiftAndStartNext = async () => {
    if (!validateStep1()) return
    if (!currentShift || !branchId) return

    setSubmitting(true)
    try {
      const readings = nozzles.map(nozzle => ({
        nozzle_id: nozzle.id,
        closing_reading: parseFloat(nozzleReadings[nozzle.id] || "0"),
        incoming_attendant_id: incomingAttendants[nozzle.id] || null,
        rtt: parseFloat(nozzleRtt[nozzle.id] || "0") || 0,
        self_fueling: parseFloat(nozzleSelfFueling[nozzle.id] || "0") || 0,
        prepaid_sale: parseFloat(nozzlePrepaidSale[nozzle.id] || "0") || 0,
      }))

      const tankData = tanks.map(tank => ({
        tank_id: tank.id,
        closing_stock: parseFloat(tankStocks[tank.id] || "0") || tankBaselines[tank.id] || 0,
        stock_received: parseFloat(tankStockReceived[tank.id] || "0") || 0,
      }))

      const response = await fetch("/api/shifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentShift.id,
          status: "completed",
          notes: "",
          nozzle_readings: readings,
          tank_stocks: tankData,
          attendant_collections: [],
          expenses: [],
          banking: [],
        }),
      })

      const responseText = await response.text()
      let result
      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        console.error("Response was not valid JSON:", responseText)
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`)
      }
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to end shift: ${response.status}`)
      }

      toast.success("Shift ended successfully. Next shift started. Please complete reconciliation.")
      setUnreconciledShift(result.data)
      setCurrentShift(result.data)
      setIsReconcileMode(true)
      setStep(2)
    } catch (error) {
      console.error("Error ending shift:", error)
      toast.error(error instanceof Error ? error.message : "Failed to end shift")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReconcile = async () => {
    const shiftToReconcile = unreconciledShift || currentShift
    if (!shiftToReconcile || !branchId) return

    if (!validateStep2()) {
      return
    }

    if (shiftBanking.length === 0) {
      toast.error("Banking summary is mandatory. Please add at least one banking entry.")
      return
    }

    const hasBankingWithAmount = shiftBanking.some(b => b.banking_account_id && parseFloat(b.amount) > 0)
    if (!hasBankingWithAmount) {
      toast.error("Please enter a valid banking amount.")
      return
    }

    setSubmitting(true)
    try {
      const collectionsData = Object.entries(attendantCollections).map(([attendantId, payments]) => ({
        attendant_id: attendantId,
        payments: payments.map(p => ({
          payment_method: p.payment_method,
          amount: parseFloat(p.amount || "0") || 0,
        })),
      }))

      const expensesData = shiftExpenses
        .filter(e => e.expense_account_id && parseFloat(e.amount) > 0)
        .map(e => ({
          expense_account_id: e.expense_account_id,
          amount: parseFloat(e.amount),
          description: e.description || null,
        }))

      const bankingData = shiftBanking
        .filter(b => b.banking_account_id && parseFloat(b.amount) > 0)
        .map(b => ({
          banking_account_id: b.banking_account_id,
          amount: parseFloat(b.amount),
          notes: b.notes || null,
        }))

      const response = await fetch("/api/shifts/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shift_id: shiftToReconcile.id,
          attendant_collections: collectionsData,
          expenses: expensesData,
          banking: bankingData,
          notes,
        }),
      })

      const responseText = await response.text()
      let result
      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        console.error("Response was not valid JSON:", responseText)
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`)
      }
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to reconcile shift: ${response.status}`)
      }

      toast.success("Shift reconciled successfully")
      router.push('/sales/summary')
    } catch (error) {
      console.error("Error reconciling shift:", error)
      toast.error(error instanceof Error ? error.message : "Failed to reconcile shift")
    } finally {
      setSubmitting(false)
    }
  }

  const shiftStartTime = currentShift ? new Date(currentShift.start_time).toLocaleString() : ""
  const shiftDuration = currentShift ? Math.round((Date.now() - new Date(currentShift.start_time).getTime()) / 3600000) : 0
  const totalSales = sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0)

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white items-center justify-center">
        <div className="text-white text-lg">Loading shift data...</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading End Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{loadError}</p>
            <Button onClick={() => router.push('/sales/summary')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-8 my-0 lg:my-6 mr-0 lg:mr-6 relative z-10">
        <div className="bg-white lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/sales/summary')}
                    className="mb-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sales Summary
                  </Button>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {isReconcileMode ? "Shift Reconciliation" : "End Current Shift"}
                  </h1>
                  <p className="text-slate-600">
                    {isReconcileMode 
                      ? "Complete the reconciliation for the previous shift" 
                      : "Complete the shift closure process"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={step === 1 ? "default" : "secondary"}>Step 1: End Shift</Badge>
                  <span className="text-slate-400">→</span>
                  <Badge variant={step === 2 ? "default" : "secondary"}>Step 2: Reconciliation</Badge>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Started</p>
                        <p className="text-sm font-medium">{shiftStartTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="text-sm font-medium">{shiftDuration}h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">Total Sales</p>
                        <p className="text-sm font-medium text-green-600">KES {totalSales.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500">Transactions</p>
                        <p className="text-sm font-medium">{sales.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {step === 1 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Fuel className="h-5 w-5" />
                        Nozzle Meter Readings & Incoming Attendants
                      </CardTitle>
                      <CardDescription>
                        Enter closing readings and select the cashier who will take over each nozzle
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {nozzles.map((nozzle) => {
                        const dispenser = dispensers.find((d: any) => d.id === nozzle.dispenser_id)
                        const openingReading = nozzleBaselines[nozzle.id] || 0
                        return (
                          <div key={nozzle.id} className="bg-slate-50 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {dispenser?.name || 'Dispenser'} - Nozzle {nozzle.nozzle_number}
                                </p>
                                <p className="text-sm text-slate-500 capitalize">
                                  {nozzle.fuel_type} - Opening: {openingReading.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <Label className="text-xs text-slate-500">Closing Reading *</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={openingReading}
                                  placeholder="Enter reading"
                                  value={nozzleReadings[nozzle.id] || ""}
                                  onChange={(e) => setNozzleReadings({ ...nozzleReadings, [nozzle.id]: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-500">RTT (Litres)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={nozzleRtt[nozzle.id] || ""}
                                  onChange={(e) => setNozzleRtt({ ...nozzleRtt, [nozzle.id]: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-500">Self Fueling (L)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={nozzleSelfFueling[nozzle.id] || ""}
                                  onChange={(e) => setNozzleSelfFueling({ ...nozzleSelfFueling, [nozzle.id]: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-500">Prepaid Sale (L)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={nozzlePrepaidSale[nozzle.id] || ""}
                                  onChange={(e) => setNozzlePrepaidSale({ ...nozzlePrepaidSale, [nozzle.id]: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Incoming Attendant *</Label>
                              <Select
                                value={incomingAttendants[nozzle.id] || ""}
                                onValueChange={(value) => setIncomingAttendants({ ...incomingAttendants, [nozzle.id]: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cashier taking over" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cashiers.map((cashier) => (
                                    <SelectItem key={cashier.id} value={cashier.id}>
                                      {cashier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {nozzleReadings[nozzle.id] && parseFloat(nozzleReadings[nozzle.id]) < openingReading && (
                              <p className="text-xs text-red-500">Closing reading cannot be less than opening ({openingReading})</p>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {tanks.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Tank Closing Stock</CardTitle>
                        <CardDescription>Enter the closing stock levels for each tank</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tanks.map((tank) => {
                          const openingStock = tankBaselines[tank.id] || 0
                          const closingStock = parseFloat(tankStocks[tank.id] || "0") || 0
                          const needsStockReceived = closingStock > openingStock
                          const { variance, totalNozzleSales, expectedClosing, requiresOffload, stockBeforeOffload } = calculateTankVolumeVariance(tank.id, tank)
                          const hasClosingValue = tankStocks[tank.id] && tankStocks[tank.id] !== ""
                          const offloaded = parseFloat(tankStockReceived[tank.id] || "0") || 0
                          const showOffloadWarning = requiresOffload && offloaded === 0
                          return (
                            <div key={tank.id} className="bg-slate-50 p-4 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{tank.tank_name}</p>
                                  <p className="text-sm text-slate-500 capitalize">
                                    {tank.fuel_type} - Opening: {openingStock.toLocaleString()} L
                                  </p>
                                </div>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Closing stock (L)"
                                  className="w-40"
                                  value={tankStocks[tank.id] || ""}
                                  onChange={(e) => setTankStocks({ ...tankStocks, [tank.id]: e.target.value })}
                                />
                              </div>
                              {showOffloadWarning && (
                                <div className="flex items-center gap-3 pt-2 border-t border-red-200 bg-red-50 -mx-4 px-4 py-2">
                                  <span className="text-sm text-red-700 flex-1">
                                    Nozzle sales ({totalNozzleSales.toFixed(2)} L) exceed opening stock ({openingStock.toFixed(2)} L). 
                                    Enter fuel offloaded during this shift:
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Fuel offloaded (L)"
                                    className="w-40 border-red-300"
                                    value={tankStockReceived[tank.id] || ""}
                                    onChange={(e) => setTankStockReceived({ ...tankStockReceived, [tank.id]: e.target.value })}
                                  />
                                </div>
                              )}
                              {!showOffloadWarning && needsStockReceived && (
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                  <span className="text-sm text-amber-600 flex-1">Stock increased - enter fuel received:</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Stock received (L)"
                                    className="w-40"
                                    value={tankStockReceived[tank.id] || ""}
                                    onChange={(e) => setTankStockReceived({ ...tankStockReceived, [tank.id]: e.target.value })}
                                  />
                                </div>
                              )}
                              {!showOffloadWarning && requiresOffload && offloaded > 0 && (
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                  <span className="text-sm text-blue-600 flex-1">Fuel offloaded during shift:</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Fuel offloaded (L)"
                                    className="w-40"
                                    value={tankStockReceived[tank.id] || ""}
                                    onChange={(e) => setTankStockReceived({ ...tankStockReceived, [tank.id]: e.target.value })}
                                  />
                                </div>
                              )}
                              {hasClosingValue && !showOffloadWarning && (
                                <div className="pt-2 border-t border-slate-200">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                      Nozzle Sales: <span className="font-medium">{totalNozzleSales.toFixed(2)} L</span>
                                      {" | "}
                                      Expected: <span className="font-medium">{expectedClosing.toFixed(2)} L</span>
                                    </span>
                                    <div className={`px-3 py-1 rounded-md font-semibold text-sm ${
                                      Math.abs(variance) < 0.5
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : variance > 0
                                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                          : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                      Variance: {variance > 0 ? '+' : ''}{variance.toFixed(2)} L
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {isReconcileMode && (
                    <Card className="bg-amber-50 border-amber-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-full">
                            <Receipt className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-amber-800">Reconciliation Required</p>
                            <p className="text-sm text-amber-700">
                              The previous shift has ended. You must complete the reconciliation by entering attendant collections and banking summary before proceeding.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Attendant Collections
                      </CardTitle>
                      <CardDescription>
                        Enter payment amounts for each attendant. Mobile Money and Card are pre-filled from sales data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {outgoingAttendants.length > 0 ? (
                        outgoingAttendants.map((attendant) => {
                          const totalSales = calculateAttendantSales(attendant.id)
                          const variance = calculateVariance(attendant.id)
                          return (
                            <div key={attendant.id} className="bg-slate-50 p-4 rounded-lg space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-slate-700">{attendant.name}</h4>
                                <div className="text-sm text-slate-600">
                                  Total Sales: <span className="font-semibold">KES {totalSales.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {attendantCollections[attendant.id]?.map((payment, idx) => (
                                  <div key={payment.payment_method}>
                                    <Label className="text-xs text-slate-500 capitalize">
                                      {payment.payment_method === 'mobile_money' ? 'Mobile Money' : payment.payment_method.replace('_', ' ')}
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      value={payment.amount}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const newCollections = { ...attendantCollections }
                                        newCollections[attendant.id][idx].amount = e.target.value
                                        setAttendantCollections(newCollections)
                                      }}
                                    />
                                  </div>
                                ))}
                                <div>
                                  <Label className="text-xs text-slate-500">Variance</Label>
                                  <div className={`h-10 flex items-center px-3 rounded-md border font-semibold ${
                                    variance === 0 
                                      ? 'bg-green-50 border-green-200 text-green-700' 
                                      : variance > 0 
                                        ? 'bg-red-50 border-red-200 text-red-700' 
                                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                  }`}>
                                    {variance === 0 ? '0.00' : variance > 0 ? `-${variance.toFixed(2)}` : `+${Math.abs(variance).toFixed(2)}`}
                                  </div>
                                </div>
                              </div>
                              {Math.abs(variance) > 1000 && (
                                <div className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                  <p className="text-sm text-red-700">
                                    <strong>Cannot reconcile:</strong> Variance for {attendant.name} is KES {Math.abs(variance).toLocaleString('en-KE', { minimumFractionDigits: 2 })}. 
                                    Variance must be within KES 1,000 to complete reconciliation.
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          No sales recorded during this shift
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Expenses
                      </CardTitle>
                      <CardDescription>
                        Record any expenses incurred during this shift
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {shiftExpenses.map((expense, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-slate-50 p-3 rounded-lg">
                          <div className="col-span-4">
                            <Label className="text-xs text-slate-500">Expense Type</Label>
                            <Select
                              value={expense.expense_account_id}
                              onValueChange={(value) => {
                                const updated = [...shiftExpenses]
                                updated[idx].expense_account_id = value
                                setShiftExpenses(updated)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {expenseAccounts.filter(a => a.id).map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.account_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs text-slate-500">Amount (KES)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={expense.amount}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const updated = [...shiftExpenses]
                                updated[idx].amount = e.target.value
                                setShiftExpenses(updated)
                              }}
                            />
                          </div>
                          <div className="col-span-4">
                            <Label className="text-xs text-slate-500">Description</Label>
                            <Input
                              type="text"
                              placeholder="Optional notes..."
                              value={expense.description}
                              onChange={(e) => {
                                const updated = [...shiftExpenses]
                                updated[idx].description = e.target.value
                                setShiftExpenses(updated)
                              }}
                            />
                          </div>
                          <div className="col-span-1 pt-5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setShiftExpenses(shiftExpenses.filter((_, i) => i !== idx))
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {expenseAccounts.length > 0 ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShiftExpenses([...shiftExpenses, { expense_account_id: '', amount: '', description: '' }])
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      ) : (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          <p>No expense accounts configured.</p>
                          <p className="text-xs mt-1">Create accounts in Accounting &gt; Collections to enable expense tracking.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Banking Summary
                      </CardTitle>
                      <CardDescription>
                        Record any banking activity during this shift
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {shiftBanking.map((entry, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-3 items-start bg-slate-50 p-3 rounded-lg">
                          <div className="col-span-4">
                            <Label className="text-xs text-slate-500">Banking Account</Label>
                            <Select
                              value={entry.banking_account_id}
                              onValueChange={(value) => {
                                const updated = [...shiftBanking]
                                updated[idx].banking_account_id = value
                                setShiftBanking(updated)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select account..." />
                              </SelectTrigger>
                              <SelectContent>
                                {bankingAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.account_name}
                                    {account.bank_name && ` (${account.bank_name})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs text-slate-500">Amount (KES)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={entry.amount}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const updated = [...shiftBanking]
                                updated[idx].amount = e.target.value
                                setShiftBanking(updated)
                              }}
                            />
                          </div>
                          <div className="col-span-4">
                            <Label className="text-xs text-slate-500">Notes</Label>
                            <Input
                              type="text"
                              placeholder="Optional notes..."
                              value={entry.notes}
                              onChange={(e) => {
                                const updated = [...shiftBanking]
                                updated[idx].notes = e.target.value
                                setShiftBanking(updated)
                              }}
                            />
                          </div>
                          <div className="col-span-1 pt-5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setShiftBanking(shiftBanking.filter((_, i) => i !== idx))
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {bankingAccounts.length > 0 ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShiftBanking([...shiftBanking, { banking_account_id: '', amount: '', notes: '' }])
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Banking Entry
                        </Button>
                      ) : (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          <p>No banking accounts configured.</p>
                          <p className="text-xs mt-1">Create accounts in Accounting &gt; Collections to enable banking tracking.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Shift Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Add any notes about this shift (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                {step === 1 && !isReconcileMode ? (
                  <>
                    <Button variant="outline" onClick={() => router.push('/sales/summary')}>
                      Cancel
                    </Button>
                    <Button onClick={handleEndShiftAndStartNext} disabled={submitting}>
                      {submitting ? "Ending Shift..." : "End Shift: Reconciliation"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    {!isReconcileMode && (
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    )}
                    {isReconcileMode && (
                      <Button variant="outline" onClick={() => router.push('/sales/summary')} disabled>
                        Cannot leave - Reconciliation required
                      </Button>
                    )}
                    <Button onClick={handleReconcile} disabled={submitting}>
                      {submitting ? "Reconciling..." : "Reconcile"}
                    </Button>
                  </>
                )}
              </div>

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-foreground">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
