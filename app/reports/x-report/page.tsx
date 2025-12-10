"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer } from "lucide-react"

export default function XReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [fromTime, setFromTime] = useState("")
  const [toTime, setToTime] = useState("")

  // X Report Data (current shift/session data before closing)
  const xReportData = {
    reportNumber: "X-2025-001-15",
    date: "January 15, 2025",
    time: "14:30:45",
    cashier: "John Doe",
    shiftStart: "08:00:00",
    deviceSerial: "FP-2024-12345",

    salesSummary: {
      grossSales: 450000,
      returns: 5000,
      netSales: 445000,
    },

    vatBreakdown: [
      { category: "A - Exempt", taxableAmount: 50000, vatAmount: 0, total: 50000 },
      { category: "B - 16% VAT", taxableAmount: 300000, vatAmount: 48000, total: 348000 },
      { category: "C - Zero Rated", taxableAmount: 30000, vatAmount: 0, total: 30000 },
      { category: "D - Non-VAT", taxableAmount: 17000, vatAmount: 0, total: 17000 },
    ],

    paymentMethods: [
      { method: "Cash", amount: 200000, count: 45 },
      { method: "M-PESA", amount: 150000, count: 32 },
      { method: "Card", amount: 75000, count: 18 },
      { method: "Bank Transfer", amount: 20000, count: 3 },
    ],

    transactionCount: 98,
    voidedTransactions: 2,
    voidedAmount: 5000,
  }

  const totalVAT = xReportData.vatBreakdown.reduce((sum, item) => sum + item.vatAmount, 0)
  const totalSales = xReportData.vatBreakdown.reduce((sum, item) => sum + item.total, 0)
  const totalPayments = xReportData.paymentMethods.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Report Card */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader className="border-b pb-4">
                <div>
                  <h1 className="text-3xl font-bold text-balance">X Report</h1>
                  <p className="text-muted-foreground">Current Session Report (Non-Fiscal)</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4 border-b pb-6">
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
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Report Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold">FLOW360</h2>
                  <p className="text-sm text-muted-foreground">Tax Invoice Management System</p>
                  <p className="text-xs text-muted-foreground mt-2">Device Serial: {xReportData.deviceSerial}</p>
                </div>

                {/* Report Info */}
                <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Report Number:</p>
                    <p className="font-semibold">{xReportData.reportNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date & Time:</p>
                    <p className="font-semibold">
                      {xReportData.date} {xReportData.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cashier:</p>
                    <p className="font-semibold">{xReportData.cashier}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shift Start:</p>
                    <p className="font-semibold">{xReportData.shiftStart}</p>
                  </div>
                </div>

                {/* Sales Summary */}
                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">SALES SUMMARY</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Sales</span>
                      <span className="font-semibold">KES {xReportData.salesSummary.grossSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Returns/Voids</span>
                      <span className="font-semibold">-KES {xReportData.salesSummary.returns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Net Sales</span>
                      <span>KES {xReportData.salesSummary.netSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* VAT Breakdown */}
                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">VAT BREAKDOWN</h3>
                  <div className="space-y-2 text-sm">
                    {xReportData.vatBreakdown.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{item.category}</span>
                        </div>
                        <div className="flex justify-between pl-4 text-muted-foreground">
                          <span>Taxable Amount:</span>
                          <span>KES {item.taxableAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pl-4 text-muted-foreground">
                          <span>VAT Amount:</span>
                          <span>KES {item.vatAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pl-4 font-semibold">
                          <span>Total:</span>
                          <span>KES {item.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total VAT</span>
                      <span>KES {totalVAT.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">PAYMENT METHODS</h3>
                  <div className="space-y-2 text-sm">
                    {xReportData.paymentMethods.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {item.method} ({item.count} trans.)
                        </span>
                        <span className="font-semibold">KES {item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total Payments</span>
                      <span>KES {totalPayments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Statistics */}
                <div>
                  <h3 className="font-bold mb-3">TRANSACTION STATISTICS</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Total Transactions:</span>
                      <span className="font-semibold">{xReportData.transactionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voided Transactions:</span>
                      <span className="font-semibold text-red-600">{xReportData.voidedTransactions}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                  <p className="font-semibold">*** END OF X REPORT ***</p>
                  <p className="mt-2">This is an interim report and does not reset counters</p>
                </div>
              </CardContent>
            </Card>

            <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
              Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
