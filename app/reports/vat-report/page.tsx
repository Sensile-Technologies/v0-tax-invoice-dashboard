"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, FileText, Calendar } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"

export default function VATReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const vatData = [
    {
      date: "2025-01-15",
      invoiceNo: "INV-2025-001",
      customer: "ABC Company Ltd",
      taxableAmount: 100000,
      vatRate: "16%",
      vatAmount: 16000,
      totalAmount: 116000,
      taxType: "B - 16% VAT",
    },
    {
      date: "2025-01-14",
      invoiceNo: "INV-2025-002",
      customer: "XYZ Traders",
      taxableAmount: 50000,
      vatRate: "16%",
      vatAmount: 8000,
      totalAmount: 58000,
      taxType: "B - 16% VAT",
    },
    {
      date: "2025-01-13",
      invoiceNo: "INV-2025-003",
      customer: "DEF Enterprises",
      taxableAmount: 75000,
      vatRate: "0%",
      vatAmount: 0,
      totalAmount: 75000,
      taxType: "C - Zero Rated",
    },
    {
      date: "2025-01-12",
      invoiceNo: "INV-2025-004",
      customer: "GHI Suppliers",
      taxableAmount: 150000,
      vatRate: "16%",
      vatAmount: 24000,
      totalAmount: 174000,
      taxType: "B - 16% VAT",
    },
    {
      date: "2025-01-11",
      invoiceNo: "INV-2025-005",
      customer: "JKL Distributors",
      taxableAmount: 200000,
      vatRate: "Exempt",
      vatAmount: 0,
      totalAmount: 200000,
      taxType: "A - Exempt",
    },
  ]

  const totalTaxable = vatData.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalVAT = vatData.reduce((sum, item) => sum + item.vatAmount, 0)
  const totalAmount = vatData.reduce((sum, item) => sum + item.totalAmount, 0)

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
            <div className="mx-auto max-w-7xl space-y-6">
              <ReportTabs />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-balance">VAT Report</h1>
                  <p className="text-muted-foreground">Value Added Tax summary and details</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
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
                <CardHeader>
                  <CardTitle>VAT Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Taxable Amount</p>
                      <p className="text-2xl font-bold text-navy-900">
                        KES {totalTaxable.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total VAT Collected</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {totalVAT.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <CardTitle>VAT Transactions</CardTitle>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-40 rounded-xl"
                          placeholder="Start Date"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-40 rounded-xl"
                          placeholder="End Date"
                        />
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 rounded-xl w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border overflow-hidden overflow-x-auto">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Date</TableHead>
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Tax Type</TableHead>
                          <TableHead className="text-right">Taxable Amount</TableHead>
                          <TableHead className="text-right">VAT Rate</TableHead>
                          <TableHead className="text-right">VAT Amount</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vatData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell className="font-medium">{item.invoiceNo}</TableCell>
                            <TableCell>{item.customer}</TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                {item.taxType}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              KES {item.taxableAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right">{item.vatRate}</TableCell>
                            <TableCell className="text-right">
                              KES {item.vatAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              KES {item.totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
