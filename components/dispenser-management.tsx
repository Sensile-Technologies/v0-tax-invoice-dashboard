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
import { Plus, Edit, Trash2, Fuel } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

interface CreatedNozzle {
  id: string
  nozzle_number: number
  fuel_type: string
  tank_name: string
  dispenser_number: number
  meter_reading: string
}

export default function DispenserManagement({ branchId }: { branchId: string | null }) {
  const [dispensers, setDispensers] = useState<Dispenser[]>([])
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMeterReadingDialog, setShowMeterReadingDialog] = useState(false)
  const [selectedDispenser, setSelectedDispenser] = useState<Dispenser | null>(null)
  const [createdNozzles, setCreatedNozzles] = useState<CreatedNozzle[]>([])

  const [formData, setFormData] = useState({
    dispenser_number: "",
    status: "active",
  })


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

  const handleSaveMeterReadings = async () => {
    // Validate all meter readings are valid numbers
    for (const nozzle of createdNozzles) {
      const reading = parseFloat(nozzle.meter_reading)
      if (isNaN(reading) || reading < 0) {
        toast.error(`Invalid meter reading for D${nozzle.dispenser_number}N${nozzle.nozzle_number}`)
        return
      }
    }

    try {
      let hasError = false
      for (const nozzle of createdNozzles) {
        const res = await fetch("/api/nozzles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: nozzle.id,
            initial_meter_reading: parseFloat(nozzle.meter_reading) || 0
          })
        })
        
        const result = await res.json()
        if (!result.success) {
          hasError = true
          toast.error(`Failed to save reading for D${nozzle.dispenser_number}N${nozzle.nozzle_number}`)
        }
      }
      
      if (!hasError) {
        toast.success("Meter readings saved successfully")
      }
      setShowMeterReadingDialog(false)
      setCreatedNozzles([])
      setSelectedDispenser(null)
      fetchData()
    } catch (error) {
      console.error("Error saving meter readings:", error)
      toast.error("Failed to save meter readings")
    }
  }

  const updateNozzleMeterReading = (nozzleId: string, value: string) => {
    setCreatedNozzles(prev => prev.map(n => 
      n.id === nozzleId ? { ...n, meter_reading: value } : n
    ))
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

  const getAssignedTankNames = (dispenser: Dispenser) => {
    const tankIds = dispenser.tank_ids || (dispenser.tank_id ? [dispenser.tank_id] : [])
    if (tankIds.length === 0) return "None"
    
    const assignedTanks = tanks.filter(t => tankIds.includes(t.id))
    return assignedTanks.map(t => t.tank_name).join(", ") || "None"
  }

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

      <Dialog open={showMeterReadingDialog} onOpenChange={setShowMeterReadingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enter Nozzle Meter Readings</DialogTitle>
            <DialogDescription>
              Enter the current meter readings for the newly created nozzles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {createdNozzles.map((nozzle) => (
              <div key={nozzle.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">
                    D{nozzle.dispenser_number}N{nozzle.nozzle_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nozzle.tank_name} - {nozzle.fuel_type}
                  </p>
                </div>
                <div className="w-40">
                  <Label className="text-xs">Meter Reading</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={nozzle.meter_reading}
                    onChange={(e) => updateNozzleMeterReading(nozzle.id, e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowMeterReadingDialog(false)
                setCreatedNozzles([])
                setSelectedDispenser(null)
                fetchData()
              }}
              className="rounded-xl"
            >
              Skip
            </Button>
            <Button onClick={handleSaveMeterReadings} className="rounded-xl">
              Save Meter Readings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
