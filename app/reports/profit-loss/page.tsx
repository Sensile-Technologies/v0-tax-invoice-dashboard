"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Calendar } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"

export default function ProfitLossPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [startDate, setStartDate] = useState("2025-01-01")
  const [endDate, setEndDate] = useState("2025-01-31")

  const plData = {
    companyName: "Flow360 Ltd",
    period: "For the Month Ended January 31, 2025",

    revenue: [
      { name: "Sales Revenue", amount: 15000000 },
      { name: "Service Revenue", amount: 2000000 },
      { name: "Other Income", amount: 500000 },
    ],

    costOfSales: [
      { name: "Cost of Goods Sold", amount: 8000000 },
      { name: "Direct Labor", amount: 1500000 },
    ],

    operatingExpenses: [
      { name: "Salaries and Wages", amount: 2500000 },
      { name: "Rent", amount: 400000 },
      { name: "Utilities", amount: 150000 },
      { name: "Marketing & Advertising", amount: 300000 },
      { name: "Depreciation", amount: 250000 },
      { name: "Office Supplies", amount: 100000 },
      { name: "Insurance", amount: 200000 },
      { name: "Professional Fees", amount: 150000 },
    ],

    otherExpenses: [
      { name: "Interest Expense", amount: 180000 },
      { name: "Bank Charges", amount: 20000 },
    ],

    tax: [{ name: "Income Tax (30%)", amount: 750000 }],
  }

  const totalRevenue = plData.revenue.reduce((sum, item) => sum + item.amount, 0)
  const totalCOGS = plData.costOfSales.reduce((sum, item) => sum + item.amount, 0)
  const grossProfit = totalRevenue - totalCOGS
  const totalOpEx = plData.operatingExpenses.reduce((sum, item) => sum + item.amount, 0)
  const operatingIncome = grossProfit - totalOpEx
  const totalOtherExpenses = plData.otherExpenses.reduce((sum, item) => sum + item.amount, 0)
  const profitBeforeTax = operatingIncome - totalOtherExpenses
  const totalTax = plData.tax.reduce((sum, item) => sum + item.amount, 0)
  const netProfit = profitBeforeTax - totalTax

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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-balance">Profit & Loss Statement</h1>
                  <p className="text-muted-foreground">Income Statement</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-36 rounded-xl"
                    />
                    <span>to</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-36 rounded-xl"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-4 md:p-8 space-y-6">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">{plData.companyName}</h2>
                    <p className="text-lg font-semibold mt-1">PROFIT & LOSS STATEMENT</p>
                    <p className="text-sm text-muted-foreground">{plData.period}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-navy-900">REVENUE</h3>
                    <div className="space-y-1 text-sm pl-4">
                      {plData.revenue.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-semibold">KES {item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t text-base">
                        <span>Total Revenue</span>
                        <span>KES {totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-navy-900">COST OF SALES</h3>
                    <div className="space-y-1 text-sm pl-4">
                      {plData.costOfSales.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-semibold text-red-600">({item.amount.toLocaleString()})</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t text-base">
                        <span>Total Cost of Sales</span>
                        <span className="text-red-600">(KES {totalCOGS.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold bg-green-50 p-3 rounded-lg">
                    <span>GROSS PROFIT</span>
                    <span className="text-green-700">KES {grossProfit.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-navy-900">OPERATING EXPENSES</h3>
                    <div className="space-y-1 text-sm pl-4">
                      {plData.operatingExpenses.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-semibold text-red-600">({item.amount.toLocaleString()})</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t text-base">
                        <span>Total Operating Expenses</span>
                        <span className="text-red-600">(KES {totalOpEx.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold bg-blue-50 p-3 rounded-lg">
                    <span>OPERATING INCOME</span>
                    <span className="text-blue-700">KES {operatingIncome.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-navy-900">OTHER EXPENSES</h3>
                    <div className="space-y-1 text-sm pl-4">
                      {plData.otherExpenses.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-semibold text-red-600">({item.amount.toLocaleString()})</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t text-base">
                        <span>Total Other Expenses</span>
                        <span className="text-red-600">(KES {totalOtherExpenses.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold bg-amber-50 p-3 rounded-lg">
                    <span>PROFIT BEFORE TAX</span>
                    <span className="text-amber-700">KES {profitBeforeTax.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="space-y-1 text-sm pl-4">
                      {plData.tax.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-semibold text-red-600">({item.amount.toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-xl font-bold bg-navy-900 text-white p-4 rounded-lg">
                    <span>NET PROFIT</span>
                    <span>KES {netProfit.toLocaleString()}</span>
                  </div>

                  <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                    <p>Net Profit Margin: {((netProfit / totalRevenue) * 100).toFixed(2)}%</p>
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
