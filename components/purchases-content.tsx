"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Search, Loader2, Package, ClipboardCheck, Fuel, Gauge, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"
import { toast } from "sonner"

interface Purchase {
  id: string
  po_number: string
  supplier: string
  supplier_tin?: string
  date: string | null
  items: number
  amount: number
  tax_amount: number
  volume?: number
  status: string
  purchase_type?: string
  payment_type?: string
  remark?: string
  created_at: string
  source?: 'purchase_order' | 'transaction'
}

interface PendingPO {
  id: string
  po_number: string
  supplier_name: string
  item_count: number
  total_amount: number
  expected_delivery: string
  notes: string
  issued_at: string
  created_by_name: string
}

interface Tank {
  id: string
  tank_name: string
  capacity: number
  current_stock?: number
}

interface Dispenser {
  id: string
  dispenser_number: string
  tank_id: string
  meter_reading?: number
}

interface TankReading {
  tank_id: string
  tank_name: string
  capacity: number
  volume_before: number
  volume_after: number
}

interface DispenserReading {
  dispenser_id: string
  dispenser_name: string
  meter_reading_before: number
  meter_reading_after: number
}

interface NozzleReading {
  nozzle_id: string
  nozzle_name: string
  fuel_type: string
  dispenser_number: number
  meter_reading_before: number
  meter_reading_after: number
}

interface POItemEntry {
  item_id: string
  item_name: string
  ordered_quantity: number
  unit_price: number
  bowser_volume: string
}

