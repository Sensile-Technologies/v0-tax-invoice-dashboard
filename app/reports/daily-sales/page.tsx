"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, BarChart3, Fuel, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/lib/currency-utils"

interface SaleCategory {
  category: string
  quantity: number
  amount: number
  tax: number
}

interface DailySalesData {
  categories: SaleCategory[]
  totals: {
    total_sales: number
    total_tax: number
    total_quantity: number
    net_sales: number
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<SaleCategory[]>([])
  const [totals, setTotals] = useState({
    total_sales: 0,
    total_tax: 0,
    total_quantity: 0,
    net_sales: 0,
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

      const params = new URLSearchParams()
      if (branchId) params.append("branch_id", branchId)
      params.append("date", selectedDate)

      const response = await fetch(`/api/sales?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.sales) {
        const categoryMap = new Map<string, SaleCategory>()
        
        result.sales.forEach((sale: any) => {
          const rawFuelType = sale.fuel_type || sale.item_name || "Other"
          const baseFuelType = rawFuelType.charAt(0).toUpperCase() + rawFuelType.slice(1).toLowerCase()
          const isBulkSale = sale.is_automated === true || sale.source_system === 'meter_diff_bulk' || sale.source_system === 'PTS'
          const category = isBulkSale ? `${baseFuelType} (Bulk)` : `${baseFuelType} (Invoiced)`
          const existing = categoryMap.get(category) || { category, quantity: 0, amount: 0, tax: 0 }
          
          existing.quantity += parseFloat(sale.quantity) || 1
          existing.amount += parseFloat(sale.total_amount) || 0
          existing.tax += parseFloat(sale.tax_amount) || (parseFloat(sale.total_amount) * 0.16) || 0
          
          categoryMap.set(category, existing)
        })

        const categories = Array.from(categoryMap.values())
        setSalesData(categories)

        const totalAmount = categories.reduce((sum, item) => sum + item.amount, 0)
        const totalTax = categories.reduce((sum, item) => sum + item.tax, 0)
        const totalQuantity = categories.reduce((sum, item) => sum + item.quantity, 0)

        setTotals({
          total_sales: totalAmount,
          total_tax: totalTax,
          total_quantity: totalQuantity,
          net_sales: totalAmount - totalTax,
        })
      } else {
        setSalesData([])
        setTotals({ total_sales: 0, total_tax: 0, total_quantity: 0, net_sales: 0 })
      }
    } catch (error) {
      console.error("Error fetching daily sales:", error)
      setSalesData([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

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
      params.append("date", selectedDate)
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
  }, [selectedDate])

  useEffect(() => {
    fetchNozzleReport()
  }, [fetchNozzleReport])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const csvContent = [
      ["Category", "Quantity", "Sales Amount", "Tax", "Net Amount"],
      ...salesData.map(item => [
        item.category,
        item.quantity.toString(),
        item.amount.toString(),
        item.tax.toString(),
        (item.amount - item.tax).toString()
      ]),
      ["TOTAL", totals.total_quantity.toString(), totals.total_sales.toString(), totals.total_tax.toString(), totals.net_sales.toString()]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `daily-sales-report-${selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Daily Sales Report</h1>
                  <p className="text-sm text-slate-600 mt-1">Comprehensive daily sales breakdown</p>
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
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totals.total_sales)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Tax</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totals.total_tax)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Net Sales</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totals.net_sales)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Items Sold</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : Math.round(totals.total_quantity)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg md:text-xl">Sales by Category</CardTitle>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full sm:w-40 rounded-xl"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading sales data...</span>
                    </div>
                  ) : salesData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No sales data for this date</p>
                      <p className="text-sm text-muted-foreground mt-1">Try selecting a different date</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-3 md:mx-0">
                      <table className="w-full min-w-[500px]">
                        <thead>
                          <tr className="border-b text-xs md:text-sm">
                            <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Category</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Quantity</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Sales Amount</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Tax</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Net Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                              <td className="py-2 md:py-3 px-3 md:px-4">{item.category}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right">{Math.round(item.quantity)}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(item.amount)}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(item.tax)}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right font-semibold">
                                {formatCurrency(item.amount - item.tax)}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-slate-50 text-xs md:text-sm">
                            <td className="py-2 md:py-3 px-3 md:px-4">TOTAL</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{Math.round(totals.total_quantity)}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totals.total_sales)}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totals.total_tax)}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totals.net_sales)}</td>
                          </tr>
                        </tbody>
                      </table>
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
