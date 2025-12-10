"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Printer } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

export default function ShiftsReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { formatCurrency } = useCurrency()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const shifts = [
    {
      id: "SH001",
      cashier: "John Doe",
      startTime: "08:00",
      endTime: "16:00",
      openingCash: 50000,
      sales: 245000,
      closingCash: 295000,
      variance: 0,
    },
    {
      id: "SH002",
      cashier: "Jane Smith",
      startTime: "16:00",
      endTime: "00:00",
      openingCash: 50000,
      sales: 189000,
      closingCash: 239000,
      variance: 0,
    },
    {
      id: "SH003",
      cashier: "Mike Johnson",
      startTime: "00:00",
      endTime: "08:00",
      openingCash: 50000,
      sales: 134000,
      closingCash: 184000,
      variance: 0,
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Shifts Report</h1>
                <p className="text-slate-600 mt-1">Cashier shift performance and reconciliation</p>
              </div>
              <div className="flex gap-2">
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
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Shifts</p>
                    <p className="text-2xl font-bold">{shifts.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Sales</p>
                    <p className="text-2xl font-bold">{formatCurrency(568000)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Average Per Shift</p>
                    <p className="text-2xl font-bold">{formatCurrency(189333)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Variance</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search shifts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl"
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
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Shift ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Cashier</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Start Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">End Time</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Opening Cash</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Sales</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Closing Cash</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((shift) => (
                        <tr key={shift.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{shift.id}</td>
                          <td className="py-3 px-4">{shift.cashier}</td>
                          <td className="py-3 px-4">{shift.startTime}</td>
                          <td className="py-3 px-4">{shift.endTime}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(shift.openingCash)}</td>
                          <td className="py-3 px-4 text-right font-semibold">{formatCurrency(shift.sales)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(shift.closingCash)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={shift.variance === 0 ? "text-green-600" : "text-red-600"}>
                              {formatCurrency(shift.variance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
