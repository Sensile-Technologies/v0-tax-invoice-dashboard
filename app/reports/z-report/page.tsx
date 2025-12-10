"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer } from "lucide-react"

export default function ZReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [fromTime, setFromTime] = useState("")
  const [toTime, setToTime] = useState("")

  // Z Report Data (end of day fiscal report)
  const zReportData = {
    reportNumber: "Z-2025-001-001",
    fiscalNumber: "FP-2024-12345-Z-001",
    date: "January 15, 2025",
    time: "23:59:45",
    operator: "Manager - Jane Smith",
    shiftDuration: "16:00 hours",
    deviceSerial: "FP-2024-12345",

    dailySales: {
      grossSales: 1250000,
      returns: 15000,
      netSales: 1235000,
    },

    vatBreakdown: [
      { category: "A - Exempt", taxableAmount: 150000, vatAmount: 0, total: 150000 },
      { category: "B - 16% VAT", taxableAmount: 850000, vatAmount: 136000, total: 986000 },
      { category: "C - Zero Rated", taxableAmount: 80000, vatAmount: 0, total: 80000 },
      { category: "D - Non-VAT", taxableAmount: 19000, vatAmount: 0, total: 19000 },
    ],

    paymentMethods: [
      { method: "Cash", amount: 550000, count: 145 },
      { method: "M-PESA", amount: 450000, count: 98 },
      { method: "Card", amount: 200000, count: 52 },
      { method: "Bank Transfer", amount: 35000, count: 8 },
    ],

    counters: {
      totalTransactions: 303,
      voidedTransactions: 5,
      lastZNumber: "Z-2025-001-000",
      cumulativeSales: 45678900,
    },
  }

  const totalVAT = zReportData.vatBreakdown.reduce((sum, item) => sum + item.vatAmount, 0)
  const totalSales = zReportData.vatBreakdown.reduce((sum, item) => sum + item.total, 0)
  const totalPayments = zReportData.paymentMethods.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader className="border-b pb-4">
                <div>
                  <h1 className="text-3xl font-bold text-balance">Z Report</h1>
                  <p className="text-muted-foreground">End of Day Fiscal Report</p>
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

                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold">FLOW360</h2>
                  <p className="text-sm text-muted-foreground">Tax Invoice Management System</p>
                  <p className="text-xs text-muted-foreground mt-2">Device Serial: {zReportData.deviceSerial}</p>
                  <p className="text-lg font-bold mt-2 text-red-600">*** FISCAL Z REPORT ***</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Z Report Number:</p>
                    <p className="font-semibold">{zReportData.reportNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fiscal Number:</p>
                    <p className="font-semibold">{zReportData.fiscalNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date & Time:</p>
                    <p className="font-semibold">
                      {zReportData.date} {zReportData.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Operator:</p>
                    <p className="font-semibold">{zReportData.operator}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shift Duration:</p>
                    <p className="font-semibold">{zReportData.shiftDuration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previous Z:</p>
                    <p className="font-semibold">{zReportData.counters.lastZNumber}</p>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">DAILY SALES SUMMARY</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Sales</span>
                      <span className="font-semibold">KES {zReportData.dailySales.grossSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Returns/Voids</span>
                      <span className="font-semibold">-KES {zReportData.dailySales.returns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Net Sales</span>
                      <span>KES {zReportData.dailySales.netSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">VAT SUMMARY BY CATEGORY</h3>
                  <div className="space-y-3 text-sm">
                    {zReportData.vatBreakdown.map((item, index) => (
                      <div key={index} className="space-y-1 bg-slate-50 p-3 rounded-lg">
                        <div className="font-semibold">{item.category}</div>
                        <div className="grid grid-cols-3 gap-2 pl-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Taxable</div>
                            <div className="font-semibold">KES {item.taxableAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">VAT</div>
                            <div className="font-semibold">KES {item.vatAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total</div>
                            <div className="font-semibold">KES {item.total.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total VAT Collected</span>
                      <span>KES {totalVAT.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">PAYMENT SUMMARY</h3>
                  <div className="space-y-2 text-sm">
                    {zReportData.paymentMethods.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {item.method} ({item.count} transactions)
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

                <div className="border-b pb-4">
                  <h3 className="font-bold mb-3">FISCAL COUNTERS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Transactions Today:</span>
                      <span className="font-semibold">{zReportData.counters.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voided Transactions:</span>
                      <span className="font-semibold text-red-600">{zReportData.counters.voidedTransactions}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Cumulative Grand Total:</span>
                      <span>KES {zReportData.counters.cumulativeSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground pt-4 border-t space-y-2">
                  <p className="font-bold text-red-600">*** END OF Z REPORT ***</p>
                  <p className="font-semibold">FISCAL MEMORY UPDATED - COUNTERS RESET</p>
                  <p>This report has been recorded in fiscal memory</p>
                  <p className="mt-4">Authorized Signature: _______________________</p>
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
