"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const DashboardSidebar = dynamic(() => import("@/components/dashboard-sidebar"), { ssr: false })
const DashboardHeader = dynamic(() => import("@/components/dashboard-header"), { ssr: false })
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, RefreshCw, Clock, AlertCircle, StopCircle, Loader2, Fuel, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Shift {
  id: string
  branch_id: string
  staff_id: string
  start_time: string
  end_time: string | null
  opening_cash: number
  closing_cash: number
  total_sales: number
  status: string
  notes: string | null
  branch_name: string
  cashier: string
  variance: number
}


interface Nozzle {
  id: string
  name: string
  fuel_type: string
  initial_meter_reading: number
}

interface Tank {
  id: string
  tank_name: string
  fuel_type: string
  current_stock: number
  capacity: number
}

interface NozzleReading {
  nozzle_id: string
  closing_reading: string
}

interface TankStock {
  tank_id: string
  closing_reading: string
  stock_received: string
}

interface NozzleReport {
  nozzle_id: string
  nozzle_name: string
  fuel_type: string
  opening_reading: number
  closing_reading: number
  meter_difference: number
  invoiced_quantity: number
  invoiced_amount: number
  variance: number
}

interface NozzleReportData {
  shift: {
    id: string
    branch_name: string
    cashier_name: string
    start_time: string
    end_time: string
    status: string
    opening_cash: number
    closing_cash: number
  } | null
  nozzles: NozzleReport[]
  totals: {
    total_meter_difference: number
    total_invoiced_quantity: number
    total_invoiced_amount: number
    total_variance: number
  } | null
}

