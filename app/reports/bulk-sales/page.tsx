"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, RefreshCw, Fuel, FileSpreadsheet, FileText, TrendingUp, Package, DollarSign, BarChart3, AlertTriangle, Router, Settings, Check, Percent } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"
import { useCurrency } from "@/lib/currency-utils"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

interface BulkSaleEntry {
  id: string
  shift_id: string
  nozzle_id: string
  item_id: string
  fuel_type: string
  opening_reading: number
  closing_reading: number
  meter_difference: number
  invoiced_quantity: number
  bulk_quantity: number
  unit_price: number
  total_amount: number
  generated_invoices: number
  status: string
  created_at: string
  nozzle_name: string
  dispenser_number: number
  nozzle_number: number
  shift_start: string
  shift_end: string | null
  cashier_name: string
  item_name: string
}

interface ProductSummary {
  fuel_type: string
  product_name: string
  total_meter_difference: number
  total_invoiced: number
  total_bulk: number
  total_amount: number
  total_invoices: number
  entry_count: number
}

interface BulkSalesData {
  bulk_sales: BulkSaleEntry[]
  summary: ProductSummary[]
  branch_name: string
  kra_percentage: number
  has_controller: boolean
  controller_id: string | null
  totals: {
    total_meter_difference: number
    total_invoiced: number
    total_bulk: number
    total_amount: number
    total_entries: number
  }
}

