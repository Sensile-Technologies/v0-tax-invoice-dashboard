"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download } from "lucide-react"

export default function AgedReceivablesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const receivablesData = [
    {
      customer: "ABC Corporation",
      pin: "P051234567A",
      current: 125000,
      days30: 45000,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 170000,
    },
    {
      customer: "XYZ Ltd",
      pin: "P051234568B",
      current: 0,
      days30: 85000,
      days60: 42000,
      days90: 0,
      over90: 0,
      total: 127000,
    },
    {
      customer: "Tech Solutions",
      pin: "P051234569C",
      current: 95000,
      days30: 0,
      days60: 0,
      days90: 28000,
      over90: 0,
      total: 123000,
    },
    {
      customer: "Global Traders",
      pin: "P051234570D",
      current: 0,
      days30: 0,
      days60: 65000,
      days90: 35000,
      over90: 18000,
      total: 118000,
    },
    {
      customer: "Prime Enterprises",
      pin: "P051234571E",
      current: 78000,
      days30: 32000,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 110000,
    },
  ]

  const totals = receivablesData.reduce(
    (acc, item) => ({
      current: acc.current + item.current,
      days30: acc.days30 + item.days30,
      days60: acc.days60 + item.days60,
      days90: acc.days90 + item.days90,
      over90: acc.over90 + item.over90,
      total: acc.total + item.total,
    }),
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 },
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Aged Receivables Report</h1>
                <p className="text-slate-600 mt-1">
                  Outstanding customer balances as of {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Current (0-30)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">KES {totals.current.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">31-60 Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-yellow-600">KES {totals.days30.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">61-90 Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-orange-600">KES {totals.days60.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Over 90 Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">KES {totals.over90.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Total Outstanding</CardTitle>
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search customers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64 rounded-full"
                        />
                      </div>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-40 rounded-full"
                        placeholder="From"
                      />
                      <span className="text-slate-600">to</span>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-40 rounded-full"
                        placeholder="To"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">PIN</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Current</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">31-60 Days</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">61-90 Days</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">91+ Days</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Due (KES)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receivablesData.map((item, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium">{item.customer}</td>
                            <td className="py-3 px-4 text-slate-600">{item.pin}</td>
                            <td className="py-3 px-4 text-right">
                              {item.current > 0 ? item.current.toLocaleString() : "-"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {item.days30 > 0 ? item.days30.toLocaleString() : "-"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {item.days60 > 0 ? item.days60.toLocaleString() : "-"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {item.over90 > 0 ? (
                                <span className="text-red-600 font-semibold">{item.over90.toLocaleString()}</span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-bold">{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={2} className="py-3 px-4">
                            Total Outstanding:
                          </td>
                          <td className="py-3 px-4 text-right">{totals.current.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{totals.days30.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{totals.days60.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{totals.over90.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-lg">KES {totals.total.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <footer className="mt-12 border-t pt-6 pb-4 text-center text-muted-foreground">
          Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
        </footer>
      </div>
    </div>
  )
}
