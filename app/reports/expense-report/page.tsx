"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download, ArrowUpDown } from "lucide-react"

export default function ExpenseReportPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const expenseData = [
    {
      date: "2025-01-15",
      category: "Rent",
      description: "Office Rent - January",
      department: "Administration",
      amount: 150000,
      approvedBy: "John Doe",
    },
    {
      date: "2025-01-14",
      category: "Utilities",
      description: "Electricity Bill",
      department: "Operations",
      amount: 45000,
      approvedBy: "Jane Smith",
    },
    {
      date: "2025-01-13",
      category: "Salaries",
      description: "Staff Salaries - January",
      department: "HR",
      amount: 850000,
      approvedBy: "Michael Johnson",
    },
    {
      date: "2025-01-12",
      category: "Marketing",
      description: "Digital Advertising",
      department: "Marketing",
      amount: 75000,
      approvedBy: "Sarah Williams",
    },
    {
      date: "2025-01-11",
      category: "Travel",
      description: "Client Visit - Mombasa",
      department: "Sales",
      amount: 32000,
      approvedBy: "David Brown",
    },
    {
      date: "2025-01-10",
      category: "Maintenance",
      description: "Equipment Servicing",
      department: "Operations",
      amount: 28000,
      approvedBy: "Jane Smith",
    },
    {
      date: "2025-01-09",
      category: "Insurance",
      description: "Business Insurance Premium",
      department: "Finance",
      amount: 95000,
      approvedBy: "John Doe",
    },
  ]

  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)

  const categoryTotals = expenseData.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount
      return acc
    },
    {} as Record<string, number>,
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
                <h1 className="text-3xl font-bold text-slate-900">Expense Report</h1>
                <p className="text-slate-600 mt-1">Company expenses and operating costs</p>
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
                  <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">KES {totalExpense.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Number of Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">{expenseData.length}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Average Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">
                    KES {Math.round(totalExpense / expenseData.length).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy-900">{Object.keys(categoryTotals).length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Expense by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="border rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-1">{category}</div>
                      <div className="text-lg font-bold text-navy-900">KES {amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {((amount / totalExpense) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Expense Transactions</CardTitle>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search expenses..."
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount (KES)</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4">{item.department}</td>
                          <td className="py-3 px-4 text-right font-semibold">{item.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-600">{item.approvedBy}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="py-3 px-4 text-right">
                          Total Expenses:
                        </td>
                        <td className="py-3 px-4 text-right text-lg">KES {totalExpense.toLocaleString()}</td>
                        <td></td>
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
