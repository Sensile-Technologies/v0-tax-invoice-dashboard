"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download, Loader2, Package } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

interface PurchaseItem {
  id: string
  date: string
  po_number: string
  supplier: string
  items: string
  qty: number
  unit_price: number
  net_amount: number
  vat: number
  gross_amount: number
}

export default function PurchaseReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [purchaseData, setPurchaseData] = useState<PurchaseItem[]>([])
  const { formatCurrency } = useCurrency()

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      const params = new URLSearchParams()
      if (branchId) params.append("branch_id", branchId)
      if (searchQuery) params.append("search", searchQuery)
      if (dateFrom) params.append("date_from", dateFrom)
      if (dateTo) params.append("date_to", dateTo)

      const response = await fetch(`/api/purchases?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.purchases) {
        const items = result.purchases.map((p: any) => ({
          id: p.id,
          date: p.date || 'N/A',
          po_number: p.po_number,
          supplier: p.supplier,
          items: p.remark || 'Various Items',
          qty: p.items || 1,
          unit_price: p.amount / (p.items || 1),
          net_amount: p.amount - p.tax_amount,
          vat: p.tax_amount,
          gross_amount: p.amount,
        }))
        setPurchaseData(items)
      } else {
        setPurchaseData([])
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
      setPurchaseData([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, dateFrom, dateTo])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  const totals = purchaseData.reduce(
    (acc, item) => ({
      netAmount: acc.netAmount + item.net_amount,
      vat: acc.vat + item.vat,
      grossAmount: acc.grossAmount + item.gross_amount,
    }),
    { netAmount: 0, vat: 0, grossAmount: 0 },
  )

  const handlePrint = () => window.print()

  const handleExport = () => {
    const csvContent = [
      ["Date", "PO Number", "Supplier", "Items", "Qty", "Unit Price", "Net Amount", "VAT", "Gross Amount"],
      ...purchaseData.map(p => [
        p.date, p.po_number, p.supplier, p.items, p.qty.toString(),
        p.unit_price.toString(), p.net_amount.toString(), p.vat.toString(), p.gross_amount.toString()
      ]),
      ["TOTAL", "", "", "", "", "", totals.netAmount.toString(), totals.vat.toString(), totals.grossAmount.toString()]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `purchase-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Purchase Report</h1>
                  <p className="text-sm text-slate-600 mt-1">Summary of all purchases and procurement</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Total Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : purchaseData.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Net Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totals.netAmount)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Total VAT</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totals.vat)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Gross Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totals.grossAmount)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg md:text-xl">Purchase Details</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 rounded-xl w-40"
                        />
                      </div>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="rounded-xl w-32 md:w-36 text-sm"
                      />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="rounded-xl w-32 md:w-36 text-sm"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading purchases...</span>
                    </div>
                  ) : purchaseData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No purchases found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or date filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-3 md:mx-0">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b text-xs md:text-sm">
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Date</th>
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">PO Number</th>
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Supplier</th>
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700 hidden lg:table-cell">Items</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700 hidden md:table-cell">Qty</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Net Amount</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700 hidden sm:table-cell">VAT</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Gross</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseData.map((item, index) => (
                            <tr key={item.id || index} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                              <td className="py-2 md:py-3 px-2 md:px-4">{item.date}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4">{item.po_number}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4">{item.supplier}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 hidden lg:table-cell max-w-[150px] truncate">{item.items}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden md:table-cell">{item.qty}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right">{formatCurrency(item.net_amount)}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden sm:table-cell">{formatCurrency(item.vat)}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right font-semibold">{formatCurrency(item.gross_amount)}</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-slate-50 text-xs md:text-sm">
                            <td colSpan={5} className="py-2 md:py-3 px-2 md:px-4">TOTAL</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-right">{formatCurrency(totals.netAmount)}</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden sm:table-cell">{formatCurrency(totals.vat)}</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-right">{formatCurrency(totals.grossAmount)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
    </div>
  )
}
