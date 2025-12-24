"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Loader2, ClipboardList, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Branch {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

interface Item {
  id: string
  name: string
  unit_price?: number
}

interface POItem {
  item_id: string
  item_name: string
  quantity: number
  unit_price: number
  total_amount: number
}

interface PurchaseOrder {
  id: string
  po_number: string
  branch_id: string
  branch_name: string
  supplier_id: string
  supplier_name: string
  status: string
  expected_delivery: string
  notes: string
  item_count: number
  total_amount: number
  issued_at: string
  created_by_name: string
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [expectedDelivery, setExpectedDelivery] = useState("")
  const [notes, setNotes] = useState("")
  const [poItems, setPoItems] = useState<POItem[]>([])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/headquarters/purchase-orders")
      const result = await response.json()
      if (result.success) {
        setOrders(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBranches = useCallback(async () => {
    try {
      const response = await fetch("/api/branches/list")
      if (response.ok) {
        const data = await response.json()
        setBranches(data || [])
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }, [])

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch("/api/vendors/partners?partner_type=supplier")
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }, [])

  const fetchItems = useCallback(async (branchId: string) => {
    try {
      const response = await fetch(`/api/items?branchId=${branchId}`)
      const result = await response.json()
      if (result.success) {
        setItems(result.items || [])
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchBranches()
    fetchSuppliers()
  }, [fetchOrders, fetchBranches, fetchSuppliers])

  useEffect(() => {
    if (selectedBranch) {
      fetchItems(selectedBranch)
    }
  }, [selectedBranch, fetchItems])

  const addItem = () => {
    setPoItems([...poItems, { item_id: "", item_name: "", quantity: 0, unit_price: 0, total_amount: 0 }])
  }

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    const updated = [...poItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "item_id") {
      const selectedItem = items.find(i => i.id === value)
      if (selectedItem) {
        updated[index].item_name = selectedItem.name
        updated[index].unit_price = selectedItem.unit_price || 0
        updated[index].total_amount = updated[index].quantity * updated[index].unit_price
      }
    }

    if (field === "quantity" || field === "unit_price") {
      updated[index].total_amount = updated[index].quantity * updated[index].unit_price
    }

    setPoItems(updated)
  }

  const removeItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setSelectedBranch("")
    setSelectedSupplier("")
    setExpectedDelivery("")
    setNotes("")
    setPoItems([])
  }

  const handleSubmit = async () => {
    if (!selectedBranch) {
      toast.error("Please select a branch")
      return
    }

    if (poItems.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    const invalidItems = poItems.filter(item => !item.item_name || item.quantity <= 0)
    if (invalidItems.length > 0) {
      toast.error("Please fill in all item details with valid quantities")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/headquarters/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: selectedBranch,
          supplier_id: selectedSupplier || null,
          expected_delivery: expectedDelivery || null,
          notes: notes || null,
          items: poItems
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message || "Purchase order created successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchOrders()
      } else {
        toast.error(result.error || "Failed to create purchase order")
      }
    } catch (error) {
      console.error("Error creating purchase order:", error)
      toast.error("Failed to create purchase order")
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Accepted</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader currentBranch="hq" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/headquarters")}
              className="rounded-xl mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Headquarters
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <ClipboardList className="h-8 w-8" />
              Purchase Orders
            </h1>
            <p className="mt-1 text-muted-foreground">Create and manage purchase orders for branches</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order to be fulfilled at a branch location.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Branch *</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select supplier (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expected Delivery Date</Label>
                    <Input
                      type="date"
                      value={expectedDelivery}
                      onChange={(e) => setExpectedDelivery(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes or instructions..."
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-xl">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  {poItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-xl">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No items added yet</p>
                      <p className="text-sm">Click "Add Item" to add items to this order</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {poItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-xl">
                          <Select
                            value={item.item_id}
                            onValueChange={(v) => updateItem(index, "item_id", v)}
                          >
                            <SelectTrigger className="flex-1 rounded-xl">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map(i => (
                                <SelectItem key={i.id} value={i.id}>
                                  {i.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-24 rounded-xl"
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={item.unit_price || ""}
                            onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                            className="w-28 rounded-xl"
                          />
                          <span className="text-sm font-medium w-28 text-right">
                            {formatCurrency(item.total_amount)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2 border-t">
                        <span className="font-bold">
                          Total: {formatCurrency(poItems.reduce((sum, item) => sum + item.total_amount, 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="rounded-xl">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Purchase Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No purchase orders yet</p>
                <p>Create your first purchase order to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Issued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>{order.branch_name || "-"}</TableCell>
                      <TableCell>{order.supplier_name || "-"}</TableCell>
                      <TableCell>{order.item_count} items</TableCell>
                      <TableCell>{formatCurrency(parseFloat(String(order.total_amount)) || 0)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.expected_delivery)}</TableCell>
                      <TableCell>{formatDate(order.issued_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
