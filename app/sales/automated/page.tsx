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

const PAGE_SIZE = 50

export default function AutomatedSalesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { formatCurrency } = useCurrency()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    status: "all",
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
  }, [currentPage, filters])

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

      const salesRes = await fetch(`/api/sales?branch_id=${branchId}&is_automated=true&start_date=${filters.startDate}&end_date=${filters.endDate}${filters.status !== 'all' ? `&transmission_status=${filters.status}` : ''}`)
      const salesResult = await salesRes.json()

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
      toast.error("Failed to load automated sales data")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0)
  const pendingCount = sales.filter((s) => s.transmission_status === "pending").length
  const transmittedCount = sales.filter((s) => s.transmission_status === "transmitted").length
  const flaggedCount = sales.filter((s) => s.transmission_status === "flagged").length

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
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col ml-8 my-6 mr-6">
        <div className="bg-white rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Automated Sales</h2>
                  <p className="text-slate-600">Sales transactions posted automatically from external systems</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Automated Sales Log</CardTitle>
                      <CardDescription>Transactions automatically posted from external systems</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center ml-auto">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="start-date" className="text-sm whitespace-nowrap">From:</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                          className="w-40 h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="end-date" className="text-sm whitespace-nowrap">To:</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                          className="w-40 h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="status-filter" className="text-sm whitespace-nowrap">Status:</Label>
                        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                          <SelectTrigger id="status-filter" className="w-32 h-9">
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sales.length === 0 ? (
                      <div className="text-center py-12">
                        <Zap className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">No automated sales found</p>
                        <p className="text-sm text-slate-400 mt-2">
                          Automated sales appear here when they are posted from external systems like POS terminals or fuel management systems.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table className="w-full">
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
                            {sales.map((sale) => {
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

      <Dialog open={creditNoteDialogOpen} onOpenChange={setCreditNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Credit Note</DialogTitle>
            <DialogDescription>
              Create a credit note for invoice {selectedSaleForCreditNote?.invoice_number || selectedSaleForCreditNote?.receipt_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Original Amount</Label>
              <p className="text-lg font-semibold">{formatCurrency(selectedSaleForCreditNote?.total_amount || 0)}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Refund Type</Label>
              <RadioGroup 
                value={creditNoteForm.refundType} 
                onValueChange={(value: "full" | "partial") => setCreditNoteForm({...creditNoteForm, refundType: value})}
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
                <Label htmlFor="partialAmount">Refund Amount</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={creditNoteForm.partialAmount}
                  onChange={(e) => setCreditNoteForm({...creditNoteForm, partialAmount: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reasonCode">Reason Code</Label>
              <Select value={creditNoteForm.reasonCode} onValueChange={(value) => setCreditNoteForm({...creditNoteForm, reasonCode: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Wrong Quantity Dispensed</SelectItem>
                  <SelectItem value="02">Wrong Fuel Type</SelectItem>
                  <SelectItem value="03">Customer Request</SelectItem>
                  <SelectItem value="04">Pricing Error</SelectItem>
                  <SelectItem value="05">System Error</SelectItem>
                  <SelectItem value="06">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={creditNoteForm.notes}
                onChange={(e) => setCreditNoteForm({...creditNoteForm, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditNoteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitCreditNote} 
              disabled={issuingCreditNote === selectedSaleForCreditNote?.id}
            >
              {issuingCreditNote === selectedSaleForCreditNote?.id ? "Processing..." : "Issue Credit Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
