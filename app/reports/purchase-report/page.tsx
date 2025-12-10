"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download, ArrowUpDown } from "lucide-react"

export default function PurchaseReportPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const purchaseData = [
    {
      date: "2025-01-15",
      poNumber: "PO-2025-001",
      supplier: "Global Supplies Inc",
      items: "Electronics",
      qty: 50,
      unitPrice: 2500,
      netAmount: 125000,
      vat: 20000,
      grossAmount: 145000,
    },
    {
      date: "2025-01-14",
      poNumber: "PO-2025-002",
      supplier: "Tech Distribution",
      items: "Office Equipment",
      qty: 30,
      unitPrice: 3200,
      netAmount: 96000,
      vat: 15360,
      grossAmount: 111360,
    },
    {
      date: "2025-01-13",
      poNumber: "PO-2025-003",
      supplier: "Office Furniture Co",
      items: "Furniture",
      qty: 15,
      unitPrice: 8500,
      netAmount: 127500,
      vat: 20400,
      grossAmount: 147900,
    },
    {
      date: "2025-01-12",
      poNumber: "PO-2025-004",
      supplier: "Import Traders Ltd",
      items: "Raw Materials",
      qty: 100,
      unitPrice: 850,
      netAmount: 85000,
      vat: 13600,
      grossAmount: 98600,
    },
    {
      date: "2025-01-11",
      poNumber: "PO-2025-005",
      supplier: "Equipment Suppliers",
      items: "Machinery",
      qty: 5,
      unitPrice: 45000,
      netAmount: 225000,
      vat: 36000,
      grossAmount: 261000,
    },
  ]

  const totals = purchaseData.reduce(
    (acc, item) => ({
      netAmount: acc.netAmount + item.netAmount,
      vat: acc.vat + item.vat,
      grossAmount: acc.grossAmount + item.grossAmount,
    }),
    { netAmount: 0, vat: 0, grossAmount: 0 },
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
                <h1 className="text-3xl font-bold text-slate-900">Purchase Report</h1>
                <p className="text-slate-600 mt-1">Summary of all purchases and procurement</p>
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
                  <CardTitle className="text-sm font-medium text-slate-600">Total Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">{purchaseData.length}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Net Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totals.netAmount.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total VAT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totals.vat.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Gross Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totals.grossAmount.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Purchase Transactions</CardTitle>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search purchases..."
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-1">
                            Date <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">PO Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Supplier</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Items</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Qty</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Net (KES)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">VAT (KES)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Gross (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">{item.poNumber}</td>
                          <td className="py-3 px-4">{item.supplier}</td>
                          <td className="py-3 px-4">{item.items}</td>
                          <td className="py-3 px-4 text-right">{item.qty}</td>
                          <td className="py-3 px-4 text-right">{item.netAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{item.vat.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-semibold">{item.grossAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={5} className="py-3 px-4 text-right">
                          Totals:
                        </td>
                        <td className="py-3 px-4 text-right">{totals.netAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{totals.vat.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-lg">KES {totals.grossAmount.toLocaleString()}</td>
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
