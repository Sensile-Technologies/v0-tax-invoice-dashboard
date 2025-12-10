"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Printer, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SupplierStatementPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const suppliers = [
    { id: "1", name: "Global Supplies Inc", pin: "P051234572F" },
    { id: "2", name: "Tech Distribution", pin: "P051234573G" },
    { id: "3", name: "Office Furniture Co", pin: "P051234574H" },
  ]

  const transactions = [
    {
      date: "2025-01-10",
      type: "Purchase",
      reference: "PO-2025-001",
      description: "Office Equipment",
      debit: 185000,
      credit: 0,
      balance: 185000,
    },
    {
      date: "2025-01-12",
      type: "Payment",
      reference: "PMT-SUP-012",
      description: "Bank Transfer",
      debit: 0,
      credit: 100000,
      balance: 85000,
    },
    {
      date: "2025-01-15",
      type: "Purchase",
      reference: "PO-2025-008",
      description: "Consumables",
      debit: 65000,
      credit: 0,
      balance: 150000,
    },
    {
      date: "2025-01-18",
      type: "Debit Note",
      reference: "DN-2025-002",
      description: "Damaged Goods Return",
      debit: 0,
      credit: 25000,
      balance: 125000,
    },
    {
      date: "2025-01-20",
      type: "Payment",
      reference: "PMT-SUP-015",
      description: "Cheque Payment",
      debit: 0,
      credit: 75000,
      balance: 50000,
    },
  ]

  const openingBalance = 0
  const closingBalance = 50000

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader isCollapsed={isCollapsed} />

        <main className="flex-1 overflow-auto ml-6 mt-6 mb-6 mr-6">
          <div className="bg-white rounded-tl-3xl shadow-2xl p-8 min-h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Supplier Statement</h1>
                <p className="text-slate-600 mt-1">Account statement for selected supplier</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Statement Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Select Supplier</label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Choose supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.pin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">From Date</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">To Date</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedSupplier && (
              <>
                <Card className="rounded-2xl mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Supplier Name</div>
                        <div className="font-semibold text-navy-900">Global Supplies Inc</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">PIN Number</div>
                        <div className="font-semibold text-navy-900">P051234572F</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Opening Balance</div>
                        <div className="font-semibold text-navy-900">KES {openingBalance.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Amount Payable</div>
                        <div className="font-semibold text-red-600 text-lg">KES {closingBalance.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Reference</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit (KES)</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Credit (KES)</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance (KES)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b bg-slate-50">
                            <td colSpan={6} className="py-3 px-4 font-semibold">
                              Opening Balance
                            </td>
                            <td className="py-3 px-4 text-right font-semibold">{openingBalance.toLocaleString()}</td>
                          </tr>
                          {transactions.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs ${
                                    item.type === "Purchase"
                                      ? "bg-blue-100 text-blue-700"
                                      : item.type === "Payment"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium">{item.reference}</td>
                              <td className="py-3 px-4">{item.description}</td>
                              <td className="py-3 px-4 text-right">
                                {item.debit > 0 ? item.debit.toLocaleString() : "-"}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {item.credit > 0 ? item.credit.toLocaleString() : "-"}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">{item.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-100 font-bold">
                            <td colSpan={6} className="py-3 px-4 text-right">
                              Amount Payable:
                            </td>
                            <td className="py-3 px-4 text-right text-lg text-red-600">
                              KES {closingBalance.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <footer className="mt-8 pt-6 border-t text-center text-sm text-navy-900 font-medium">
              Powered by Sensile Technologies East Africa Ltd
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
