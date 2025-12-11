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
  CheckCircle, Package, MoreVertical, Download
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"

interface Invoice {
  id: string
  invoice_number: string
  vendor_id: string
  merchant_name: string
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
  line_items?: any[]
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
  merchant_name?: string
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
  const [merchants, setMerchants] = useState<any[]>([])
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
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<BillingProduct | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    product_type: "setup",
    default_amount: ""
  })
  const [selectedProductId, setSelectedProductId] = useState("")

  useEffect(() => {
    fetchInvoices()
    fetchMerchants()
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

  const fetchMerchants = async () => {
    try {
      const response = await fetch("/api/admin/vendors")
      const data = await response.json()
      setMerchants(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching merchants:", error)
      setMerchants([])
    }
  }

  const handleExportPDF = async (invoice: Invoice) => {
    try {
      const detailRes = await fetch(`/api/admin/invoices/${invoice.id}`)
      const invoiceDetail = await detailRes.json()
      
      const doc = new jsPDF()
      
      const logoImg = new Image()
      logoImg.src = '/sensile-logo.png'
      
      await new Promise((resolve) => {
        logoImg.onload = resolve
        logoImg.onerror = resolve
      })
      
      try {
        doc.addImage(logoImg, 'PNG', 14, 10, 40, 20)
      } catch (e) {
        doc.setFontSize(20)
        doc.setTextColor(0, 0, 0)
        doc.text('Sensile Technologies', 14, 25)
      }
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('Sensile Technologies Ltd', 140, 15)
      doc.text('P.O. Box 12345, Nairobi', 140, 20)
      doc.text('Email: info@sensiletechnologies.com', 140, 25)
      doc.text('Phone: +254 700 000 000', 140, 30)
      
      doc.setFontSize(24)
      doc.setTextColor(0, 0, 0)
      doc.text('TAX INVOICE', 14, 50)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Invoice #: ${invoice.invoice_number}`, 14, 60)
      doc.text(`Issue Date: ${invoice.issue_date ? format(new Date(invoice.issue_date), 'MMM d, yyyy') : 'N/A'}`, 14, 66)
      doc.text(`Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'N/A'}`, 14, 72)
      
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Bill To:', 14, 85)
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      doc.text(invoice.merchant_name || 'N/A', 14, 92)
      
      const lineItems = invoiceDetail.line_items || []
      const tableData = lineItems.map((item: any) => {
        const subtotal = item.quantity * item.unit_price
        const discount = subtotal * ((item.discount || 0) / 100)
        const amount = subtotal - discount
        return [
          item.description,
          item.quantity.toString(),
          formatCurrency(item.unit_price),
          item.discount ? `${item.discount}%` : '-',
          formatCurrency(amount)
        ]
      })
      
      autoTable(doc, {
        startY: 100,
        head: [['Description', 'Qty', 'Unit Price', 'Discount', 'Amount']],
        body: tableData.length > 0 ? tableData : [['No items', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 }
      })
      
      const finalY = (doc as any).lastAutoTable?.finalY || 150
      
      doc.setFontSize(10)
      doc.text('Subtotal:', 140, finalY + 15)
      doc.text(formatCurrency(Number(invoice.subtotal)), 180, finalY + 15, { align: 'right' })
      
      doc.text('VAT (16%):', 140, finalY + 22)
      doc.text(formatCurrency(Number(invoice.tax_amount)), 180, finalY + 22, { align: 'right' })
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Total:', 140, finalY + 32)
      doc.text(formatCurrency(Number(invoice.total_amount)), 180, finalY + 32, { align: 'right' })
      
      if (Number(invoice.paid_amount) > 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(0, 128, 0)
        doc.text('Paid:', 140, finalY + 42)
        doc.text(formatCurrency(Number(invoice.paid_amount)), 180, finalY + 42, { align: 'right' })
        
        doc.setTextColor(255, 0, 0)
        doc.text('Balance Due:', 140, finalY + 49)
        doc.text(formatCurrency(Number(invoice.total_amount) - Number(invoice.paid_amount)), 180, finalY + 49, { align: 'right' })
      }
      
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Thank you for your business!', 105, 280, { align: 'center' })
      doc.text('This is a computer generated invoice.', 105, 285, { align: 'center' })
      
      doc.save(`Invoice-${invoice.invoice_number}.pdf`)
      toast.success('PDF exported successfully')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF')
    }
  }

  const fetchBillingProducts = async () => {
    try {
      const response = await fetch("/api/admin/billing-products")
      const data = await response.json()
      setBillingProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching billing products:", error)
      setBillingProducts([])
    }
  }

  const handleCreateProduct = async () => {
    if (!newProduct.name) {
      toast.error("Please enter a product name")
      return
    }

    try {
      const response = await fetch("/api/admin/billing-products", {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct ? { ...newProduct, id: editingProduct.id, is_active: true } : newProduct)
      })

      if (!response.ok) throw new Error("Failed to save product")

      toast.success(editingProduct ? "Product updated" : "Product created")
      setProductDialogOpen(false)
      resetProductForm()
      fetchBillingProducts()
    } catch (error) {
      toast.error("Failed to save product")
    }
  }

  const handleToggleProductActive = async (product: BillingProduct) => {
    try {
      const response = await fetch("/api/admin/billing-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, is_active: !product.is_active })
      })

      if (!response.ok) throw new Error("Failed to update product")
      toast.success(product.is_active ? "Product deactivated" : "Product activated")
      fetchBillingProducts()
    } catch (error) {
      toast.error("Failed to update product")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/billing-products?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete product")
      toast.success("Product deleted")
      fetchBillingProducts()
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  const openEditProduct = (product: BillingProduct) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description || "",
      product_type: product.product_type,
      default_amount: product.default_amount?.toString() || ""
    })
    setProductDialogOpen(true)
  }

  const resetProductForm = () => {
    setNewProduct({ name: "", description: "", product_type: "setup", default_amount: "" })
    setEditingProduct(null)
  }

  const handleAddSelectedProduct = () => {
    if (!selectedProductId) return
    const product = billingProducts.find(p => p.id === selectedProductId)
    if (product) {
      handleAddLineItem(product)
      setSelectedProductId("")
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
        tax_rate: 16,
        discount: 0
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
    i.merchant_name?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingInvoices = invoices.filter(i => i.status === "pending" || i.status === "partial")

  const lineItemsTotal = newInvoice.line_items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unit_price
    const discountAmount = subtotal * ((item.discount || 0) / 100)
    return sum + (subtotal - discountAmount)
  }, 0)

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
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products/Services
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
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Generate a new invoice for a merchant</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Merchant</Label>
                      <Select
                        value={newInvoice.vendor_id}
                        onValueChange={(v) => setNewInvoice({ ...newInvoice, vendor_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select merchant" />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
                    <div className="flex gap-2">
                      <Select
                        value={selectedProductId}
                        onValueChange={setSelectedProductId}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a product to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingProducts.filter(p => p.is_active).map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex items-center justify-between gap-4">
                                <span>{product.name}</span>
                                <span className="text-xs text-slate-500">
                                  {getProductTypeLabel(product.product_type)} - {formatCurrency(Number(product.default_amount))}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        onClick={handleAddSelectedProduct}
                        disabled={!selectedProductId}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {billingProducts.filter(p => p.is_active).length === 0 && (
                      <p className="text-sm text-slate-500">
                        No products configured. Go to the Products/Services tab to add some.
                      </p>
                    )}
                  </div>

                  {newInvoice.line_items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Description</th>
                            <th className="text-left p-3 text-sm font-medium w-24">Type</th>
                            <th className="text-right p-3 text-sm font-medium w-16">Qty</th>
                            <th className="text-right p-3 text-sm font-medium w-28">Unit Price</th>
                            <th className="text-right p-3 text-sm font-medium w-24">Discount %</th>
                            <th className="text-right p-3 text-sm font-medium w-28">Amount</th>
                            <th className="p-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {newInvoice.line_items.map((item, index) => {
                            const discountAmount = (item.quantity * item.unit_price) * ((item.discount || 0) / 100)
                            const lineTotal = (item.quantity * item.unit_price) - discountAmount
                            return (
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
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    value={item.discount || 0}
                                    onChange={(e) => handleUpdateLineItem(index, "discount", Number(e.target.value))}
                                    className="h-8 text-right"
                                    min={0}
                                    max={100}
                                    placeholder="0"
                                  />
                                </td>
                                <td className="p-3 text-right font-medium">
                                  {formatCurrency(lineTotal)}
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
                            )
                          })}
                          <tr className="border-t bg-slate-50">
                            <td colSpan={5} className="p-3 text-right font-medium">Subtotal</td>
                            <td className="p-3 text-right font-bold">{formatCurrency(lineItemsTotal)}</td>
                            <td></td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td colSpan={5} className="p-3 text-right font-medium">VAT (16%)</td>
                            <td className="p-3 text-right font-bold">{formatCurrency(lineItemsTotal * 0.16)}</td>
                            <td></td>
                          </tr>
                          <tr className="bg-blue-50">
                            <td colSpan={5} className="p-3 text-right font-bold text-blue-900">Total</td>
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
                            {invoice.merchant_name}
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
                          onClick={() => handleExportPDF(invoice)}
                          title="Export PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
                            {inv.invoice_number} - {inv.merchant_name} ({formatCurrency(Number(inv.total_amount) - Number(inv.paid_amount || 0))} due)
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
                          {payment.merchant_name} - {payment.payment_method?.replace('_', ' ')}
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

        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Products & Services</h2>
              <p className="text-sm text-slate-500">Configure billable items for invoices</p>
            </div>
            <Dialog open={productDialogOpen} onOpenChange={(open) => {
              setProductDialogOpen(open)
              if (!open) resetProductForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                  <DialogDescription>Configure a billable product or service</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Setup Fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Initial setup and configuration"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Type</Label>
                      <Select
                        value={newProduct.product_type}
                        onValueChange={(v) => setNewProduct({ ...newProduct, product_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="setup">Setup Fee</SelectItem>
                          <SelectItem value="one_off_manual">One-off (Manual)</SelectItem>
                          <SelectItem value="one_off_automated">One-off (Automated)</SelectItem>
                          <SelectItem value="subscription_monthly_manual">Monthly Subscription (Manual)</SelectItem>
                          <SelectItem value="subscription_monthly_automated">Monthly Subscription (Automated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Amount (KES)</Label>
                      <Input
                        type="number"
                        value={newProduct.default_amount}
                        onChange={(e) => setNewProduct({ ...newProduct, default_amount: e.target.value })}
                        placeholder="10000"
                        min={0}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateProduct} className="w-full">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {billingProducts.map((product) => (
              <Card key={product.id} className={`${!product.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.is_active ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Package className={`h-5 w-5 ${product.is_active ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge variant="outline">{getProductTypeLabel(product.product_type)}</Badge>
                          {!product.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-slate-500 mt-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(Number(product.default_amount))}</p>
                        <p className="text-xs text-slate-500">Default price</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditProduct(product)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleProductActive(product)}>
                            {product.is_active ? (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {billingProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No products configured yet</p>
              <p className="text-sm text-slate-400 mt-1">Add products to use them in invoices</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
