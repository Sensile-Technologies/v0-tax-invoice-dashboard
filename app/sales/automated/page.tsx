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
import { ChevronLeft, ChevronRight, RefreshCw, Zap, Check, X, Printer, MoreVertical, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const PAGE_SIZE = 20

export default function AutomatedSalesPage() {
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
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    status: "all",
    documentType: "all",
    fuelType: "all",
    invoiceNumber: "",
    nozzle: "all",
    paymentMethod: "all",
    loyalty: "all",
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

  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null)

  useEffect(() => {
    const getBranchId = () => {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (currentBranch) {
        try {
          const branchData = JSON.parse(currentBranch)
          return branchData.id
        } catch {
          return null
        }
      }
      return null
    }

    const branchId = getBranchId()
    setCurrentBranchId(branchId)

    const handleStorageChange = () => {
      const newBranchId = getBranchId()
      if (newBranchId !== currentBranchId) {
        setCurrentBranchId(newBranchId)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      const newBranchId = getBranchId()
      if (newBranchId && newBranchId !== currentBranchId) {
        setCurrentBranchId(newBranchId)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentBranchId])

  useEffect(() => {
    if (currentBranchId) {
      fetchData()
    }
  }, [currentPage, filters, currentBranchId])

  async function fetchData() {
    try {
      setLoading(true)
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected. Please select a branch from the header.")
        return
      }

      let branchId: string
      try {
        const branchData = JSON.parse(currentBranch)
        branchId = branchData.id
      } catch {
        toast.error("Invalid branch selection. Please reselect your branch.")
        return
      }

      if (!branchId || branchId === "hq") {
        toast.error("Please select a specific branch to view automated sales.")
        return
      }

      const [nozzlesRes, dispensersRes, salesRes] = await Promise.all([
        fetch(`/api/nozzles?branch_id=${branchId}&status=active`),
        fetch(`/api/dispensers?branch_id=${branchId}`),
        fetch(`/api/sales?branch_id=${branchId}&is_automated=true&start_date=${filters.startDate}&end_date=${filters.endDate}&page=${currentPage}&limit=${PAGE_SIZE}${filters.status !== 'all' ? `&transmission_status=${filters.status}` : ''}${filters.fuelType !== 'all' ? `&fuel_type=${filters.fuelType}` : ''}${filters.nozzle !== 'all' ? `&nozzle_id=${filters.nozzle}` : ''}${filters.paymentMethod !== 'all' ? `&payment_method=${filters.paymentMethod}` : ''}`)
      ])
      
      const [nozzlesResult, dispensersResult, salesResult] = await Promise.all([
        nozzlesRes.json(),
        dispensersRes.json(),
        salesRes.json()
      ])

      setNozzles(nozzlesResult.success ? nozzlesResult.data || [] : [])
      setDispensers(dispensersResult.success ? dispensersResult.data || [] : [])

      const salesData = salesResult.success ? salesResult.data || [] : []
      setTotalCount(salesResult.totalCount || salesData.length)

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
      toast.error("Failed to load automated sales data")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  
  const filteredSales = sales.filter((sale) => {
    if (filters.documentType === "invoices" && sale.is_credit_note) return false
    if (filters.documentType === "credit_notes" && !sale.is_credit_note) return false
    if (filters.invoiceNumber) {
      const invoiceMatch = (sale.invoice_number || sale.receipt_number || "")
        .toLowerCase()
        .includes(filters.invoiceNumber.toLowerCase())
      if (!invoiceMatch) return false
    }
    if (filters.loyalty === "loyalty" && !sale.is_loyalty_sale) return false
    if (filters.loyalty === "non-loyalty" && sale.is_loyalty_sale) return false
    return true
  })
  
  const uniqueFuelTypes = Array.from(new Set(sales.map((s) => s.fuel_type).filter(Boolean)))
  const uniqueNozzles = Array.from(new Set(sales.map((s) => s.nozzle_id).filter(Boolean)))
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0)
  const pendingCount = filteredSales.filter((s) => s.transmission_status === "pending").length
  const transmittedCount = filteredSales.filter((s) => s.transmission_status === "transmitted").length
  const flaggedCount = filteredSales.filter((s) => s.transmission_status === "flagged").length

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "transmitted": return "default"
      case "pending": return "secondary"
      case "flagged": return "destructive"
      default: return "secondary"
    }
  }

  async function retryTransmission(saleId: string) {
    toast.info(`Retrying transmission for sale ${saleId}...`)
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

  function getKraStatusBadge(sale: any) {
    const status = sale.kra_status || 'pending'
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Synced</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Automated Sales</h2>
                  <p className="text-slate-600">Sales transactions posted automatically from external systems</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Total Automated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalCount}</div>
                    <p className="text-sm text-slate-500">{formatCurrency(totalRevenue)} revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Transmitted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{transmittedCount}</div>
                    <p className="text-sm text-slate-500">Successfully sent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                    <p className="text-sm text-slate-500">Awaiting transmission</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Flagged
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{flaggedCount}</div>
                    <p className="text-sm text-slate-500">Requires attention</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Automated Sales Log</CardTitle>
                      <CardDescription>Transactions automatically posted from external systems</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="start-date" className="text-sm whitespace-nowrap">From:</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                          className="w-36 h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="end-date" className="text-sm whitespace-nowrap">To:</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                          className="w-36 h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="status-filter" className="text-sm whitespace-nowrap">Status:</Label>
                        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                          <SelectTrigger id="status-filter" className="w-28 h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="transmitted">Transmitted</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="flagged">Flagged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="fuel-filter" className="text-sm whitespace-nowrap">Fuel:</Label>
                        <Select value={filters.fuelType} onValueChange={(value) => setFilters({ ...filters, fuelType: value })}>
                          <SelectTrigger id="fuel-filter" className="w-28 h-9">
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
                      <div className="flex items-center gap-2">
                        <Label htmlFor="nozzle-filter" className="text-sm whitespace-nowrap">Nozzle:</Label>
                        <Select value={filters.nozzle} onValueChange={(value) => setFilters({ ...filters, nozzle: value })}>
                          <SelectTrigger id="nozzle-filter" className="w-28 h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {uniqueNozzles.map((nozzleId) => {
                              const nozzle = nozzles.find((n) => n.id === nozzleId)
                              const dispenser = nozzle ? dispensers.find((d: any) => d.id === nozzle.dispenser_id) : null
                              return (
                                <SelectItem key={nozzleId} value={nozzleId}>
                                  {dispenser && nozzle ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : "Unknown"}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="payment-filter" className="text-sm whitespace-nowrap">Payment:</Label>
                        <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
                          <SelectTrigger id="payment-filter" className="w-28 h-9">
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
                      <div className="flex items-center gap-2">
                        <Label htmlFor="doctype-filter" className="text-sm whitespace-nowrap">Type:</Label>
                        <Select value={filters.documentType} onValueChange={(value) => setFilters({ ...filters, documentType: value })}>
                          <SelectTrigger id="doctype-filter" className="w-32 h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="invoices">Invoices</SelectItem>
                            <SelectItem value="credit_notes">Credit Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="loyalty-filter" className="text-sm whitespace-nowrap">Loyalty:</Label>
                        <Select value={filters.loyalty} onValueChange={(value) => setFilters({ ...filters, loyalty: value })}>
                          <SelectTrigger id="loyalty-filter" className="w-28 h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="loyalty">Loyalty Only</SelectItem>
                            <SelectItem value="non-loyalty">Walk-in</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="invoice-filter" className="text-sm whitespace-nowrap">Invoice:</Label>
                        <Input
                          id="invoice-filter"
                          type="text"
                          placeholder="Search..."
                          value={filters.invoiceNumber}
                          onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                          className="w-28 h-9"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFilters({
                        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                        endDate: new Date().toISOString().split("T")[0],
                        status: "all",
                        documentType: "all",
                        fuelType: "all",
                        invoiceNumber: "",
                        nozzle: "all",
                        paymentMethod: "all",
                        loyalty: "all",
                      })} className="h-9">Clear</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSales.length === 0 ? (
                      <div className="text-center py-12">
                        <Zap className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">No automated sales found</p>
                        <p className="text-sm text-slate-400 mt-2">
                          Automated sales appear here when they are posted from external systems like POS terminals or fuel management systems.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table className="w-full min-w-[900px]">
                          <TableHeader>
                            <TableRow>
                              <TableCell className="text-left p-2">Date</TableCell>
                              <TableCell className="text-left p-2">Invoice No.</TableCell>
                              <TableCell className="text-left p-2">Source</TableCell>
                              <TableCell className="text-left p-2">Fuel Type</TableCell>
                              <TableCell className="text-right p-2">Quantity (L)</TableCell>
                              <TableCell className="text-right p-2">Total</TableCell>
                              <TableCell className="text-center p-2">Transmission</TableCell>
                              <TableCell className="text-center p-2">KRA Status</TableCell>
                              <TableCell className="text-center p-2">Actions</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSales.map((sale) => {
                              return (
                                <TableRow key={sale.id} className="hover:bg-slate-50">
                                  <TableCell className="p-2">
                                    {new Date(sale.sale_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </TableCell>
                                  <TableCell className="p-2 text-sm font-mono">
                                    {sale.invoice_number || sale.receipt_number}
                                  </TableCell>
                                  <TableCell className="p-2 text-sm">
                                    <Badge variant="outline">{sale.source_system || "External"}</Badge>
                                  </TableCell>
                                  <TableCell className="p-2">{sale.fuel_type}</TableCell>
                                  <TableCell className="p-2 text-right">{Number(sale.quantity).toFixed(2)}</TableCell>
                                  <TableCell className="p-2 text-right font-medium">{formatCurrency(sale.total_amount)}</TableCell>
                                  <TableCell className="p-2 text-center">
                                    <Badge variant={getStatusBadgeVariant(sale.transmission_status)} className="capitalize">
                                      {sale.transmission_status || "pending"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="p-2 text-center">
                                    {getKraStatusBadge(sale)}
                                  </TableCell>
                                  <TableCell className="p-2 text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handlePrintReceipt(sale)}>
                                          <Printer className="h-4 w-4 mr-2" />
                                          Print KRA Receipt
                                        </DropdownMenuItem>
                                        {!sale.is_credit_note && !sale.has_credit_note && (
                                          <DropdownMenuItem onClick={() => openCreditNoteDialog(sale)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generate Credit Note
                                          </DropdownMenuItem>
                                        )}
                                        {(sale.transmission_status === "pending" || sale.transmission_status === "flagged") && (
                                          <DropdownMenuItem onClick={() => retryTransmission(sale.id)}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Retry Transmission
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
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-slate-500">
                          Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} entries
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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

      <Dialog open={creditNoteDialogOpen} onOpenChange={setCreditNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Credit Note</DialogTitle>
            <DialogDescription>
              Create a credit note for sale {selectedSaleForCreditNote?.invoice_number || selectedSaleForCreditNote?.receipt_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Type</Label>
              <RadioGroup
                value={creditNoteForm.refundType}
                onValueChange={(value: "full" | "partial") =>
                  setCreditNoteForm({ ...creditNoteForm, refundType: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full">Full Refund</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial">Partial Refund</Label>
                </div>
              </RadioGroup>
            </div>

            {creditNoteForm.refundType === "partial" && (
              <div className="space-y-2">
                <Label htmlFor="partialAmount">Partial Amount</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={creditNoteForm.partialAmount}
                  onChange={(e) =>
                    setCreditNoteForm({ ...creditNoteForm, partialAmount: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reasonCode">Reason Code</Label>
              <Select
                value={creditNoteForm.reasonCode}
                onValueChange={(value) =>
                  setCreditNoteForm({ ...creditNoteForm, reasonCode: value })
                }
              >
                <SelectTrigger id="reasonCode">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Pricing Error</SelectItem>
                  <SelectItem value="02">Quality Issues</SelectItem>
                  <SelectItem value="03">Wrong Product</SelectItem>
                  <SelectItem value="04">Customer Return</SelectItem>
                  <SelectItem value="05">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={creditNoteForm.notes}
                onChange={(e) =>
                  setCreditNoteForm({ ...creditNoteForm, notes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditNoteDialogOpen(false)}>
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
