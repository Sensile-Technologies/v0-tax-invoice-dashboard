"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

export default function CashFlowPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { formatCurrency } = useCurrency()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const operatingActivities = [
    { item: "Cash received from customers", amount: 15450000 },
    { item: "Cash paid to suppliers", amount: -8900000 },
    { item: "Cash paid for operating expenses", amount: -3200000 },
    { item: "Interest paid", amount: -150000 },
    { item: "Tax paid", amount: -850000 },
  ]

  const investingActivities = [
    { item: "Purchase of equipment", amount: -2500000 },
    { item: "Sale of old equipment", amount: 450000 },
  ]

  const financingActivities = [
    { item: "Proceeds from bank loan", amount: 3000000 },
    { item: "Repayment of loan", amount: -1200000 },
    { item: "Dividends paid", amount: -500000 },
  ]

  const netOperating = operatingActivities.reduce((sum, item) => sum + item.amount, 0)
  const netInvesting = investingActivities.reduce((sum, item) => sum + item.amount, 0)
  const netFinancing = financingActivities.reduce((sum, item) => sum + item.amount, 0)
  const netIncrease = netOperating + netInvesting + netFinancing

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
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Cash Flow Statement</h1>
                  <p className="text-slate-600 mt-1">For the period ending {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
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

              <Card className="rounded-2xl mb-4">
                <CardHeader>
                  <CardTitle>Operating Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <tbody>
                        {operatingActivities.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{item.item}</td>
                            <td className={`py-3 px-4 text-right ${item.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                              {formatCurrency(Math.abs(item.amount))}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50">
                          <td className="py-3 px-4">Net Cash from Operating Activities</td>
                          <td className={`py-3 px-4 text-right ${netOperating < 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(netOperating)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl mb-4">
                <CardHeader>
                  <CardTitle>Investing Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <tbody>
                        {investingActivities.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{item.item}</td>
                            <td className={`py-3 px-4 text-right ${item.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                              {formatCurrency(Math.abs(item.amount))}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50">
                          <td className="py-3 px-4">Net Cash from Investing Activities</td>
                          <td className={`py-3 px-4 text-right ${netInvesting < 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(netInvesting)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl mb-4">
                <CardHeader>
                  <CardTitle>Financing Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <tbody>
                        {financingActivities.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{item.item}</td>
                            <td className={`py-3 px-4 text-right ${item.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                              {formatCurrency(Math.abs(item.amount))}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-slate-50">
                          <td className="py-3 px-4">Net Cash from Financing Activities</td>
                          <td className={`py-3 px-4 text-right ${netFinancing < 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(netFinancing)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Net Increase in Cash</span>
                    <span className={`text-2xl font-bold ${netIncrease < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(netIncrease)}
                    </span>
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
