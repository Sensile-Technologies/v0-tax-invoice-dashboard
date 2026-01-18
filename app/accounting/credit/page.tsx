"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, ChevronDown, ChevronRight, DollarSign, CheckCircle, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, subDays } from "date-fns"

interface Transaction {
  id: string
  credit_type: 'sale' | 'collection'
  transaction_date: string
  day: string
  invoice_number?: string
  customer_name?: string
  vehicle_number?: string
  credit_amount: number
  paid_amount: number
  outstanding: number
  item_name?: string
  quantity?: number
  unit_price?: number
  staff_name?: string
  shift_id?: string
}

interface DailySummary {
  date: string
  total_credit: number
  total_paid: number
  outstanding: number
  transactions: Transaction[]
}

interface Branch {
  id: string
  branch_name: string
}

export default function CreditPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [dailyData, setDailyData] = useState<DailySummary[]>([])
  const [totals, setTotals] = useState({ total_credit: 0, total_paid: 0, outstanding: 0 })
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const { toast } = useToast()

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchCreditTransactions()
    }
  }, [selectedBranch, dateRange])

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches", { credentials: "include" })
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setBranches(data.data)
        const stored = localStorage.getItem('selectedBranch') || localStorage.getItem('selected_branch')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.id) {
              setSelectedBranch(parsed.id)
              return
            }
          } catch {}
        }
        setSelectedBranch(data.data[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCreditTransactions = async () => {
    if (!selectedBranch) return
    
    setLoading(true)
    try {
      let url = `/api/credit-transactions?branch_id=${selectedBranch}`
      
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
        const endDate = format(new Date(), 'yyyy-MM-dd')
        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
        url += `&start_date=${startDate}&end_date=${endDate}`
      }
      
      const res = await fetch(url, { credentials: "include" })
      const data = await res.json()
      
      if (data.success) {
        setDailyData(data.data.daily || [])
        setTotals(data.data.totals || { total_credit: 0, total_paid: 0, outstanding: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch credit transactions:", error)
      toast({ title: "Error", description: "Failed to load credit data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  const openPaymentDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setPaymentAmount(transaction.outstanding.toFixed(2))
    setPaymentReference("")
    setPaymentNotes("")
    setPaymentDialogOpen(true)
  }

  const handleRecordPayment = async () => {
    if (!selectedTransaction || !paymentAmount) return
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid payment amount", variant: "destructive" })
      return
    }
    
    if (amount > selectedTransaction.outstanding) {
      toast({ title: "Error", description: `Payment cannot exceed outstanding amount (${selectedTransaction.outstanding.toFixed(2)})`, variant: "destructive" })
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch("/api/credit-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          branch_id: selectedBranch,
          credit_type: selectedTransaction.credit_type,
          source_id: selectedTransaction.id,
          source_date: selectedTransaction.day,
          credit_amount: selectedTransaction.credit_amount,
          payment_amount: amount,
          payment_reference: paymentReference,
          payment_notes: paymentNotes
        })
      })
      
      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Payment recorded successfully" })
        setPaymentDialogOpen(false)
        fetchCreditTransactions()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'EEE, MMM d, yyyy')
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
          <DashboardHeader
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Credit Management</h1>
                  <p className="text-muted-foreground">Track credit sales and collections, record payments</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.total_credit)}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Payments Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.total_paid)}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(totals.outstanding)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credit Transactions by Day
                  </CardTitle>
                  <CardDescription>
                    Credit sales and collections grouped by day. Click to expand and record payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : dailyData.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No credit transactions found</p>
                      <p className="text-sm mt-1">Credit sales and collections will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dailyData.map((day) => (
                        <Collapsible
                          key={day.date}
                          open={expandedDays.has(day.date)}
                          onOpenChange={() => toggleDay(day.date)}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                              <div className="flex items-center gap-3">
                                {expandedDays.has(day.date) ? (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-semibold">{formatDate(day.date)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {day.transactions.length} transaction{day.transactions.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-right">
                                  <div className="text-muted-foreground">Credit</div>
                                  <div className="font-semibold text-blue-600">{formatCurrency(day.total_credit)}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-muted-foreground">Paid</div>
                                  <div className="font-semibold text-green-600">{formatCurrency(day.total_paid)}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-muted-foreground">Outstanding</div>
                                  <div className={`font-semibold ${day.outstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {formatCurrency(day.outstanding)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 border rounded-xl overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-50">
                                    <TableHead>Type</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead className="text-right">Credit Amount</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                    <TableHead className="text-right">Outstanding</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {day.transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                      <TableCell>
                                        <Badge variant={tx.credit_type === 'sale' ? 'default' : 'secondary'}>
                                          {tx.credit_type === 'sale' ? 'Invoice' : 'Collection'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {tx.credit_type === 'sale' ? (
                                          <div>
                                            <div className="font-medium">{tx.invoice_number || 'N/A'}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {tx.customer_name || 'Walk-in'} {tx.vehicle_number && `| ${tx.vehicle_number}`}
                                            </div>
                                            {tx.item_name && (
                                              <div className="text-xs text-muted-foreground">
                                                {tx.quantity} x {tx.item_name} @ {formatCurrency(tx.unit_price || 0)}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="font-medium">{tx.staff_name || 'Unknown Staff'}</div>
                                            <div className="text-sm text-muted-foreground">Shift Collection</div>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(tx.credit_amount)}
                                      </TableCell>
                                      <TableCell className="text-right text-green-600">
                                        {formatCurrency(tx.paid_amount)}
                                      </TableCell>
                                      <TableCell className="text-right font-medium text-orange-600">
                                        {formatCurrency(tx.outstanding)}
                                      </TableCell>
                                      <TableCell>
                                        {tx.outstanding <= 0 ? (
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Paid
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {tx.outstanding > 0 && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openPaymentDialog(tx)}
                                          >
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            Pay
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment against this credit transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-100 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Type:</span>
                  <span className="font-medium capitalize">{selectedTransaction.credit_type}</span>
                </div>
                {selectedTransaction.invoice_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice:</span>
                    <span className="font-medium">{selectedTransaction.invoice_number}</span>
                  </div>
                )}
                {selectedTransaction.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{selectedTransaction.customer_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Amount:</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.credit_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedTransaction.paid_amount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-bold text-orange-600">{formatCurrency(selectedTransaction.outstanding)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Payment Amount *</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter payment amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_reference">Payment Reference</Label>
                <Input
                  id="payment_reference"
                  placeholder="e.g., MPESA confirmation code, cheque number"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_notes">Notes</Label>
                <Textarea
                  id="payment_notes"
                  placeholder="Optional notes about this payment"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
