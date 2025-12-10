"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

export default function SalesSummaryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const { formatCurrency } = useCurrency()

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Sales Summary Report</h1>
                <p className="text-slate-600 mt-1">Aggregate sales performance overview</p>
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

            <div className="grid grid-cols-3 gap-6 mb-6">
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(15450000)}</p>
                  <p className="text-sm text-green-600 mt-1">+12.5% from last period</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Total Transactions</p>
                  <p className="text-3xl font-bold mt-2">3,456</p>
                  <p className="text-sm text-green-600 mt-1">+8.3% from last period</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Average Transaction</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(4471)}</p>
                  <p className="text-sm text-blue-600 mt-1">+3.9% from last period</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sales by Payment Method</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl w-40"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl w-40"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment Method</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">MPESA</td>
                      <td className="py-3 px-4 text-right">1,890</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(8500000)}</td>
                      <td className="py-3 px-4 text-right">55.0%</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">Cash</td>
                      <td className="py-3 px-4 text-right">1,234</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(4650000)}</td>
                      <td className="py-3 px-4 text-right">30.1%</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">VISA/Mastercard</td>
                      <td className="py-3 px-4 text-right">256</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(1850000)}</td>
                      <td className="py-3 px-4 text-right">12.0%</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">Bank Transfer</td>
                      <td className="py-3 px-4 text-right">76</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(450000)}</td>
                      <td className="py-3 px-4 text-right">2.9%</td>
                    </tr>
                    <tr className="font-bold bg-slate-50">
                      <td className="py-3 px-4">TOTAL</td>
                      <td className="py-3 px-4 text-right">3,456</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(15450000)}</td>
                      <td className="py-3 px-4 text-right">100.0%</td>
                    </tr>
                  </tbody>
                </table>
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
