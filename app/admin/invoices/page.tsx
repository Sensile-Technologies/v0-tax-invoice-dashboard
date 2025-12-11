"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  FileText, Plus, Search, Calendar, Building2, Copy, 
  RefreshCcw, CreditCard, Trash2, Edit2, DollarSign,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Invoice {
  id: string
  invoice_number: string
  vendor_id: string
  vendor_name: string
  branch_name: string
  status: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  is_recurring: boolean
  recurring_interval: string
  next_invoice_date: string
  created_at: string
}

interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: string
  reference_number: string
  notes: string
  created_at: string
  invoice_number?: string
  vendor_name?: string
}

interface BillingProduct {
  id: string
  name: string
  description: string
  product_type: string
  default_amount: number
  is_active: boolean
}

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState("invoices")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [billingProducts, setBillingProducts] = useState<BillingProduct[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [newInvoice, setNewInvoice] = useState({
    vendor_id: "",
    due_date: "",
    notes: "",
    is_recurring: false,
    recurring_interval: "annually",
    line_items: [] as any[]
  })
  const [newPayment, setNewPayment] = useState({
    invoice_id: "",
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "bank_transfer",
    reference_number: "",
    notes: ""
  })

  useEffect(() => {
    fetchInvoices()
    fetchVendors()
    fetchBillingProducts()
    fetchPayments()
  }, [statusFilter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/admin/invoices?${params}`)
      const data = await response.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      const data = await response.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching payments:", error)
      setPayments([])
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/admin/vendors")
      const data = await response.json()
      setVendors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching vendors:", error)
      setVendors([])
    }
  }

  const fetchBillingProducts = async () => {
    try {
      const response = await fetch("/api/db/billing_products")
      const data = await response.json()
      setBillingProducts(Array.isArray(data) ? data.filter((p: BillingProduct) => p.is_active) : [])
    } catch (error) {
      console.error("Error fetching billing products:", error)
      setBillingProducts([])
    }
  }

  const handleAddLineItem = (product: BillingProduct) => {
    const isSubscription = product.product_type.includes('subscription')
    setNewInvoice({
      ...newInvoice,
      line_items: [...newInvoice.line_items, {
        product_id: product.id,
        description: product.name,
        product_type: product.product_type,
        quantity: isSubscription ? 12 : 1,
        unit_price: Number(product.default_amount),
        tax_rate: 16
      }]
    })
  }

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    const items = [...newInvoice.line_items]
    items[index] = { ...items[index], [field]: value }
    setNewInvoice({ ...newInvoice, line_items: items })
  }

  const handleRemoveLineItem = (index: number) => {
    const items = [...newInvoice.line_items]
    items.splice(index, 1)
    setNewInvoice({ ...newInvoice, line_items: items })
  }

  const handleCreateInvoice = async () => {
    if (!newInvoice.vendor_id) {
      toast.error("Please select a vendor")
      return
    }

    if (newInvoice.line_items.length === 0) {
      toast.error("Please add at least one line item")
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newInvoice, 
          created_by: user.id,
          issue_date: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) throw new Error("Failed to create invoice")

      toast.success("Invoice created successfully")
      setDialogOpen(false)
      resetInvoiceForm()
      fetchInvoices()
    } catch (error) {
      toast.error("Failed to create invoice")
    }
  }

  const handleDuplicateInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/duplicate`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to duplicate invoice")
      toast.success("Invoice duplicated successfully")
      fetchInvoices()
    } catch (error) {
      toast.error("Failed to duplicate invoice")
    }
  }

  const handleRecordPayment = async () => {
    if (!newPayment.invoice_id || !newPayment.amount) {
      toast.error("Please select an invoice and enter an amount")
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPayment, created_by: user.id })
      })

      if (!response.ok) throw new Error("Failed to record payment")

      toast.success("Payment recorded successfully")
      setPaymentDialogOpen(false)
      resetPaymentForm()
      fetchPayments()
      fetchInvoices()
    } catch (error) {
      toast.error("Failed to record payment")
    }
  }

  const resetInvoiceForm = () => {
    setNewInvoice({
      vendor_id: "",
      due_date: "",
      notes: "",
      is_recurring: false,
      recurring_interval: "annually",
      line_items: []
    })
  }

  const resetPaymentForm = () => {
    setNewPayment({
      invoice_id: "",
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: "bank_transfer",
      reference_number: "",
      notes: ""
    })
    setSelectedInvoice(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-slate-100 text-slate-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "paid": return "bg-green-100 text-green-800"
      case "overdue": return "bg-red-100 text-red-800"
      case "partial": return "bg-blue-100 text-blue-800"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case "setup": return "Setup"
      case "one_off_manual": return "One-off (Manual)"
      case "one_off_automated": return "One-off (Auto)"
      case "subscription_monthly_manual": return "Monthly (Manual)"
      case "subscription_monthly_automated": return "Monthly (Auto)"
      default: return type
    }
  }

  const filteredInvoices = invoices.filter(i => 
    i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    i.vendor_name?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingInvoices = invoices.filter(i => i.status === "pending" || i.status === "partial")

  const lineItemsTotal = newInvoice.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
          <p className="text-slate-600 mt-1">Manage invoices and payments</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Generate a new invoice for a vendor</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vendor</Label>
                      <Select
                        value={newInvoice.vendor_id}
                        onValueChange={(v) => setNewInvoice({ ...newInvoice, vendor_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={newInvoice.due_date}
                        onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                    <Checkbox
                      id="recurring"
                      checked={newInvoice.is_recurring}
                      onCheckedChange={(checked) => setNewInvoice({ ...newInvoice, is_recurring: !!checked })}
                    />
                    <Label htmlFor="recurring" className="flex-1">
                      <span className="font-medium">Recurring Invoice</span>
                      <p className="text-sm text-slate-500">Automatically generate this invoice on the due date</p>
                    </Label>
                    {newInvoice.is_recurring && (
                      <Select
                        value={newInvoice.recurring_interval}
                        onValueChange={(v) => setNewInvoice({ ...newInvoice, recurring_interval: v })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Add Products/Services</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {billingProducts.map((product) => (
                        <Button
                          key={product.id}
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto py-2"
                          onClick={() => handleAddLineItem(product)}
                        >
                          <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-slate-500">
                              {getProductTypeLabel(product.product_type)} - {formatCurrency(Number(product.default_amount))}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {newInvoice.line_items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Description</th>
                            <th className="text-left p-3 text-sm font-medium w-24">Type</th>
                            <th className="text-right p-3 text-sm font-medium w-20">Qty</th>
                            <th className="text-right p-3 text-sm font-medium w-32">Unit Price</th>
                            <th className="text-right p-3 text-sm font-medium w-28">Amount</th>
                            <th className="p-3 w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {newInvoice.line_items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <Input
                                  value={item.description}
                                  onChange={(e) => handleUpdateLineItem(index, "description", e.target.value)}
                                  className="h-8"
                                />
                              </td>
                              <td className="p-2">
                                <Badge variant="outline" className="text-xs">
                                  {getProductTypeLabel(item.product_type)}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateLineItem(index, "quantity", Number(e.target.value))}
                                  className="h-8 text-right"
                                  min={1}
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={item.unit_price}
                                  onChange={(e) => handleUpdateLineItem(index, "unit_price", Number(e.target.value))}
                                  className="h-8 text-right"
                                  min={0}
                                />
                              </td>
                              <td className="p-3 text-right font-medium">
                                {formatCurrency(item.quantity * item.unit_price)}
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveLineItem(index)}
                                  className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t bg-slate-50">
                            <td colSpan={4} className="p-3 text-right font-medium">Subtotal</td>
                            <td className="p-3 text-right font-bold">{formatCurrency(lineItemsTotal)}</td>
                            <td></td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td colSpan={4} className="p-3 text-right font-medium">VAT (16%)</td>
                            <td className="p-3 text-right font-bold">{formatCurrency(lineItemsTotal * 0.16)}</td>
                            <td></td>
                          </tr>
                          <tr className="bg-blue-50">
                            <td colSpan={4} className="p-3 text-right font-bold text-blue-900">Total</td>
                            <td className="p-3 text-right font-bold text-blue-900">{formatCurrency(lineItemsTotal * 1.16)}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newInvoice.notes}
                      onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                      placeholder="Additional notes for this invoice..."
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleCreateInvoice} className="w-full">
                    Create Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold">{invoice.invoice_number}</span>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          {invoice.is_recurring && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <RefreshCcw className="h-3 w-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {invoice.vendor_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(Number(invoice.total_amount))}
                        </p>
                        {Number(invoice.paid_amount) > 0 && (
                          <p className="text-sm text-green-600">
                            Paid: {formatCurrency(Number(invoice.paid_amount))}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateInvoice(invoice)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setNewPayment({
                              ...newPayment,
                              invoice_id: invoice.id,
                              amount: Number(invoice.total_amount) - Number(invoice.paid_amount || 0)
                            })
                            setPaymentDialogOpen(true)
                          }}
                          title="Record Payment"
                          disabled={invoice.status === "paid"}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search payments..."
                className="pl-10"
              />
            </div>
            <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
              setPaymentDialogOpen(open)
              if (!open) resetPaymentForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>Add a payment for an invoice</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Invoice</Label>
                    <Select
                      value={newPayment.invoice_id}
                      onValueChange={(v) => {
                        const inv = pendingInvoices.find(i => i.id === v)
                        setSelectedInvoice(inv || null)
                        setNewPayment({
                          ...newPayment,
                          invoice_id: v,
                          amount: inv ? Number(inv.total_amount) - Number(inv.paid_amount || 0) : 0
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingInvoices.map((inv) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            {inv.invoice_number} - {inv.vendor_name} ({formatCurrency(Number(inv.total_amount) - Number(inv.paid_amount || 0))} due)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedInvoice && (
                    <div className="p-3 bg-slate-50 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">{formatCurrency(Number(selectedInvoice.total_amount))}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Paid:</span>
                        <span className="font-medium">{formatCurrency(Number(selectedInvoice.paid_amount || 0))}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(Number(selectedInvoice.total_amount) - Number(selectedInvoice.paid_amount || 0))}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={newPayment.payment_date}
                        onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={newPayment.payment_method}
                        onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reference Number</Label>
                      <Input
                        value={newPayment.reference_number}
                        onChange={(e) => setNewPayment({ ...newPayment, reference_number: e.target.value })}
                        placeholder="Transaction ID / Receipt #"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleRecordPayment} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{payment.invoice_number}</div>
                        <div className="text-sm text-slate-500">
                          {payment.vendor_name} - {payment.payment_method?.replace('_', ' ')}
                          {payment.reference_number && ` (${payment.reference_number})`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        +{formatCurrency(Number(payment.amount))}
                      </p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(payment.payment_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No payments recorded yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
