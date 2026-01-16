"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, BarChart3 } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"
import { ReportTabs } from "@/components/report-tabs"

interface PaymentMethodSummary {
  method: string
  transactions: number
  amount: number
  percentage: number
}

export default function SalesSummaryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [averageTransaction, setAverageTransaction] = useState(0)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([])
  const { formatCurrency } = useCurrency()

  const fetchSalesSummary = useCallback(async () => {
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
      params.append("date_from", startDate)
      params.append("date_to", endDate)

      const response = await fetch(`/api/sales?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.sales) {
        const sales = result.sales
        const total = sales.reduce((sum: number, s: any) => sum + (parseFloat(s.total_amount) || 0), 0)
        const count = sales.length
        
        setTotalRevenue(total)
        setTotalTransactions(count)
        setAverageTransaction(count > 0 ? total / count : 0)

        const methodMap = new Map<string, { transactions: number; amount: number }>()
        sales.forEach((sale: any) => {
          const method = sale.payment_method || sale.pmt_ty_cd || 'Other'
          const methodName = method === '01' ? 'Cash' : method === '02' ? 'MPESA' : method === '03' ? 'Credit' : method === '04' ? 'Card' : method
          const existing = methodMap.get(methodName) || { transactions: 0, amount: 0 }
          existing.transactions += 1
          existing.amount += parseFloat(sale.total_amount) || 0
          methodMap.set(methodName, existing)
        })

        const methods = Array.from(methodMap.entries()).map(([method, data]) => ({
          method,
          transactions: data.transactions,
          amount: data.amount,
          percentage: total > 0 ? (data.amount / total) * 100 : 0
        })).sort((a, b) => b.amount - a.amount)

        setPaymentMethods(methods)
      } else {
        setTotalRevenue(0)
        setTotalTransactions(0)
        setAverageTransaction(0)
        setPaymentMethods([])
      }
    } catch (error) {
      console.error("Error fetching sales summary:", error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchSalesSummary()
  }, [fetchSalesSummary])

  const handlePrint = () => window.print()

  const handleExport = () => {
    const csvContent = [
      ["Payment Method", "Transactions", "Amount", "Percentage"],
      ...paymentMethods.map(m => [m.method, m.transactions.toString(), m.amount.toString(), `${m.percentage.toFixed(1)}%`]),
      ["TOTAL", totalTransactions.toString(), totalRevenue.toString(), "100%"]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-summary-${startDate}-to-${endDate}.csv`
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
              <ReportTabs />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Sales Summary Report</h1>
                  <p className="text-sm text-slate-600 mt-1">Aggregate sales performance overview</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Revenue</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(totalRevenue)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Transactions</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalTransactions.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Average Transaction</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(averageTransaction)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl mb-4 md:mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg md:text-xl">Sales by Payment Method</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-xl w-32 md:w-40 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-xl w-32 md:w-40 text-sm"
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
                  ) : paymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No sales data for this period</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-3 md:mx-0">
                      <table className="w-full min-w-[400px]">
                        <thead>
                          <tr className="border-b text-xs md:text-sm">
                            <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Payment Method</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Transactions</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Amount</th>
                            <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentMethods.map((method, index) => (
                            <tr key={index} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                              <td className="py-2 md:py-3 px-3 md:px-4">{method.method}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right">{method.transactions.toLocaleString()}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(method.amount)}</td>
                              <td className="py-2 md:py-3 px-3 md:px-4 text-right">{method.percentage.toFixed(1)}%</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-slate-50 text-xs md:text-sm">
                            <td className="py-2 md:py-3 px-3 md:px-4">TOTAL</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{totalTransactions.toLocaleString()}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totalRevenue)}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">100.0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

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
