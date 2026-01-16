"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, Fuel, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"
import { useCurrency } from "@/lib/currency-utils"
import { Label } from "@/components/ui/label"

interface NozzleReading {
  nozzle_id: string
  nozzle_name: string
  dispenser_number: number
  nozzle_number: number
  fuel_type: string
  closing_meter: number
  opening_meter: number
  throughput: number
  rtt: number
  pump_sales: number
}

interface ProductNozzleTotal {
  product: string
  throughput: number
  rtt: number
  pump_sales: number
}

interface ProductMovement {
  product: string
  opening_stock: number
  offloaded_volume: number
  closing_stock: number
  tank_sales: number
  pump_sales: number
  variance: number
  variance_percent: number
}

interface ProductCashFlow {
  product: string
  total_sales_litres: number
  pump_price: number
  amount: number
  actual_cash: number
  difference: number
}

interface DailyCashFlow {
  opening_cash: number
  day_shift_cash: number
  night_shift_cash: number
  cash_banked: number
  closing_cash: number
  physical_count: number
  difference: number
}

interface AttendantCollection {
  staff_id: string
  staff_name: string
  cash: number
  mpesa: number
  card: number
  mobile_money: number
  credit: number
  total: number
}

interface BankingEntry {
  id: string
  account_name: string
  bank_name: string
  amount: number
  notes: string | null
  created_at: string
}

interface DSSRData {
  date: string
  branch_name: string
  shifts: Array<{ id: string; start_time: string; end_time: string | null; cashier_name: string; shift_type: string }>
  nozzle_readings: NozzleReading[]
  product_nozzle_totals: ProductNozzleTotal[]
  product_movement: ProductMovement[]
  product_cash_flow: ProductCashFlow[]
  daily_cash_flow: DailyCashFlow
  attendant_collections: AttendantCollection[]
  banking_entries: BankingEntry[]
  totals: {
    total_sales_amount: number
    total_collections: number
    sales_vs_collections_diff: number
  }
}

