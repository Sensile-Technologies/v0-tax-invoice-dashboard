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
import { Fuel, Gauge, Plus, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ConfigurationPage() {
  const router = useRouter()
  const [fuelPrices, setFuelPrices] = useState<any[]>([])
  const [dispensers, setDispensers] = useState<any[]>([])
  const [nozzles, setNozzles] = useState<any[]>([])
  const [availableFuelTypes, setAvailableFuelTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [newPrice, setNewPrice] = useState({ fuel_type: "", price: "" })
  const [newNozzle, setNewNozzle] = useState({
    dispenser_id: "",
    nozzle_number: "",
    fuel_type: "",
    initial_meter_reading: "",
  })

  const supabase = createClient()

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

      const { data: tanksData, error: tanksError } = await supabase
        .from("tanks")
        .select("fuel_type")
        .eq("branch_id", branchId)

      if (tanksError) {
        console.error("Error fetching tanks:", tanksError)
      } else {
        const fuelTypes = [...new Set(tanksData?.map((tank) => tank.fuel_type) || [])]
        setAvailableFuelTypes(fuelTypes)
      }

      const { data: pricesData, error: pricesError } = await supabase
        .from("fuel_prices")
        .select("*")
        .eq("branch_id", branchId)
        .order("effective_date", { ascending: false })

      if (pricesError) {
        console.error("Error fetching fuel prices:", pricesError)
      } else {
        setFuelPrices(pricesData || [])
      }

      const { data: dispensersData, error: dispensersError } = await supabase
        .from("dispensers")
        .select("*")
        .eq("branch_id", branchId)

      if (dispensersError) {
        console.error("Error fetching dispensers:", dispensersError)
      } else {
        setDispensers(dispensersData || [])
      }

      const { data: nozzlesData, error: nozzlesError } = await supabase
        .from("nozzles")
        .select("*")
        .eq("branch_id", branchId)

      if (nozzlesError) {
        console.error("Error fetching nozzles:", nozzlesError)
      } else {
        setNozzles(nozzlesData || [])
      }
    } catch (error) {
      console.error("Error fetching configuration:", error)
      toast.error("Failed to load configuration")
    }
  }

  const handleAddFuelPrice = async () => {
    if (!newPrice.fuel_type || !newPrice.price) {
      toast.error("Please fill in all fields")
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

      const { data, error } = await supabase
        .from("fuel_prices")
        .insert({
          branch_id: branchId,
          fuel_type: newPrice.fuel_type,
          price: Number.parseFloat(newPrice.price),
          effective_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding fuel price:", error)
        toast.error("Failed to add fuel price")
      } else {
        toast.success("Fuel price added successfully")
        setNewPrice({ fuel_type: "", price: "" })
        await fetchConfiguration()
      }
    } catch (error) {
      console.error("Error adding fuel price:", error)
      toast.error("Failed to add fuel price")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFuelPrice = async (priceId: string, fuelType: string) => {
    if (!editPrice) {
      toast.error("Please enter a price")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("fuel_prices")
        .update({
          price: Number.parseFloat(editPrice),
          effective_date: new Date().toISOString(),
        })
        .eq("id", priceId)

      if (error) {
        console.error("Error updating fuel price:", error)
        toast.error("Failed to update fuel price")
      } else {
        toast.success(`${fuelType} price updated successfully`)
        setEditingPriceId(null)
        setEditPrice("")
        await fetchConfiguration()
      }
    } catch (error) {
      console.error("Error updating fuel price:", error)
      toast.error("Failed to update fuel price")
    } finally {
      setLoading(false)
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

      const { data: tanksData, error: tanksError } = await supabase
        .from("tanks")
        .select("id")
        .eq("branch_id", branchId)
        .eq("fuel_type", newNozzle.fuel_type)
        .limit(1)

      if (tanksError) {
        console.error("Error checking tanks:", tanksError)
        toast.error("Failed to validate fuel type")
        setLoading(false)
        return
      }

      if (!tanksData || tanksData.length === 0) {
        toast.error(
          `No tank configured for ${newNozzle.fuel_type}. Please add a ${newNozzle.fuel_type} tank in Tank Management first.`,
        )
        setLoading(false)
        return
      }

      const priceExists = fuelPrices.some((price) => price.fuel_type === newNozzle.fuel_type)
      if (!priceExists) {
        toast.error(
          `No price configured for ${newNozzle.fuel_type}. Please add a fuel price for ${newNozzle.fuel_type} first.`,
        )
        setLoading(false)
        return
      }

      const { data: existingNozzles, error: fetchError } = await supabase
        .from("nozzles")
        .select("nozzle_number")
        .eq("dispenser_id", newNozzle.dispenser_id)
        .order("nozzle_number", { ascending: false })
        .limit(1)

      if (fetchError) {
        console.error("Error fetching existing nozzles:", fetchError)
        toast.error("Failed to determine next nozzle number")
        setLoading(false)
        return
      }

      const nextNozzleNumber = existingNozzles && existingNozzles.length > 0 ? existingNozzles[0].nozzle_number + 1 : 1

      const { data, error } = await supabase
        .from("nozzles")
        .insert({
          branch_id: branchId,
          dispenser_id: newNozzle.dispenser_id,
          nozzle_number: nextNozzleNumber,
          fuel_type: newNozzle.fuel_type,
          initial_meter_reading: newNozzle.initial_meter_reading
            ? Number.parseFloat(newNozzle.initial_meter_reading)
            : 0,
          status: "active",
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding nozzle:", error)
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
      const { error } = await supabase.from("nozzles").update({ status: newStatus }).eq("id", nozzleId)

      if (error) {
        console.error("Error updating nozzle status:", error)
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
              <CardTitle>Add Fuel Price</CardTitle>
              <CardDescription>Set selling prices for different fuel types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select
                    value={newPrice.fuel_type}
                    onValueChange={(value) => setNewPrice({ ...newPrice, fuel_type: value })}
                  >
                    <SelectTrigger id="fuel_type">
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFuelTypes.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-slate-500">
                          No fuel types available. Add tanks in Tank Management first.
                        </div>
                      ) : (
                        availableFuelTypes
                          .filter((fuelType) => !fuelPrices.some((price) => price.fuel_type === fuelType))
                          .map((fuelType) => (
                            <SelectItem key={fuelType} value={fuelType}>
                              {fuelType}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddFuelPrice}
                disabled={
                  loading || availableFuelTypes.filter((ft) => !fuelPrices.some((p) => p.fuel_type === ft)).length === 0
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Fuel Price
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Fuel Prices</CardTitle>
              <CardDescription>Active fuel prices for this branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fuelPrices.length === 0 ? (
                  <p className="text-sm text-slate-500">No fuel prices configured</p>
                ) : (
                  fuelPrices.map((price) => (
                    <div key={price.id} className="flex items-center justify-between p-3 border rounded-lg">
                      {editingPriceId === price.id ? (
                        <>
                          <div className="flex-1">
                            <p className="font-medium mb-2">{price.fuel_type}</p>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter new price"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="max-w-[200px]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateFuelPrice(price.id, price.fuel_type)}
                              disabled={loading}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPriceId(null)
                                setEditPrice("")
                              }}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium">{price.fuel_type}</p>
                            <p className="text-sm text-slate-500">
                              Effective: {new Date(price.effective_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-bold">KES {Number.parseFloat(price.price).toFixed(2)}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPriceId(price.id)
                                setEditPrice(price.price.toString())
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </>
                      )}
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
                                Initial Reading: {nozzle.initial_meter_reading?.toFixed(3) || "0.000"} L
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
