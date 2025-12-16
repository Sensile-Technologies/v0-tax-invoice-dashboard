"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Fuel, Gauge, Plus, ArrowLeft, Info } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfigurationPage() {
  const router = useRouter()
  const [fuelItems, setFuelItems] = useState<any[]>([])
  const [dispensers, setDispensers] = useState<any[]>([])
  const [nozzles, setNozzles] = useState<any[]>([])
  const [availableFuelTypes, setAvailableFuelTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [newNozzle, setNewNozzle] = useState({
    dispenser_id: "",
    nozzle_number: "",
    fuel_type: "",
    initial_meter_reading: "",
  })

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("Please select a branch first")
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const [tanksRes, itemsRes, dispensersRes, nozzlesRes] = await Promise.all([
        fetch(`/api/tanks?branch_id=${branchId}`),
        fetch(`/api/items?branch_id=${branchId}`),
        fetch(`/api/dispensers?branch_id=${branchId}`),
        fetch(`/api/nozzles?branch_id=${branchId}`)
      ])

      const [tanksResult, itemsResult, dispensersResult, nozzlesResult] = await Promise.all([
        tanksRes.json(),
        itemsRes.json(),
        dispensersRes.json(),
        nozzlesRes.json()
      ])

      if (tanksResult.success) {
        const fuelTypes = [...new Set(tanksResult.data?.map((tank: any) => tank.fuel_type as string) || [])] as string[]
        setAvailableFuelTypes(fuelTypes)
      }

      if (itemsResult.success) {
        const fuelTypeItems = (itemsResult.data || []).filter((item: any) => 
          item.item_name?.toUpperCase() === 'DIESEL' || 
          item.item_name?.toUpperCase() === 'PETROL' ||
          item.item_type === '2'
        )
        setFuelItems(fuelTypeItems)
      }

      if (dispensersResult.success) {
        setDispensers(dispensersResult.data || [])
      }

      if (nozzlesResult.success) {
        setNozzles(nozzlesResult.data || [])
      }
    } catch (error) {
      console.error("Error fetching configuration:", error)
      toast.error("Failed to load configuration")
    }
  }

  const handleAddNozzle = async () => {
    if (!newNozzle.dispenser_id || !newNozzle.fuel_type) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("Please select a branch first")
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const tanksRes = await fetch(`/api/tanks?branch_id=${branchId}`)
      const tanksResult = await tanksRes.json()
      const tanksData = tanksResult.success ? tanksResult.data.filter((t: any) => t.fuel_type === newNozzle.fuel_type) : []

      if (tanksData.length === 0) {
        toast.error(
          `No tank configured for ${newNozzle.fuel_type}. Please add a ${newNozzle.fuel_type} tank in Tank Management first.`,
        )
        setLoading(false)
        return
      }

      const priceExists = fuelItems.some((item) => item.item_name?.toUpperCase() === newNozzle.fuel_type?.toUpperCase())
      if (!priceExists) {
        toast.error(
          `No item configured for ${newNozzle.fuel_type}. Please add this fuel type in the Items list first.`,
        )
        setLoading(false)
        return
      }

      const nozzlesRes = await fetch(`/api/nozzles?dispenser_id=${newNozzle.dispenser_id}`)
      const nozzlesResult = await nozzlesRes.json()
      const existingNozzles = nozzlesResult.success ? nozzlesResult.data : []
      const nozzleNumbers = existingNozzles.map((n: any) => n.nozzle_number || 0)
      const nextNozzleNumber = nozzleNumbers.length > 0 ? Math.max(...nozzleNumbers) + 1 : 1

      const response = await fetch('/api/nozzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          dispenser_id: newNozzle.dispenser_id,
          nozzle_number: nextNozzleNumber,
          fuel_type: newNozzle.fuel_type,
          initial_meter_reading: newNozzle.initial_meter_reading
            ? Number.parseFloat(newNozzle.initial_meter_reading)
            : 0,
          status: "active",
        })
      })

      const result = await response.json()

      if (!result.success) {
        console.error("Error adding nozzle:", result.error)
        toast.error("Failed to add nozzle")
      } else {
        const selectedDispenser = dispensers.find((d) => d.id === newNozzle.dispenser_id)
        const dispenserNum = selectedDispenser?.dispenser_number || "?"
        toast.success(`Nozzle D${dispenserNum}N${nextNozzleNumber} added successfully`)
        setNewNozzle({ dispenser_id: "", nozzle_number: "", fuel_type: "", initial_meter_reading: "" })
        await fetchConfiguration()
      }
    } catch (error) {
      console.error("Error adding nozzle:", error)
      toast.error("Failed to add nozzle")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNozzleStatus = async (nozzleId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    try {
      const response = await fetch('/api/nozzles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nozzleId, status: newStatus })
      })
      
      const result = await response.json()

      if (!result.success) {
        console.error("Error updating nozzle status:", result.error)
        toast.error("Failed to update nozzle status")
      } else {
        toast.success(`Nozzle ${newStatus === "active" ? "activated" : "deactivated"}`)
        await fetchConfiguration()
      }
    } catch (error) {
      console.error("Error updating nozzle status:", error)
      toast.error("Failed to update nozzle status")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Branch Configuration</h1>
          <p className="text-slate-600 mt-1">Configure fuel prices and nozzle mappings for this branch</p>
        </div>
      </div>

      <Tabs defaultValue="fuel-prices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fuel-prices">
            <Fuel className="h-4 w-4 mr-2" />
            Fuel Prices
          </TabsTrigger>
          <TabsTrigger value="nozzles">
            <Gauge className="h-4 w-4 mr-2" />
            Nozzles & Dispensers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fuel-prices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Fuel Prices</CardTitle>
              <CardDescription>Sale prices from items list (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Fuel prices are managed in the Items list. To update prices, go to Inventory → Items and edit the sale price for each fuel type.
                </p>
              </div>
              <div className="space-y-2">
                {fuelItems.length === 0 ? (
                  <p className="text-sm text-slate-500">No fuel items configured. Add fuel items in the Items list.</p>
                ) : (
                  fuelItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-slate-500">
                          Item Code: {item.item_code || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">KES {Number.parseFloat(item.sale_price || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">Purchase: KES {Number.parseFloat(item.purchase_price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nozzles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Nozzle</CardTitle>
              <CardDescription>Map nozzles to dispensers and fuel types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dispenser">Dispenser</Label>
                  <Select
                    value={newNozzle.dispenser_id}
                    onValueChange={(value) => setNewNozzle({ ...newNozzle, dispenser_id: value })}
                  >
                    <SelectTrigger id="dispenser">
                      <SelectValue placeholder="Select dispenser" />
                    </SelectTrigger>
                    <SelectContent>
                      {dispensers.map((dispenser) => (
                        <SelectItem key={dispenser.id} value={dispenser.id}>
                          Dispenser {dispenser.dispenser_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nozzle_fuel_type">Fuel Type</Label>
                  <Select
                    value={newNozzle.fuel_type}
                    onValueChange={(value) => setNewNozzle({ ...newNozzle, fuel_type: value })}
                  >
                    <SelectTrigger id="nozzle_fuel_type">
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFuelTypes.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-slate-500">
                          No fuel types available. Add tanks in Tank Management first.
                        </div>
                      ) : (
                        availableFuelTypes.map((fuelType) => (
                          <SelectItem key={fuelType} value={fuelType}>
                            {fuelType}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial_meter_reading">Initial Meter Reading</Label>
                  <Input
                    id="initial_meter_reading"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={newNozzle.initial_meter_reading}
                    onChange={(e) => setNewNozzle({ ...newNozzle, initial_meter_reading: e.target.value })}
                  />
                </div>
              </div>
              <div className="text-sm text-slate-500">Nozzle number will be automatically assigned</div>
              <Button onClick={handleAddNozzle} disabled={loading || availableFuelTypes.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Nozzle
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispensers</CardTitle>
                <CardDescription>Fuel dispensers at this branch (multi-product capable)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dispensers.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No dispensers found. Dispensers are created when you create a branch.
                    </p>
                  ) : (
                    dispensers.map((dispenser) => (
                      <div key={dispenser.id} className="p-3 border rounded-lg">
                        <p className="font-medium">Dispenser {dispenser.dispenser_number}</p>
                        <p className="text-sm text-slate-500 capitalize">Multi-Product - {dispenser.status}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nozzles</CardTitle>
                <CardDescription>Nozzles mapped to dispensers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {nozzles.length === 0 ? (
                    <p className="text-sm text-slate-500">No nozzles configured</p>
                  ) : (
                    nozzles.map((nozzle) => {
                      const dispenser = dispensers.find((d) => d.id === nozzle.dispenser_id)
                      return (
                        <div key={nozzle.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {dispenser
                                  ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}`
                                  : `Nozzle ${nozzle.nozzle_number}`}
                              </p>
                              <p className="text-sm text-slate-500">
                                {dispenser ? `Dispenser ${dispenser.dispenser_number}` : "Unknown"} - {nozzle.fuel_type}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Initial Reading: {Number(nozzle.initial_meter_reading || 0).toFixed(3)} L
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`nozzle-${nozzle.id}`} className="text-xs text-slate-500">
                                {nozzle.status === "active" ? "Active" : "Inactive"}
                              </Label>
                              <Switch
                                id={`nozzle-${nozzle.id}`}
                                checked={nozzle.status === "active"}
                                onCheckedChange={() => handleToggleNozzleStatus(nozzle.id, nozzle.status)}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
