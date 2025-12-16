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
import { ChevronLeft, ChevronRight, FileText, CreditCard, MoreVertical, Printer } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const PAGE_SIZE = 50

export default function SalesReportsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
        fetch(`/api/sales?branch_id=${branchId}`)
      ])

      const [nozzlesResult, dispensersResult, salesResult] = await Promise.all([
        nozzlesRes.json(),
        dispensersRes.json(),
        salesRes.json()
      ])

      setNozzles(nozzlesResult.success ? nozzlesResult.data || [] : [])
      setDispensers(dispensersResult.success ? dispensersResult.data || [] : [])

      const allSales = salesResult.success ? salesResult.data || [] : []
      setTotalCount(allSales.length)

      const offset = (currentPage - 1) * PAGE_SIZE
      const paginatedSales = allSales.slice(offset, offset + PAGE_SIZE)

      const processedSales = paginatedSales.map((sale: any) => ({
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

  async function handleIssueCreditNote(sale: any) {
    if (sale.is_credit_note) {
      toast.error("Cannot issue credit note for a credit note")
      return
    }
    if (sale.has_credit_note) {
      toast.error("Credit note already issued for this sale")
      return
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
          reason: 'other',
          refund_reason_code: 'other'
        })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to issue credit note')
      }
      
      toast.success(`Credit note ${result.creditNoteNumber} issued successfully`)
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
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col ml-8 my-6 mr-6">
        <div className="bg-white rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Sales Reports</h2>
                <p className="text-slate-600">View and filter sales transactions</p>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Sales Report</CardTitle>
                      <CardDescription>Fuel sales transactions with filters and pagination</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center ml-auto">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="date-filter" className="text-sm whitespace-nowrap">Date:</Label>
                        <Input
                          id="date-filter"
                          type="date"
                          value={filters.date}
                          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                          className="w-40 h-9"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label htmlFor="invoice-filter" className="text-sm whitespace-nowrap">Invoice:</Label>
                        <Input
                          id="invoice-filter"
                          type="text"
                          placeholder="Search..."
                          value={filters.invoiceNumber}
                          onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                          className="w-32 h-9"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label htmlFor="fuel-filter" className="text-sm whitespace-nowrap">Fuel:</Label>
                        <Select value={filters.fuelType} onValueChange={(value) => setFilters({ ...filters, fuelType: value })}>
                          <SelectTrigger id="fuel-filter" className="w-32 h-9">
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
                          <SelectTrigger id="nozzle-filter" className="w-32 h-9">
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

                      <div className="flex items-center gap-2">
                        <Label htmlFor="payment-filter" className="text-sm whitespace-nowrap">Payment:</Label>
                        <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
                          <SelectTrigger id="payment-filter" className="w-32 h-9">
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
                          <SelectTrigger id="doctype-filter" className="w-36 h-9">
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
                          <SelectTrigger id="loyalty-filter" className="w-32 h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="loyalty">Loyalty Only</SelectItem>
                            <SelectItem value="non-loyalty">Walk-in</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button variant="outline" size="sm" onClick={clearFilters}>Clear</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSales.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        {sales.length === 0 ? "No sales recorded yet" : "No sales match the current filters"}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow>
                              <TableCell className="text-left p-2">Date</TableCell>
                              <TableCell className="text-left p-2">Invoice No.</TableCell>
                              <TableCell className="text-left p-2">Nozzle</TableCell>
                              <TableCell className="text-left p-2">Fuel Type</TableCell>
                              <TableCell className="text-right p-2">Quantity (L)</TableCell>
                              <TableCell className="text-right p-2">Unit Price</TableCell>
                              <TableCell className="text-right p-2">Total</TableCell>
                              <TableCell className="text-center p-2">Payment</TableCell>
                              <TableCell className="text-center p-2">Loyalty</TableCell>
                              <TableCell className="text-right p-2">Meter Reading</TableCell>
                              <TableCell className="text-center p-2">Status</TableCell>
                              <TableCell className="text-center p-2">Actions</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSales.map((sale) => {
                              const nozzle = nozzles.find((n) => n.id === sale.nozzle_id)
                              const dispenser = nozzle ? dispensers.find((d) => d.id === nozzle.dispenser_id) : null

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
                                    {dispenser && nozzle ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : "-"}
                                  </TableCell>
                                  <TableCell className="p-2">{sale.fuel_type}</TableCell>
                                  <TableCell className="p-2 text-right">{Number(sale.quantity).toFixed(2)}</TableCell>
                                  <TableCell className="p-2 text-right">{formatCurrency(sale.unit_price)}</TableCell>
                                  <TableCell className="p-2 text-right font-medium">{formatCurrency(sale.total_amount)}</TableCell>
                                  <TableCell className="p-2 text-center">
                                    <Badge variant="outline" className="capitalize">
                                      {(() => {
                                        const m = (sale.payment_method || "cash").toLowerCase()
                                        if (m === "mpesa" || m === "m-pesa" || m === "mobile_money") return "Mobile Money"
                                        if (m === "card") return "Card"
                                        if (m === "credit") return "Credit"
                                        return "Cash"
                                      })()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="p-2 text-center">
                                    {sale.is_loyalty_sale && (
                                      <div className="flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="p-2 text-right font-mono text-sm">{sale.meter_reading_after.toFixed(2)}</TableCell>
                                  <TableCell className="p-2 text-center">
                                    {sale.kra_status === 'success' ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handlePrintReceipt(sale)}
                                        title="Print KRA Receipt"
                                      >
                                        <Printer className="h-5 w-5" />
                                      </Button>
                                    ) : (
                                      <Badge variant={getStatusBadgeVariant(sale.kra_status || sale.transmission_status)} className="capitalize">
                                        {sale.kra_status || sale.transmission_status || "pending"}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="p-2 text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                            onClick={() => handleIssueCreditNote(sale)}
                                            disabled={issuingCreditNote === sale.id || sale.has_credit_note}
                                          >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            {issuingCreditNote === sale.id ? "Issuing..." : sale.has_credit_note ? "Credit Note Issued" : "Issue Credit Note"}
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
                        <p className="text-sm text-slate-600">
                          Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} transactions
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <span className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
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
    </div>
  )
}
