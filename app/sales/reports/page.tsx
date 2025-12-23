"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/lib/currency-utils"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, FileText, CreditCard, MoreVertical, Printer, Download, FileSpreadsheet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const PAGE_SIZE = 20

export default function SalesReportsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { formatCurrency } = useCurrency()
  const [sales, setSales] = useState<any[]>([])
  const [nozzles, setNozzles] = useState<any[]>([])
  const [dispensers, setDispensers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [filters, setFilters] = useState({
    date: "",
    invoiceNumber: "",
    fuelType: "",
    nozzle: "",
    loyalty: "all",
    paymentMethod: "",
    documentType: "all",
  })
  const [issuingCreditNote, setIssuingCreditNote] = useState<string | null>(null)
  const [creditNoteDialogOpen, setCreditNoteDialogOpen] = useState(false)
  const [selectedSaleForCreditNote, setSelectedSaleForCreditNote] = useState<any>(null)
  const [creditNoteForm, setCreditNoteForm] = useState({
    refundType: "full" as "full" | "partial",
    reasonCode: "01",
    partialAmount: "",
    notes: ""
  })

  useEffect(() => {
    fetchData()
  }, [currentPage])

  async function fetchData() {
    try {
      setLoading(true)
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const [nozzlesRes, dispensersRes, salesRes] = await Promise.all([
        fetch(`/api/nozzles?branch_id=${branchId}&status=active`),
        fetch(`/api/dispensers?branch_id=${branchId}`),
        fetch(`/api/sales?branch_id=${branchId}&page=${currentPage}&limit=${PAGE_SIZE}&is_automated=false`)
      ])

      const [nozzlesResult, dispensersResult, salesResult] = await Promise.all([
        nozzlesRes.json(),
        dispensersRes.json(),
        salesRes.json()
      ])

      setNozzles(nozzlesResult.success ? nozzlesResult.data || [] : [])
      setDispensers(dispensersResult.success ? dispensersResult.data || [] : [])

      const salesData = salesResult.success ? salesResult.data || [] : []
      setTotalCount(salesResult.totalCount || 0)

      const processedSales = salesData.map((sale: any) => ({
        ...sale,
        quantity: Number(sale.quantity) || 0,
        unit_price: Number(sale.unit_price) || 0,
        total_amount: Number(sale.total_amount) || 0,
        meter_reading_after: Number(sale.meter_reading_after) || 0,
      }))
      setSales(processedSales)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load sales data")
    } finally {
      setLoading(false)
    }
  }

  function buildExportUrl(format: string) {
    const currentBranch = localStorage.getItem("selectedBranch")
    if (!currentBranch) return null
    const branchData = JSON.parse(currentBranch)
    
    const params = new URLSearchParams()
    params.set('branch_id', branchData.id)
    params.set('format', format)
    params.set('export', 'true')
    params.set('is_automated', 'false')
    
    if (filters.date) params.set('date', filters.date)
    if (filters.fuelType && filters.fuelType !== 'all') params.set('fuel_type', filters.fuelType)
    if (filters.nozzle && filters.nozzle !== 'all') params.set('nozzle_id', filters.nozzle)
    if (filters.paymentMethod && filters.paymentMethod !== 'all') params.set('payment_method', filters.paymentMethod)
    if (filters.documentType && filters.documentType !== 'all') params.set('document_type', filters.documentType)
    
    return `/api/sales/export?${params.toString()}`
  }

  async function exportToPDF() {
    try {
      const url = buildExportUrl('pdf')
      if (!url) {
        toast.error("No branch selected")
        return
      }
      
      toast.loading("Generating PDF...")
      const response = await fetch(url)
      
      if (!response.ok) throw new Error("Failed to export")
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.dismiss()
      toast.success("PDF downloaded")
    } catch (error) {
      toast.dismiss()
      toast.error("Failed to export PDF")
    }
  }

  async function exportToExcel() {
    try {
      const url = buildExportUrl('excel')
      if (!url) {
        toast.error("No branch selected")
        return
      }
      
      toast.loading("Generating Excel...")
      const response = await fetch(url)
      
      if (!response.ok) throw new Error("Failed to export")
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.dismiss()
      toast.success("Excel downloaded")
    } catch (error) {
      toast.dismiss()
      toast.error("Failed to export Excel")
    }
  }

  const filteredSales = sales.filter((sale) => {
    if (filters.date) {
      const saleDate = new Date(sale.sale_date).toISOString().split("T")[0]
      if (saleDate !== filters.date) return false
    }
    if (filters.invoiceNumber) {
      const invoiceMatch = (sale.invoice_number || sale.receipt_number || "")
        .toLowerCase()
        .includes(filters.invoiceNumber.toLowerCase())
      if (!invoiceMatch) return false
    }
    if (filters.fuelType && filters.fuelType !== "all") {
      if (sale.fuel_type !== filters.fuelType) return false
    }
    if (filters.nozzle && filters.nozzle !== "all") {
      if (sale.nozzle_id !== filters.nozzle) return false
    }
    if (filters.loyalty === "loyalty") {
      if (!sale.is_loyalty_sale) return false
    } else if (filters.loyalty === "non-loyalty") {
      if (sale.is_loyalty_sale) return false
    }
    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      const normalizePaymentMethod = (method: string) => {
        const m = (method || "cash").toLowerCase()
        if (m === "mpesa" || m === "m-pesa" || m === "mobile_money") return "mobile_money"
        if (m === "card") return "card"
        if (m === "credit") return "credit"
        return "cash"
      }
      if (normalizePaymentMethod(sale.payment_method) !== filters.paymentMethod) return false
    }
    if (filters.documentType === "invoices") {
      if (sale.is_credit_note) return false
    } else if (filters.documentType === "credit_notes") {
      if (!sale.is_credit_note) return false
    }
    return true
  })

  const uniqueFuelTypes = Array.from(new Set(sales.map((s) => s.fuel_type)))
  const uniqueNozzles = Array.from(new Set(sales.map((s) => s.nozzle_id)))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "transmitted": return "default"
      case "success": return "default"
      case "pending": return "secondary"
      case "failed": return "destructive"
      case "flagged": return "destructive"
      default: return "secondary"
    }
  }

  function clearFilters() {
    setFilters({ date: "", invoiceNumber: "", fuelType: "", nozzle: "", loyalty: "all", paymentMethod: "", documentType: "all" })
  }

  function openCreditNoteDialog(sale: any) {
    if (sale.is_credit_note) {
      toast.error("Cannot issue credit note for a credit note")
      return
    }
    if (sale.has_credit_note) {
      toast.error("Credit note already issued for this sale")
      return
    }
    setSelectedSaleForCreditNote(sale)
    setCreditNoteForm({
      refundType: "full",
      reasonCode: "01",
      partialAmount: "",
      notes: ""
    })
    setCreditNoteDialogOpen(true)
  }

  async function handleSubmitCreditNote() {
    if (!selectedSaleForCreditNote) return
    
    const sale = selectedSaleForCreditNote
    
    if (creditNoteForm.refundType === "partial") {
      const partialAmt = parseFloat(creditNoteForm.partialAmount)
      if (isNaN(partialAmt) || partialAmt <= 0) {
        toast.error("Please enter a valid partial amount")
        return
      }
      if (partialAmt > Math.abs(parseFloat(sale.total_amount))) {
        toast.error("Partial amount cannot exceed original sale amount")
        return
      }
    }
    
    try {
      setIssuingCreditNote(sale.id)
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        return
      }
      const branchData = JSON.parse(currentBranch)
      
      const response = await fetch('/api/credit-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: sale.id,
          branch_id: branchData.id,
          reason_code: creditNoteForm.reasonCode,
          refund_type: creditNoteForm.refundType,
          partial_amount: creditNoteForm.refundType === "partial" ? parseFloat(creditNoteForm.partialAmount) : null,
          notes: creditNoteForm.notes
        })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to issue credit note')
      }
      
      toast.success(`Credit note ${result.creditNoteNumber} issued successfully`)
      setCreditNoteDialogOpen(false)
      setSelectedSaleForCreditNote(null)
      fetchData()
    } catch (error: any) {
      console.error('Error issuing credit note:', error)
      toast.error(error.message || 'Failed to issue credit note')
    } finally {
      setIssuingCreditNote(null)
    }
  }

  async function handlePrintReceipt(sale: any) {
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        return
      }
      const branchData = JSON.parse(currentBranch)
      
      const response = await fetch('/api/receipt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: sale.id,
          branch_id: branchData.id
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate receipt')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${sale.invoice_number || sale.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Receipt downloaded')
    } catch (error) {
      console.error('Error generating receipt:', error)
      toast.error('Failed to generate receipt')
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-3 md:p-6">
            <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Sales Reports</h2>
                <p className="text-sm md:text-base text-slate-600">View and filter sales transactions</p>
              </div>

              <Card className="rounded-2xl">
                <CardHeader className="p-3 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg md:text-xl">Sales Report</CardTitle>
                      <CardDescription className="text-sm">Fuel sales transactions with filters and pagination</CardDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-2 items-center">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="date-filter" className="text-xs sm:text-sm whitespace-nowrap">Date:</Label>
                        <Input
                          id="date-filter"
                          type="date"
                          value={filters.date}
                          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                          className="w-full sm:w-32 h-8 text-sm"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="invoice-filter" className="text-xs sm:text-sm whitespace-nowrap">Invoice:</Label>
                        <Input
                          id="invoice-filter"
                          type="text"
                          placeholder="Search..."
                          value={filters.invoiceNumber}
                          onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                          className="w-full sm:w-28 h-8 text-sm"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="fuel-filter" className="text-xs sm:text-sm whitespace-nowrap">Fuel:</Label>
                        <Select value={filters.fuelType} onValueChange={(value) => setFilters({ ...filters, fuelType: value })}>
                          <SelectTrigger id="fuel-filter" className="w-full sm:w-28 h-8 text-sm">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {uniqueFuelTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="nozzle-filter" className="text-xs sm:text-sm whitespace-nowrap">Nozzle:</Label>
                        <Select value={filters.nozzle} onValueChange={(value) => setFilters({ ...filters, nozzle: value })}>
                          <SelectTrigger id="nozzle-filter" className="w-full sm:w-28 h-8 text-sm">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {uniqueNozzles.map((nozzleId) => {
                              const nozzle = nozzles.find((n) => n.id === nozzleId)
                              const dispenser = nozzle ? dispensers.find((d) => d.id === nozzle.dispenser_id) : null
                              return (
                                <SelectItem key={nozzleId} value={nozzleId}>
                                  {dispenser && nozzle ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : "Unknown"}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="payment-filter" className="text-xs sm:text-sm whitespace-nowrap">Payment:</Label>
                        <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
                          <SelectTrigger id="payment-filter" className="w-full sm:w-28 h-8 text-sm">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="credit">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="doctype-filter" className="text-xs sm:text-sm whitespace-nowrap">Type:</Label>
                        <Select value={filters.documentType} onValueChange={(value) => setFilters({ ...filters, documentType: value })}>
                          <SelectTrigger id="doctype-filter" className="w-full sm:w-32 h-8 text-sm">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="invoices">Invoices</SelectItem>
                            <SelectItem value="credit_notes">Credit Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <Label htmlFor="loyalty-filter" className="text-xs sm:text-sm whitespace-nowrap">Loyalty:</Label>
                        <Select value={filters.loyalty} onValueChange={(value) => setFilters({ ...filters, loyalty: value })}>
                          <SelectTrigger id="loyalty-filter" className="w-full sm:w-28 h-8 text-sm">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="loyalty">Loyalty Only</SelectItem>
                            <SelectItem value="non-loyalty">Walk-in</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button variant="outline" size="sm" onClick={clearFilters} className="col-span-2 sm:col-span-1 h-8">Clear</Button>
                      <Button variant="outline" size="sm" onClick={exportToPDF} className="h-8">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportToExcel} className="h-8">
                        <FileSpreadsheet className="w-4 h-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  <div className="space-y-4">
                    {filteredSales.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        {sales.length === 0 ? "No sales recorded yet" : "No sales match the current filters"}
                      </p>
                    ) : (
                      <div className="overflow-x-auto -mx-3 md:mx-0">
                        <Table className="w-full min-w-[800px] md:min-w-0">
                          <TableHeader>
                            <TableRow className="text-xs md:text-sm">
                              <TableCell className="text-left p-2">Date</TableCell>
                              <TableCell className="text-left p-2">Invoice</TableCell>
                              <TableCell className="text-left p-2 hidden sm:table-cell">Nozzle</TableCell>
                              <TableCell className="text-left p-2">Fuel</TableCell>
                              <TableCell className="text-right p-2">Qty (L)</TableCell>
                              <TableCell className="text-right p-2 hidden md:table-cell">Unit Price</TableCell>
                              <TableCell className="text-right p-2">Total</TableCell>
                              <TableCell className="text-center p-2 hidden lg:table-cell">Payment</TableCell>
                              <TableCell className="text-center p-2 hidden lg:table-cell">Loyalty</TableCell>
                              <TableCell className="text-right p-2 hidden xl:table-cell">Meter</TableCell>
                              <TableCell className="text-center p-2">Status</TableCell>
                              <TableCell className="text-center p-2">Actions</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSales.map((sale) => {
                              const nozzle = nozzles.find((n) => n.id === sale.nozzle_id)
                              const dispenser = nozzle ? dispensers.find((d) => d.id === nozzle.dispenser_id) : null

                              return (
                                <TableRow key={sale.id} className="hover:bg-slate-50 text-xs md:text-sm">
                                  <TableCell className="p-1 md:p-2">
                                    {new Date(sale.sale_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell className="p-1 md:p-2 font-mono text-xs">
                                    {(sale.invoice_number || sale.receipt_number || "").slice(-8)}
                                  </TableCell>
                                  <TableCell className="p-1 md:p-2 hidden sm:table-cell">
                                    {dispenser && nozzle ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : "-"}
                                  </TableCell>
                                  <TableCell className="p-1 md:p-2">{sale.fuel_type}</TableCell>
                                  <TableCell className="p-1 md:p-2 text-right">{Number(sale.quantity).toFixed(2)}</TableCell>
                                  <TableCell className="p-1 md:p-2 text-right hidden md:table-cell">{formatCurrency(sale.unit_price)}</TableCell>
                                  <TableCell className="p-1 md:p-2 text-right font-medium">{formatCurrency(sale.total_amount)}</TableCell>
                                  <TableCell className="p-1 md:p-2 text-center hidden lg:table-cell">
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {(() => {
                                        const m = (sale.payment_method || "cash").toLowerCase()
                                        if (m === "mpesa" || m === "m-pesa" || m === "mobile_money") return "Mobile"
                                        if (m === "card") return "Card"
                                        if (m === "credit") return "Credit"
                                        return "Cash"
                                      })()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="p-1 md:p-2 text-center hidden lg:table-cell">
                                    {sale.is_loyalty_sale && (
                                      <div className="flex items-center justify-center">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="p-1 md:p-2 text-right font-mono text-xs hidden xl:table-cell">{sale.meter_reading_after.toFixed(2)}</TableCell>
                                  <TableCell className="p-1 md:p-2 text-center">
                                    {sale.kra_status === 'success' ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 md:h-8 md:w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handlePrintReceipt(sale)}
                                        title="Print KRA Receipt"
                                      >
                                        <Printer className="h-4 w-4 md:h-5 md:w-5" />
                                      </Button>
                                    ) : (
                                      <Badge variant={getStatusBadgeVariant(sale.kra_status || sale.transmission_status)} className="capitalize text-xs">
                                        {sale.kra_status || sale.transmission_status || "pending"}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="p-1 md:p-2 text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handlePrintReceipt(sale)}>
                                          <FileText className="h-4 w-4 mr-2" />
                                          View Invoice
                                        </DropdownMenuItem>
                                        {!sale.is_credit_note && (
                                          <DropdownMenuItem 
                                            onClick={() => openCreditNoteDialog(sale)}
                                            disabled={sale.has_credit_note}
                                          >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            {sale.has_credit_note ? "Credit Note Issued" : "Issue Credit Note"}
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-3">
                        <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                          Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="h-8 px-2 sm:px-3"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Previous</span>
                          </Button>
                          <span className="text-xs sm:text-sm text-slate-600">
                            {currentPage}/{totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="h-8 px-2 sm:px-3"
                          >
                            <span className="hidden sm:inline mr-1">Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-foreground">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={creditNoteDialogOpen} onOpenChange={setCreditNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Issue Credit Note</DialogTitle>
            <DialogDescription>
              {selectedSaleForCreditNote && (
                <>
                  Create a credit note for invoice <strong>{selectedSaleForCreditNote.invoice_number}</strong> 
                  {" "}(Amount: {formatCurrency(Math.abs(parseFloat(selectedSaleForCreditNote.total_amount)))})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Refund Type</Label>
              <RadioGroup
                value={creditNoteForm.refundType}
                onValueChange={(value) => setCreditNoteForm({ ...creditNoteForm, refundType: value as "full" | "partial" })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="font-normal cursor-pointer">Full Refund</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial" className="font-normal cursor-pointer">Partial Refund</Label>
                </div>
              </RadioGroup>
            </div>

            {creditNoteForm.refundType === "partial" && (
              <div className="space-y-2">
                <Label htmlFor="partialAmount">Refund Amount (KES)</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedSaleForCreditNote ? Math.abs(parseFloat(selectedSaleForCreditNote.total_amount)) : undefined}
                  placeholder="Enter amount to refund"
                  value={creditNoteForm.partialAmount}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, partialAmount: e.target.value })}
                />
                {selectedSaleForCreditNote && (
                  <p className="text-sm text-muted-foreground">
                    Maximum: {formatCurrency(Math.abs(parseFloat(selectedSaleForCreditNote.total_amount)))}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reasonCode">Reason for Credit Note</Label>
              <Select
                value={creditNoteForm.reasonCode}
                onValueChange={(value) => setCreditNoteForm({ ...creditNoteForm, reasonCode: value })}
              >
                <SelectTrigger id="reasonCode">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Wrong quantity delivered</SelectItem>
                  <SelectItem value="02">Wrong product delivered</SelectItem>
                  <SelectItem value="03">Product returned</SelectItem>
                  <SelectItem value="04">Goods damaged</SelectItem>
                  <SelectItem value="05">Goods rejected</SelectItem>
                  <SelectItem value="06">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes..."
                value={creditNoteForm.notes}
                onChange={(e) => setCreditNoteForm({ ...creditNoteForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreditNoteDialogOpen(false)}
              disabled={issuingCreditNote !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreditNote}
              disabled={issuingCreditNote !== null}
            >
              {issuingCreditNote ? "Issuing..." : "Issue Credit Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