export default function ShiftsReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { formatCurrency } = useCurrency()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalShifts: 0,
    totalSales: 0,
    averagePerShift: 0,
    totalVariance: 0
  })

  const [endShiftDialogOpen, setEndShiftDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [endShiftLoading, setEndShiftLoading] = useState(false)
  const [closingCash, setClosingCash] = useState("")
  const [nozzles, setNozzles] = useState<Nozzle[]>([])
  const [tanks, setTanks] = useState<Tank[]>([])
  const [nozzleReadings, setNozzleReadings] = useState<NozzleReading[]>([])
  const [tankStocks, setTankStocks] = useState<TankStock[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [nozzleReportDialogOpen, setNozzleReportDialogOpen] = useState(false)
  const [nozzleReportLoading, setNozzleReportLoading] = useState(false)
  const [nozzleReportData, setNozzleReportData] = useState<NozzleReportData | null>(null)
  const [selectedReportShift, setSelectedReportShift] = useState<Shift | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    
    if (!userStr) {
      setLoading(false)
      return
    }
    
    const user = JSON.parse(userStr)
    setUserId(user.id)
    
    const params = new URLSearchParams()
    params.append('user_id', user.id)
    
    fetch(`/api/shifts/list?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setShifts(data.data || [])
          const totalSales = data.data.reduce((sum: number, s: Shift) => sum + (s.total_sales || 0), 0)
          const totalVariance = data.data.reduce((sum: number, s: Shift) => sum + (s.variance || 0), 0)
          setSummary({
            totalShifts: data.data.length,
            totalSales,
            averagePerShift: data.data.length > 0 ? totalSales / data.data.length : 0,
            totalVariance
          })
        }
        setLoading(false)
      })
      .catch(e => {
        console.error('[ShiftsReport] Error loading shifts:', e)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (userId && (dateFrom || dateTo)) {
      fetchShifts(userId, dateFrom, dateTo)
    }
  }, [userId, dateFrom, dateTo])

  async function fetchShifts(uid: string, fromDate?: string, toDate?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('user_id', uid)
      if (fromDate) params.append('date_from', fromDate)
      if (toDate) params.append('date_to', toDate)

      const response = await fetch(`/api/shifts/list?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setShifts(data.data || [])
        
        const totalSales = data.data.reduce((sum: number, s: Shift) => sum + (s.total_sales || 0), 0)
        const totalVariance = data.data.reduce((sum: number, s: Shift) => sum + (s.variance || 0), 0)
        setSummary({
          totalShifts: data.data.length,
          totalSales,
          averagePerShift: data.data.length > 0 ? totalSales / data.data.length : 0,
          totalVariance
        })
      } else {
        toast.error(data.error || 'Failed to fetch shifts')
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
      toast.error('Failed to fetch shifts')
    } finally {
      setLoading(false)
    }
  }

  function formatDateTime(dateString: string | null) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  async function openEndShiftDialog(shift: Shift) {
    setSelectedShift(shift)
    setEndShiftLoading(true)
    setClosingCash("")
    setNozzleReadings([])
    setTankStocks([])
    setEndShiftDialogOpen(true)

    try {
      const [nozzlesRes, tanksRes] = await Promise.all([
        fetch(`/api/nozzles?branch_id=${shift.branch_id}&status=active`),
        fetch(`/api/tanks?branch_id=${shift.branch_id}`)
      ])
      
      const nozzlesData = await nozzlesRes.json()
      const tanksData = await tanksRes.json()

      if (nozzlesData.success) {
        setNozzles(nozzlesData.data || [])
        setNozzleReadings((nozzlesData.data || []).map((n: Nozzle) => ({
          nozzle_id: n.id,
          closing_reading: ""
        })))
      }

      if (tanksData.success) {
        setTanks(tanksData.data || [])
        setTankStocks((tanksData.data || []).map((t: Tank) => ({
          tank_id: t.id,
          closing_reading: t.current_stock?.toString() || "",
          stock_received: "0"
        })))
      }
    } catch (error) {
      console.error('Error fetching nozzles/tanks:', error)
      toast.error('Failed to load nozzle and tank data')
    } finally {
      setEndShiftLoading(false)
    }
  }

  function updateNozzleReading(nozzleId: string, value: string) {
    setNozzleReadings(prev =>
      prev.map(r => r.nozzle_id === nozzleId ? { ...r, closing_reading: value } : r)
    )
  }

  function updateTankStock(tankId: string, field: 'closing_reading' | 'stock_received', value: string) {
    setTankStocks(prev =>
      prev.map(t => t.tank_id === tankId ? { ...t, [field]: value } : t)
    )
  }

  async function handleEndShift() {
    if (!selectedShift) return

    setSubmitting(true)
    try {
      const payload = {
        id: selectedShift.id,
        closing_cash: closingCash ? parseFloat(closingCash) : 0,
        status: 'completed',
        nozzle_readings: nozzleReadings
          .filter(r => r.closing_reading)
          .map(r => ({
            nozzle_id: r.nozzle_id,
            closing_reading: parseFloat(r.closing_reading)
          })),
        tank_stocks: tankStocks
          .filter(t => t.closing_reading)
          .map(t => ({
            tank_id: t.tank_id,
            closing_reading: parseFloat(t.closing_reading),
            stock_received: t.stock_received ? parseFloat(t.stock_received) : 0
          }))
      }

      const response = await fetch('/api/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Shift ended successfully')
        setEndShiftDialogOpen(false)
        if (userId) fetchShifts(userId)
      } else {
        toast.error(data.error || 'Failed to end shift')
      }
    } catch (error) {
      console.error('Error ending shift:', error)
      toast.error('Failed to end shift')
    } finally {
      setSubmitting(false)
    }
  }

  async function openNozzleReport(shift: Shift) {
    setSelectedReportShift(shift)
    setNozzleReportLoading(true)
    setNozzleReportData(null)
    setNozzleReportDialogOpen(true)

    try {
      const params = new URLSearchParams()
      params.append('shift_id', shift.id)
      if (userId) params.append('user_id', userId)

      const response = await fetch(`/api/shifts/nozzle-report?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setNozzleReportData(data.data)
      } else {
        toast.error(data.error || 'Failed to load nozzle report')
      }
    } catch (error) {
      console.error('Error fetching nozzle report:', error)
      toast.error('Failed to load nozzle report')
    } finally {
      setNozzleReportLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Shifts Report</h1>
                  <p className="text-slate-600 mt-1">Cashier shift performance and reconciliation</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => {
                      const userStr = localStorage.getItem("user")
                      if (userStr) {
                        const user = JSON.parse(userStr)
                        setUserId(user.id)
                        fetchShifts(user.id)
                      }
                    }}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl mb-6">
                <CardHeader>
                  <CardTitle>Shift Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Total Shifts</p>
                      <p className="text-2xl font-bold">{summary.totalShifts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Sales</p>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Average Per Shift</p>
                      <p className="text-2xl font-bold">{formatCurrency(summary.averagePerShift)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Variance</p>
                      <p className={`text-2xl font-bold ${summary.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.totalVariance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-slate-600 font-medium">Filter by date:</span>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-40 rounded-xl"
                      placeholder="From"
                    />
                    <span className="text-slate-600">to</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40 rounded-xl"
                      placeholder="To"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setDateFrom(''); setDateTo(''); if (userId) fetchShifts(userId, '', ''); }}
                      className="rounded-xl"
                    >
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-500">Loading shifts...</span>
                    </div>
                  ) : shifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Clock className="h-12 w-12 mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No shifts found</p>
                      <p className="text-sm">Try adjusting your filters or date range</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Branch</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Cashier</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Start Time</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">End Time</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Opening Cash</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Sales</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Closing Cash</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Variance</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shifts.map((shift) => (
                            <tr key={shift.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4">{shift.branch_name || 'Unknown'}</td>
                              <td className="py-3 px-4">{shift.cashier}</td>
                              <td className="py-3 px-4">{formatDateTime(shift.start_time)}</td>
                              <td className="py-3 px-4">{formatDateTime(shift.end_time)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(shift.opening_cash)}</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(shift.total_sales)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(shift.closing_cash)}</td>
                              <td className="py-3 px-4 text-right">
                                <span className={shift.variance >= 0 ? "text-green-600" : "text-red-600"}>
                                  {shift.variance !== 0 && (
                                    <AlertCircle className="h-4 w-4 inline mr-1" />
                                  )}
                                  {formatCurrency(shift.variance)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {getStatusBadge(shift.status)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openNozzleReport(shift)}
                                  >
                                    <Fuel className="h-4 w-4 mr-1" />
                                    Nozzles
                                  </Button>
                                  {shift.status === 'active' && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => openEndShiftDialog(shift)}
                                    >
                                      <StopCircle className="h-4 w-4 mr-1" />
                                      End
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={endShiftDialogOpen} onOpenChange={setEndShiftDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StopCircle className="h-5 w-5 text-red-500" />
              End Shift
            </DialogTitle>
            <DialogDescription>
              {selectedShift && (
                <>End shift for <strong>{selectedShift.branch_name}</strong> started at {formatDateTime(selectedShift.start_time)}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {endShiftLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Loading shift data...</span>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="closing-cash">Closing Cash (KES)</Label>
                  <Input
                    id="closing-cash"
                    type="number"
                    placeholder="Enter closing cash amount"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {nozzles.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <Label className="text-base font-semibold">Nozzle Readings</Label>
                    <p className="text-sm text-slate-500">Enter closing meter readings for each nozzle</p>
                    <div className="grid gap-3">
                      {nozzles.map((nozzle) => {
                        const reading = nozzleReadings.find(r => r.nozzle_id === nozzle.id)
                        return (
                          <div key={nozzle.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{nozzle.name}</p>
                              <p className="text-sm text-slate-500">{nozzle.fuel_type} - Current: {nozzle.initial_meter_reading?.toLocaleString() || 0}</p>
                            </div>
                            <Input
                              type="number"
                              placeholder="Closing reading"
                              value={reading?.closing_reading || ""}
                              onChange={(e) => updateNozzleReading(nozzle.id, e.target.value)}
                              className="w-40 rounded-xl"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {tanks.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <Label className="text-base font-semibold">Tank Volumes</Label>
                    <p className="text-sm text-slate-500">Enter closing stock levels and any stock received</p>
                    <div className="grid gap-3">
                      {tanks.map((tank) => {
                        const stock = tankStocks.find(t => t.tank_id === tank.id)
                        return (
                          <div key={tank.id} className="p-3 bg-slate-50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{tank.tank_name}</p>
                                <p className="text-sm text-slate-500">{tank.fuel_type} - Current: {tank.current_stock?.toLocaleString() || 0}L / {tank.capacity?.toLocaleString() || 0}L</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-slate-500">Closing Stock (L)</Label>
                                <Input
                                  type="number"
                                  placeholder="Closing stock"
                                  value={stock?.closing_reading || ""}
                                  onChange={(e) => updateTankStock(tank.id, 'closing_reading', e.target.value)}
                                  className="rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-500">Stock Received (L)</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={stock?.stock_received || ""}
                                  onChange={(e) => updateTankStock(tank.id, 'stock_received', e.target.value)}
                                  className="rounded-xl"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEndShiftDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEndShift}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ending Shift...
                </>
              ) : (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  End Shift
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={nozzleReportDialogOpen} onOpenChange={setNozzleReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-blue-500" />
              Nozzle Sales Report
            </DialogTitle>
            <DialogDescription>
              {selectedReportShift && (
                <>Nozzle breakdown for <strong>{selectedReportShift.branch_name}</strong> - {formatDateTime(selectedReportShift.start_time)} to {formatDateTime(selectedReportShift.end_time)}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {nozzleReportLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Loading nozzle report...</span>
            </div>
          ) : nozzleReportData && nozzleReportData.nozzles.length > 0 ? (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Nozzle</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Fuel Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Opening</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Closing</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Meter Diff (L)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Invoiced (L)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Variance (L)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nozzleReportData.nozzles.map((nozzle) => (
                        <tr key={nozzle.nozzle_id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{nozzle.nozzle_name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{nozzle.fuel_type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{nozzle.opening_reading.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono">{nozzle.closing_reading.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold">{nozzle.meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-right font-mono">{nozzle.invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-mono font-semibold ${nozzle.variance === 0 ? 'text-green-600' : nozzle.variance > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                              {nozzle.variance > 0 ? '+' : ''}{nozzle.variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {nozzle.variance !== 0 && <AlertCircle className="h-4 w-4 inline ml-1" />}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100">
                      <tr className="font-bold">
                        <td className="py-3 px-4" colSpan={4}>TOTAL STATION SALES</td>
                        <td className="py-3 px-4 text-right font-mono">{nozzleReportData.totals?.total_meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right font-mono">{nozzleReportData.totals?.total_invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-mono ${(nozzleReportData.totals?.total_variance || 0) === 0 ? 'text-green-600' : (nozzleReportData.totals?.total_variance || 0) > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                            {(nozzleReportData.totals?.total_variance || 0) > 0 ? '+' : ''}{nozzleReportData.totals?.total_variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">How to read this report:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Meter Difference</strong> = Closing Reading - Opening Reading (actual fuel dispensed)</li>
                    <li><strong>Invoiced</strong> = Total quantity from invoices issued on this nozzle</li>
                    <li><strong>Variance</strong> = Meter Difference - Invoiced (should be 0 ideally)</li>
                    <li className="text-amber-700"><strong>Positive variance</strong> = More fuel dispensed than invoiced (potential loss)</li>
                    <li className="text-red-700"><strong>Negative variance</strong> = Less fuel dispensed than invoiced (data error)</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Fuel className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No nozzle readings found</p>
              <p className="text-sm">This shift may not have recorded nozzle readings yet</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setNozzleReportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
