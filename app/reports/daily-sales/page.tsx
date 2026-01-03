"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, BarChart3, Fuel, AlertCircle, Clock, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/lib/currency-utils"
import { Label } from "@/components/ui/label"

interface ShiftSaleItem {
  fuel_type: string
  claimed_quantity: number
  claimed_amount: number
  unclaimed_quantity: number
  unclaimed_amount: number
}

interface ShiftSummary {
  shift_id: string
  cashier_name: string
  start_time: string
  end_time: string | null
  status: string
  items: ShiftSaleItem[]
  totals: {
    claimed_quantity: number
    claimed_amount: number
    unclaimed_quantity: number
    unclaimed_amount: number
  }
}

interface NozzleData {
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

interface NozzleTotals {
  total_meter_difference: number
  total_invoiced_quantity: number
  total_invoiced_amount: number
  total_variance: number
}

export default function DailySalesReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [shiftSummaries, setShiftSummaries] = useState<ShiftSummary[]>([])
  const [productTotals, setProductTotals] = useState<ShiftSaleItem[]>([])
  const [grandTotals, setGrandTotals] = useState({
    claimed_quantity: 0,
    claimed_amount: 0,
    unclaimed_quantity: 0,
    unclaimed_amount: 0,
  })
  const { formatCurrency } = useCurrency()
  const [nozzleData, setNozzleData] = useState<NozzleData[]>([])
  const [nozzleTotals, setNozzleTotals] = useState<NozzleTotals | null>(null)
  const [nozzleLoading, setNozzleLoading] = useState(false)

  const fetchDailySales = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      if (!branchId) {
        setShiftSummaries([])
        setProductTotals([])
        setGrandTotals({ claimed_quantity: 0, claimed_amount: 0, unclaimed_quantity: 0, unclaimed_amount: 0 })
        return
      }

      const params = new URLSearchParams()
      params.append("branch_id", branchId)
      params.append("start_date", startDate)
      params.append("end_date", endDate)

