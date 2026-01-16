"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Calendar } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"

export default function BalanceSheetPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [reportDate, setReportDate] = useState("2025-01-15")

  const balanceSheetData = {
    companyName: "Flow360 Ltd",
    reportDate: "As at January 15, 2025",

    assets: {
      currentAssets: [
        { name: "Cash and Cash Equivalents", amount: 2500000 },
        { name: "Accounts Receivable", amount: 1800000 },
        { name: "Inventory", amount: 3500000 },
        { name: "Prepaid Expenses", amount: 200000 },
      ],
      nonCurrentAssets: [
        { name: "Property, Plant & Equipment", amount: 15000000 },
        { name: "Accumulated Depreciation", amount: -3000000 },
        { name: "Intangible Assets", amount: 500000 },
        { name: "Long-term Investments", amount: 2000000 },
      ],
    },

    liabilities: {
      currentLiabilities: [
        { name: "Accounts Payable", amount: 1500000 },
        { name: "Short-term Loans", amount: 800000 },
        { name: "Accrued Expenses", amount: 450000 },
        { name: "Tax Payable", amount: 350000 },
      ],
      nonCurrentLiabilities: [
        { name: "Long-term Debt", amount: 5000000 },
        { name: "Deferred Tax Liability", amount: 200000 },
      ],
    },

    equity: [
      { name: "Share Capital", amount: 10000000 },
      { name: "Retained Earnings", amount: 5200000 },
      { name: "Current Year Profit", amount: 2500000 },
    ],
  }

  const totalCurrentAssets = balanceSheetData.assets.currentAssets.reduce((sum, item) => sum + item.amount, 0)
  const totalNonCurrentAssets = balanceSheetData.assets.nonCurrentAssets.reduce((sum, item) => sum + item.amount, 0)
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets

  const totalCurrentLiabilities = balanceSheetData.liabilities.currentLiabilities.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalNonCurrentLiabilities = balanceSheetData.liabilities.nonCurrentLiabilities.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities

  const totalEquity = balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0)
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

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
              <ReportTabs />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-balance">Balance Sheet</h1>
                  <p className="text-muted-foreground">Statement of Financial Position</p>
                </div>
              </div>

              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-4 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{balanceSheetData.companyName}</h2>
                      <p className="text-lg font-semibold mt-1">BALANCE SHEET</p>
                      <p className="text-sm text-muted-foreground">{balanceSheetData.reportDate}</p>
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

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 bg-navy-900 text-white p-2 rounded-lg">ASSETS</h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-navy-900 mb-2">Current Assets</h4>
                          <div className="space-y-1 text-sm pl-4">
                            {balanceSheetData.assets.currentAssets.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-semibold">KES {item.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Current Assets</span>
                              <span>KES {totalCurrentAssets.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-navy-900 mb-2">Non-Current Assets</h4>
                          <div className="space-y-1 text-sm pl-4">
                            {balanceSheetData.assets.nonCurrentAssets.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span className={item.amount < 0 ? "text-red-600" : ""}>{item.name}</span>
                                <span className={`font-semibold ${item.amount < 0 ? "text-red-600" : ""}`}>
                                  KES {item.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Non-Current Assets</span>
                              <span>KES {totalNonCurrentAssets.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-navy-900 bg-blue-50 p-3 rounded-lg">
                          <span>TOTAL ASSETS</span>
                          <span>KES {totalAssets.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4 bg-navy-900 text-white p-2 rounded-lg">
                        LIABILITIES & EQUITY
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-navy-900 mb-2">Current Liabilities</h4>
                          <div className="space-y-1 text-sm pl-4">
                            {balanceSheetData.liabilities.currentLiabilities.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-semibold">KES {item.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Current Liabilities</span>
                              <span>KES {totalCurrentLiabilities.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-navy-900 mb-2">Non-Current Liabilities</h4>
                          <div className="space-y-1 text-sm pl-4">
                            {balanceSheetData.liabilities.nonCurrentLiabilities.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-semibold">KES {item.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Non-Current Liabilities</span>
                              <span>KES {totalNonCurrentLiabilities.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>TOTAL LIABILITIES</span>
                          <span>KES {totalLiabilities.toLocaleString()}</span>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-semibold text-navy-900 mb-2">Equity</h4>
                          <div className="space-y-1 text-sm pl-4">
                            {balanceSheetData.equity.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-semibold">KES {item.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Equity</span>
                              <span>KES {totalEquity.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-navy-900 bg-blue-50 p-3 rounded-lg">
                          <span>TOTAL LIABILITIES & EQUITY</span>
                          <span>KES {totalLiabilitiesAndEquity.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-muted-foreground pt-4 border-t space-y-2">
                    <p className="font-semibold">Fundamental Accounting Equation: Assets = Liabilities + Equity</p>
                    <p>Verified: {totalAssets === totalLiabilitiesAndEquity ? "✓ Balanced" : "✗ Not Balanced"}</p>
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
