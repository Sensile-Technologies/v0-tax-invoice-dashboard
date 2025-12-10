"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Printer, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CustomerStatementPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const customers = [
    { id: "1", name: "ABC Corporation", pin: "P051234567A" },
    { id: "2", name: "XYZ Ltd", pin: "P051234568B" },
    { id: "3", name: "Tech Solutions", pin: "P051234569C" },
  ]

  const transactions = [
    {
      date: "2025-01-15",
      type: "Invoice",
      reference: "INV-2025-001",
      description: "Product Sales",
      debit: 125000,
      credit: 0,
      balance: 125000,
    },
    {
      date: "2025-01-18",
      type: "Payment",
      reference: "PMT-2025-045",
      description: "Bank Transfer",
      debit: 0,
      credit: 75000,
      balance: 50000,
    },
    {
      date: "2025-01-20",
      type: "Invoice",
      reference: "INV-2025-015",
      description: "Service Charges",
      debit: 45000,
      credit: 0,
      balance: 95000,
    },
    {
      date: "2025-01-22",
      type: "Credit Note",
      reference: "CN-2025-003",
      description: "Returns",
      debit: 0,
      credit: 15000,
      balance: 80000,
    },
    {
      date: "2025-01-25",
      type: "Payment",
      reference: "PMT-2025-056",
      description: "MPESA Payment",
      debit: 0,
      credit: 50000,
      balance: 30000,
    },
  ]

  const openingBalance = 0
  const closingBalance = 30000

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader isCollapsed={isCollapsed} />

        <main className="flex-1 overflow-auto ml-6 mt-6 mb-6 mr-6">
          <div className="bg-white rounded-tl-3xl shadow-2xl p-8 min-h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Customer Statement</h1>
                <p className="text-slate-600 mt-1">Account statement for selected customer</p>
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
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Select Customer</label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Choose customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.pin}
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

            {selectedCustomer && (
              <>
                <Card className="rounded-2xl mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Customer Name</div>
                        <div className="font-semibold text-navy-900">ABC Corporation</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">PIN Number</div>
                        <div className="font-semibold text-navy-900">P051234567A</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Opening Balance</div>
                        <div className="font-semibold text-navy-900">KES {openingBalance.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Closing Balance</div>
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
                                    item.type === "Invoice"
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
                              Closing Balance:
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
