"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download } from "lucide-react"

export default function WithholdingTaxPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const whtData = [
    {
      date: "2025-01-15",
      supplier: "Professional Services Ltd",
      pin: "P051234580K",
      invoiceAmount: 500000,
      whtRate: 5,
      whtAmount: 25000,
      netPayment: 475000,
      category: "Professional Fees",
    },
    {
      date: "2025-01-16",
      supplier: "Management Consultants",
      pin: "P051234581L",
      invoiceAmount: 350000,
      whtRate: 5,
      whtAmount: 17500,
      netPayment: 332500,
      category: "Consultancy",
    },
    {
      date: "2025-01-17",
      supplier: "Rental Properties Inc",
      pin: "P051234582M",
      invoiceAmount: 200000,
      whtRate: 10,
      whtAmount: 20000,
      netPayment: 180000,
      category: "Rent",
    },
    {
      date: "2025-01-18",
      supplier: "Freelance Developer",
      pin: "P051234583N",
      invoiceAmount: 180000,
      whtRate: 5,
      whtAmount: 9000,
      netPayment: 171000,
      category: "Freelance Services",
    },
    {
      date: "2025-01-19",
      supplier: "Training Institute",
      pin: "P051234584O",
      invoiceAmount: 125000,
      whtRate: 5,
      whtAmount: 6250,
      netPayment: 118750,
      category: "Training",
    },
  ]

  const totals = whtData.reduce(
    (acc, item) => ({
      invoiceAmount: acc.invoiceAmount + item.invoiceAmount,
      whtAmount: acc.whtAmount + item.whtAmount,
      netPayment: acc.netPayment + item.netPayment,
    }),
    { invoiceAmount: 0, whtAmount: 0, netPayment: 0 },
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
                <h1 className="text-3xl font-bold text-slate-900">Withholding Tax Report</h1>
                <p className="text-slate-600 mt-1">Tax withheld on payments to suppliers</p>
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
                  <CardTitle className="text-sm font-medium text-slate-600">Total Invoice Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totals.invoiceAmount.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total WHT Withheld</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">KES {totals.whtAmount.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Net Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">KES {totals.netPayment.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">{whtData.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Withholding Tax Transactions</CardTitle>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search transactions..."
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Supplier</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">PIN</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Invoice (KES)</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">WHT Rate</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">WHT Amount (KES)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Net Payment (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whtData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">{item.supplier}</td>
                          <td className="py-3 px-4 text-slate-600">{item.pin}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{item.invoiceAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">{item.whtRate}%</td>
                          <td className="py-3 px-4 text-right font-semibold text-red-600">
                            {item.whtAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">{item.netPayment.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="py-3 px-4 text-right">
                          Totals:
                        </td>
                        <td className="py-3 px-4 text-right">{totals.invoiceAmount.toLocaleString()}</td>
                        <td></td>
                        <td className="py-3 px-4 text-right text-red-600">{totals.whtAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-lg">{totals.netPayment.toLocaleString()}</td>
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
