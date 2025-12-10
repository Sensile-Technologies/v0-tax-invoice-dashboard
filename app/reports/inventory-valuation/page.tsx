"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download } from "lucide-react"

export default function InventoryValuationPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const inventoryData = [
    {
      code: "ITM001",
      name: "Product A",
      category: "Electronics",
      qty: 150,
      unitCost: 2500,
      totalCost: 375000,
      avgCost: 2500,
      method: "FIFO",
    },
    {
      code: "ITM002",
      name: "Product B",
      category: "Furniture",
      qty: 80,
      unitCost: 8500,
      totalCost: 680000,
      avgCost: 8500,
      method: "WAC",
    },
    {
      code: "ITM003",
      name: "Product C",
      category: "Office Supplies",
      qty: 500,
      unitCost: 350,
      totalCost: 175000,
      avgCost: 350,
      method: "FIFO",
    },
    {
      code: "ITM004",
      name: "Product D",
      category: "Electronics",
      qty: 45,
      unitCost: 15000,
      totalCost: 675000,
      avgCost: 15000,
      method: "LIFO",
    },
    {
      code: "ITM005",
      name: "Product E",
      category: "Accessories",
      qty: 200,
      unitCost: 1200,
      totalCost: 240000,
      avgCost: 1200,
      method: "WAC",
    },
  ]

  const totalValue = inventoryData.reduce((sum, item) => sum + item.totalCost, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Inventory Valuation Report</h1>
                <p className="text-slate-600 mt-1">Stock valuation as of {new Date().toLocaleDateString()}</p>
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
                  <CardTitle className="text-sm font-medium text-slate-600">Total Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">{inventoryData.length}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    {inventoryData.reduce((sum, item) => sum + item.qty, 0)} units
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Inventory Items</CardTitle>
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search items..."
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
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Code</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Unit Cost (KES)</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Cost (KES)</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Valuation Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.map((item) => (
                          <tr key={item.code} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium">{item.code}</td>
                            <td className="py-3 px-4">{item.name}</td>
                            <td className="py-3 px-4">{item.category}</td>
                            <td className="py-3 px-4 text-right">{item.qty}</td>
                            <td className="py-3 px-4 text-right">{item.unitCost.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-semibold">{item.totalCost.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                {item.method}
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={5} className="py-3 px-4 text-right">
                            Total Inventory Value:
                          </td>
                          <td className="py-3 px-4 text-right text-lg">KES {totalValue.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <footer className="mt-12 border-t pt-6 pb-4 text-center text-muted-foreground">
              Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
