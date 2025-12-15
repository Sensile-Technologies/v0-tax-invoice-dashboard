"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

interface RunningBalanceEntry {
  date: string
  shift: string
  user: string
  debit: number
  credit: number
  balance: number
  paymentMethod: string
}

interface BankAccountEntry {
  date: string
  transactionId: string
  source: string
  debit: number
  balance: number
}

export default function RunningBalanceReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [entries, setEntries] = useState<RunningBalanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [activePaymentMethod, setActivePaymentMethod] = useState<string>("All")
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const selectedBranchData = localStorage.getItem("selectedBranch")
        const selectedBranchId = selectedBranchData ? JSON.parse(selectedBranchData).id : null

        if (!selectedBranchId) {
          console.error("[v0] No branch selected")
          loadPlaceholderData()
          setLoading(false)
          return
        }

        const [shiftsRes, salesRes, staffRes] = await Promise.all([
          fetch(`/api/shifts?branch_id=${selectedBranchId}`),
          fetch(`/api/sales?branch_id=${selectedBranchId}`),
          fetch(`/api/staff?branch_id=${selectedBranchId}`)
        ])

        const [shiftsResult, salesResult, staffResult] = await Promise.all([
          shiftsRes.json(),
          salesRes.json(),
          staffRes.json()
        ])

        const shifts = shiftsResult.success ? shiftsResult.data : []
        const salesData = salesResult.success ? salesResult.data : []
        const staffData = staffResult.success ? staffResult.data : []

        if (!shifts || shifts.length === 0) {
          loadPlaceholderData()
          setLoading(false)
          return
        }

        // Create a map of staff_id to full_name
        const staffMap = new Map((staffData || []).map((s: any) => [s.id, s.full_name]))

        // Group sales by shift_id
        const salesByShift = (salesData || []).reduce((acc: any, sale: any) => {
          if (!acc[sale.shift_id]) acc[sale.shift_id] = []
          acc[sale.shift_id].push(sale)
          return acc
        }, {})

        // Attach sales to shifts
        const shiftsWithSales = shifts.map((shift: any) => ({
          ...shift,
          opening_cash: Number(shift.opening_cash) || 0,
          closing_cash: Number(shift.closing_cash) || 0,
          total_sales: Number(shift.total_sales) || 0,
          sales: salesByShift[shift.id] || []
        })).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

        const balanceEntries: RunningBalanceEntry[] = []
        let runningBalance = 0

        if (shiftsWithSales && shiftsWithSales.length > 0) {
          const firstShift = shiftsWithSales[0]
          runningBalance = firstShift.opening_cash || 0
          balanceEntries.push({
            date: new Date(firstShift.start_time).toLocaleDateString(),
            shift: "Opening",
            user: "-",
            debit: 0,
            credit: firstShift.opening_cash || 0,
            balance: runningBalance,
            paymentMethod: "All",
          })
        }

        shiftsWithSales?.forEach((shift: any) => {
          const shiftDate = new Date(shift.start_time).toLocaleDateString()
          const endTime = shift.end_time ? new Date(shift.end_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : "Ongoing"
          const shiftTime = `${new Date(shift.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${endTime}`
          const staffName = staffMap.get(shift.staff_id) || "Unknown Staff"

          const paymentMethodTotals: { [key: string]: number } = {}
          shift.sales?.forEach((sale: any) => {
            const method = sale.payment_method || "Cash"
            paymentMethodTotals[method] = (paymentMethodTotals[method] || 0) + (Number(sale.total_amount) || 0)
          })

          Object.entries(paymentMethodTotals).forEach(([method, amount]) => {
            runningBalance += amount
            balanceEntries.push({
              date: shiftDate,
              shift: shiftTime,
              user: staffName as string,
              debit: amount,
              credit: 0,
              balance: runningBalance,
              paymentMethod: method,
            })
          })
        })

        const totalDebit = balanceEntries.reduce((sum, entry) => sum + entry.debit, 0)
        const totalCredit = balanceEntries.reduce((sum, entry) => sum + entry.credit, 0)

        if (shiftsWithSales && shiftsWithSales.length > 0) {
          const lastShift = shiftsWithSales[shiftsWithSales.length - 1]
          balanceEntries.push({
            date: new Date(lastShift.end_time || lastShift.start_time).toLocaleDateString(),
            shift: "Closing",
            user: "-",
            debit: 0,
            credit: 0,
            balance: runningBalance,
            paymentMethod: "All",
          })
        }

        setEntries(balanceEntries)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching running balance:", error)
        loadPlaceholderData()
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const loadPlaceholderData = () => {
    const placeholderEntries: RunningBalanceEntry[] = [
      {
        date: "12/15/2025",
        shift: "Opening",
        user: "-",
        debit: 0,
        credit: 50000,
        balance: 50000,
        paymentMethod: "All",
      },
      {
        date: "12/15/2025",
        shift: "06:00 AM - 02:00 PM",
        user: "John Doe",
        debit: 125000,
        credit: 0,
        balance: 175000,
        paymentMethod: "Cash",
      },
      {
        date: "12/15/2025",
        shift: "06:00 AM - 02:00 PM",
        user: "John Doe",
        debit: 89000,
        credit: 0,
        balance: 264000,
        paymentMethod: "M-Pesa",
      },
      {
        date: "12/15/2025",
        shift: "06:00 AM - 02:00 PM",
        user: "John Doe",
        debit: 45000,
        credit: 0,
        balance: 309000,
        paymentMethod: "Card",
      },
      {
        date: "12/15/2025",
        shift: "02:00 PM - 10:00 PM",
        user: "Jane Smith",
        debit: 156000,
        credit: 0,
        balance: 465000,
        paymentMethod: "Cash",
      },
      {
        date: "12/15/2025",
        shift: "02:00 PM - 10:00 PM",
        user: "Jane Smith",
        debit: 112000,
        credit: 0,
        balance: 577000,
        paymentMethod: "M-Pesa",
      },
      {
        date: "12/16/2025",
        shift: "06:00 AM - 02:00 PM",
        user: "Peter Johnson",
        debit: 134000,
        credit: 0,
        balance: 711000,
        paymentMethod: "Cash",
      },
      {
        date: "12/16/2025",
        shift: "06:00 AM - 02:00 PM",
        user: "Peter Johnson",
        debit: 98000,
        credit: 0,
        balance: 809000,
        paymentMethod: "M-Pesa",
      },
      {
        date: "12/16/2025",
        shift: "Closing",
        user: "-",
        debit: 0,
        credit: 0,
        balance: 809000,
        paymentMethod: "All",
      },
    ]
    setEntries(placeholderEntries)
  }

  const getFilteredEntriesByPayment = (paymentMethod: string) => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        entry.shift.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchQuery.toLowerCase())

      const entryDate = new Date(entry.date)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      const matchesDate = (!fromDate || entryDate >= fromDate) && (!toDate || entryDate <= toDate)

      if (paymentMethod === "All") {
        return matchesSearch && matchesDate
      }

      return matchesSearch && matchesDate && entry.paymentMethod === paymentMethod
    })

    return filtered
  }

  const exportToExcel = (paymentMethod: string) => {
    const filteredData = getFilteredEntriesByPayment(paymentMethod)

    let csv = "Date,Shift,User/Staff,Payment Method,Debit,Credit,Balance\n"

    filteredData.forEach((entry) => {
      csv += `${entry.date},${entry.shift},${entry.user},${entry.paymentMethod},${entry.debit},${entry.credit},${entry.balance}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `running-balance-${paymentMethod.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const exportBankAccountStatement = () => {
    const bankEntries: BankAccountEntry[] = []

    const openingEntry = entries.find((e) => e.shift === "Opening")
    if (openingEntry) {
      bankEntries.push({
        date: openingEntry.date,
        transactionId: "OPN-001",
        source: "Opening Balance",
        debit: openingEntry.credit,
        balance: openingEntry.credit,
      })
    }

    let runningBalance = openingEntry ? openingEntry.credit : 0
    let transactionCounter = 1

    entries
      .filter((e) => e.shift !== "Opening" && e.shift !== "Closing")
      .forEach((entry) => {
        const totalAmount = entry.debit + entry.credit
        if (totalAmount > 0) {
          runningBalance += totalAmount

          let source = ""
          if (entry.paymentMethod === "Cash") {
            source = "Cash Deposit"
          } else if (entry.paymentMethod === "M-Pesa") {
            source = "Mpesa Withdrawal"
          } else if (entry.paymentMethod === "Card") {
            source = "Card Payment"
          } else {
            source = `${entry.paymentMethod} Transaction`
          }

          bankEntries.push({
            date: entry.date,
            transactionId: `TXN-${String(transactionCounter).padStart(4, "0")}`,
            source: source,
            debit: totalAmount,
            balance: runningBalance,
          })
          transactionCounter++
        }
      })

    bankEntries.push({
      date: bankEntries[bankEntries.length - 1]?.date || new Date().toLocaleDateString(),
      transactionId: "CLS-001",
      source: "Closing Balance",
      debit: 0,
      balance: runningBalance,
    })

    let csv = "Date,Transaction ID,Source,Debit,Balance\n"
    bankEntries.forEach((entry) => {
      csv += `${entry.date},${entry.transactionId},${entry.source},${entry.debit},${entry.balance}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bank-account-statement-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const paymentMethods = Array.from(new Set(entries.map((e) => e.paymentMethod).filter((m) => m !== "All")))

  const renderTable = (paymentMethod: string) => {
    const filteredEntries = getFilteredEntriesByPayment(paymentMethod)

    if (filteredEntries.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-600">No transactions found</p>
        </div>
      )
    }

    const totalDebit = filteredEntries
      .filter((e) => e.shift !== "Opening" && e.shift !== "Closing")
      .reduce((sum, e) => sum + e.debit, 0)
    const totalCredit = filteredEntries
      .filter((e) => e.shift !== "Opening" && e.shift !== "Closing")
      .reduce((sum, e) => sum + e.credit, 0)

    const openingEntry = filteredEntries.find((e) => e.shift === "Opening")
    const closingEntry = filteredEntries.find((e) => e.shift === "Closing")
    const transactionEntries = filteredEntries.filter((e) => e.shift !== "Opening" && e.shift !== "Closing")

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Shift</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">User/Staff</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment Method</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Credit</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {openingEntry && (
              <tr className="bg-green-50 font-semibold border-b">
                <td className="py-3 px-4">{openingEntry.date}</td>
                <td className="py-3 px-4">{openingEntry.shift}</td>
                <td className="py-3 px-4">{openingEntry.user}</td>
                <td className="py-3 px-4">{openingEntry.paymentMethod}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(openingEntry.debit)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(openingEntry.credit)}</td>
                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(openingEntry.balance)}</td>
              </tr>
            )}

            {transactionEntries.map((entry, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="py-3 px-4">{entry.date}</td>
                <td className="py-3 px-4">{entry.shift}</td>
                <td className="py-3 px-4">{entry.user}</td>
                <td className="py-3 px-4">{entry.paymentMethod}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(entry.debit)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(entry.credit)}</td>
                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(entry.balance)}</td>
              </tr>
            ))}

            <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
              <td className="py-3 px-4" colSpan={4}>
                Totals
              </td>
              <td className="py-3 px-4 text-right">{formatCurrency(totalDebit)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(totalCredit)}</td>
              <td className="py-3 px-4 text-right">-</td>
            </tr>

            {closingEntry && (
              <tr className="border-t-2 border-slate-300 bg-blue-50 font-bold">
                <td className="py-3 px-4">{closingEntry.date}</td>
                <td className="py-3 px-4">{closingEntry.shift}</td>
                <td className="py-3 px-4">{closingEntry.user}</td>
                <td className="py-3 px-4">{closingEntry.paymentMethod}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(closingEntry.debit)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(closingEntry.credit)}</td>
                <td className="py-3 px-4 text-right font-semibold text-blue-600">
                  {formatCurrency(closingEntry.balance)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const renderBankAccountStatement = () => {
    const bankEntries: BankAccountEntry[] = []

    const openingEntry = entries.find((e) => e.shift === "Opening")
    if (openingEntry) {
      bankEntries.push({
        date: openingEntry.date,
        transactionId: "OPN-001",
        source: "Opening Balance",
        debit: openingEntry.credit,
        balance: openingEntry.credit,
      })
    }

    let runningBalance = openingEntry ? openingEntry.credit : 0
    let transactionCounter = 1

    entries
      .filter((e) => e.shift !== "Opening" && e.shift !== "Closing")
      .forEach((entry) => {
        const totalAmount = entry.debit + entry.credit
        if (totalAmount > 0) {
          runningBalance += totalAmount

          let source = ""
          if (entry.paymentMethod === "Cash") {
            source = "Cash Deposit"
          } else if (entry.paymentMethod === "M-Pesa") {
            source = "Mpesa Withdrawal"
          } else if (entry.paymentMethod === "Card") {
            source = "Card Payment"
          } else {
            source = `${entry.paymentMethod} Transaction`
          }

          bankEntries.push({
            date: entry.date,
            transactionId: `TXN-${String(transactionCounter).padStart(4, "0")}`,
            source: source,
            debit: totalAmount,
            balance: runningBalance,
          })
          transactionCounter++
        }
      })

    bankEntries.push({
      date: bankEntries[bankEntries.length - 1]?.date || new Date().toLocaleDateString(),
      transactionId: "CLS-001",
      source: "Closing Balance",
      debit: 0,
      balance: runningBalance,
    })

    const openingRow = bankEntries[0]
    const closingRow = bankEntries[bankEntries.length - 1]
    const transactionRows = bankEntries.slice(1, bankEntries.length - 1)

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Transaction ID</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Source</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {/* Opening Balance */}
            <tr className="bg-green-50 font-semibold border-b">
              <td className="py-3 px-4">{openingRow.date}</td>
              <td className="py-3 px-4">{openingRow.transactionId}</td>
              <td className="py-3 px-4">{openingRow.source}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(openingRow.debit)}</td>
              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(openingRow.balance)}</td>
            </tr>

            {/* Transactions */}
            {transactionRows.map((entry, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="py-3 px-4">{entry.date}</td>
                <td className="py-3 px-4 font-mono text-sm">{entry.transactionId}</td>
                <td className="py-3 px-4">{entry.source}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(entry.debit)}</td>
                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(entry.balance)}</td>
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="bg-blue-50 font-semibold border-b-2">
              <td colSpan={3} className="py-3 px-4 text-right">
                Totals:
              </td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4"></td>
            </tr>

            {/* Closing Balance */}
            <tr className="bg-amber-50 font-semibold border-b-2">
              <td className="py-3 px-4">{closingRow.date}</td>
              <td className="py-3 px-4">{closingRow.transactionId}</td>
              <td className="py-3 px-4">{closingRow.source}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(closingRow.debit)}</td>
              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(closingRow.balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800">Running Balance Report</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-600">Loading...</div>
                ) : (
                  <Tabs value={activePaymentMethod} onValueChange={setActivePaymentMethod} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <TabsList>
                        {paymentMethods.map((method) => (
                          <TabsTrigger key={method} value={method}>
                            {method}
                          </TabsTrigger>
                        ))}
                        <TabsTrigger value="All">All Payment Methods</TabsTrigger>
                        <TabsTrigger value="BankStatement">Bank Account Statement</TabsTrigger>
                      </TabsList>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (activePaymentMethod === "BankStatement") {
                            exportBankAccountStatement()
                          } else {
                            exportToExcel(activePaymentMethod)
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    {paymentMethods.map((method) => (
                      <TabsContent key={method} value={method}>
                        {renderTable(method)}
                      </TabsContent>
                    ))}

                    <TabsContent value="All">{renderTable("All")}</TabsContent>
                    <TabsContent value="BankStatement">{renderBankAccountStatement()}</TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
              Powered by <span className="font-semibold text-foreground">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
