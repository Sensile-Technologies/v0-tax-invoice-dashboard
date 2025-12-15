"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  FileText, Plus, ArrowLeft, Trash2, Loader2
} from "lucide-react"
import { toast } from "sonner"

interface BillingProduct {
  id: string
  name: string
  description: string
  product_type: string
  default_amount: number
  is_active: boolean
}

interface LineItem {
  id?: string
  product_id?: string
  description: string
  product_type?: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount: number
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [billingProducts, setBillingProducts] = useState<BillingProduct[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [includeVat, setIncludeVatState] = useState(true)
  const [invoice, setInvoice] = useState({
    id: "",
    invoice_number: "",
    vendor_id: "",
    merchant_name: "",
    billed_to_contact: "",
    due_date: "",
    notes: "",
    status: "",
    line_items: [] as LineItem[]
  })

  const setIncludeVat = (value: boolean) => {
    setIncludeVatState(value)
    if (invoice.line_items.length > 0) {
      const updatedItems = invoice.line_items.map(item => ({
        ...item,
        tax_rate: value ? 16 : 0
      }))
      setInvoice({ ...invoice, line_items: updatedItems })
    }
  }

  useEffect(() => {
    fetchInvoice()
    fetchBillingProducts()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/invoices/${id}`)
      if (!response.ok) throw new Error("Invoice not found")
      const data = await response.json()
      
      const hasVat = data.line_items?.some((item: any) => item.tax_rate > 0) ?? true
      setIncludeVatState(hasVat)
      
      setInvoice({
        id: data.id,
        invoice_number: data.invoice_number,
        vendor_id: data.vendor_id,
        merchant_name: data.merchant_name || "",
        billed_to_contact: data.billed_to_contact || "",
        due_date: data.due_date ? data.due_date.split('T')[0] : "",
        notes: data.notes || "",
        status: data.status,
        line_items: data.line_items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          description: item.description,
          product_type: item.product_type || "setup",
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_rate: Number(item.tax_rate) || 0,
          discount: Number(item.discount) || 0
        })) || []
      })
    } catch (error) {
      console.error("Error fetching invoice:", error)
      toast.error("Failed to load invoice")
      router.push("/admin/invoices")
    } finally {
      setLoading(false)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case "setup": return "Setup"
      case "one_off_manual": return "One-off (Manual)"
      case "one_off_automated": return "One-off (Auto)"
      case "subscription_monthly_manual": return "Monthly (Manual)"
      case "subscription_monthly_automated": return "Monthly (Auto)"
      default: return type || "Setup"
    }
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
    setInvoice({
      ...invoice,
      line_items: [...invoice.line_items, {
        product_id: product.id,
        description: product.name,
        product_type: product.product_type,
        quantity: isSubscription ? 12 : 1,
        unit_price: Number(product.default_amount),
        tax_rate: includeVat ? 16 : 0,
        discount: 0
      }]
    })
  }

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    const items = [...invoice.line_items]
    items[index] = { ...items[index], [field]: value }
    setInvoice({ ...invoice, line_items: items })
  }

  const handleRemoveLineItem = (index: number) => {
    const items = [...invoice.line_items]
    items.splice(index, 1)
    setInvoice({ ...invoice, line_items: items })
  }

  const handleSaveInvoice = async () => {
    if (invoice.line_items.length === 0) {
      toast.error("Please add at least one line item")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billed_to_contact: invoice.billed_to_contact,
          due_date: invoice.due_date,
          notes: invoice.notes,
          include_vat: includeVat,
          line_items: invoice.line_items
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update invoice")
      }

      toast.success("Invoice updated successfully")
      router.push("/admin/invoices")
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice")
    } finally {
      setSaving(false)
    }
  }

  const lineItemsTotal = invoice.line_items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unit_price
    const discountAmount = subtotal * ((item.discount || 0) / 100)
    return sum + (subtotal - discountAmount)
  }, 0)

  const vatAmount = includeVat ? lineItemsTotal * 0.16 : 0
  const totalAmount = lineItemsTotal + vatAmount

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (invoice.status !== "draft") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/invoices")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cannot Edit Invoice</h2>
            <p className="text-slate-500">
              Only invoices with "draft" status can be edited. This invoice is currently "{invoice.status}".
            </p>
            <Button className="mt-4" onClick={() => router.push("/admin/invoices")}>
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/invoices")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Invoice</h1>
          <p className="text-slate-600 mt-1">
            {invoice.invoice_number} - {invoice.merchant_name}
          </p>
        </div>
        <Badge className="bg-slate-100 text-slate-800">{invoice.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Input value={invoice.merchant_name} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={invoice.due_date}
                onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Billed To (Contact)</Label>
            <Input
              value={invoice.billed_to_contact}
              onChange={(e) => setInvoice({ ...invoice, billed_to_contact: e.target.value })}
              placeholder="Enter contact name, email, or address"
            />
          </div>

          <div className="flex items-center justify-end p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Label htmlFor="vat-toggle" className="font-medium">Include VAT (16%)</Label>
              <Switch
                id="vat-toggle"
                checked={includeVat}
                onCheckedChange={setIncludeVat}
              />
            </div>
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
          </div>

          {invoice.line_items.length > 0 && (
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
                  {invoice.line_items.map((item, index) => {
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
                            {getProductTypeLabel(item.product_type || "")}
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
                  {includeVat && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} className="p-3 text-right font-medium">VAT (16%)</td>
                      <td className="p-3 text-right font-bold">{formatCurrency(vatAmount)}</td>
                      <td></td>
                    </tr>
                  )}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="p-3 text-right font-bold text-blue-900">Total</td>
                    <td className="p-3 text-right font-bold text-blue-900">{formatCurrency(totalAmount)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
              placeholder="Additional notes for this invoice..."
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/invoices")} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveInvoice} className="flex-1" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
