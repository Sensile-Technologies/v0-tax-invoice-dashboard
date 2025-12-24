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

interface Nozzle {
  id: string
  nozzle_number: number
  fuel_type: string
  status: string
  dispenser_id: string
  dispenser_number?: number
  initial_meter_reading?: number
}

interface Dispenser {
  id: string
  dispenser_number: number
  tank_id: string
  tank_name?: string
  fuel_type?: string
}

export default function NozzleManagement({ branchId }: { branchId: string | null }) {
  const [nozzles, setNozzles] = useState<Nozzle[]>([])
  const [dispensers, setDispensers] = useState<Dispenser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedNozzle, setSelectedNozzle] = useState<Nozzle | null>(null)

  const [formData, setFormData] = useState({
    dispenser_id: "",
    nozzle_number: "1",
    fuel_type: "Diesel",
    initial_meter_reading: "0",
  })

  useEffect(() => {
    if (branchId) {
      fetchData()
    }
  }, [branchId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [nozzlesRes, dispensersRes] = await Promise.all([
        fetch(`/api/nozzles?branch_id=${branchId}`),
        fetch(`/api/dispensers?branch_id=${branchId}`)
      ])

      const nozzlesResult = await nozzlesRes.json()
      const dispensersResult = await dispensersRes.json()

      if (nozzlesResult.success) {
        setNozzles(nozzlesResult.data || [])
      }
      if (dispensersResult.success) {
        setDispensers(dispensersResult.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load nozzles")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNozzle = async () => {
    if (!formData.dispenser_id) {
      toast.error("Please select a dispenser")
      return
    }

    try {
      const res = await fetch("/api/nozzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          dispenser_id: formData.dispenser_id,
          nozzle_number: parseInt(formData.nozzle_number),
          fuel_type: formData.fuel_type,
          initial_meter_reading: parseFloat(formData.initial_meter_reading) || 0,
          status: "active",
        }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Nozzle added successfully")
        setShowAddDialog(false)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || "Failed to add nozzle")
      }
    } catch (error) {
      console.error("Error adding nozzle:", error)
      toast.error("Failed to add nozzle")
    }
  }

  const handleEditNozzle = async () => {
    if (!selectedNozzle) return

    try {
      const res = await fetch("/api/nozzles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNozzle.id,
          dispenser_id: formData.dispenser_id,
          nozzle_number: parseInt(formData.nozzle_number),
          fuel_type: formData.fuel_type,
          status: selectedNozzle.status,
          initial_meter_reading: parseFloat(formData.initial_meter_reading) || 0,
        }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Nozzle updated successfully")
        setShowEditDialog(false)
        setSelectedNozzle(null)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || "Failed to update nozzle")
      }
    } catch (error) {
      console.error("Error updating nozzle:", error)
      toast.error("Failed to update nozzle")
    }
  }

  const handleDeleteNozzle = async (nozzle: Nozzle) => {
    if (!confirm(`Are you sure you want to delete nozzle D${nozzle.dispenser_number}N${nozzle.nozzle_number}?`)) {
      return
    }

    try {
      const res = await fetch("/api/nozzles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nozzle.id }),
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Nozzle deleted successfully")
        fetchData()
      } else {
        toast.error(result.error || "Failed to delete nozzle")
      }
    } catch (error) {
      console.error("Error deleting nozzle:", error)
      toast.error("Failed to delete nozzle")
    }
  }

  const openEditDialog = (nozzle: Nozzle) => {
    setSelectedNozzle(nozzle)
    setFormData({
      dispenser_id: nozzle.dispenser_id,
      nozzle_number: nozzle.nozzle_number.toString(),
      fuel_type: nozzle.fuel_type,
      initial_meter_reading: (nozzle.initial_meter_reading || 0).toString(),
    })
    setShowEditDialog(true)
  }

  const resetForm = () => {
    setFormData({
      dispenser_id: "",
      nozzle_number: "1",
      fuel_type: "Diesel",
      initial_meter_reading: "0",
    })
  }

  const getDispenserLabel = (dispenser: Dispenser) => {
    return `D${dispenser.dispenser_number} - ${dispenser.fuel_type || "Unknown"} (${dispenser.tank_name || "No tank"})`
  }

  if (!branchId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please select a branch to manage nozzles
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Nozzle Management
          </CardTitle>
          <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Nozzle
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading nozzles...</div>
          ) : nozzles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No nozzles found. Click "Add Nozzle" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nozzle</TableHead>
                  <TableHead>Dispenser</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Meter Reading</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nozzles.map((nozzle) => (
                  <TableRow key={nozzle.id}>
                    <TableCell className="font-medium">
                      D{nozzle.dispenser_number}N{nozzle.nozzle_number}
                    </TableCell>
                    <TableCell>Dispenser {nozzle.dispenser_number}</TableCell>
                    <TableCell>
                      <Badge variant={nozzle.fuel_type === "Diesel" ? "default" : "secondary"}>
                        {nozzle.fuel_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={nozzle.status === "active" ? "default" : "destructive"}>
                        {nozzle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{nozzle.initial_meter_reading?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(nozzle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNozzle(nozzle)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Nozzle</DialogTitle>
            <DialogDescription>
              Add a nozzle to a dispenser. The nozzle will be used for recording sales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dispenser</Label>
              <Select value={formData.dispenser_id} onValueChange={(v) => setFormData({ ...formData, dispenser_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dispenser" />
                </SelectTrigger>
                <SelectContent>
                  {dispensers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {getDispenserLabel(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nozzle Number</Label>
              <Input
                type="number"
                min="1"
                value={formData.nozzle_number}
                onChange={(e) => setFormData({ ...formData, nozzle_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Select value={formData.fuel_type} onValueChange={(v) => setFormData({ ...formData, fuel_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Kerosene">Kerosene</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Current Meter Reading</Label>
              <Input
                type="number"
                min="0"
                value={formData.initial_meter_reading}
                onChange={(e) => setFormData({ ...formData, initial_meter_reading: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddNozzle}>Add Nozzle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Nozzle</DialogTitle>
            <DialogDescription>
              Update nozzle details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dispenser</Label>
              <Select value={formData.dispenser_id} onValueChange={(v) => setFormData({ ...formData, dispenser_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dispenser" />
                </SelectTrigger>
                <SelectContent>
                  {dispensers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {getDispenserLabel(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nozzle Number</Label>
              <Input
                type="number"
                min="1"
                value={formData.nozzle_number}
                onChange={(e) => setFormData({ ...formData, nozzle_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Select value={formData.fuel_type} onValueChange={(v) => setFormData({ ...formData, fuel_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Kerosene">Kerosene</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Current Meter Reading</Label>
              <Input
                type="number"
                min="0"
                value={formData.initial_meter_reading}
                onChange={(e) => setFormData({ ...formData, initial_meter_reading: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditNozzle}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
