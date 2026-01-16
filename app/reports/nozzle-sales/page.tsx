"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Printer, Loader2, Fuel, AlertCircle, RefreshCw, Calendar, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/lib/currency-utils"

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

interface ShiftInfo {
  id: string
  start_time: string
  end_time: string | null
  status: string
  cashier_name: string | null
}

interface NozzleReportData {
  shift?: {
    id: string
    start_time: string
    end_time: string | null
    status: string
    branch_name: string
    cashier_name: string | null
  }
  branch?: {
    id: string
    name: string
  }
  date?: string
  shifts?: ShiftInfo[]
  nozzles: NozzleData[]
  totals: {
    total_meter_difference: number
    total_invoiced_quantity: number
    total_invoiced_amount: number
    total_variance: number
  } | null
}

function NozzleSalesReportContent() {
  const searchParams = useSearchParams()
  const urlShiftId = searchParams.get("shift_id")
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<NozzleReportData | null>(null)
  const [shifts, setShifts] = useState<ShiftInfo[]>([])
  const [selectedShiftId, setSelectedShiftId] = useState<string>(urlShiftId || "")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"shift" | "daily">("shift")
  const [shiftsLoading, setShiftsLoading] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const { formatCurrency } = useCurrency()

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "In Progress"
    return new Date(dateStr).toLocaleString("en-KE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const fetchShifts = useCallback(async () => {
    try {
      setShiftsLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      if (!branchId) {
        setShifts([])
        return
      }

      const params = new URLSearchParams()
      params.append("branch_id", branchId)
      params.append("limit", "50")

      const response = await fetch(`/api/shifts/list?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setShifts(result.data.map((s: any) => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
          status: s.status,
          cashier_name: s.staff_name || s.cashier || 'Unknown'
        })))
      }
    } catch (error) {
      console.error("Error fetching shifts:", error)
    } finally {
      setShiftsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const fetchNozzleReport = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      if (!branchId) {
        setReportData(null)
        return
      }

      const params = new URLSearchParams()
      params.append("branch_id", branchId)

      if (viewMode === "shift" && selectedShiftId) {
        params.append("shift_id", selectedShiftId)
      } else if (viewMode === "daily") {
        params.append("date", selectedDate)
      } else {
        setReportData(null)
        setLoading(false)
        return
      }

      const response = await fetch(`/api/shifts/nozzle-report?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setReportData(result.data)
      } else {
        setReportData(null)
      }
    } catch (error) {
      console.error("Error fetching nozzle report:", error)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }, [viewMode, selectedShiftId, selectedDate])

  useEffect(() => {
    if ((viewMode === "shift" && selectedShiftId) || viewMode === "daily") {
      fetchNozzleReport()
    }
  }, [fetchNozzleReport, viewMode, selectedShiftId])

  useEffect(() => {
    if (urlShiftId && !initialLoadDone) {
      setSelectedShiftId(urlShiftId)
      setViewMode("shift")
      setInitialLoadDone(true)
    }
  }, [urlShiftId, initialLoadDone])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!reportData || !reportData.nozzles.length) return

    const csvContent = [
      ["Nozzle", "Fuel Type", "Opening", "Closing", "Meter Diff (L)", "Invoiced (L)", "Invoiced Amount", "Variance (L)"],
      ...reportData.nozzles.map(n => [
        n.nozzle_name,
        n.fuel_type,
        n.opening_reading.toString(),
        n.closing_reading.toString(),
        n.meter_difference.toString(),
        n.invoiced_quantity.toString(),
        n.invoiced_amount.toString(),
        n.variance.toString()
      ]),
      ["TOTAL", "", "", "", 
        reportData.totals?.total_meter_difference.toString() || "0",
        reportData.totals?.total_invoiced_quantity.toString() || "0",
        reportData.totals?.total_invoiced_amount.toString() || "0",
        reportData.totals?.total_variance.toString() || "0"
      ]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nozzle-sales-report-${viewMode === "shift" ? selectedShiftId : selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getReportTitle = () => {
    if (viewMode === "shift" && reportData?.shift) {
      return `${reportData.shift.branch_name} - ${formatDateTime(reportData.shift.start_time)} to ${formatDateTime(reportData.shift.end_time)}`
    }
    if (viewMode === "daily" && reportData?.branch) {
      return `${reportData.branch.name} - ${new Date(selectedDate).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
    }
    return "Select a shift or date to view report"
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
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Fuel className="h-8 w-8 text-blue-600" />
                    Nozzle Sales Report
                  </h1>
                  <p className="text-slate-600 mt-1">Meter readings and variance analysis by nozzle</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {urlShiftId && (
                    <Button variant="outline" size="sm" onClick={() => window.location.href = "/reports/shifts"}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Shifts
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={fetchNozzleReport} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={!reportData?.nozzles.length}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {!urlShiftId && (
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Report Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Select Date</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-44 rounded-xl"
                          />
                        </div>
                      </div>

                      <Button onClick={() => { setViewMode("daily"); fetchNozzleReport(); }} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Load Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reportData?.shifts && reportData.shifts.length > 0 && viewMode === "daily" && (
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Shifts on {new Date(selectedDate).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {reportData.shifts.map((shift) => (
                        <Badge key={shift.id} variant={shift.status === "active" ? "default" : "secondary"} className="text-sm py-1 px-3">
                          {formatDateTime(shift.start_time)} - {formatDateTime(shift.end_time)}
                          {shift.cashier_name && ` (${shift.cashier_name})`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">{getReportTitle()}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-500">Loading nozzle report...</span>
                    </div>
                  ) : reportData && reportData.nozzles && reportData.nozzles.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-sm text-blue-600 font-medium">Total Volume (L)</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {reportData.totals?.total_meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                          <p className="text-sm text-green-600 font-medium">Invoiced (L)</p>
                          <p className="text-2xl font-bold text-green-900">
                            {reportData.totals?.total_invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <p className="text-sm text-purple-600 font-medium">Invoiced Amount</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {formatCurrency(reportData.totals?.total_invoiced_amount || 0)}
                          </p>
                        </div>
                        <div className={`rounded-xl p-4 ${(reportData.totals?.total_variance || 0) === 0 ? 'bg-green-50' : (reportData.totals?.total_variance || 0) > 0 ? 'bg-amber-50' : 'bg-red-50'}`}>
                          <p className={`text-sm font-medium ${(reportData.totals?.total_variance || 0) === 0 ? 'text-green-600' : (reportData.totals?.total_variance || 0) > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                            Total Variance (L)
                          </p>
                          <p className={`text-2xl font-bold ${(reportData.totals?.total_variance || 0) === 0 ? 'text-green-900' : (reportData.totals?.total_variance || 0) > 0 ? 'text-amber-900' : 'text-red-900'}`}>
                            {(reportData.totals?.total_variance || 0) > 0 ? '+' : ''}
                            {reportData.totals?.total_variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                          <thead>
                            <tr className="border-b bg-slate-100">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Nozzle</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Fuel Type</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Opening</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Closing</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Meter Diff (L)</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Invoiced (L)</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Variance (L)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.nozzles.map((nozzle) => (
                              <tr key={nozzle.nozzle_id} className="border-b hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{nozzle.nozzle_name}</td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline">{nozzle.fuel_type}</Badge>
                                </td>
                                <td className="py-3 px-4 text-right font-mono">{nozzle.opening_reading.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right font-mono">{nozzle.closing_reading.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right font-mono font-semibold">
                                  {nozzle.meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-right font-mono">
                                  {nozzle.invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-right font-mono">
                                  {formatCurrency(nozzle.invoiced_amount)}
                                </td>
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
                              <td className="py-3 px-4 text-right font-mono">
                                {reportData.totals?.total_meter_difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-right font-mono">
                                {reportData.totals?.total_invoiced_quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-right font-mono">
                                {formatCurrency(reportData.totals?.total_invoiced_amount || 0)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-mono ${(reportData.totals?.total_variance || 0) === 0 ? 'text-green-600' : (reportData.totals?.total_variance || 0) > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {(reportData.totals?.total_variance || 0) > 0 ? '+' : ''}
                                  {reportData.totals?.total_variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 mt-4">
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
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Fuel className="h-12 w-12 mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No nozzle readings found</p>
                      <p className="text-sm">This shift/date may not have recorded nozzle readings yet</p>
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

export default function NozzleSalesReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    }>
      <NozzleSalesReportContent />
    </Suspense>
  )
}