export default function DSSRPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const today = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DSSRData | null>(null)
  const { formatCurrency } = useCurrency()

  const fetchDSSR = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      if (!branchId) {
        setData(null)
        return
      }

      const params = new URLSearchParams()
      params.append("branch_id", branchId)
      params.append("date", selectedDate)

      const response = await fetch(`/api/reports/dssr?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setData(result.data)
      } else {
        setData(null)
      }
    } catch (error) {
      console.error("Error fetching DSSR:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchDSSR()
  }, [fetchDSSR])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!data) return

    let csv = `DAILY STATION STATUS REPORT (DSSR)\n`
    csv += `Date: ${new Date(data.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`
    csv += `Branch: ${data.branch_name}\n\n`

    csv += `SALES OF WHITE PRODUCTS IN LITRES\n`
    csv += `Nozzle,Fuel Type,Closing Meter,Opening Meter,Throughput,RTT,Pump Sales\n`
    for (const n of data.nozzle_readings) {
      csv += `${n.nozzle_name},${n.fuel_type},${n.closing_meter.toFixed(2)},${n.opening_meter.toFixed(2)},${n.throughput.toFixed(2)},${n.rtt.toFixed(2)},${n.pump_sales.toFixed(2)}\n`
    }

    csv += `\nWHITE PRODUCT MOVEMENT\n`
    csv += `Product,Opening Stock,Offloaded,Closing Stock,Tank Sales,Pump Sales,Variance,Variance %\n`
    for (const p of data.product_movement) {
      csv += `${p.product},${p.opening_stock.toFixed(2)},${p.offloaded_volume.toFixed(2)},${p.closing_stock.toFixed(2)},${p.tank_sales.toFixed(2)},${p.pump_sales.toFixed(2)},${p.variance.toFixed(2)},${p.variance_percent.toFixed(2)}%\n`
    }

    csv += `\nCASH FLOW SUMMARY\n`
    csv += `Opening Cash,${data.daily_cash_flow.opening_cash.toFixed(2)}\n`
    csv += `Day Shift Cash,${data.daily_cash_flow.day_shift_cash.toFixed(2)}\n`
    csv += `Night Shift Cash,${data.daily_cash_flow.night_shift_cash.toFixed(2)}\n`
    csv += `Cash Banked,${data.daily_cash_flow.cash_banked.toFixed(2)}\n`
    csv += `Closing Cash,${data.daily_cash_flow.closing_cash.toFixed(2)}\n`
    csv += `Difference,${data.daily_cash_flow.difference.toFixed(2)}\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DSSR_${data.branch_name}_${data.date}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getVarianceColor = (variance: number, variancePercent: number) => {
    if (Math.abs(variancePercent) <= 0.5) return "text-green-600"
    if (variance > 0) return "text-amber-600"
    return "text-red-600"
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white print:bg-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6 print:m-0">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden print:shadow-none print:rounded-none">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6 print:bg-white print:p-2">
            <div className="mx-auto max-w-7xl space-y-6">
              <ReportTabs />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Fuel className="h-8 w-8 text-blue-600" />
                    Daily Sales Summary Report (DSSR)
                  </h1>
                  <p className="text-slate-600 mt-1">Comprehensive daily fuel station performance summary</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={fetchDSSR} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl print:hidden">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="date" className="text-sm font-medium text-slate-700">Report Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={fetchDSSR} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading DSSR data...</span>
                </div>
              ) : !data ? (
                <Card className="rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <Fuel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No data available for the selected date</p>
                    <p className="text-sm text-slate-500 mt-1">Try selecting a different date or ensure shifts have been recorded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6 print:space-y-4">
                  <div className="text-center print:block hidden mb-4">
                    <h1 className="text-xl font-bold">DAILY STATION STATUS REPORT (DSSR)</h1>
                    <p className="text-sm">{data.branch_name}</p>
                    <p className="text-sm">{new Date(data.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        SALES OF WHITE PRODUCTS IN LITRES
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm table-auto">
                          <thead>
                            <tr className="bg-slate-100 border-y text-xs">
                              <th className="text-left py-2 px-4 font-semibold whitespace-nowrap">NOZZLES</th>
                              {data.nozzle_readings.map(n => (
                                <th key={n.nozzle_id} className="text-right py-2 px-4 font-semibold min-w-[100px] whitespace-nowrap">
                                  {n.nozzle_name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">A) Closing Meter</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">{formatNumber(n.closing_meter)}</td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">B) Opening</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">{formatNumber(n.opening_meter)}</td>
                              ))}
                            </tr>
                            <tr className="border-b bg-slate-50">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">C) Thro'put (A-B)</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-semibold">{formatNumber(n.throughput)}</td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">D) RTT</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">{formatNumber(n.rtt)}</td>
                              ))}
                            </tr>
                            <tr className="border-b bg-blue-50">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">E) Pump Sales (C-D)</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-semibold text-blue-700">{formatNumber(n.pump_sales)}</td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {data.product_nozzle_totals.length > 0 && (
                        <div className="border-t p-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">F) TOTAL PER PRODUCT</p>
                          <div className="flex flex-wrap gap-4">
                            {data.product_nozzle_totals.map(p => (
                              <div key={p.product} className="bg-slate-100 rounded-lg px-4 py-2">
                                <span className="font-medium">{p.product}:</span>
                                <span className="ml-2 font-mono font-semibold">{formatNumber(p.pump_sales)} L</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        WHITE PRODUCT MOVEMENT
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100 border-y text-xs">
                              <th className="text-left py-2 px-3 font-semibold">PRODUCT</th>
                              <th className="text-right py-2 px-3 font-semibold">OPENING STOCK</th>
                              <th className="text-right py-2 px-3 font-semibold">OFFLOADED VOLUME</th>
                              <th className="text-right py-2 px-3 font-semibold">CLOSING STOCK</th>
                              <th className="text-right py-2 px-3 font-semibold">TANK SALES</th>
                              <th className="text-right py-2 px-3 font-semibold">PUMP SALES</th>
                              <th className="text-right py-2 px-3 font-semibold">VARIANCE</th>
                              <th className="text-right py-2 px-3 font-semibold">DAILY %</th>
                              <th className="text-center py-2 px-3 font-semibold">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.product_movement.map(p => (
                              <tr key={p.product} className="border-b hover:bg-slate-50">
                                <td className="py-2 px-3 font-medium">{p.product}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.opening_stock)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.offloaded_volume)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.closing_stock)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.tank_sales)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.pump_sales)}</td>
                                <td className={`text-right py-2 px-3 font-mono font-semibold ${getVarianceColor(p.variance, p.variance_percent)}`}>
                                  {formatNumber(p.variance)}
                                </td>
                                <td className={`text-right py-2 px-3 font-mono ${getVarianceColor(p.variance, p.variance_percent)}`}>
                                  {formatNumber(p.variance_percent)}%
                                </td>
                                <td className="text-center py-2 px-3">
                                  {Math.abs(p.variance_percent) <= 0.5 ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 inline" />
                                  ) : (
                                    <AlertTriangle className={`h-5 w-5 inline ${p.variance > 0 ? 'text-amber-600' : 'text-red-600'}`} />
                                  )}
                                </td>
                              </tr>
                            ))}
                            {data.product_movement.length > 0 && (
                              <tr className="bg-slate-100 font-bold">
                                <td className="py-2 px-3">TOTAL</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.opening_stock, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.offloaded_volume, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.closing_stock, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.tank_sales, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.pump_sales, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.variance, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">-</td>
                                <td></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        CASH FLOW SUMMARY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100 border-y text-xs">
                              <th className="text-left py-2 px-3 font-semibold">PRODUCT</th>
                              <th className="text-right py-2 px-3 font-semibold">TOTAL SALES (L)</th>
                              <th className="text-right py-2 px-3 font-semibold">PUMP PRICE</th>
                              <th className="text-right py-2 px-3 font-semibold">AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.product_cash_flow.map(p => (
                              <tr key={p.product} className="border-b hover:bg-slate-50">
                                <td className="py-2 px-3 font-medium">{p.product}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.total_sales_litres)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatCurrency(p.pump_price)}</td>
                                <td className="text-right py-2 px-3 font-mono font-semibold">{formatCurrency(p.amount)}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold">
                              <td className="py-2 px-3">TOTAL</td>
                              <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_cash_flow.reduce((s, p) => s + p.total_sales_litres, 0))}</td>
                              <td></td>
                              <td className="text-right py-2 px-3 font-mono">{formatCurrency(data.totals.total_sales_amount)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        COLLECTION SUMMARY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {data.attendant_collections.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-y text-xs">
                                <th className="text-left py-2 px-4 font-semibold">ATTENDANT</th>
                                <th className="text-right py-2 px-4 font-semibold">CASH</th>
                                <th className="text-right py-2 px-4 font-semibold">MPESA</th>
                                <th className="text-right py-2 px-4 font-semibold">CARD</th>
                                <th className="text-right py-2 px-4 font-semibold">MOBILE MONEY</th>
                                <th className="text-right py-2 px-4 font-semibold">CREDIT</th>
                                <th className="text-right py-2 px-4 font-semibold">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.attendant_collections.map(ac => (
                                <tr key={ac.staff_id} className="border-b hover:bg-slate-50">
                                  <td className="py-2 px-4 font-medium">{ac.staff_name}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.cash)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.mpesa)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.card)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.mobile_money)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.credit)}</td>
                                  <td className="text-right py-2 px-4 font-mono font-semibold text-blue-700">{formatCurrency(ac.total)}</td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100 font-bold">
                                <td className="py-2 px-4">TOTAL</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.cash, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.mpesa, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.card, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.mobile_money, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.credit, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono font-semibold text-blue-700">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.total, 0))}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          No collection records found for this date
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        BANKING SUMMARY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {data.banking_entries.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-y text-xs">
                                <th className="text-left py-2 px-4 font-semibold">ACCOUNT</th>
                                <th className="text-left py-2 px-4 font-semibold">BANK</th>
                                <th className="text-right py-2 px-4 font-semibold">AMOUNT</th>
                                <th className="text-left py-2 px-4 font-semibold">NOTES</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.banking_entries.map(be => (
                                <tr key={be.id} className="border-b hover:bg-slate-50">
                                  <td className="py-2 px-4 font-medium">{be.account_name}</td>
                                  <td className="py-2 px-4 text-slate-600">{be.bank_name}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(be.amount)}</td>
                                  <td className="py-2 px-4 text-slate-600">{be.notes || '-'}</td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100 font-bold">
                                <td className="py-2 px-4" colSpan={2}>TOTAL BANKED</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.banking_entries.reduce((s, be) => s + be.amount, 0))}</td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          No banking records found for this date
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">How to read this report:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li><strong>Throughput</strong> = Closing Meter - Opening Meter (total fuel through nozzle)</li>
                        <li><strong>RTT</strong> = Return To Tank (fuel returned, not sold)</li>
                        <li><strong>Pump Sales</strong> = Throughput - RTT (actual fuel sold)</li>
                        <li><strong>Tank Sales</strong> = Opening Stock + Offloaded - Closing Stock</li>
                        <li><strong>Variance</strong> = Pump Sales - Tank Sales (should be near zero)</li>
                        <li className="text-amber-700"><strong>Positive variance</strong> = More fuel sold than expected (potential measurement error)</li>
                        <li className="text-red-700"><strong>Negative variance</strong> = Less fuel sold than expected (potential loss)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground print:hidden">
                Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