      const response = await fetch(`/api/shifts/daily-summary?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setShiftSummaries(result.data.shifts || [])
        setProductTotals(result.data.productTotals || [])
        setGrandTotals(result.data.grandTotals || { claimed_quantity: 0, claimed_amount: 0, unclaimed_quantity: 0, unclaimed_amount: 0 })
      } else {
        setShiftSummaries([])
        setProductTotals([])
        setGrandTotals({ claimed_quantity: 0, claimed_amount: 0, unclaimed_quantity: 0, unclaimed_amount: 0 })
      }
    } catch (error) {
      console.error("Error fetching daily sales:", error)
      setShiftSummaries([])
      setProductTotals([])
      setGrandTotals({ claimed_quantity: 0, claimed_amount: 0, unclaimed_quantity: 0, unclaimed_amount: 0 })
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchDailySales()
  }, [fetchDailySales])

  const fetchNozzleReport = useCallback(async () => {
    try {
      setNozzleLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      const userStr = localStorage.getItem("user")
      let branchId = ""
      let userId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }
      if (userStr) {
        const user = JSON.parse(userStr)
        userId = user.id
      }

      if (!branchId) {
        setNozzleData([])
        setNozzleTotals(null)
        return
      }

      const params = new URLSearchParams()
      params.append("branch_id", branchId)
      params.append("date", startDate)
      if (userId) params.append("user_id", userId)

      const response = await fetch(`/api/shifts/nozzle-report?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setNozzleData(result.data.nozzles || [])
        setNozzleTotals(result.data.totals || null)
      } else {
        setNozzleData([])
        setNozzleTotals(null)
      }
    } catch (error) {
      console.error("Error fetching nozzle report:", error)
      setNozzleData([])
      setNozzleTotals(null)
    } finally {
      setNozzleLoading(false)
    }
  }, [startDate])

  useEffect(() => {
    fetchNozzleReport()
  }, [fetchNozzleReport])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const rows: string[][] = [
      ["Shift", "Cashier", "Fuel Type", "Claimed (L)", "Claimed Amount", "Unclaimed (L)", "Unclaimed Amount"]
    ]
    
    shiftSummaries.forEach(shift => {
      const time = new Date(shift.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      shift.items.forEach(item => {
        rows.push([
          time,
          shift.cashier_name,
          item.fuel_type,
          item.claimed_quantity.toFixed(2),
          item.claimed_amount.toFixed(2),
          item.unclaimed_quantity.toFixed(2),
          item.unclaimed_amount.toFixed(2)
        ])
      })
    })
    
    rows.push([
      "TOTAL", "", "",
      grandTotals.claimed_quantity.toFixed(2),
      grandTotals.claimed_amount.toFixed(2),
      grandTotals.unclaimed_quantity.toFixed(2),
      grandTotals.unclaimed_amount.toFixed(2)
    ])

    const csvContent = rows.map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const totalSales = grandTotals.claimed_amount + grandTotals.unclaimed_amount
  const totalQuantity = grandTotals.claimed_quantity + grandTotals.unclaimed_quantity

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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Daily Sales Report</h1>
                  <p className="text-sm text-slate-600 mt-1">Comprehensive daily sales breakdown by shift</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Sales</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totalSales)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Claimed Sales</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2 text-green-600">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(grandTotals.claimed_amount)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Unclaimed Sales</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2 text-amber-600">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(grandTotals.unclaimed_amount)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Volume (L)</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Date Range Filter
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs text-slate-600">From</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-36 rounded-xl"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs text-slate-600">To</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-36 rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setStartDate(today); setEndDate(today); }}
                        >
                          Today
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            setStartDate(weekAgo.toISOString().split("T")[0])
                            setEndDate(today)
                          }}
                        >
                          Last 7 Days
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const monthAgo = new Date()
                            monthAgo.setDate(monthAgo.getDate() - 30)
                            setStartDate(monthAgo.toISOString().split("T")[0])
                            setEndDate(today)
                          }}
                        >
                          Last 30 Days
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {productTotals.length > 0 && (
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-blue-500" />
                      Product Summary
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Cumulative sales by product for the selected period
                      {startDate !== endDate && ` (${startDate} to ${endDate})`}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b text-xs md:text-sm bg-slate-50">
                            <th className="text-left py-2 px-4 font-semibold text-slate-700">Product</th>
                            <th className="text-right py-2 px-4 font-semibold text-green-700">Claimed (L)</th>
                            <th className="text-right py-2 px-4 font-semibold text-green-700">Claimed Amount</th>
                            <th className="text-right py-2 px-4 font-semibold text-amber-700">Unclaimed (L)</th>
                            <th className="text-right py-2 px-4 font-semibold text-amber-700">Unclaimed Amount</th>
                            <th className="text-right py-2 px-4 font-semibold text-slate-700">Total (L)</th>
                            <th className="text-right py-2 px-4 font-semibold text-slate-700">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productTotals.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                              <td className="py-2 px-4 font-medium">{item.fuel_type}</td>
                              <td className="py-2 px-4 text-right text-green-700 font-mono">
                                {item.claimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-4 text-right text-green-700 font-mono">
                                {formatCurrency(item.claimed_amount)}
                              </td>
                              <td className="py-2 px-4 text-right text-amber-700 font-mono">
                                {item.unclaimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-4 text-right text-amber-700 font-mono">
                                {formatCurrency(item.unclaimed_amount)}
                              </td>
                              <td className="py-2 px-4 text-right font-mono font-semibold">
                                {(item.claimed_quantity + item.unclaimed_quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-4 text-right font-mono font-semibold">
                                {formatCurrency(item.claimed_amount + item.unclaimed_amount)}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-slate-100 text-xs md:text-sm">
                            <td className="py-2 px-4">TOTAL</td>
                            <td className="py-2 px-4 text-right text-green-700 font-mono">
                              {grandTotals.claimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-4 text-right text-green-700 font-mono">
                              {formatCurrency(grandTotals.claimed_amount)}
                            </td>
                            <td className="py-2 px-4 text-right text-amber-700 font-mono">
                              {grandTotals.unclaimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-4 text-right text-amber-700 font-mono">
                              {formatCurrency(grandTotals.unclaimed_amount)}
                            </td>
                            <td className="py-2 px-4 text-right font-mono">
                              {totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-4 text-right font-mono">
                              {formatCurrency(totalSales)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Shift Details</CardTitle>
                  <p className="text-sm text-slate-600">
                    {shiftSummaries.length} shift{shiftSummaries.length !== 1 ? 's' : ''} in selected period
                  </p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading sales data...</span>
                    </div>
                  ) : shiftSummaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No shifts recorded for this period</p>
                      <p className="text-sm text-muted-foreground mt-1">Try selecting a different date range</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {shiftSummaries.map((shift) => (
                        <div key={shift.shift_id} className="border rounded-xl overflow-hidden">
                          <div className="bg-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-3">
                              {startDate !== endDate && (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="font-medium">{new Date(shift.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">{formatTime(shift.start_time)}</span>
                                {shift.end_time && (
                                  <>
                                    <span className="text-slate-400">-</span>
                                    <span className="font-medium">{formatTime(shift.end_time)}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm">
                                <User className="h-4 w-4 text-slate-500" />
                                <span>{shift.cashier_name}</span>
                              </div>
                            </div>
                            <Badge variant={shift.status === 'closed' ? 'secondary' : 'default'}>
                              {shift.status === 'closed' ? 'Closed' : 'Open'}
                            </Badge>
                          </div>
                          
                          {shift.items.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              No fuel sales recorded in this shift
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[600px]">
                                <thead>
                                  <tr className="border-b text-xs md:text-sm bg-slate-50">
                                    <th className="text-left py-2 px-4 font-semibold text-slate-700">Fuel Type</th>
                                    <th className="text-right py-2 px-4 font-semibold text-green-700">Claimed (L)</th>
                                    <th className="text-right py-2 px-4 font-semibold text-green-700">Claimed Amount</th>
                                    <th className="text-right py-2 px-4 font-semibold text-amber-700">Unclaimed (L)</th>
                                    <th className="text-right py-2 px-4 font-semibold text-amber-700">Unclaimed Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {shift.items.map((item, idx) => (
                                    <tr key={idx} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                                      <td className="py-2 px-4 font-medium">{item.fuel_type}</td>
                                      <td className="py-2 px-4 text-right text-green-700 font-mono">
                                        {item.claimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="py-2 px-4 text-right text-green-700 font-mono">
                                        {formatCurrency(item.claimed_amount)}
                                      </td>
                                      <td className="py-2 px-4 text-right text-amber-700 font-mono">
                                        {item.unclaimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="py-2 px-4 text-right text-amber-700 font-mono">
                                        {formatCurrency(item.unclaimed_amount)}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="font-bold bg-slate-50 text-xs md:text-sm">
                                    <td className="py-2 px-4">Shift Total</td>
                                    <td className="py-2 px-4 text-right text-green-700 font-mono">
                                      {shift.totals.claimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 px-4 text-right text-green-700 font-mono">
                                      {formatCurrency(shift.totals.claimed_amount)}
                                    </td>
                                    <td className="py-2 px-4 text-right text-amber-700 font-mono">
                                      {shift.totals.unclaimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 px-4 text-right text-amber-700 font-mono">
                                      {formatCurrency(shift.totals.unclaimed_amount)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="bg-blue-50 rounded-xl p-4 mt-4">
                        <h4 className="font-semibold text-blue-900 mb-3">Daily Grand Total</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-blue-700">Claimed Volume</p>
                            <p className="font-bold text-green-700">{grandTotals.claimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</p>
                          </div>
                          <div>
                            <p className="text-blue-700">Claimed Amount</p>
                            <p className="font-bold text-green-700">{formatCurrency(grandTotals.claimed_amount)}</p>
                          </div>
                          <div>
                            <p className="text-blue-700">Unclaimed Volume</p>
                            <p className="font-bold text-amber-700">{grandTotals.unclaimed_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</p>
                          </div>
                          <div>
                            <p className="text-blue-700">Unclaimed Amount</p>
                            <p className="font-bold text-amber-700">{formatCurrency(grandTotals.unclaimed_amount)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-100 rounded-lg p-3 md:p-4 text-xs">
                        <h4 className="font-semibold text-slate-800 mb-2">Understanding this report:</h4>
                        <ul className="text-slate-600 space-y-1">
                          <li><span className="text-green-700 font-semibold">Claimed</span> = Sales invoiced through the APK (with receipt)</li>
                          <li><span className="text-amber-700 font-semibold">Unclaimed</span> = Bulk sales from meter difference (dispensed but no invoice)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-blue-500" />
                      Nozzle Sales Report
                    </CardTitle>
                  </div>
                  <p className="text-sm text-slate-600">Station sales breakdown by nozzle with variance analysis</p>
                </CardHeader>
                <CardContent>
                  {nozzleLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading nozzle data...</span>
                    </div>
                  ) : nozzleData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Fuel className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No nozzle readings for this date</p>
                      <p className="text-sm text-muted-foreground mt-1">Nozzle data is recorded when shifts are completed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto -mx-3 md:mx-0">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="border-b bg-slate-50 text-xs md:text-sm">
                              <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Nozzle</th>
                              <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Fuel Type</th>
                              <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Opening</th>
                              <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Closing</th>
                              <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Meter Diff (L)</th>
                              <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Invoiced (L)</th>
                              <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Variance (L)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nozzleData.map((nozzle) => (
                              <tr key={nozzle.nozzle_id} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                                <td className="py-2 md:py-3 px-3 md:px-4 font-medium">{nozzle.nozzle_name}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4">
                                  <Badge variant="outline">{nozzle.fuel_type}</Badge>
                                </td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right font-mono">{nozzle.opening_reading.toLocaleString()}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right font-mono">{nozzle.closing_reading.toLocaleString()}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right font-mono font-semibold">{nozzle.meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right font-mono">{nozzle.invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right">
                                  <span className={`font-mono font-semibold ${nozzle.variance === 0 ? 'text-green-600' : nozzle.variance > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {nozzle.variance > 0 ? '+' : ''}{nozzle.variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    {nozzle.variance !== 0 && <AlertCircle className="h-3 w-3 inline ml-1" />}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {nozzleTotals && (
                            <tfoot className="bg-slate-100">
                              <tr className="font-bold text-xs md:text-sm">
                                <td className="py-2 md:py-3 px-3 md:px-4" colSpan={4}>TOTAL STATION SALES</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right font-mono">{nozzleTotals.total_meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right font-mono">{nozzleTotals.total_invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="py-2 md:py-3 px-3 md:px-4 text-right">
                                  <span className={`font-mono ${nozzleTotals.total_variance === 0 ? 'text-green-600' : nozzleTotals.total_variance > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {nozzleTotals.total_variance > 0 ? '+' : ''}{nozzleTotals.total_variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm">How to read this report:</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li><strong>Meter Difference</strong> = Closing - Opening (actual fuel dispensed)</li>
                          <li><strong>Invoiced</strong> = Total quantity from invoices issued</li>
                          <li><strong>Variance</strong> = Meter Difference - Invoiced</li>
                          <li className="text-amber-700"><strong>Positive</strong> = More dispensed than invoiced (loss)</li>
                          <li className="text-red-700"><strong>Negative</strong> = Less dispensed than invoiced (error)</li>
                        </ul>
                      </div>
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
    </div>
  )
}
