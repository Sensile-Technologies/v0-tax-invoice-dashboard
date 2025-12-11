"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { FileText, Plus, Search, Calendar, Building2 } from "lucide-react"
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
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [billingRates, setBillingRates] = useState<any[]>([])
  const [newInvoice, setNewInvoice] = useState({
    vendor_id: "",
    due_date: "",
    notes: "",
    line_items: [] as any[]
  })

  useEffect(() => {
    fetchInvoices()
    fetchVendors()
    fetchBillingRates()
  }, [statusFilter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/admin/invoices?${params}`)
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/admin/vendors")
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  const fetchBillingRates = async () => {
    try {
      const response = await fetch("/api/db/billing_rates")
      const data = await response.json()
      setBillingRates(data)
    } catch (error) {
      console.error("Error fetching billing rates:", error)
    }
  }

  const handleAddLineItem = (rate: any) => {
    setNewInvoice({
      ...newInvoice,
      line_items: [...newInvoice.line_items, {
        description: rate.name,
        quantity: 1,
        unit_price: Number(rate.amount),
        tax_rate: 16
      }]
    })
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
      setNewInvoice({ vendor_id: "", due_date: "", notes: "", line_items: [] })
      fetchInvoices()
    } catch (error) {
      toast.error("Failed to create invoice")
    }
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
      default: return "bg-slate-100 text-slate-800"
    }
  }

  const filteredInvoices = invoices.filter(i => 
    i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    i.vendor_name?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Manage billing and invoices for vendors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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

              <div className="space-y-2">
                <Label>Add Services</Label>
                <div className="flex flex-wrap gap-2">
                  {billingRates.map((rate) => (
                    <Button
                      key={rate.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLineItem(rate)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {rate.name} ({formatCurrency(Number(rate.amount))})
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
                        <th className="text-right p-3 text-sm font-medium">Qty</th>
                        <th className="text-right p-3 text-sm font-medium">Price</th>
                        <th className="text-right p-3 text-sm font-medium">Amount</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newInvoice.line_items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{item.description}</td>
                          <td className="p-3 text-sm text-right">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLineItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-slate-50">
                        <td colSpan={3} className="p-3 text-right font-medium">Subtotal</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(lineItemsTotal)}</td>
                        <td></td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td colSpan={3} className="p-3 text-right font-medium">VAT (16%)</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(lineItemsTotal * 0.16)}</td>
                        <td></td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td colSpan={3} className="p-3 text-right font-bold text-blue-900">Total</td>
                        <td className="p-3 text-right font-bold text-blue-900">{formatCurrency(lineItemsTotal * 1.16)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <Button onClick={handleCreateInvoice} className="w-full">
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
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
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
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
    </div>
  )
}
