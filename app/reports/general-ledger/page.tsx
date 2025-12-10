"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download, ArrowUpDown } from "lucide-react"

export default function GeneralLedgerPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const ledgerEntries = [
    {
      date: "2025-01-15",
      account: "1001 - Cash",
      description: "Cash Sale",
      reference: "INV-001",
      debit: 125000,
      credit: 0,
    },
    {
      date: "2025-01-15",
      account: "4001 - Sales Revenue",
      description: "Cash Sale",
      reference: "INV-001",
      debit: 0,
      credit: 125000,
    },
    {
      date: "2025-01-16",
      account: "5001 - Rent Expense",
      description: "Office Rent",
      reference: "EXP-045",
      debit: 150000,
      credit: 0,
    },
    {
      date: "2025-01-16",
      account: "1001 - Cash",
      description: "Office Rent",
      reference: "EXP-045",
      debit: 0,
      credit: 150000,
    },
    {
      date: "2025-01-17",
      account: "1002 - Bank Account",
      description: "Customer Payment",
      reference: "PMT-056",
      debit: 85000,
      credit: 0,
    },
    {
      date: "2025-01-17",
      account: "1102 - Accounts Receivable",
      description: "Customer Payment",
      reference: "PMT-056",
      debit: 0,
      credit: 85000,
    },
    {
      date: "2025-01-18",
      account: "3001 - Inventory",
      description: "Stock Purchase",
      reference: "PO-008",
      debit: 245000,
      credit: 0,
    },
    {
      date: "2025-01-18",
      account: "2001 - Accounts Payable",
      description: "Stock Purchase",
      reference: "PO-008",
      debit: 0,
      credit: 245000,
    },
  ]

  const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0)
  const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0)

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader isCollapsed={isCollapsed} />

        <main className="flex-1 overflow-auto ml-6 mt-6 mb-6 mr-6">
          <div className="bg-white rounded-tl-3xl shadow-2xl p-8 min-h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">General Ledger</h1>
                <p className="text-slate-600 mt-1">Complete record of all financial transactions</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Debits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totalDebit.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totalCredit.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Balance Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${totalDebit === totalCredit ? "text-green-600" : "text-red-600"}`}
                  >
                    {totalDebit === totalCredit ? "Balanced ✓" : "Out of Balance"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Ledger Entries</CardTitle>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search entries..."
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Account</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Reference</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit (KES)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Credit (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((entry, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">{entry.account}</td>
                          <td className="py-3 px-4">{entry.description}</td>
                          <td className="py-3 px-4 text-slate-600">{entry.reference}</td>
                          <td className="py-3 px-4 text-right">
                            {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="py-3 px-4 text-right">
                          Totals:
                        </td>
                        <td className="py-3 px-4 text-right text-lg">{totalDebit.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-lg">{totalCredit.toLocaleString()}</td>
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
