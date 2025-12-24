"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TrialBalancePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [reportDate, setReportDate] = useState("2025-01-31")

  const trialBalanceData = {
    companyName: "Flow360 Ltd",
    reportDate: "As at January 31, 2025",

    accounts: [
      { code: "1001", name: "Cash at Bank", debit: 2500000, credit: 0 },
      { code: "1002", name: "Petty Cash", debit: 50000, credit: 0 },
      { code: "1101", name: "Accounts Receivable", debit: 1800000, credit: 0 },
      { code: "1201", name: "Inventory", debit: 3500000, credit: 0 },
      { code: "1301", name: "Prepaid Insurance", debit: 200000, credit: 0 },
      { code: "1501", name: "Property & Equipment", debit: 15000000, credit: 0 },
      { code: "1502", name: "Accumulated Depreciation", debit: 0, credit: 3000000 },
      { code: "2001", name: "Accounts Payable", debit: 0, credit: 1500000 },
      { code: "2101", name: "Short-term Loans", debit: 0, credit: 800000 },
      { code: "2201", name: "VAT Payable", debit: 0, credit: 350000 },
      { code: "2301", name: "Accrued Expenses", debit: 0, credit: 450000 },
      { code: "2501", name: "Long-term Debt", debit: 0, credit: 5000000 },
      { code: "3001", name: "Share Capital", debit: 0, credit: 10000000 },
      { code: "3101", name: "Retained Earnings", debit: 0, credit: 5200000 },
      { code: "4001", name: "Sales Revenue", debit: 0, credit: 15000000 },
      { code: "4002", name: "Service Revenue", debit: 0, credit: 2000000 },
      { code: "4999", name: "Other Income", debit: 0, credit: 500000 },
      { code: "5001", name: "Cost of Goods Sold", debit: 8000000, credit: 0 },
      { code: "5101", name: "Salaries & Wages", debit: 3500000, credit: 0 },
      { code: "5201", name: "Rent Expense", debit: 400000, credit: 0 },
      { code: "5202", name: "Utilities", debit: 150000, credit: 0 },
      { code: "5301", name: "Marketing Expense", debit: 300000, credit: 0 },
      { code: "5401", name: "Depreciation Expense", debit: 250000, credit: 0 },
      { code: "5501", name: "Insurance Expense", debit: 200000, credit: 0 },
      { code: "5601", name: "Interest Expense", debit: 180000, credit: 0 },
      { code: "6001", name: "Income Tax Expense", debit: 750000, credit: 0 },
    ],
  }

  const totalDebits = trialBalanceData.accounts.reduce((sum, acc) => sum + acc.debit, 0)
  const totalCredits = trialBalanceData.accounts.reduce((sum, acc) => sum + acc.credit, 0)
  const isBalanced = totalDebits === totalCredits

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
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-balance">Trial Balance</h1>
                  <p className="text-muted-foreground">Statement of Account Balances</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-40 rounded-xl"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-4 md:p-8 space-y-6">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">{trialBalanceData.companyName}</h2>
                    <p className="text-lg font-semibold mt-1">TRIAL BALANCE</p>
                    <p className="text-sm text-muted-foreground">{trialBalanceData.reportDate}</p>
                  </div>

                  <div className="rounded-xl border overflow-hidden overflow-x-auto">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow className="bg-navy-900 text-white hover:bg-navy-900">
                          <TableHead className="text-white font-bold">Account Code</TableHead>
                          <TableHead className="text-white font-bold">Account Name</TableHead>
                          <TableHead className="text-right text-white font-bold">Debit (KES)</TableHead>
                          <TableHead className="text-right text-white font-bold">Credit (KES)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trialBalanceData.accounts.map((account, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">{account.code}</TableCell>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {account.debit > 0 ? account.debit.toLocaleString() : "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {account.credit > 0 ? account.credit.toLocaleString() : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-navy-900 text-white font-bold text-lg">
                          <TableCell colSpan={2} className="text-white">
                            TOTAL
                          </TableCell>
                          <TableCell className="text-right text-white">KES {totalDebits.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-white">KES {totalCredits.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow className={isBalanced ? "bg-green-50" : "bg-red-50"}>
                          <TableCell colSpan={2} className="font-bold">
                            DIFFERENCE
                          </TableCell>
                          <TableCell colSpan={2} className="text-center font-bold">
                            {isBalanced ? (
                              <span className="text-green-700">✓ Balanced (KES 0)</span>
                            ) : (
                              <span className="text-red-700">
                                ✗ Out of Balance (KES {Math.abs(totalDebits - totalCredits).toLocaleString()})
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="text-center text-xs text-muted-foreground pt-4 border-t space-y-2">
                    <p className="font-semibold">Accounting Principle: Total Debits must equal Total Credits</p>
                    <p>This report verifies the mathematical accuracy of the general ledger</p>
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