export function PurchasesContent() {
  const [activeTab, setActiveTab] = useState("all")
  const { formatCurrency } = useCurrency()
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [isPendingListOpen, setIsPendingListOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pendingPOs, setPendingPOs] = useState<PendingPO[]>([])
  const [tanks, setTanks] = useState<Tank[]>([])
  const [dispensers, setDispensers] = useState<Dispenser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPending, setLoadingPending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<any>(null)
  const [selectedPO, setSelectedPO] = useState<PendingPO | null>(null)
  
  const [acceptanceForm, setAcceptanceForm] = useState({
    acceptanceTimestamp: new Date().toISOString().slice(0, 16),
    remarks: ""
  })
  const [poItemEntries, setPoItemEntries] = useState<POItemEntry[]>([])
  const [tankReadings, setTankReadings] = useState<TankReading[]>([])
  const [dispenserReadings, setDispenserReadings] = useState<DispenserReading[]>([])
  const [nozzleReadings, setNozzleReadings] = useState<NozzleReading[]>([])

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
        setCurrentBranch(branch)
      }

      const params = new URLSearchParams()
      if (branchId) params.append("branch_id", branchId)
      if (searchQuery) params.append("search", searchQuery)
      if (dateFrom) params.append("date_from", dateFrom)
      if (dateTo) params.append("date_to", dateTo)

      const response = await fetch(`/api/purchases?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setPurchases(result.purchases || [])
      } else {
        console.error("Failed to fetch purchases:", result.error)
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, dateFrom, dateTo])

  const fetchPendingPOs = useCallback(async () => {
    if (!currentBranch?.id) return
    
    try {
      setLoadingPending(true)
      const response = await fetch(`/api/purchases/accept?branch_id=${currentBranch.id}`)
      const result = await response.json()

      if (result.success) {
        setPendingPOs(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching pending POs:", error)
    } finally {
      setLoadingPending(false)
    }
  }, [currentBranch])

  const fetchTanksAndDispensers = useCallback(async () => {
    if (!currentBranch?.id) return

    try {
      const [tanksRes, dispensersRes] = await Promise.all([
        fetch(`/api/tanks?branch_id=${currentBranch.id}`),
        fetch(`/api/dispensers?branch_id=${currentBranch.id}`)
      ])

      const tanksResult = await tanksRes.json()
      const dispensersResult = await dispensersRes.json()

      if (tanksResult.success) {
        setTanks(tanksResult.data || [])
        setTankReadings((tanksResult.data || []).map((t: Tank) => ({
          tank_id: t.id,
          tank_name: t.tank_name,
          capacity: t.capacity || 0,
          volume_before: t.current_stock || 0,
          volume_after: 0
        })))
      }

      if (dispensersResult.success) {
        setDispensers(dispensersResult.data || [])
        setDispenserReadings((dispensersResult.data || []).map((d: Dispenser) => ({
          dispenser_id: d.id,
          dispenser_name: `Dispenser ${d.dispenser_number}`,
          meter_reading_before: d.meter_reading || 0,
          meter_reading_after: 0
        })))
      }
    } catch (error) {
      console.error("Error fetching tanks/dispensers:", error)
    }
  }, [currentBranch])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  useEffect(() => {
    if (currentBranch?.id) {
      fetchPendingPOs()
    }
  }, [currentBranch, fetchPendingPOs])

  const deliveries = purchases.filter((purchase) => purchase.source === "purchase_order")
  const kraPurchases = purchases.filter((purchase) => purchase.source === "transaction")
  const approvedPurchases = purchases.filter((purchase) => purchase.status === "approved")
  const rejectedPurchases = purchases.filter((purchase) => purchase.status === "rejected")

  const totalBowserVolume = useMemo(() => {
    return poItemEntries.reduce((sum, item) => sum + (parseFloat(item.bowser_volume) || 0), 0)
  }, [poItemEntries])

  const variance = useMemo(() => {
    const tankVariance = tankReadings.reduce((sum, t) => {
      return sum + ((parseFloat(String(t.volume_after)) || 0) - (parseFloat(String(t.volume_before)) || 0))
    }, 0)

    const nozzleVariance = nozzleReadings.reduce((sum, n) => {
      return sum + ((parseFloat(String(n.meter_reading_after)) || 0) - (parseFloat(String(n.meter_reading_before)) || 0))
    }, 0)

    return (tankVariance + nozzleVariance) - totalBowserVolume
  }, [totalBowserVolume, tankReadings, nozzleReadings])

  const updatePoItemBowserVolume = (index: number, value: string) => {
    const updated = [...poItemEntries]
    updated[index].bowser_volume = value
    setPoItemEntries(updated)
  }

  const handleSelectPO = async (po: PendingPO) => {
    setSelectedPO(po)
    setIsPendingListOpen(false)
    setIsAcceptDialogOpen(true)
    setAcceptanceForm({
      acceptanceTimestamp: new Date().toISOString().slice(0, 16),
      remarks: ""
    })
    setPoItemEntries([])
    
    try {
      const response = await fetch(`/api/purchases/accept?purchase_order_id=${po.id}`)
      const result = await response.json()
      
      if (result.success) {
        setTanks(result.tanks || [])
        setTankReadings((result.tanks || []).map((t: any) => ({
          tank_id: t.id,
          tank_name: t.tank_name,
          capacity: parseFloat(t.capacity) || 0,
          volume_before: t.current_stock || 0,
          volume_after: 0
        })))
        
        setDispensers(result.dispensers || [])
        setDispenserReadings((result.dispensers || []).map((d: any) => ({
          dispenser_id: d.id,
          dispenser_name: `Dispenser ${d.dispenser_number}`,
          meter_reading_before: parseFloat(d.last_meter_reading) || 0,
          meter_reading_after: 0
        })))
        
        // Populate nozzle readings for multi-nozzle pumps
        setNozzleReadings((result.nozzles || []).map((n: any) => ({
          nozzle_id: n.id,
          nozzle_name: `P${n.dispenser_number || '?'} - N${n.nozzle_number}`,
          fuel_type: n.fuel_name || n.fuel_type || 'Unknown',
          dispenser_number: n.dispenser_number || 0,
          meter_reading_before: parseFloat(n.last_meter_reading) || 0,
          meter_reading_after: 0
        })))
        
        // Populate item entries for bowser volume input per product
        setPoItemEntries((result.items || []).map((item: any) => ({
          item_id: item.item_id,
          item_name: item.item_name,
          ordered_quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
          bowser_volume: ""
        })))
      }
    } catch (error) {
      console.error("Error fetching PO-specific tanks/dispensers:", error)
    }
  }

  const handleSubmitAcceptance = async () => {
    if (!selectedPO) return

    // Check if at least one bowser volume is entered
    const hasAnyBowserVolume = poItemEntries.some(item => parseFloat(item.bowser_volume) > 0)
    if (!hasAnyBowserVolume) {
      toast.error("Please enter bowser volume for at least one product")
      return
    }

    // Check if any tank exceeds capacity
    for (const tank of tankReadings) {
      const volumeAfter = parseFloat(String(tank.volume_after)) || 0
      if (tank.capacity > 0 && volumeAfter > tank.capacity) {
        toast.error(`${tank.tank_name}: Volume after (${volumeAfter}L) exceeds capacity (${tank.capacity}L)`)
        return
      }
    }

    try {
      setSubmitting(true)

      const response = await fetch("/api/purchases/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_order_id: selectedPO.id,
          bowser_volume: totalBowserVolume,
          item_bowser_volumes: poItemEntries.map(item => ({
            item_id: item.item_id,
            bowser_volume: parseFloat(item.bowser_volume) || 0
          })),
          acceptance_timestamp: acceptanceForm.acceptanceTimestamp,
          remarks: acceptanceForm.remarks,
          tank_readings: tankReadings.map(t => ({
            tank_id: t.tank_id,
            volume_before: parseFloat(String(t.volume_before)) || 0,
            volume_after: parseFloat(String(t.volume_after)) || 0
          })),
          dispenser_readings: dispenserReadings.map(d => ({
            dispenser_id: d.dispenser_id,
            meter_reading_before: parseFloat(String(d.meter_reading_before)) || 0,
            meter_reading_after: parseFloat(String(d.meter_reading_after)) || 0
          })),
          nozzle_readings: nozzleReadings.map(n => ({
            nozzle_id: n.nozzle_id,
            meter_reading_before: parseFloat(String(n.meter_reading_before)) || 0,
            meter_reading_after: parseFloat(String(n.meter_reading_after)) || 0
          }))
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Purchase order ${selectedPO.po_number} accepted successfully!`)
        setIsAcceptDialogOpen(false)
        setSelectedPO(null)
        fetchPurchases()
        fetchPendingPOs()
      } else {
        toast.error(result.error || "Failed to accept purchase order")
      }
    } catch (error) {
      console.error("Error accepting purchase order:", error)
      toast.error("Failed to accept purchase order")
    } finally {
      setSubmitting(false)
    }
  }

  const updateTankReading = (index: number, field: keyof TankReading, value: number) => {
    const updated = [...tankReadings]
    updated[index] = { ...updated[index], [field]: value }
    setTankReadings(updated)
  }

  const updateNozzleReading = (index: number, field: keyof NozzleReading, value: number) => {
    const updated = [...nozzleReadings]
    updated[index] = { ...updated[index], [field]: value }
    setNozzleReadings(updated)
  }

  const renderPurchaseTable = (purchaseList: Purchase[]) => (
    <div className="rounded-xl border overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-xs md:text-sm">
            <TableHead>Purchase Order ID</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden sm:table-cell">Items</TableHead>
            <TableHead className="hidden sm:table-cell">Volume (L)</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No purchases found</p>
              </TableCell>
            </TableRow>
          ) : (
            purchaseList.map((purchase) => (
              <TableRow key={purchase.id} className="text-xs md:text-sm">
                <TableCell className="font-medium">{purchase.po_number}</TableCell>
                <TableCell>{purchase.supplier}</TableCell>
                <TableCell className="hidden md:table-cell">{purchase.date || "N/A"}</TableCell>
                <TableCell className="hidden sm:table-cell">{purchase.items}</TableCell>
                <TableCell className="hidden sm:table-cell">{purchase.volume ? purchase.volume.toLocaleString() : "-"}</TableCell>
                <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={purchase.status === "approved" ? "default" : purchase.status === "rejected" ? "destructive" : "secondary"}
                    className="rounded-lg text-xs"
                  >
                    {purchase.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Purchases</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Accept purchase orders from headquarters</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => { fetchPendingPOs(); setIsPendingListOpen(true) }}
            className="rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-sm relative"
            size="sm"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Accept Purchase</span>
            {pendingPOs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingPOs.length}
              </span>
            )}
          </Button>
          <Button 
            onClick={fetchPurchases}
            className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-3 md:p-6">
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search purchases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="rounded-xl w-32 md:w-40 text-sm"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="rounded-xl w-32 md:w-40 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Loading purchases...</span>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="rounded-xl bg-transparent gap-1 md:gap-2 flex-wrap">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-muted text-xs md:text-sm">
                  All ({purchases.length})
                </TabsTrigger>
                <TabsTrigger value="deliveries" className="rounded-lg data-[state=active]:bg-muted text-xs md:text-sm">
                  Deliveries ({deliveries.length})
                </TabsTrigger>
                <TabsTrigger value="kra" className="rounded-lg data-[state=active]:bg-muted text-xs md:text-sm">
                  KRA Purchases ({kraPurchases.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 md:mt-6">
                {renderPurchaseTable(purchases)}
              </TabsContent>

              <TabsContent value="deliveries" className="mt-4 md:mt-6">
                {renderPurchaseTable(deliveries)}
              </TabsContent>

              <TabsContent value="kra" className="mt-4 md:mt-6">
                {renderPurchaseTable(kraPurchases)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPendingListOpen} onOpenChange={setIsPendingListOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Pending Purchase Orders
            </DialogTitle>
            <DialogDescription>
              Select a purchase order from headquarters to accept
            </DialogDescription>
          </DialogHeader>
          
          {loadingPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : pendingPOs.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No pending purchase orders to accept</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingPOs.map(po => (
                <div 
                  key={po.id} 
                  onClick={() => handleSelectPO(po)}
                  className="p-4 border rounded-xl hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{po.po_number}</p>
                      <p className="text-sm text-muted-foreground">{po.supplier_name || "No supplier specified"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(parseFloat(String(po.total_amount)) || 0)}</p>
                      <p className="text-sm text-muted-foreground">{po.item_count} items</p>
                    </div>
                  </div>
                  {po.notes && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">{po.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Accept Purchase Order: {selectedPO?.po_number}</DialogTitle>
            <DialogDescription>
              Record delivery details, tank volumes, and dispenser readings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Bowser Volume per Product */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Package className="h-5 w-5" />
                Bowser Volume by Product *
              </h3>
              {poItemEntries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Loading products...</p>
              ) : (
                <div className="space-y-3">
                  {poItemEntries.map((item, index) => (
                    <div key={item.item_id} className="grid grid-cols-3 gap-3 p-3 border rounded-xl">
                      <div>
                        <Label className="text-xs text-muted-foreground">Product</Label>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-xs text-muted-foreground">Ordered: {item.ordered_quantity?.toLocaleString()}L</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Bowser Volume (L) *</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 15000"
                          value={item.bowser_volume}
                          onChange={(e) => updatePoItemBowserVolume(index, e.target.value)}
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Variance from Order</Label>
                        <p className={`font-medium text-sm pt-2 ${
                          (parseFloat(item.bowser_volume) || 0) - item.ordered_quantity < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {((parseFloat(item.bowser_volume) || 0) - item.ordered_quantity).toFixed(0)} L
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end p-2 bg-muted rounded-xl">
                    <p className="font-semibold">Total Bowser Volume: {totalBowserVolume.toLocaleString()} L</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Acceptance Timestamp *</Label>
                <Input
                  type="datetime-local"
                  value={acceptanceForm.acceptanceTimestamp}
                  onChange={(e) => setAcceptanceForm({ ...acceptanceForm, acceptanceTimestamp: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Input
                  placeholder="Any notes about this delivery"
                  value={acceptanceForm.remarks}
                  onChange={(e) => setAcceptanceForm({ ...acceptanceForm, remarks: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Fuel className="h-5 w-5" />
                Tank Volume Readings
              </h3>
              {tankReadings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tanks configured for this branch</p>
              ) : (
                <div className="space-y-3">
                  {tankReadings.map((tank, index) => {
                    const exceedsCapacity = tank.capacity > 0 && (parseFloat(String(tank.volume_after)) || 0) > tank.capacity
                    return (
                      <div key={tank.tank_id} className={`grid grid-cols-3 gap-3 p-3 border rounded-xl ${exceedsCapacity ? 'border-red-500 bg-red-50' : ''}`}>
                        <div>
                          <Label className="text-xs text-muted-foreground">Tank</Label>
                          <p className="font-medium">{tank.tank_name}</p>
                          <p className="text-xs text-muted-foreground">Capacity: {tank.capacity?.toLocaleString()}L</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Volume Before (L)</Label>
                          <Input
                            type="number"
                            value={tank.volume_before || ""}
                            onChange={(e) => updateTankReading(index, "volume_before", parseFloat(e.target.value) || 0)}
                            className="rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Volume After (L)</Label>
                          <Input
                            type="number"
                            value={tank.volume_after || ""}
                            onChange={(e) => updateTankReading(index, "volume_after", parseFloat(e.target.value) || 0)}
                            className={`rounded-xl h-9 ${exceedsCapacity ? 'border-red-500' : ''}`}
                          />
                          {exceedsCapacity && (
                            <p className="text-xs text-red-600 font-medium">Exceeds capacity ({tank.capacity?.toLocaleString()}L)</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Nozzle Meter Readings */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Gauge className="h-5 w-5" />
                Nozzle Meter Readings
              </h3>
              {nozzleReadings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No nozzles configured for this branch</p>
              ) : (
                <div className="space-y-3">
                  {nozzleReadings.map((nozzle, index) => (
                    <div key={nozzle.nozzle_id} className="grid grid-cols-4 gap-3 p-3 border rounded-xl">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nozzle</Label>
                        <p className="font-medium">{nozzle.nozzle_name}</p>
                        <p className="text-xs text-muted-foreground">{nozzle.fuel_type}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Meter Before</Label>
                        <Input
                          type="number"
                          value={nozzle.meter_reading_before || ""}
                          onChange={(e) => updateNozzleReading(index, "meter_reading_before", parseFloat(e.target.value) || 0)}
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Meter After</Label>
                        <Input
                          type="number"
                          value={nozzle.meter_reading_after || ""}
                          onChange={(e) => updateNozzleReading(index, "meter_reading_after", parseFloat(e.target.value) || 0)}
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Difference</Label>
                        <p className="font-medium text-sm pt-2">
                          {((parseFloat(String(nozzle.meter_reading_after)) || 0) - (parseFloat(String(nozzle.meter_reading_before)) || 0)).toFixed(2)} L
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className={`p-4 rounded-xl ${Math.abs(variance) > 100 ? 'bg-red-50 border-red-200' : variance === 0 ? 'bg-gray-50' : 'bg-yellow-50 border-yellow-200'} border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {Math.abs(variance) > 100 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  <span className="font-semibold">Calculated Variance</span>
                </div>
                <span className={`text-2xl font-bold ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : ''}`}>
                  {variance > 0 ? '+' : ''}{variance.toFixed(2)} L
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Formula: (Tank After - Tank Before) + (Nozzle/Dispenser After - Before) - Bowser Volume
              </p>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAcceptance} 
              disabled={submitting || totalBowserVolume <= 0}
              className="rounded-xl bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Accept Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
