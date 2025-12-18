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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Daily Sales Report</h1>
                  <p className="text-sm text-slate-600 mt-1">Comprehensive daily sales breakdown</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Sales</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">{formatCurrency(totalAmount)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Total Tax</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">{formatCurrency(totalTax)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Net Sales</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">{formatCurrency(totalAmount - totalTax)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="pt-4 md:pt-6">
                    <p className="text-xs md:text-sm text-slate-600">Items Sold</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">{totalQuantity}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg md:text-xl">Sales by Category</CardTitle>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full sm:w-40 rounded-xl"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-3 md:mx-0">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b text-xs md:text-sm">
                          <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Category</th>
                          <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Quantity</th>
                          <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Sales Amount</th>
                          <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Tax</th>
                          <th className="text-right py-2 md:py-3 px-3 md:px-4 font-semibold text-slate-700">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                            <td className="py-2 md:py-3 px-3 md:px-4">{item.category}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{item.quantity}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(item.amount)}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(item.tax)}</td>
                            <td className="py-2 md:py-3 px-3 md:px-4 text-right font-semibold">
                              {formatCurrency(item.amount - item.tax)}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50 text-xs md:text-sm">
                          <td className="py-2 md:py-3 px-3 md:px-4">TOTAL</td>
                          <td className="py-2 md:py-3 px-3 md:px-4 text-right">{totalQuantity}</td>
                          <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totalAmount)}</td>
                          <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totalTax)}</td>
                          <td className="py-2 md:py-3 px-3 md:px-4 text-right">{formatCurrency(totalAmount - totalTax)}</td>
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
    </div>
  )
}
