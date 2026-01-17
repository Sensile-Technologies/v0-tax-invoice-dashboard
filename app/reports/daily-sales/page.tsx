"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, Loader2, Fuel, RefreshCw, AlertTriangle, CheckCircle, FileSpreadsheet, FileText } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"
import { useCurrency } from "@/lib/currency-utils"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

interface NozzleReading {
  nozzle_id: string
  nozzle_name: string
  dispenser_number: number
  nozzle_number: number
  fuel_type: string
  closing_meter: number
  opening_meter: number
  throughput: number
  rtt: number
  pump_sales: number
}

interface ProductNozzleTotal {
  product: string
  throughput: number
  rtt: number
  pump_sales: number
  price_per_litre: number
  amount: number
}

interface ProductMovement {
  product: string
  opening_stock: number
  offloaded_volume: number
  closing_stock: number
  tank_sales: number
  pump_sales: number
  variance: number
  variance_percent: number
}

interface ProductCashFlow {
  product: string
  total_sales_litres: number
  pump_price: number
  amount: number
  actual_cash: number
  difference: number
}

interface DailyCashFlow {
  opening_cash: number
  day_shift_cash: number
  night_shift_cash: number
  cash_banked: number
  closing_cash: number
  physical_count: number
  difference: number
}

interface AttendantCollection {
  staff_id: string
  staff_name: string
  cash: number
  mpesa: number
  card: number
  mobile_money: number
  credit: number
  total: number
}

interface BankingEntry {
  id: string
  account_name: string
  bank_name: string
  amount: number
  notes: string | null
  created_at: string
}

interface DSSRData {
  date: string
  branch_name: string
  shifts: Array<{ id: string; start_time: string; end_time: string | null; cashier_name: string; shift_type: string }>
  nozzle_readings: NozzleReading[]
  product_nozzle_totals: ProductNozzleTotal[]
  product_movement: ProductMovement[]
  product_cash_flow: ProductCashFlow[]
  daily_cash_flow: DailyCashFlow
  attendant_collections: AttendantCollection[]
  banking_entries: BankingEntry[]
  totals: {
    total_sales_amount: number
    total_collections: number
    sales_vs_collections_diff: number
  }
}

