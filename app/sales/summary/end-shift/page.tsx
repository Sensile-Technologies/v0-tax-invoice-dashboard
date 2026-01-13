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
import { ArrowLeft, ArrowRight, Clock, Fuel, Users, CreditCard } from "lucide-react"
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
  const [notes, setNotes] = useState("")

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

        if (!shiftData.data) {
          setLoadError("No active shift to end. Please start a shift first.")
          setLoading(false)
          return
        }

        setCurrentShift(shiftData.data)
        setNozzles(nozzlesData.data || [])
        setTanks(tanksData.data || [])
        setDispensers(dispensersData.data || [])
        
        const allStaff = Array.isArray(staffData.staff) ? staffData.staff : (Array.isArray(staffData.data) ? staffData.data : [])
        const branchCashiers = allStaff
          .filter((s: any) => s.role?.toLowerCase() === 'cashier' && s.status === 'active')
          .map((s: any) => ({ id: s.id, name: s.full_name || s.username || 'Unknown' }))
        setCashiers(branchCashiers)
        
        const shiftSales = (salesData.data || []).filter((s: any) => 
          s.shift_id === shiftData.data.id
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

        const attendantIdsFromSales = [...new Set(shiftSales.map((s: any) => s.attendant_id || s.staff_id).filter(Boolean))]
        
        // Also get incoming attendants from previous shift (they should work this shift)
        let incomingAttendantIds: string[] = []
        if (currentBranchId) {
          try {
            const prevShiftRes = await fetch(`/api/shifts/incoming-attendants?branch_id=${currentBranchId}`)
            if (prevShiftRes.ok) {
              const prevData = await prevShiftRes.json()
              if (prevData.incoming_attendant_ids) {
                incomingAttendantIds = prevData.incoming_attendant_ids
              }
            }
          } catch (e) {
            console.error("Failed to fetch previous shift incoming attendants:", e)
          }
        }
        
        const allAttendantIds = [...new Set([...attendantIdsFromSales, ...incomingAttendantIds])]
        const outgoing = allStaff
          .filter((s: any) => allAttendantIds.includes(s.id))
          .map((s: any) => ({ id: s.id, name: s.full_name || s.username || 'Unknown' }))
        setOutgoingAttendants(outgoing)

        const collections: Record<string, Array<{ payment_method: string; amount: string }>> = {}
        for (const att of outgoing) {
          const attSales = shiftSales.filter((s: any) => s.attendant_id === att.id)
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
      if (closingStock > openingStock) {
        const stockReceived = parseFloat(tankStockReceived[tank.id] || "0") || 0
        if (stockReceived <= 0) {
          toast.error(`Please enter stock received for ${tank.tank_name || 'tank'} (closing stock is higher than opening)`)
          return false
        }
      }
    }
    return true
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
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleEndShift = async () => {
    if (!currentShift || !branchId) return

    if (!validateStep2()) {
      return
    }

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

      const collectionsData = Object.entries(attendantCollections).map(([attendantId, payments]) => ({
        attendant_id: attendantId,
        payments: payments.map(p => ({
          payment_method: p.payment_method,
          amount: parseFloat(p.amount || "0") || 0,
        })),
      }))

      const response = await fetch("/api/shifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentShift.id,
          status: "completed",
          notes,
          nozzle_readings: readings,
          tank_stocks: tankData,
          attendant_collections: collectionsData,
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

      toast.success("Shift ended successfully")
      router.push('/sales/summary')
    } catch (error) {
      console.error("Error ending shift:", error)
      toast.error(error instanceof Error ? error.message : "Failed to end shift")
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
                  <h1 className="text-2xl font-bold text-slate-900">End Current Shift</h1>
                  <p className="text-slate-600">Complete the shift closure process</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={step === 1 ? "default" : "secondary"}>Step 1</Badge>
                  <span className="text-slate-400">→</span>
                  <Badge variant={step === 2 ? "default" : "secondary"}>Step 2</Badge>
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
                              {needsStockReceived && (
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Attendant Collections
                      </CardTitle>
                      <CardDescription>
                        Enter cash and credit amounts for each attendant. App payments are auto-calculated.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {outgoingAttendants.length > 0 ? (
                        outgoingAttendants.map((attendant) => (
                          <div key={attendant.id} className="bg-slate-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold text-slate-700">{attendant.name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {attendantCollections[attendant.id]?.map((payment, idx) => (
                                <div key={payment.payment_method}>
                                  <Label className="text-xs text-slate-500 capitalize">
                                    {payment.payment_method === 'mobile_money' ? 'Mobile Money' : payment.payment_method.replace('_', ' ')}
                                    {['card', 'mobile_money'].includes(payment.payment_method) && (
                                      <span className="text-blue-500 ml-1">(auto)</span>
                                    )}
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={payment.amount}
                                    disabled={['card', 'mobile_money'].includes(payment.payment_method)}
                                    className={['card', 'mobile_money'].includes(payment.payment_method) ? "bg-slate-100" : ""}
                                    onChange={(e) => {
                                      const newCollections = { ...attendantCollections }
                                      newCollections[attendant.id][idx].amount = e.target.value
                                      setAttendantCollections(newCollections)
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          No sales recorded during this shift
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
                {step === 1 ? (
                  <>
                    <Button variant="outline" onClick={() => router.push('/sales/summary')}>
                      Cancel
                    </Button>
                    <Button onClick={handleNextStep}>
                      Next: Collections
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleEndShift} disabled={submitting}>
                      {submitting ? "Ending Shift..." : "End Shift"}
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
