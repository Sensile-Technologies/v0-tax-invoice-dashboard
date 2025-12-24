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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Fuel, Link2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-toastify"

interface Dispenser {
  id: string
  dispenser_number: number
  fuel_type: string
  status: string
  tank_id?: string
  tank_ids?: string[]
  item_id?: string
  item_name?: string
  tank_name?: string
}

interface Tank {
  id: string
  tank_name: string
  fuel_type: string
  item_id?: string
  item_name?: string
  status: string
}

export default function DispenserManagement({ branchId }: { branchId: string | null }) {
  const [dispensers, setDispensers] = useState<Dispenser[]>([])
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAssignTanksDialog, setShowAssignTanksDialog] = useState(false)
  const [selectedDispenser, setSelectedDispenser] = useState<Dispenser | null>(null)

  const [formData, setFormData] = useState({
    dispenser_number: "",
    status: "active",
  })

  const [selectedTankIds, setSelectedTankIds] = useState<string[]>([])

  useEffect(() => {
    if (branchId) {
      fetchData()
    }
  }, [branchId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dispensersRes, tanksRes] = await Promise.all([
        fetch(`/api/dispensers?branch_id=${branchId}`),
        fetch(`/api/tanks?branch_id=${branchId}`)
      ])

      const dispensersResult = await dispensersRes.json()
      const tanksResult = await tanksRes.json()

      if (dispensersResult.success) {
        setDispensers(dispensersResult.data || [])
      }
      if (tanksResult.success) {
        setTanks(tanksResult.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dispensers")
    } finally {
      setLoading(false)
    }
  }

  const handleAddDispenser = async () => {
    if (!formData.dispenser_number) {
      toast.error("Please enter a dispenser number")
      return
    }

    try {
      const res = await fetch("/api/dispensers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          dispenser_number: parseInt(formData.dispenser_number),
          fuel_type: "Pending",
          status: formData.status,
          tank_ids: [],
        }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Dispenser added successfully. Now assign tanks to it.")
        setShowAddDialog(false)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || "Failed to add dispenser")
      }
    } catch (error) {
      console.error("Error adding dispenser:", error)
      toast.error("Failed to add dispenser")
    }
  }

  const handleAssignTanks = async () => {
    if (!selectedDispenser) return

    try {
      const res = await fetch("/api/dispensers/assign-tanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispenser_id: selectedDispenser.id,
          tank_ids: selectedTankIds,
          branch_id: branchId,
        }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success(`Tanks assigned and ${result.nozzlesCreated || 0} nozzles created`)
        setShowAssignTanksDialog(false)
        setSelectedDispenser(null)
        setSelectedTankIds([])
        fetchData()
      } else {
        toast.error(result.error || "Failed to assign tanks")
      }
    } catch (error) {
      console.error("Error assigning tanks:", error)
      toast.error("Failed to assign tanks")
    }
  }

  const handleEditDispenser = async () => {
    if (!selectedDispenser) return

    try {
      const res = await fetch("/api/dispensers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDispenser.id,
          dispenser_number: parseInt(formData.dispenser_number),
          status: formData.status,
        }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Dispenser updated successfully")
        setShowEditDialog(false)
        setSelectedDispenser(null)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || "Failed to update dispenser")
      }
    } catch (error) {
      console.error("Error updating dispenser:", error)
      toast.error("Failed to update dispenser")
    }
  }

  const handleDeleteDispenser = async (dispenser: Dispenser) => {
    if (!confirm(`Are you sure you want to delete Dispenser ${dispenser.dispenser_number}? This will also delete all associated nozzles.`)) {
      return
    }

    try {
      const res = await fetch("/api/dispensers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dispenser.id }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Dispenser deleted successfully")
        fetchData()
      } else {
        toast.error(result.error || "Failed to delete dispenser")
      }
    } catch (error) {
      console.error("Error deleting dispenser:", error)
      toast.error("Failed to delete dispenser")
    }
  }

  const resetForm = () => {
    setFormData({
      dispenser_number: "",
      status: "active",
    })
  }

  const openEditDialog = (dispenser: Dispenser) => {
    setSelectedDispenser(dispenser)
    setFormData({
      dispenser_number: dispenser.dispenser_number.toString(),
      status: dispenser.status,
    })
    setShowEditDialog(true)
  }

  const openAssignTanksDialog = (dispenser: Dispenser) => {
    setSelectedDispenser(dispenser)
    setSelectedTankIds(dispenser.tank_ids || (dispenser.tank_id ? [dispenser.tank_id] : []))
    setShowAssignTanksDialog(true)
  }

  const getAssignedTankNames = (dispenser: Dispenser) => {
    const tankIds = dispenser.tank_ids || (dispenser.tank_id ? [dispenser.tank_id] : [])
    if (tankIds.length === 0) return "None"
    
    const assignedTanks = tanks.filter(t => tankIds.includes(t.id))
    return assignedTanks.map(t => t.tank_name).join(", ") || "None"
  }

  const activeTanks = tanks.filter(t => t.status === "active")

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Manage Dispensers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading dispensers...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Manage Dispensers
        </CardTitle>
        <Button onClick={() => setShowAddDialog(true)} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Add Dispenser
        </Button>
      </CardHeader>
      <CardContent>
        {dispensers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No dispensers found. Click "Add Dispenser" to create one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispenser #</TableHead>
                <TableHead>Assigned Tanks</TableHead>
                <TableHead>Fuel Types</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispensers.map((dispenser) => (
                <TableRow key={dispenser.id}>
                  <TableCell className="font-medium">D{dispenser.dispenser_number}</TableCell>
                  <TableCell>{getAssignedTankNames(dispenser)}</TableCell>
                  <TableCell>{dispenser.fuel_type || "Pending"}</TableCell>
                  <TableCell>{dispenser.item_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={dispenser.status === "active" ? "default" : "secondary"}>
                      {dispenser.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignTanksDialog(dispenser)}
                      className="rounded-xl"
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      Assign Tanks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(dispenser)}
                      className="rounded-xl"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDispenser(dispenser)}
                      className="rounded-xl text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Dispenser Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Dispenser</DialogTitle>
            <DialogDescription>
              Create a new dispenser. After adding, assign tanks to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dispenser Number</Label>
              <Input
                type="number"
                placeholder="e.g., 1"
                value={formData.dispenser_number}
                onChange={(e) => setFormData({ ...formData, dispenser_number: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAddDispenser} className="rounded-xl">
              Add Dispenser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dispenser Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dispenser</DialogTitle>
            <DialogDescription>
              Update dispenser details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dispenser Number</Label>
              <Input
                type="number"
                value={formData.dispenser_number}
                onChange={(e) => setFormData({ ...formData, dispenser_number: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleEditDispenser} className="rounded-xl">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tanks Dialog */}
      <Dialog open={showAssignTanksDialog} onOpenChange={setShowAssignTanksDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Tanks to Dispenser {selectedDispenser?.dispenser_number}</DialogTitle>
            <DialogDescription>
              Select tanks this dispenser will serve. Nozzles will be automatically created for each tank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Select Active Tanks</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {activeTanks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active tanks available</p>
                ) : (
                  activeTanks.map((tank) => (
                    <div key={tank.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assign-tank-${tank.id}`}
                        checked={selectedTankIds.includes(tank.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTankIds([...selectedTankIds, tank.id])
                          } else {
                            setSelectedTankIds(selectedTankIds.filter(id => id !== tank.id))
                          }
                        }}
                      />
                      <label htmlFor={`assign-tank-${tank.id}`} className="text-sm cursor-pointer flex-1">
                        <span className="font-medium">{tank.tank_name}</span>
                        <span className="text-muted-foreground ml-2">- {tank.fuel_type}</span>
                        {tank.item_id && <span className="text-green-600 ml-2">(Item linked)</span>}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {selectedTankIds.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTankIds.length} tank(s) selected - {selectedTankIds.length} nozzle(s) will be created
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignTanksDialog(false)
                setSelectedTankIds([])
              }} 
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTanks} className="rounded-xl">
              Assign Tanks & Create Nozzles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
