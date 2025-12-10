"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

export default function DailySalesReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const { formatCurrency } = useCurrency()

  const salesData = [
    { category: "Electronics", quantity: 45, amount: 450000, tax: 72000 },
    { category: "Groceries", quantity: 120, amount: 180000, tax: 0 },
    { category: "Clothing", quantity: 67, amount: 234000, tax: 37440 },
    { category: "Home & Garden", quantity: 34, amount: 156000, tax: 24960 },
  ]

  const totalAmount = salesData.reduce((sum, item) => sum + item.amount, 0)
  const totalTax = salesData.reduce((sum, item) => sum + item.tax, 0)
  const totalQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Daily Sales Report</h1>
                <p className="text-slate-600 mt-1">Comprehensive daily sales breakdown</p>
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

            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Total Sales</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(totalAmount)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Total Tax</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(totalTax)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Net Sales</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(totalAmount - totalTax)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Items Sold</p>
                  <p className="text-2xl font-bold mt-2">{totalQuantity}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sales by Category</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="rounded-xl w-48"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Sales Amount</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Tax</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{item.category}</td>
                          <td className="py-3 px-4 text-right">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.tax)}</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {formatCurrency(item.amount - item.tax)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50">
                        <td className="py-3 px-4">TOTAL</td>
                        <td className="py-3 px-4 text-right">{totalQuantity}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(totalAmount)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(totalTax)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(totalAmount - totalTax)}</td>
                      </tr>
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
