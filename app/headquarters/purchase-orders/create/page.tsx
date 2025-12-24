"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Loader2, Package, Truck, User, Building } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Branch {
  id: string
  name: string
}

interface Partner {
  id: string
  name: string
  phone?: string
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

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [suppliers, setSuppliers] = useState<Partner[]>([])
  const [transporters, setTransporters] = useState<Partner[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [selectedTransporter, setSelectedTransporter] = useState("")
  const [expectedDelivery, setExpectedDelivery] = useState("")
  const [notes, setNotes] = useState("")
  const [transportCost, setTransportCost] = useState("")
  const [vehicleRegistration, setVehicleRegistration] = useState("")
  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [poItems, setPoItems] = useState<POItem[]>([])

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

  const fetchTransporters = useCallback(async () => {
    try {
      const response = await fetch("/api/vendors/partners?partner_type=transporter")
      const result = await response.json()
      if (result.success) {
        setTransporters(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching transporters:", error)
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
    Promise.all([fetchBranches(), fetchSuppliers(), fetchTransporters()]).finally(() => {
      setLoading(false)
    })
  }, [fetchBranches, fetchSuppliers, fetchTransporters])

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

  const handleSubmit = async () => {
    if (!selectedBranch) {
      toast.error("Please select a branch")
      return
    }

    if (!selectedSupplier) {
      toast.error("Please select a supplier")
      return
    }

    if (poItems.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    const invalidItems = poItems.filter(item => !item.item_name || item.quantity <= 0 || item.unit_price <= 0)
    if (invalidItems.length > 0) {
      toast.error("Please fill in all item details with valid quantities and unit prices")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/headquarters/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: selectedBranch,
          supplier_id: selectedSupplier,
          transporter_id: selectedTransporter || null,
          expected_delivery: expectedDelivery || null,
          notes: notes || null,
          transport_cost: parseFloat(transportCost) || 0,
          vehicle_registration: vehicleRegistration || null,
          driver_name: driverName || null,
          driver_phone: driverPhone || null,
          items: poItems
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message || "Purchase order created successfully")
        router.push("/headquarters/purchase-orders")
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const itemsTotal = poItems.reduce((sum, item) => sum + item.total_amount, 0)
  const grandTotal = itemsTotal + (parseFloat(transportCost) || 0)

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <DashboardHeader currentBranch="hq" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader currentBranch="hq" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/headquarters/purchase-orders")}
            className="rounded-xl mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchase Orders
          </Button>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Purchase Order</h1>
          <p className="text-muted-foreground mb-8">Fill in the details to create a new purchase order for a branch.</p>

          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <CardDescription>Select the branch, supplier, and delivery information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label>Supplier *</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select supplier" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Transport Details
                </CardTitle>
                <CardDescription>Transporter, vehicle, and driver information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Transporter</Label>
                    <Select value={selectedTransporter} onValueChange={setSelectedTransporter}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select transporter (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {transporters.map(transporter => (
                          <SelectItem key={transporter.id} value={transporter.id}>
                            {transporter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transport Cost (KES)</Label>
                    <Input
                      type="number"
                      value={transportCost}
                      onChange={(e) => setTransportCost(e.target.value)}
                      placeholder="0.00"
                      className="rounded-xl"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Registration</Label>
                    <Input
                      value={vehicleRegistration}
                      onChange={(e) => setVehicleRegistration(e.target.value)}
                      placeholder="e.g., KBZ 123A"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Driver Name</Label>
                    <Input
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver's full name"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Driver Phone</Label>
                    <Input
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="e.g., 0712345678"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items
                    </CardTitle>
                    <CardDescription>Add items with quantities and unit purchase prices</CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addItem} 
                    className="rounded-xl"
                    disabled={!selectedBranch}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedBranch ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-xl bg-slate-50">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Please select a branch first to load available items</p>
                  </div>
                ) : poItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-xl bg-slate-50">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items added yet</p>
                    <p className="text-sm">Click "Add Item" to add items to this order</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-3">
                      <div className="col-span-4">Item</div>
                      <div className="col-span-2">Quantity (L)</div>
                      <div className="col-span-2">Unit Price *</div>
                      <div className="col-span-3 text-right">Total</div>
                      <div className="col-span-1"></div>
                    </div>
                    {poItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-xl bg-white">
                        <div className="col-span-4">
                          <Select
                            value={item.item_id}
                            onValueChange={(v) => updateItem(index, "item_id", v)}
                          >
                            <SelectTrigger className="rounded-xl">
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
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                            className="rounded-xl"
                            min="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Price *"
                            value={item.unit_price || ""}
                            onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                            className="rounded-xl"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-3 text-right font-medium">
                          {formatCurrency(item.total_amount)}
                        </div>
                        <div className="col-span-1 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items Subtotal:</span>
                        <span>{formatCurrency(itemsTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transport Cost:</span>
                        <span>{formatCurrency(parseFloat(transportCost) || 0)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/headquarters/purchase-orders")}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-xl px-8"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Purchase Order
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
