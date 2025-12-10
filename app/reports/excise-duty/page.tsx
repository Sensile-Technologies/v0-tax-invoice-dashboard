"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download } from "lucide-react"

export default function ExciseDutyPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const exciseData = [
    {
      date: "2025-01-15",
      product: "Beer - 500ml",
      category: "Alcoholic Beverages",
      quantity: 500,
      unitPrice: 250,
      grossValue: 125000,
      exciseRate: 30,
      exciseDuty: 37500,
      totalValue: 162500,
    },
    {
      date: "2025-01-16",
      product: "Wine - 750ml",
      category: "Alcoholic Beverages",
      quantity: 200,
      unitPrice: 1500,
      grossValue: 300000,
      exciseRate: 30,
      exciseDuty: 90000,
      totalValue: 390000,
    },
    {
      date: "2025-01-17",
      product: "Cigarettes - Pack",
      category: "Tobacco Products",
      quantity: 1000,
      unitPrice: 350,
      grossValue: 350000,
      exciseRate: 40,
      exciseDuty: 140000,
      totalValue: 490000,
    },
    {
      date: "2025-01-18",
      product: "Energy Drink - 250ml",
      category: "Soft Drinks",
      quantity: 800,
      unitPrice: 120,
      grossValue: 96000,
      exciseRate: 20,
      exciseDuty: 19200,
      totalValue: 115200,
    },
    {
      date: "2025-01-19",
      product: "Spirits - 750ml",
      category: "Alcoholic Beverages",
      quantity: 150,
      unitPrice: 2000,
      grossValue: 300000,
      exciseRate: 35,
      exciseDuty: 105000,
      totalValue: 405000,
    },
  ]

  const totals = exciseData.reduce(
    (acc, item) => ({
      grossValue: acc.grossValue + item.grossValue,
      exciseDuty: acc.exciseDuty + item.exciseDuty,
      totalValue: acc.totalValue + item.totalValue,
    }),
    { grossValue: 0, exciseDuty: 0, totalValue: 0 },
  )

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader isCollapsed={isCollapsed} />

        <main className="flex-1 overflow-auto ml-6 mt-6 mb-6 mr-6">
          <div className="bg-white rounded-tl-3xl shadow-2xl p-8 min-h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Excise Duty Report</h1>
                <p className="text-slate-600 mt-1">Excise tax on controlled goods</p>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Gross Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totals.grossValue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Excise Duty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">KES {totals.exciseDuty.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totals.totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">{exciseData.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Excise Duty Transactions</CardTitle>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search products..."
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
                    />
                    <span className="text-slate-600">to</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40 rounded-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Product</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Gross Value (KES)</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Excise Rate</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Excise Duty (KES)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Value (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exciseData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">{item.product}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{item.grossValue.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">{item.exciseRate}%</td>
                          <td className="py-3 px-4 text-right font-semibold text-red-600">
                            {item.exciseDuty.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">{item.totalValue.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="py-3 px-4 text-right">
                          Totals:
                        </td>
                        <td className="py-3 px-4 text-right">{totals.grossValue.toLocaleString()}</td>
                        <td></td>
                        <td className="py-3 px-4 text-right text-red-600">{totals.exciseDuty.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-lg">{totals.totalValue.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <footer className="mt-8 pt-6 border-t text-center text-sm text-navy-900 font-medium">
              Powered by Sensile Technologies East Africa Ltd
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
