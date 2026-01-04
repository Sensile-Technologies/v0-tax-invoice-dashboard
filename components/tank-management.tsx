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

interface PendingTransfer {
  id: string
  from_branch_id: string
  from_branch_name?: string
  from_tank_id: string
  from_tank_name?: string
  to_tank_id: string
  quantity: number
  requested_by: string
  notes: string
  created_at: string
}

export default function TankManagement({ branchId }: { branchId: string | null }) {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showAddTankDialog, setShowAddTankDialog] = useState(false)
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)
  const [acceptingTransferId, setAcceptingTransferId] = useState<string | null>(null)
  const [destinationTanks, setDestinationTanks] = useState<Tank[]>([])
  const [loadingDestinationTanks, setLoadingDestinationTanks] = useState(false)


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
      fetchPendingTransfers()
    }
  }, [branchId])

  useEffect(() => {
    if (transferForm.toBranchId && transferForm.toBranchId !== branchId) {
      fetchDestinationTanks(transferForm.toBranchId)
    } else if (transferForm.toBranchId === branchId) {
      setDestinationTanks(tanks)
    }
  }, [transferForm.toBranchId, branchId, tanks])

  const fetchDestinationTanks = async (destBranchId: string) => {
    setLoadingDestinationTanks(true)
    try {
      const res = await fetch(`/api/tanks?branch_id=${destBranchId}`)
      const result = await res.json()
      if (result.success) {
        setDestinationTanks(result.data || [])
      } else {
        setDestinationTanks([])
      }
    } catch (error) {
      console.error("Error fetching destination tanks:", error)
      setDestinationTanks([])
    } finally {
      setLoadingDestinationTanks(false)
    }
  }

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
      // Use branch-items API which returns both catalog items (from HQ) and legacy branch items
      const response = await fetch(`/api/branch-items?branchId=${branchId}`)
      const result = await response.json()
      if (result.success) {
        // Map to expected format - only include assigned/available items
        const mappedItems = (result.items || [])
          .filter((item: any) => item.is_assigned || item.branch_item_id)
          .map((item: any) => ({
            id: item.item_id,
            item_name: item.item_name,
            item_code: item.item_code,
            item_type: item.item_type
          }))
        setItems(mappedItems)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const fetchPendingTransfers = async () => {
    try {
      const response = await fetch(`/api/stock-transfers?branch_id=${branchId}`)
      const result = await response.json()
      if (result.success) {
        // Filter to only pending incoming transfers for this branch
        const incoming = (result.data || []).filter((t: any) => 
          t.to_branch_id === branchId && 
          (t.status === 'pending' || (!t.status && t.approval_status === 'pending'))
        )
        
        // Enrich with branch and tank names
        const enrichedTransfers = await Promise.all(incoming.map(async (transfer: any) => {
          // Get source branch name
          let fromBranchName = "Unknown Branch"
          let fromTankName = "Unknown Tank"
          
          const branchRes = await fetch(`/api/branches?id=${transfer.from_branch_id}`)
          const branchData = await branchRes.json()
          if (branchData.success && branchData.data?.length > 0) {
            fromBranchName = branchData.data[0].name
          }
          
          // Get source tank name
          const tankRes = await fetch(`/api/tanks?branch_id=${transfer.from_branch_id}`)
          const tankData = await tankRes.json()
          if (tankData.success) {
            const sourceTank = tankData.data.find((t: any) => t.id === transfer.from_tank_id)
            if (sourceTank) {
              fromTankName = sourceTank.tank_name
            }
          }
          
          return {
            ...transfer,
            from_branch_name: fromBranchName,
            from_tank_name: fromTankName,
          }
        }))
        
        setPendingTransfers(enrichedTransfers)
      }
    } catch (error) {
      console.error("Error fetching pending transfers:", error)
    }
  }

  const handleAcceptTransfer = async (transferId: string) => {
    setAcceptingTransferId(transferId)
    try {
      const response = await fetch('/api/stock-transfers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_id: transferId,
          action: 'accept',
          approved_by: 'Branch User'
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast.success(`Transfer accepted. New stock: ${result.data.newStock} litres`)
        fetchTanks()
        fetchPendingTransfers()
        setShowReceiveDialog(false)
      } else {
        toast.error(result.error || "Error accepting transfer")
      }
    } catch (error) {
      console.error("Error accepting transfer:", error)
      toast.error("Error accepting transfer")
    } finally {
      setAcceptingTransferId(null)
    }
  }

  const handleRejectTransfer = async (transferId: string) => {
    try {
      const response = await fetch('/api/stock-transfers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_id: transferId,
          action: 'reject',
          approved_by: 'Branch User'
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast.info("Transfer rejected")
        fetchPendingTransfers()
      } else {
        toast.error(result.error || "Error rejecting transfer")
      }
    } catch (error) {
      console.error("Error rejecting transfer:", error)
      toast.error("Error rejecting transfer")
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

      toast.success("Transfer request submitted. Awaiting approval at destination branch.")
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
                  {(() => {
                    const tankTransfers = pendingTransfers.filter(t => t.to_tank_id === tank.id)
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTank(tank)
                          setShowReceiveDialog(true)
                        }}
                        className="rounded-xl relative"
                        disabled={tankTransfers.length === 0}
                        title={tankTransfers.length === 0 ? "No pending transfers to accept" : `${tankTransfers.length} pending transfer(s)`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Accept Transfer
                        {tankTransfers.length > 0 && (
                          <Badge className="ml-2 h-5 min-w-5 bg-orange-500 text-white text-xs">
                            {tankTransfers.length}
                          </Badge>
                        )}
                      </Button>
                    )
                  })()}
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

      {/* Accept Transfer Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Accept Stock Transfer</DialogTitle>
            <DialogDescription>
              Accept incoming stock transfers for {selectedTank?.tank_name}. Stock can only be received via approved transfers from other branches.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {selectedTank && pendingTransfers.filter(t => t.to_tank_id === selectedTank.id).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending transfers for this tank</p>
                <p className="text-sm mt-1">Transfers must be initiated from another branch</p>
              </div>
            ) : (
              selectedTank && pendingTransfers.filter(t => t.to_tank_id === selectedTank.id).map((transfer) => (
                <Card key={transfer.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {Number(transfer.quantity).toLocaleString()} litres
                        </p>
                        <p className="text-sm text-muted-foreground">
                          From: {transfer.from_branch_name} - {transfer.from_tank_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested by: {transfer.requested_by || 'Unknown'}
                        </p>
                        {transfer.notes && (
                          <p className="text-xs text-muted-foreground">
                            Notes: {transfer.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(transfer.created_at).toLocaleDateString()} {new Date(transfer.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectTransfer(transfer.id)}
                          className="rounded-lg text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptTransfer(transfer.id)}
                          disabled={acceptingTransferId === transfer.id}
                          className="rounded-lg"
                        >
                          {acceptingTransferId === transfer.id ? "Accepting..." : "Accept"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)} className="rounded-xl">
              Close
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
                disabled={loadingDestinationTanks}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={loadingDestinationTanks ? "Loading tanks..." : "Select tank"} />
                </SelectTrigger>
                <SelectContent>
                  {destinationTanks
                    .filter((t) => t.id !== selectedTank?.id && t.fuel_type === selectedTank?.fuel_type)
                    .map((tank) => (
                      <SelectItem key={tank.id} value={tank.id}>
                        {tank.tank_name} ({tank.fuel_type})
                      </SelectItem>
                    ))}
                  {destinationTanks.filter((t) => t.id !== selectedTank?.id && t.fuel_type === selectedTank?.fuel_type).length === 0 && !loadingDestinationTanks && (
                    <div className="px-2 py-1 text-sm text-muted-foreground">No matching tanks found</div>
                  )}
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
