"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  FileText, Plus, ArrowLeft, Trash2
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

export default function CreateInvoicePage() {
  const router = useRouter()
  const [merchants, setMerchants] = useState<any[]>([])
  const [billingProducts, setBillingProducts] = useState<BillingProduct[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [includeVat, setIncludeVatState] = useState(true)
  
  const setIncludeVat = (value: boolean) => {
    setIncludeVatState(value)
    if (newInvoice.line_items.length > 0) {
      const updatedItems = newInvoice.line_items.map(item => ({
        ...item,
        tax_rate: value ? 16 : 0
      }))
      setNewInvoice({ ...newInvoice, line_items: updatedItems })
    }
  }
  const [newInvoice, setNewInvoice] = useState({
    vendor_id: "",
    billed_to_contact: "",
    branch_ids: [] as string[],
    due_date: "",
    notes: "",
    is_recurring: false,
    recurring_interval: "annually",
    line_items: [] as any[]
  })

  useEffect(() => {
    fetchMerchants()
    fetchBillingProducts()
  }, [])

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

  const fetchBranches = async (merchantId: string) => {
    try {
      const response = await fetch(`/api/admin/vendors/${merchantId}/branches`)
      const data = await response.json()
      setBranches(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching branches:", error)
      setBranches([])
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
      default: return type
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
    setNewInvoice({
      ...newInvoice,
      line_items: [...newInvoice.line_items, {
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
      toast.error("Please select a merchant")
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
          include_vat: includeVat,
          created_by: user.id,
          issue_date: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) throw new Error("Failed to create invoice")

      toast.success("Invoice created successfully")
      router.push("/admin/invoices")
    } catch (error) {
      toast.error("Failed to create invoice")
    }
  }

  const lineItemsTotal = newInvoice.line_items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unit_price
    const discountAmount = subtotal * ((item.discount || 0) / 100)
    return sum + (subtotal - discountAmount)
  }, 0)

  const vatAmount = includeVat ? lineItemsTotal * 0.16 : 0
  const totalAmount = lineItemsTotal + vatAmount

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
          <h1 className="text-3xl font-bold text-slate-900">Create Invoice</h1>
          <p className="text-slate-600 mt-1">Generate a new invoice for a merchant</p>
        </div>
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
              <Select
                value={newInvoice.vendor_id}
                onValueChange={(v) => {
                  setNewInvoice({ ...newInvoice, vendor_id: v, branch_ids: [] })
                  fetchBranches(v)
                }}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billed To (Contact)</Label>
              <Input
                value={newInvoice.billed_to_contact}
                onChange={(e) => setNewInvoice({ ...newInvoice, billed_to_contact: e.target.value })}
                placeholder="Enter contact name, email, or address"
              />
              <p className="text-xs text-slate-500">This will appear on the invoice as "Billed To"</p>
            </div>
            <div className="space-y-2">
              <Label>Branches (Optional)</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <div key={branch.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`branch-${branch.id}`}
                        checked={newInvoice.branch_ids.includes(branch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewInvoice({
                              ...newInvoice,
                              branch_ids: [...newInvoice.branch_ids, branch.id]
                            })
                          } else {
                            setNewInvoice({
                              ...newInvoice,
                              branch_ids: newInvoice.branch_ids.filter(id => id !== branch.id)
                            })
                          }
                        }}
                      />
                      <label htmlFor={`branch-${branch.id}`} className="text-sm">
                        {branch.bhf_nm || branch.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-2">
                    {newInvoice.vendor_id ? "No branches found" : "Select a merchant first"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-4">
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

            <div className="flex items-center space-x-3 border-l pl-4 ml-4">
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
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
              placeholder="Additional notes for this invoice..."
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/invoices")} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} className="flex-1">
              Create Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
