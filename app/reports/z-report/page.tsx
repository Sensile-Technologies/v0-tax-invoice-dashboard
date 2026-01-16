"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, RefreshCw } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"

interface ReportData {
  reportNumber: string
  fiscalNumber: string
  date: string
  time: string
  operator: string
  shiftDuration: string
  deviceSerial: string
  branchName: string
  vendorName: string
  salesSummary: {
    grossSales: number
    returns: number
    netSales: number
  }
  vatBreakdown: Array<{
    category: string
    taxableAmount: number
    vatAmount: number
    total: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    count: number
  }>
  transactionCount: number
  voidedTransactions: number
  counters: {
    totalTransactions: number
    voidedTransactions: number
    cumulativeSales: number
  }
}

export default function ZReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [fromTime, setFromTime] = useState("")
  const [toTime, setToTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [branchId, setBranchId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.branch_id) {
          setBranchId(data.branch_id)
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchReport()
    }
  }, [branchId])

  const fetchReport = async () => {
    if (!branchId) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('type', 'z')
      params.set('branch_id', branchId)
      if (fromDate) params.set('from_date', fromDate)
      if (toDate) params.set('to_date', toDate)
      if (fromTime) params.set('from_time', fromTime)
      if (toTime) params.set('to_time', toTime)

      const res = await fetch(`/api/reports/fiscal?${params.toString()}`)
      const result = await res.json()
      
      if (result.success && result.data) {
        setReportData(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = () => {
    fetchReport()
  }

  const handlePrint = () => {
    window.print()
  }

  const totalVAT = reportData?.vatBreakdown?.reduce((sum, item) => sum + item.vatAmount, 0) || 0
  const totalPayments = reportData?.paymentMethods?.reduce((sum, item) => sum + item.amount, 0) || 0

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
            <div className="mx-auto max-w-4xl space-y-6">
              <ReportTabs />
              <Card className="rounded-2xl shadow-lg print:shadow-none">
                <CardHeader className="border-b pb-4 print:hidden">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-balance">Z Report</h1>
                    <p className="text-muted-foreground">End of Day Fiscal Report</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-8 space-y-6">
                  <div className="space-y-4 border-b pb-6 print:hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="date"
                        placeholder="From Date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-40"
                      />
                      <Input
                        type="time"
                        placeholder="From Time"
                        value={fromTime}
                        onChange={(e) => setFromTime(e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="date"
                        placeholder="To Date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-40"
                      />
                      <Input
                        type="time"
                        placeholder="To Time"
                        value={toTime}
                        onChange={(e) => setToTime(e.target.value)}
                        className="w-32"
                      />
                      <Button onClick={handleGenerateReport} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        <span className="ml-2">Generate</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" className="rounded-xl bg-transparent" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" className="rounded-xl bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-500">Loading report...</span>
                    </div>
                  ) : reportData ? (
                    <>
                      <div className="text-center border-b pb-4">
                        <h2 className="text-2xl font-bold">{reportData.vendorName || 'FLOW360'}</h2>
                        <p className="text-sm text-muted-foreground">{reportData.branchName}</p>
                        <p className="text-xs text-muted-foreground mt-2">Device Serial: {reportData.deviceSerial}</p>
                        <p className="text-lg font-bold mt-2 text-red-600">*** FISCAL Z REPORT ***</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                        <div>
                          <p className="text-muted-foreground">Z Report Number:</p>
                          <p className="font-semibold">{reportData.reportNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fiscal Number:</p>
                          <p className="font-semibold">{reportData.fiscalNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date & Time:</p>
                          <p className="font-semibold">
                            {reportData.date} {reportData.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Operator:</p>
                          <p className="font-semibold">{reportData.operator}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Shift Duration:</p>
                          <p className="font-semibold">{reportData.shiftDuration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cumulative Sales:</p>
                          <p className="font-semibold">KES {reportData.counters.cumulativeSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-bold mb-3">DAILY SALES SUMMARY</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gross Sales</span>
                            <span className="font-semibold">KES {reportData.salesSummary.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Returns/Voids</span>
                            <span className="font-semibold">-KES {reportData.salesSummary.returns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Net Sales</span>
                            <span>KES {reportData.salesSummary.netSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-bold mb-3">VAT BREAKDOWN</h3>
                        <div className="space-y-2 text-sm">
                          {reportData.vatBreakdown.map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between font-semibold">
                                <span>{item.category}</span>
                              </div>
                              <div className="flex justify-between pl-4 text-muted-foreground">
                                <span>Taxable Amount:</span>
                                <span>KES {item.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between pl-4 text-muted-foreground">
                                <span>VAT Amount:</span>
                                <span>KES {item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between pl-4 font-semibold">
                                <span>Total:</span>
                                <span>KES {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total VAT</span>
                            <span>KES {totalVAT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-bold mb-3">PAYMENT METHODS</h3>
                        <div className="space-y-2 text-sm">
                          {reportData.paymentMethods.length > 0 ? (
                            reportData.paymentMethods.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>
                                  {item.method} ({item.count} trans.)
                                </span>
                                <span className="font-semibold">KES {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No payments recorded</p>
                          )}
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total Payments</span>
                            <span>KES {totalPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-bold mb-3">FISCAL COUNTERS</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Total Transactions:</span>
                            <span className="font-semibold">{reportData.counters.totalTransactions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Voided Transactions:</span>
                            <span className="font-semibold text-red-600">{reportData.counters.voidedTransactions}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                        <p className="font-bold text-red-600 text-lg">*** END OF Z REPORT ***</p>
                        <p className="mt-2">This is an official fiscal report. Counters have been recorded.</p>
                        <p className="mt-1">Document generated on {reportData.date} at {reportData.time}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <p>No data available. Select a date range and click Generate.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