export default function BulkSalesReportPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const today = new Date().toISOString().split("T")[0]
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BulkSalesData | null>(null)
  const [splitDenominations, setSplitDenominations] = useState(true)
  const [intermittencyRate, setIntermittencyRate] = useState<number>(100)
  const [savingRate, setSavingRate] = useState(false)
  const [rateMessage, setRateMessage] = useState<string | null>(null)
  const { formatCurrency } = useCurrency()

  const fetchBulkSales = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      if (!branchId) {
        setData(null)
        return
      }

      const params = new URLSearchParams()
      params.append("branch_id", branchId)
      params.append("date_from", dateFrom)
      params.append("date_to", dateTo)

      const response = await fetch(`/api/reports/bulk-sales?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setData(result.data)
        setIntermittencyRate(result.data.kra_percentage || 100)
      } else {
        setData(null)
      }
    } catch (error) {
      console.error("Error fetching bulk sales:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchBulkSales()
  }, [fetchBulkSales])

  const handleSaveIntermittencyRate = async () => {
    try {
      setSavingRate(true)
      setRateMessage(null)
      
      const storedBranch = localStorage.getItem("selectedBranch")
      if (!storedBranch) {
        setRateMessage("No branch selected")
        return
      }
      
      const branch = JSON.parse(storedBranch)
      
      const response = await fetch(`/api/branches/${branch.id}/intermittency-rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intermittency_rate: intermittencyRate })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRateMessage(`Saved! ${intermittencyRate}% of bulk sales will be transmitted to KRA.`)
        if (data) {
          setData({ ...data, kra_percentage: intermittencyRate })
        }
        setTimeout(() => setRateMessage(null), 3000)
      } else {
        setRateMessage(result.error || "Failed to save")
      }
    } catch (error) {
      console.error("Error saving intermittency rate:", error)
      setRateMessage("Failed to save intermittency rate")
    } finally {
      setSavingRate(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  }

  const handleExportPDF = () => {
    if (!data) return

    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("BULK SALES REPORT", 14, 20)
    
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Branch: ${data.branch_name}`, 14, 28)
    doc.text(`Period: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`, 14, 34)
    doc.text(`KRA Transmission Rate: ${data.kra_percentage}%`, 14, 40)
    
    let yPos = 50

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("SUMMARY BY PRODUCT", 14, yPos)
    yPos += 4

    autoTable(doc, {
      startY: yPos,
      head: [['Product', 'Meter Diff (L)', 'Invoiced (L)', 'Bulk (L)', 'Amount', 'Invoices']],
      body: data.summary.map(s => [
        s.product_name || s.fuel_type,
        formatNumber(Number(s.total_meter_difference)),
        formatNumber(Number(s.total_invoiced)),
        formatNumber(Number(s.total_bulk)),
        formatCurrency(Number(s.total_amount)),
        Number(s.total_invoices).toString()
      ]),
      foot: [[
        'TOTAL',
        formatNumber(data.totals.total_meter_difference),
        formatNumber(data.totals.total_invoiced),
        formatNumber(data.totals.total_bulk),
        formatCurrency(data.totals.total_amount),
        data.totals.total_entries.toString()
      ]],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold', fontSize: 8 },
      margin: { left: 14, right: 14 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    if (data.bulk_sales.length > 0) {
      if (yPos > 200) { doc.addPage(); yPos = 20 }
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("DETAILED ENTRIES", 14, yPos)
      yPos += 4

      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Nozzle', 'Product', 'Meter Diff', 'Invoiced', 'Bulk', 'Amount', 'Cashier']],
        body: data.bulk_sales.map(bs => [
          formatDate(bs.created_at),
          bs.nozzle_name || `D${bs.dispenser_number}-N${bs.nozzle_number}`,
          bs.item_name || bs.fuel_type,
          formatNumber(Number(bs.meter_difference)),
          formatNumber(Number(bs.invoiced_quantity)),
          formatNumber(Number(bs.bulk_quantity)),
          formatCurrency(Number(bs.total_amount)),
          bs.cashier_name || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], fontSize: 7 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 14, right: 14 }
      })
    }

    doc.save(`Bulk_Sales_${data.branch_name}_${dateFrom}_to_${dateTo}.pdf`)
  }

  const handleExportExcel = () => {
    if (!data) return

    const wb = XLSX.utils.book_new()

    const summaryData = [
      ['BULK SALES REPORT'],
      [`Branch: ${data.branch_name}`],
      [`Period: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`],
      [`KRA Transmission Rate: ${data.kra_percentage}%`],
      [],
      ['SUMMARY BY PRODUCT'],
      ['Product', 'Meter Difference (L)', 'Invoiced (L)', 'Bulk (L)', 'Amount', 'Invoices Generated'],
      ...data.summary.map(s => [
        s.product_name || s.fuel_type,
        Number(s.total_meter_difference),
        Number(s.total_invoiced),
        Number(s.total_bulk),
        Number(s.total_amount),
        Number(s.total_invoices)
      ]),
      ['TOTAL', data.totals.total_meter_difference, data.totals.total_invoiced, data.totals.total_bulk, data.totals.total_amount, data.totals.total_entries]
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    ws1['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary')

    const detailData = [
      ['DETAILED ENTRIES'],
      ['Date', 'Nozzle', 'Product', 'Opening', 'Closing', 'Meter Diff', 'Invoiced', 'Bulk', 'Unit Price', 'Amount', 'Invoices', 'Cashier', 'Status'],
      ...data.bulk_sales.map(bs => [
        formatDate(bs.created_at),
        bs.nozzle_name || `D${bs.dispenser_number}-N${bs.nozzle_number}`,
        bs.item_name || bs.fuel_type,
        Number(bs.opening_reading),
        Number(bs.closing_reading),
        Number(bs.meter_difference),
        Number(bs.invoiced_quantity),
        Number(bs.bulk_quantity),
        Number(bs.unit_price),
        Number(bs.total_amount),
        bs.generated_invoices,
        bs.cashier_name || '-',
        bs.status
      ])
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(detailData)
    ws2['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Details')

    XLSX.writeFile(wb, `Bulk_Sales_${data.branch_name}_${dateFrom}_to_${dateTo}.xlsx`)
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white print:bg-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6 print:m-0">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden print:shadow-none print:rounded-none">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6 print:bg-white print:p-2">
            <div className="mx-auto max-w-7xl space-y-6">
              <ReportTabs />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    Bulk Sales Report
                  </h1>
                  <p className="text-slate-600 mt-1">Meter difference and bulk fuel sales analysis</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={fetchBulkSales} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!data}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportPDF}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportExcel}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {data?.has_controller && (
                <Card className="rounded-2xl border-blue-200 bg-blue-50 print:hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Router className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Pump Controller Connected</p>
                        <p className="text-sm text-blue-700 mt-1">
                          This branch has a pump controller (PTS ID: {data.controller_id}). Bulk sales are automatically captured by the controller, so manual bulk sales computation is not required.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-2xl print:hidden">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <Label htmlFor="date-from" className="text-sm font-medium text-slate-700">From Date</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <Label htmlFor="date-to" className="text-sm font-medium text-slate-700">To Date</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    {!data?.has_controller && (
                      <div className="flex items-center gap-2 min-w-[200px]">
                        <Switch
                          id="split-denominations"
                          checked={splitDenominations}
                          onCheckedChange={setSplitDenominations}
                        />
                        <Label htmlFor="split-denominations" className="text-sm text-slate-700">
                          Split into Denominations
                        </Label>
                      </div>
                    )}
                    <Button onClick={fetchBulkSales} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-amber-200 bg-amber-50/50 print:hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Percent className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-900">KRA Intermittency Rate</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                          The percentage of successful eTIMs invoice transmissions against total number of invoices validated in the ongoing shift.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={intermittencyRate}
                          onChange={(e) => setIntermittencyRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-20 pr-6 text-center font-medium"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                      </div>
                      <Button 
                        onClick={handleSaveIntermittencyRate} 
                        disabled={savingRate || intermittencyRate === data?.kra_percentage}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {savingRate ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {rateMessage && (
                    <div className={`mt-3 text-sm ${rateMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                      {rateMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              {loading ? (
                <Card className="rounded-2xl">
                  <CardContent className="py-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-600">Loading bulk sales data...</span>
                  </CardContent>
                </Card>
              ) : !data ? (
                <Card className="rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">No data available for the selected period</p>
                    <p className="text-slate-500 text-sm mt-1">Try selecting a different date range</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Meter Difference</p>
                            <p className="text-lg font-bold text-slate-900">{formatNumber(data.totals.total_meter_difference)} L</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Fuel className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Invoiced</p>
                            <p className="text-lg font-bold text-slate-900">{formatNumber(data.totals.total_invoiced)} L</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Bulk Sales</p>
                            <p className="text-lg font-bold text-slate-900">{formatNumber(data.totals.total_bulk)} L</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Total Amount</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(data.totals.total_amount)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2 print:pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800">
                          SUMMARY BY PRODUCT
                        </CardTitle>
                        <div className="text-sm text-slate-500">
                          KRA Rate: <span className="font-semibold text-blue-600">{data.kra_percentage}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100 border-y text-xs">
                              <th className="text-left py-2 px-4 font-semibold">PRODUCT</th>
                              <th className="text-right py-2 px-4 font-semibold">METER DIFF (L)</th>
                              <th className="text-right py-2 px-4 font-semibold">INVOICED (L)</th>
                              <th className="text-right py-2 px-4 font-semibold">BULK (L)</th>
                              <th className="text-right py-2 px-4 font-semibold">AMOUNT</th>
                              <th className="text-right py-2 px-4 font-semibold">INVOICES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.summary.map((s, idx) => (
                              <tr key={idx} className="border-b hover:bg-slate-50">
                                <td className="py-2 px-4 font-medium">{s.product_name || s.fuel_type}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatNumber(Number(s.total_meter_difference))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatNumber(Number(s.total_invoiced))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatNumber(Number(s.total_bulk))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(Number(s.total_amount))}</td>
                                <td className="text-right py-2 px-4 font-mono">{Number(s.total_invoices)}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold">
                              <td className="py-2 px-4">TOTAL</td>
                              <td className="text-right py-2 px-4 font-mono">{formatNumber(data.totals.total_meter_difference)}</td>
                              <td className="text-right py-2 px-4 font-mono">{formatNumber(data.totals.total_invoiced)}</td>
                              <td className="text-right py-2 px-4 font-mono">{formatNumber(data.totals.total_bulk)}</td>
                              <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.totals.total_amount)}</td>
                              <td className="text-right py-2 px-4 font-mono">{data.totals.total_entries}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {data.bulk_sales.length > 0 && (
                    <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-800">
                          DETAILED ENTRIES
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-y text-xs">
                                <th className="text-left py-2 px-3 font-semibold whitespace-nowrap">DATE</th>
                                <th className="text-left py-2 px-3 font-semibold whitespace-nowrap">NOZZLE</th>
                                <th className="text-left py-2 px-3 font-semibold whitespace-nowrap">PRODUCT</th>
                                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">METER DIFF</th>
                                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">INVOICED</th>
                                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">BULK</th>
                                <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">AMOUNT</th>
                                <th className="text-left py-2 px-3 font-semibold whitespace-nowrap">CASHIER</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.bulk_sales.map((bs) => (
                                <tr key={bs.id} className="border-b hover:bg-slate-50">
                                  <td className="py-2 px-3 whitespace-nowrap">{formatDate(bs.created_at)}</td>
                                  <td className="py-2 px-3 whitespace-nowrap">{bs.nozzle_name || `D${bs.dispenser_number}-N${bs.nozzle_number}`}</td>
                                  <td className="py-2 px-3 whitespace-nowrap">{bs.item_name || bs.fuel_type}</td>
                                  <td className="text-right py-2 px-3 font-mono whitespace-nowrap">{formatNumber(Number(bs.meter_difference))}</td>
                                  <td className="text-right py-2 px-3 font-mono whitespace-nowrap">{formatNumber(Number(bs.invoiced_quantity))}</td>
                                  <td className="text-right py-2 px-3 font-mono whitespace-nowrap">{formatNumber(Number(bs.bulk_quantity))}</td>
                                  <td className="text-right py-2 px-3 font-mono whitespace-nowrap">{formatCurrency(Number(bs.total_amount))}</td>
                                  <td className="py-2 px-3 whitespace-nowrap">{bs.cashier_name || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
