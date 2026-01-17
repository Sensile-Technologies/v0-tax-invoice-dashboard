"use client"

import { useState, useEffect } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download, ArrowUpDown, Loader2 } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"

interface ExpenseItem {
  id: string
  shift_id: string
  branch_id: string
  expense_account_id: string
  amount: string
  description: string | null
  created_at: string
  category: string
  branch_name: string
  shift_start: string
  shift_end: string | null
  recorded_by: string | null
}

interface ExpenseSummary {
  totalExpense: number
  transactionCount: number
  averageExpense: number
  categoryCount: number
  categoryTotals: Record<string, number>
}

export default function ExpenseReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalExpense: 0,
    transactionCount: 0,
    averageExpense: 0,
    categoryCount: 0,
    categoryTotals: {}
  })

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/reports/expenses?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
        setSummary(data.summary || {
          totalExpense: 0,
          transactionCount: 0,
          averageExpense: 0,
          categoryCount: 0,
          categoryTotals: {}
        })
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [dateFrom, dateTo])

  const filteredExpenses = expenses.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.category?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.branch_name?.toLowerCase().includes(query) ||
      item.recorded_by?.toLowerCase().includes(query)
    )
  })

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const headers = ["Date", "Category", "Description", "Amount (KES)"]
    const csvData = filteredExpenses.map(item => [
      new Date(item.created_at).toLocaleDateString(),
      item.category,
      item.description || "",
      parseFloat(item.amount).toFixed(2)
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expense-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-auto ml-6 mt-6 mb-6 mr-6">
          <div className="bg-white rounded-tl-3xl shadow-2xl p-8 min-h-full">
            <ReportTabs />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Expense Report</h1>
                <p className="text-slate-600 mt-1">Shift expenses and operating costs</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Loading expense data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy-900">
                        KES {summary.totalExpense.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-600">Number of Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy-900">{summary.transactionCount}</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-600">Average Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy-900">
                        KES {summary.averageExpense.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy-900">{summary.categoryCount}</div>
                    </CardContent>
                  </Card>
                </div>

                {Object.keys(summary.categoryTotals).length > 0 && (
                  <Card className="rounded-2xl mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Expense by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(summary.categoryTotals).map(([category, amount]) => (
                          <div key={category} className="border rounded-xl p-4">
                            <div className="text-sm text-slate-600 mb-1">{category}</div>
                            <div className="text-lg font-bold text-navy-900">
                              KES {amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {((amount / summary.totalExpense) * 100).toFixed(1)}% of total
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <CardTitle className="text-xl font-semibold">Expense Transactions</CardTitle>
                      <div className="flex gap-3 items-center flex-wrap">
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
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount (KES)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExpenses.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-500">
                                No expense records found
                              </td>
                            </tr>
                          ) : (
                            <>
                              {filteredExpenses.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                  <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                                  <td className="py-3 px-4">
                                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">{item.description || "-"}</td>
                                  <td className="py-3 px-4 text-right font-semibold">
                                    {parseFloat(item.amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100 font-bold">
                                <td colSpan={3} className="py-3 px-4 text-right">
                                  Total Expenses:
                                </td>
                                <td className="py-3 px-4 text-right text-lg">
                                  KES {summary.totalExpense.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            </>
                          )}
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