export default function DSSRPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const today = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DSSRData | null>(null)
  const { formatCurrency } = useCurrency()

  const fetchDSSR = useCallback(async () => {
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
      params.append("date", selectedDate)

      const response = await fetch(`/api/reports/dssr?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.data) {
        setData(result.data)
      } else {
        setData(null)
      }
    } catch (error) {
      console.error("Error fetching DSSR:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchDSSR()
  }, [fetchDSSR])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    if (!data) return

    const doc = new jsPDF()
    const reportDate = new Date(data.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("DAILY SALES SUMMARY REPORT (DSSR)", 14, 20)
    
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Date: ${reportDate}`, 14, 28)
    doc.text(`Branch: ${data.branch_name}`, 14, 34)
    
    let yPos = 44

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("1. WHITE PRODUCT METER SALES", 14, yPos)
    yPos += 4

    autoTable(doc, {
      startY: yPos,
      head: [['Nozzle', 'Fuel Type', 'Closing Meter', 'Opening Meter', 'Throughput', 'RTT', 'Pump Sales']],
      body: data.nozzle_readings.map(n => [
        n.nozzle_name,
        n.fuel_type,
        formatNumber(n.closing_meter),
        formatNumber(n.opening_meter),
        formatNumber(n.throughput),
        formatNumber(n.rtt),
        formatNumber(n.pump_sales)
      ]),
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 6
    if (data.product_nozzle_totals.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Total Throughput', 'Total RTT', 'Total Pump Sales']],
        body: data.product_nozzle_totals.map(p => [
          p.product,
          formatNumber(p.throughput),
          formatNumber(p.rtt),
          formatNumber(p.pump_sales)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      })
      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    if (yPos > 240) { doc.addPage(); yPos = 20 }
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("2. WHITE PRODUCT MOVEMENT", 14, yPos)
    yPos += 4

    autoTable(doc, {
      startY: yPos,
      head: [['Product', 'Opening', 'Offloaded', 'Closing', 'Tank Sales', 'Pump Sales', 'Variance', 'Var %']],
      body: data.product_movement.map(p => [
        p.product,
        formatNumber(p.opening_stock),
        formatNumber(p.offloaded_volume),
        formatNumber(p.closing_stock),
        formatNumber(p.tank_sales),
        formatNumber(p.pump_sales),
        formatNumber(p.variance),
        `${formatNumber(p.variance_percent)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
    if (yPos > 240) { doc.addPage(); yPos = 20 }
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("3. COLLECTION SUMMARY", 14, yPos)
    yPos += 4

    if (data.attendant_collections.length > 0) {
      const collectionTotals = data.attendant_collections.reduce((acc, ac) => ({
        cash: acc.cash + ac.cash,
        card: acc.card + ac.card,
        mobile_money: acc.mobile_money + ac.mobile_money,
        credit: acc.credit + ac.credit,
        total: acc.total + ac.total
      }), { cash: 0, card: 0, mobile_money: 0, credit: 0, total: 0 })

      autoTable(doc, {
        startY: yPos,
        head: [['Attendant', 'Cash', 'Card', 'Mobile Money', 'Credit', 'Total']],
        body: data.attendant_collections.map(ac => [
          ac.staff_name,
          formatCurrency(ac.cash),
          formatCurrency(ac.card),
          formatCurrency(ac.mobile_money),
          formatCurrency(ac.credit),
          formatCurrency(ac.total)
        ]),
        foot: [['TOTAL', formatCurrency(collectionTotals.cash), formatCurrency(collectionTotals.card), formatCurrency(collectionTotals.mobile_money), formatCurrency(collectionTotals.credit), formatCurrency(collectionTotals.total)]],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold', fontSize: 8 },
        margin: { left: 14, right: 14 }
      })
      yPos = (doc as any).lastAutoTable.finalY + 10
    } else {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.text("No collection records found for this date", 14, yPos + 4)
      yPos += 14
    }

    if (yPos > 240) { doc.addPage(); yPos = 20 }
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("4. BANKING SUMMARY", 14, yPos)
    yPos += 4

    if (data.banking_entries.length > 0) {
      const totalBanked = data.banking_entries.reduce((sum, b) => sum + b.amount, 0)
      autoTable(doc, {
        startY: yPos,
        head: [['Account', 'Bank', 'Amount', 'Notes']],
        body: data.banking_entries.map(b => [
          b.account_name,
          b.bank_name || '-',
          formatCurrency(b.amount),
          b.notes || '-'
        ]),
        foot: [['TOTAL BANKED', '', formatCurrency(totalBanked), '']],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold', fontSize: 8 },
        margin: { left: 14, right: 14 }
      })
    } else {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.text("No banking records found for this date", 14, yPos + 4)
    }

    doc.save(`DSSR_${data.branch_name}_${data.date}.pdf`)
  }

  const handleExportExcel = () => {
    if (!data) return

    const wb = XLSX.utils.book_new()
    const reportDate = new Date(data.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const nozzleData = [
      ['DAILY SALES SUMMARY REPORT (DSSR)'],
      [`Date: ${reportDate}`],
      [`Branch: ${data.branch_name}`],
      [],
      ['1. WHITE PRODUCT METER SALES'],
      ['Nozzle', 'Fuel Type', 'Closing Meter', 'Opening Meter', 'Throughput', 'RTT', 'Pump Sales'],
      ...data.nozzle_readings.map(n => [
        n.nozzle_name, n.fuel_type, n.closing_meter, n.opening_meter, n.throughput, n.rtt, n.pump_sales
      ]),
      [],
      ['F) TOTAL VOLUME PER PRODUCT'],
      ['Product', 'Total Throughput', 'Total RTT', 'Total Pump Sales (L)'],
      ...data.product_nozzle_totals.map(p => [p.product, p.throughput, p.rtt, p.pump_sales]),
      [],
      ['G) AMOUNT PER PRODUCT'],
      ['Product', 'Volume (L)', 'Price/L (KES)', 'Amount (KES)'],
      ...data.product_nozzle_totals.map(p => [p.product, p.pump_sales, p.price_per_litre || 0, p.amount || (p.pump_sales * (p.price_per_litre || 0))])
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(nozzleData)
    ws1['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Nozzle Sales')

    const movementData = [
      ['2. WHITE PRODUCT MOVEMENT'],
      ['Product', 'Opening Stock', 'Offloaded', 'Closing Stock', 'Tank Sales', 'Pump Sales', 'Variance', 'Variance %'],
      ...data.product_movement.map(p => [
        p.product, p.opening_stock, p.offloaded_volume, p.closing_stock, p.tank_sales, p.pump_sales, p.variance, `${p.variance_percent.toFixed(2)}%`
      ])
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(movementData)
    ws2['!cols'] = [{ wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Product Movement')

    const collectionTotals = data.attendant_collections.reduce((acc, ac) => ({
      cash: acc.cash + ac.cash, card: acc.card + ac.card,
      mobile_money: acc.mobile_money + ac.mobile_money, credit: acc.credit + ac.credit, total: acc.total + ac.total
    }), { cash: 0, card: 0, mobile_money: 0, credit: 0, total: 0 })

    const collectionData = [
      ['3. COLLECTION SUMMARY'],
      ['Attendant', 'Cash', 'Card', 'Mobile Money', 'Credit', 'Total'],
      ...data.attendant_collections.map(ac => [
        ac.staff_name, ac.cash, ac.card, ac.mobile_money, ac.credit, ac.total
      ]),
      ['TOTAL', collectionTotals.cash, collectionTotals.card, collectionTotals.mobile_money, collectionTotals.credit, collectionTotals.total]
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(collectionData)
    ws3['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Collections')

    const totalBanked = data.banking_entries.reduce((sum, b) => sum + b.amount, 0)
    const bankingData = [
      ['4. BANKING SUMMARY'],
      ['Account', 'Bank', 'Amount', 'Notes'],
      ...data.banking_entries.map(b => [b.account_name, b.bank_name || '-', b.amount, b.notes || '-']),
      ['TOTAL BANKED', '', totalBanked, '']
    ]
    const ws4 = XLSX.utils.aoa_to_sheet(bankingData)
    ws4['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }]
    XLSX.utils.book_append_sheet(wb, ws4, 'Banking')

    XLSX.writeFile(wb, `DSSR_${data.branch_name}_${data.date}.xlsx`)
  }

  const getVarianceColor = (variance: number, variancePercent: number) => {
    if (Math.abs(variancePercent) <= 0.5) return "text-green-600"
    if (variance > 0) return "text-amber-600"
    return "text-red-600"
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
                    <Fuel className="h-8 w-8 text-blue-600" />
                    Daily Sales Summary Report (DSSR)
                  </h1>
                  <p className="text-slate-600 mt-1">Comprehensive daily fuel station performance summary</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={fetchDSSR} disabled={loading}>
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

              <Card className="rounded-2xl print:hidden">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="date" className="text-sm font-medium text-slate-700">Report Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={fetchDSSR} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading DSSR data...</span>
                </div>
              ) : !data ? (
                <Card className="rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <Fuel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No data available for the selected date</p>
                    <p className="text-sm text-slate-500 mt-1">Try selecting a different date or ensure shifts have been recorded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6 print:space-y-4">
                  <div className="text-center print:block hidden mb-4">
                    <h1 className="text-xl font-bold">DAILY STATION STATUS REPORT (DSSR)</h1>
                    <p className="text-sm">{data.branch_name}</p>
                    <p className="text-sm">{new Date(data.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        WHITE PRODUCT METER SALES
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm table-auto">
                          <thead>
                            <tr className="bg-slate-100 border-y text-xs">
                              <th className="text-left py-2 px-4 font-semibold whitespace-nowrap">NOZZLES</th>
                              {data.nozzle_readings.map(n => (
                                <th key={n.nozzle_id} className="text-right py-2 px-4 font-semibold min-w-[100px] whitespace-nowrap">
                                  {n.nozzle_name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">A) Closing Meter</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">{formatNumber(n.closing_meter)}</td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">B) Opening</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">{formatNumber(n.opening_meter)}</td>
                              ))}
                            </tr>
                            <tr className="border-b bg-slate-50">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">C) Thro'put (A-B)</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-semibold">{formatNumber(n.throughput)}</td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">D) RTT</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">{formatNumber(n.rtt)}</td>
                              ))}
                            </tr>
                            <tr className="border-b bg-blue-50">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">E) Pump Sales (C-D)</td>
                              {data.nozzle_readings.map(n => (
                                <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-semibold text-blue-700">{formatNumber(n.pump_sales)}</td>
                              ))}
                            </tr>
                            <tr className="border-b bg-slate-100">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">F) Total Volume Per Product</td>
                              {(() => {
                                const seenProducts = new Set<string>()
                                return data.nozzle_readings.map((n, idx) => {
                                  if (seenProducts.has(n.fuel_type)) {
                                    if (idx === data.nozzle_readings.length - 1) {
                                      const totalVolume = data.product_nozzle_totals.reduce((sum, p) => sum + p.pump_sales, 0)
                                      return (
                                        <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-bold bg-slate-200">
                                          {formatNumber(totalVolume)} L
                                        </td>
                                      )
                                    }
                                    return <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">-</td>
                                  }
                                  seenProducts.add(n.fuel_type)
                                  const productTotal = data.product_nozzle_totals.find(p => p.product === n.fuel_type)
                                  return (
                                    <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-semibold">
                                      {productTotal ? `${formatNumber(productTotal.pump_sales)} L` : '-'}
                                    </td>
                                  )
                                })
                              })()}
                            </tr>
                            <tr className="border-b bg-green-50">
                              <td className="py-2 px-4 font-medium whitespace-nowrap">G) Amount Per Product</td>
                              {(() => {
                                const seenProducts = new Set<string>()
                                return data.nozzle_readings.map((n, idx) => {
                                  if (seenProducts.has(n.fuel_type)) {
                                    if (idx === data.nozzle_readings.length - 1) {
                                      const totalAmount = data.product_nozzle_totals.reduce((sum, p) => sum + p.amount, 0)
                                      return (
                                        <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-bold text-green-800 bg-green-100">
                                          KES {formatNumber(totalAmount)}
                                        </td>
                                      )
                                    }
                                    return <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono">-</td>
                                  }
                                  seenProducts.add(n.fuel_type)
                                  const productTotal = data.product_nozzle_totals.find(p => p.product === n.fuel_type)
                                  return (
                                    <td key={n.nozzle_id} className="text-right py-2 px-4 font-mono font-semibold text-green-700">
                                      {productTotal ? `KES ${formatNumber(productTotal.amount)}` : '-'}
                                    </td>
                                  )
                                })
                              })()}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        WHITE PRODUCT MOVEMENT
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100 border-y text-xs">
                              <th className="text-left py-2 px-3 font-semibold">PRODUCT</th>
                              <th className="text-right py-2 px-3 font-semibold">OPENING STOCK</th>
                              <th className="text-right py-2 px-3 font-semibold">OFFLOADED VOLUME</th>
                              <th className="text-right py-2 px-3 font-semibold">CLOSING STOCK</th>
                              <th className="text-right py-2 px-3 font-semibold">TANK SALES</th>
                              <th className="text-right py-2 px-3 font-semibold">PUMP SALES</th>
                              <th className="text-right py-2 px-3 font-semibold">VARIANCE</th>
                              <th className="text-right py-2 px-3 font-semibold">DAILY %</th>
                              <th className="text-center py-2 px-3 font-semibold">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.product_movement.map(p => (
                              <tr key={p.product} className="border-b hover:bg-slate-50">
                                <td className="py-2 px-3 font-medium">{p.product}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.opening_stock)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.offloaded_volume)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.closing_stock)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.tank_sales)}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(p.pump_sales)}</td>
                                <td className={`text-right py-2 px-3 font-mono font-semibold ${getVarianceColor(p.variance, p.variance_percent)}`}>
                                  {formatNumber(p.variance)}
                                </td>
                                <td className={`text-right py-2 px-3 font-mono ${getVarianceColor(p.variance, p.variance_percent)}`}>
                                  {formatNumber(p.variance_percent)}%
                                </td>
                                <td className="text-center py-2 px-3">
                                  {Math.abs(p.variance_percent) <= 0.5 ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 inline" />
                                  ) : (
                                    <AlertTriangle className={`h-5 w-5 inline ${p.variance > 0 ? 'text-amber-600' : 'text-red-600'}`} />
                                  )}
                                </td>
                              </tr>
                            ))}
                            {data.product_movement.length > 0 && (
                              <tr className="bg-slate-100 font-bold">
                                <td className="py-2 px-3">TOTAL</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.opening_stock, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.offloaded_volume, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.closing_stock, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.tank_sales, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.pump_sales, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">{formatNumber(data.product_movement.reduce((s, p) => s + p.variance, 0))}</td>
                                <td className="text-right py-2 px-3 font-mono">-</td>
                                <td></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        COLLECTION SUMMARY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {data.attendant_collections.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-y text-xs">
                                <th className="text-left py-2 px-4 font-semibold">ATTENDANT</th>
                                <th className="text-right py-2 px-4 font-semibold">CASH</th>
                                <th className="text-right py-2 px-4 font-semibold">CARD</th>
                                <th className="text-right py-2 px-4 font-semibold">MOBILE MONEY</th>
                                <th className="text-right py-2 px-4 font-semibold">CREDIT</th>
                                <th className="text-right py-2 px-4 font-semibold">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.attendant_collections.map(ac => (
                                <tr key={ac.staff_id} className="border-b hover:bg-slate-50">
                                  <td className="py-2 px-4 font-medium">{ac.staff_name}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.cash)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.card)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.mobile_money)}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(ac.credit)}</td>
                                  <td className="text-right py-2 px-4 font-mono font-semibold text-blue-700">{formatCurrency(ac.total)}</td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100 font-bold">
                                <td className="py-2 px-4">TOTAL</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.cash, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.card, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.mobile_money, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.credit, 0))}</td>
                                <td className="text-right py-2 px-4 font-mono font-semibold text-blue-700">{formatCurrency(data.attendant_collections.reduce((s, ac) => s + ac.total, 0))}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          No collection records found for this date
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        BANKING SUMMARY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {data.banking_entries.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-y text-xs">
                                <th className="text-left py-2 px-4 font-semibold">ACCOUNT</th>
                                <th className="text-left py-2 px-4 font-semibold">BANK</th>
                                <th className="text-right py-2 px-4 font-semibold">AMOUNT</th>
                                <th className="text-left py-2 px-4 font-semibold">NOTES</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.banking_entries.map(be => (
                                <tr key={be.id} className="border-b hover:bg-slate-50">
                                  <td className="py-2 px-4 font-medium">{be.account_name}</td>
                                  <td className="py-2 px-4 text-slate-600">{be.bank_name}</td>
                                  <td className="text-right py-2 px-4 font-mono">{formatCurrency(be.amount)}</td>
                                  <td className="py-2 px-4 text-slate-600">{be.notes || '-'}</td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100 font-bold">
                                <td className="py-2 px-4" colSpan={2}>TOTAL BANKED</td>
                                <td className="text-right py-2 px-4 font-mono">{formatCurrency(data.banking_entries.reduce((s, be) => s + be.amount, 0))}</td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          No banking records found for this date
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl print:rounded-none print:shadow-none print:border bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">How to read this report:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li><strong>Throughput</strong> = Closing Meter - Opening Meter (total fuel through nozzle)</li>
                        <li><strong>RTT</strong> = Return To Tank (fuel returned, not sold)</li>
                        <li><strong>Pump Sales</strong> = Throughput - RTT (actual fuel sold)</li>
                        <li><strong>Tank Sales</strong> = Opening Stock + Offloaded - Closing Stock</li>
                        <li><strong>Variance</strong> = Pump Sales - Tank Sales (should be near zero)</li>
                        <li className="text-amber-700"><strong>Positive variance</strong> = More fuel sold than expected (potential measurement error)</li>
                        <li className="text-red-700"><strong>Negative variance</strong> = Less fuel sold than expected (potential loss)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground print:hidden">
                Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
