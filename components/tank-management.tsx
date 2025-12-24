"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Fuel, ArrowRightLeft, Plus, Edit, Package, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"

interface Tank {
  id: string
  tank_name: string
  fuel_type: string
  capacity: number
  current_stock: number
  status: string
  item_id?: string
  item_name?: string
  dispensers?: any[]
  nozzles?: any[]
}

interface Branch {
  id: string
  name: string
}

interface Item {
  id: string
  item_name: string
  item_code?: string
  item_type?: string
}

export default function TankManagement({ branchId }: { branchId: string | null }) {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showAddTankDialog, setShowAddTankDialog] = useState(false)
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)

  const [adjustForm, setAdjustForm] = useState({
    quantity: "",
    reason: "",
    requestedBy: "",
  })

  const [receiveForm, setReceiveForm] = useState({
    quantity: "",
    reason: "",
    requestedBy: "",
  })

  const [transferForm, setTransferForm] = useState({
    toTankId: "",
    toBranchId: branchId,
    quantity: "",
    notes: "",
    requestedBy: "",
  })

  const [newTankForm, setNewTankForm] = useState({
    tankName: "",
    fuelType: "Petrol",
    capacity: "",
    initialStock: "",
  })


  useEffect(() => {
    if (branchId) {
      fetchTanks()
      fetchBranches()
      fetchItems()
    }
  }, [branchId])

  const fetchTanks = async () => {
    setLoading(true)
    try {
      const tanksRes = await fetch(`/api/tanks?branch_id=${branchId}`)
      const tanksResult = await tanksRes.json()

      if (!tanksResult.success) {
        console.error("Error fetching tanks:", tanksResult.error)
        setLoading(false)
        return
      }

      const [dispensersRes, nozzlesRes] = await Promise.all([
        fetch(`/api/dispensers?branch_id=${branchId}`),
        fetch(`/api/nozzles?branch_id=${branchId}`)
      ])
      
      const dispensersResult = await dispensersRes.json()
      const nozzlesResult = await nozzlesRes.json()
      const allDispensers = dispensersResult.success ? dispensersResult.data : []
      const allNozzles = nozzlesResult.success ? nozzlesResult.data : []

      const tanksWithDetails = (tanksResult.data || []).map((tank: any) => ({
        ...tank,
        dispensers: allDispensers.filter((d: any) => {
          const tankIds = d.tank_ids || []
          return tankIds.includes(tank.id) || d.tank_id === tank.id || (!d.tank_id && !tankIds.length && d.fuel_type === tank.fuel_type)
        }),
        nozzles: allNozzles.filter((n: any) => n.fuel_type === tank.fuel_type),
      }))

      setTanks(tanksWithDetails)
    } catch (error) {
      console.error("Error fetching tanks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      const result = await response.json()
      if (result.success) {
        setBranches(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/items?branchId=${branchId}`)
      const result = await response.json()
      if (result.success) {
        setItems(result.items || [])
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const handleUpdateTankItem = async (tankId: string, itemId: string | null) => {
    try {
      const response = await fetch('/api/tanks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tankId,
          item_id: itemId,
        })
      })

      if (response.ok) {
        toast.success("Item mapped to tank successfully")
        fetchTanks()
      } else {
        toast.error("Failed to map item to tank")
      }
    } catch (error) {
      console.error("Error updating tank item:", error)
      toast.error("Failed to map item to tank")
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedTank) return

    const quantity = Number.parseFloat(adjustForm.quantity)

    try {
      const adjustRes = await fetch('/api/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tank_id: selectedTank.id,
          branch_id: branchId,
          adjustment_type: quantity >= 0 ? "increase" : "decrease",
          quantity: Math.abs(quantity),
          reason: adjustForm.reason,
          approved_by: adjustForm.requestedBy,
          sync_to_kra: true
        })
      })

      const result = await adjustRes.json()
      
      if (adjustRes.ok && result.success) {
        toast.success(`Stock adjusted: ${result.data.previousStock} -> ${result.data.newStock} litres`)
        if (result.kraSync?.synced) {
          toast.info("Stock synced to KRA")
        }
      } else {
        toast.error(result.error || "Error adjusting stock")
      }

      setShowAdjustDialog(false)
      setAdjustForm({ quantity: "", reason: "", requestedBy: "" })
      fetchTanks()
    } catch (error) {
      console.error("Error adjusting stock:", error)
      toast.error("Error adjusting stock")
    }
  }

  const handleReceiveStock = async () => {
    if (!selectedTank) return

    const quantity = Number.parseFloat(receiveForm.quantity)

    try {
      const receiveRes = await fetch('/api/stock/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          tank_id: selectedTank.id,
          quantity,
          unit_price: 0,
          supplier_name: receiveForm.requestedBy || "Unknown",
          notes: receiveForm.reason,
          sync_to_kra: true
        })
      })

      const result = await receiveRes.json()
      
      if (receiveRes.ok && result.success) {
        toast.success(`Received ${quantity} litres. New stock: ${result.data.newStock}`)
        if (result.kraSync?.synced) {
          toast.info("Stock synced to KRA")
        }
      } else {
        toast.error(result.error || "Error receiving stock")
      }

      setShowReceiveDialog(false)
      setReceiveForm({ quantity: "", reason: "", requestedBy: "" })
      fetchTanks()
    } catch (error) {
      console.error("Error receiving stock:", error)
      toast.error("Error receiving stock")
    }
  }

  const handleTransferStock = async () => {
    if (!selectedTank) return

    const quantity = Number.parseFloat(transferForm.quantity)

    try {
      const response = await fetch('/api/stock-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_tank_id: selectedTank.id,
          to_tank_id: transferForm.toTankId,
          from_branch_id: branchId,
          to_branch_id: transferForm.toBranchId,
          quantity,
          requested_by: transferForm.requestedBy,
          notes: transferForm.notes,
          approval_status: "pending",
        })
      })

      if (!response.ok) {
        console.error("Error creating transfer")
        return
      }

      setShowTransferDialog(false)
      setTransferForm({ toTankId: "", toBranchId: branchId, quantity: "", notes: "", requestedBy: "" })
      fetchTanks()
    } catch (error) {
      console.error("Error creating transfer:", error)
    }
  }

  const handleAddTank = async () => {
    if (!branchId) return

    try {
      const response = await fetch('/api/tanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          tank_name: newTankForm.tankName,
          fuel_type: newTankForm.fuelType,
          capacity: Number.parseFloat(newTankForm.capacity),
          current_stock: Number.parseFloat(newTankForm.initialStock || "0"),
          status: "active",
        })
      })

      if (response.ok) {
        toast.success(`Tank ${newTankForm.tankName} added successfully`)
        setShowAddTankDialog(false)
        setNewTankForm({ tankName: "", fuelType: "Petrol", capacity: "", initialStock: "" })
        fetchTanks()
      } else {
        console.error("Error adding tank")
        toast.error("Failed to add tank")
      }
    } catch (error) {
      console.error("Error adding tank:", error)
      toast.error("Failed to add tank")
    }
  }

  const handleDeleteTank = async (tank: Tank) => {
    if (!confirm(`Are you sure you want to delete "${tank.tank_name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/tanks?id=${tank.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(`Tank "${tank.tank_name}" deleted successfully`)
        fetchTanks()
      } else {
        const result = await response.json()
        toast.error(result.error || "Failed to delete tank")
      }
    } catch (error) {
      console.error("Error deleting tank:", error)
      toast.error("Failed to delete tank")
    }
  }

  const getStockPercentage = (tank: Tank) => {
    return ((tank.current_stock / tank.capacity) * 100).toFixed(1)
  }

  const getStockStatus = (percentage: number) => {
    if (percentage < 20) return "critical"
    if (percentage < 50) return "low"
    return "normal"
  }

  if (!branchId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please select a branch to view tank management.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6">Loading tank management...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tank Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage fuel tanks, stock levels, and transfers</p>
        </div>
        <Button onClick={() => setShowAddTankDialog(true)} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add New Tank
        </Button>
      </div>

      <div className="grid gap-4">
        {tanks.map((tank) => {
          const percentage = Number.parseFloat(getStockPercentage(tank))
          const status = getStockStatus(percentage)

          return (
            <Card key={tank.id} className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Fuel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tank.tank_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tank.fuel_type}</p>
                    </div>
                  </div>
                  <Badge variant={status === "critical" ? "destructive" : status === "low" ? "secondary" : "default"}>
                    {percentage}% Full
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-lg font-semibold">{tank.capacity.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Stock</p>
                    <p className="text-lg font-semibold">{tank.current_stock.toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available Space</p>
                    <p className="text-lg font-semibold">{(tank.capacity - tank.current_stock).toLocaleString()} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Linked Item</p>
                    <Select
                      value={tank.item_id || "none"}
                      onValueChange={(value) => handleUpdateTankItem(tank.id, value === "none" ? null : value)}
                    >
                      <SelectTrigger className="h-8 rounded-lg text-sm">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No item linked</SelectItem>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.item_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Serving Dispensers/Nozzles</p>
                  <div className="flex flex-wrap gap-2">
                    {tank.dispensers?.map((d) => (
                      <Badge key={d.id} variant="outline">
                        D{d.dispenser_number}
                      </Badge>
                    ))}
                    {tank.nozzles?.map((n) => (
                      <Badge key={n.id} variant="outline">
                        N{n.nozzle_number}
                      </Badge>
                    ))}
                    {!tank.dispensers?.length && !tank.nozzles?.length && (
                      <span className="text-sm text-muted-foreground">No dispensers/nozzles assigned</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTank(tank)
                      setShowReceiveDialog(true)
                    }}
                    className="rounded-xl"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Receive Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTank(tank)
                      setShowAdjustDialog(true)
                    }}
                    className="rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Adjust Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTank(tank)
                      setShowTransferDialog(true)
                    }}
                    className="rounded-xl"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTank(tank)}
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Manually adjust stock for {selectedTank?.tank_name}. Positive values increase stock, negative values
              decrease it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Adjustment Quantity (Litres)</Label>
              <Input
                type="number"
                placeholder="e.g., +500 or -200"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Reason for Adjustment</Label>
              <Input
                placeholder="e.g., Physical count correction"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Requested By</Label>
              <Input
                placeholder="Your name"
                value={adjustForm.requestedBy}
                onChange={(e) => setAdjustForm({ ...adjustForm, requestedBy: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <p className="text-sm text-muted-foreground">This adjustment requires approval before taking effect.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAdjustStock} className="rounded-xl">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
            <DialogDescription>Record stock received into {selectedTank?.tank_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantity Received (Litres)</Label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={receiveForm.quantity}
                onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Delivery Note / Reference</Label>
              <Input
                placeholder="e.g., DN-12345"
                value={receiveForm.reason}
                onChange={(e) => setReceiveForm({ ...receiveForm, reason: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Received By</Label>
              <Input
                placeholder="Your name"
                value={receiveForm.requestedBy}
                onChange={(e) => setReceiveForm({ ...receiveForm, requestedBy: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleReceiveStock} className="rounded-xl">
              Receive Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>Transfer stock from {selectedTank?.tank_name} to another tank</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Destination Branch</Label>
              <Select
                value={transferForm.toBranchId || undefined}
                onValueChange={(value) => setTransferForm({ ...transferForm, toBranchId: value, toTankId: "" })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destination Tank</Label>
              <Select
                value={transferForm.toTankId}
                onValueChange={(value) => setTransferForm({ ...transferForm, toTankId: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks
                    .filter((t) => t.id !== selectedTank?.id && t.fuel_type === selectedTank?.fuel_type)
                    .map((tank) => (
                      <SelectItem key={tank.id} value={tank.id}>
                        {tank.tank_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity to Transfer (Litres)</Label>
              <Input
                type="number"
                placeholder="e.g., 1000"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Transfer Notes</Label>
              <Input
                placeholder="Reason for transfer"
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Requested By</Label>
              <Input
                placeholder="Your name"
                value={transferForm.requestedBy}
                onChange={(e) => setTransferForm({ ...transferForm, requestedBy: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <p className="text-sm text-muted-foreground">This transfer requires approval before taking effect.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleTransferStock} className="rounded-xl">
              Submit Transfer Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Tank Dialog */}
      <Dialog open={showAddTankDialog} onOpenChange={setShowAddTankDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Tank</DialogTitle>
            <DialogDescription>Add a new fuel tank to this branch</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tank Name</Label>
              <Input
                placeholder="e.g., Tank 03"
                value={newTankForm.tankName}
                onChange={(e) => setNewTankForm({ ...newTankForm, tankName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Select
                value={newTankForm.fuelType}
                onValueChange={(value) => setNewTankForm({ ...newTankForm, fuelType: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Kerosene">Kerosene</SelectItem>
                  <SelectItem value="Super">Super</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tank Capacity (Litres)</Label>
              <Input
                type="number"
                placeholder="e.g., 10000"
                value={newTankForm.capacity}
                onChange={(e) => setNewTankForm({ ...newTankForm, capacity: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Initial Stock (Litres)</Label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={newTankForm.initialStock}
                onChange={(e) => setNewTankForm({ ...newTankForm, initialStock: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTankDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAddTank} className="rounded-xl">
              Add Tank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
