"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Fuel,
  FileText,
  RefreshCw,
  DollarSign,
} from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"
import TankManagement from "./tank-management"
import NozzleManagement from "./nozzle-management"
import DispenserManagement from "./dispenser-management"
import BranchItemPricing from "./branch-item-pricing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface StockReportSummary {
  tank_id: string
  tank_name: string
  fuel_type: string
  capacity: number
  current_stock: number
  branch_name: string
  branch_id: string
  total_received: number
  total_adjusted_in: number
  total_adjusted_out: number
  total_sold: number
  total_transferred_out: number
  total_transferred_in: number
  movement_count: number
}

interface StockMovement {
  id: string
  tank_id: string
  tank_name: string
  fuel_type: string
  branch_name: string
  adjustment_type: string
  quantity: number
  previous_stock: number
  new_stock: number
  reason: string
  requested_by: string
  approval_status: string
  kra_sync_status?: string
  created_at: string
}

interface StockReportTotals {
  total_received: number
  total_adjusted_in: number
  total_adjusted_out: number
  total_sold: number
  total_transferred_out: number
  total_transferred_in: number
  current_stock: number
  capacity: number
}

interface Branch {
  id: string
  name: string
}

type SortField = string
type SortDirection = "asc" | "desc" | null

export function InventoryContent() {
  const [activeView, setActiveView] = useState<
    "cards" | "stockIn" | "stockOut" | "tankManagement" | "dispenserManagement" | "nozzleManagement" | "stockReport" | "itemPricing"
  >("cards")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortField, setSortField] = useState<SortField>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const { formatCurrency } = useCurrency()

  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [reportSummary, setReportSummary] = useState<StockReportSummary[]>([])
  const [reportMovements, setReportMovements] = useState<StockMovement[]>([])
  const [reportTotals, setReportTotals] = useState<StockReportTotals | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBranches()
    try {
      const branchData = localStorage.getItem("selectedBranch")
      if (branchData) {
        const parsed = JSON.parse(branchData)
        if (parsed.id) setSelectedBranchId(parsed.id)
      }
    } catch {}
  }, [])

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

  const fetchStockReport = useCallback(async () => {
    if (!selectedBranchId) return
    setLoading(true)
    try {
      let url = `/api/stock-report?branch_id=${selectedBranchId}`
      if (startDate) url += `&start_date=${startDate}`
      if (endDate) url += `&end_date=${endDate}`

      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setReportSummary(result.data.summary || [])
        setReportMovements(result.data.movements || [])
        setReportTotals(result.data.totals || null)
      }
    } catch (error) {
      console.error("Error fetching stock report:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedBranchId, startDate, endDate])

  useEffect(() => {
    if (activeView === "stockReport" || activeView === "stockIn" || activeView === "stockOut") {
      fetchStockReport()
    }
  }, [activeView, fetchStockReport])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field || sortDirection === null) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline" />
    )
  }

  const stockInMovements = reportMovements.filter(m => 
    m.adjustment_type === 'receive' || m.adjustment_type === 'stock_receive' || 
    m.adjustment_type === 'addition' || m.adjustment_type === 'increase' ||
    m.adjustment_type === 'purchase_receive' ||
    (m.adjustment_type === 'manual_adjustment' && m.quantity > 0) ||
    m.adjustment_type === 'transfer_in'
  )

  const stockOutMovements = reportMovements.filter(m => 
    m.adjustment_type === 'sale' || m.adjustment_type === 'deduction' || 
    m.adjustment_type === 'decrease' ||
    (m.adjustment_type === 'manual_adjustment' && m.quantity < 0) ||
    m.adjustment_type === 'transfer_out' || m.adjustment_type === 'transfer'
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAdjustmentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      receive: "bg-green-100 text-green-800",
      stock_receive: "bg-green-100 text-green-800",
      addition: "bg-green-100 text-green-800",
      increase: "bg-green-100 text-green-800",
      purchase_receive: "bg-green-100 text-green-800",
      sale: "bg-blue-100 text-blue-800",
      deduction: "bg-red-100 text-red-800",
      decrease: "bg-red-100 text-red-800",
      manual_adjustment: "bg-yellow-100 text-yellow-800",
      transfer_in: "bg-purple-100 text-purple-800",
      transfer_out: "bg-orange-100 text-orange-800",
      transfer: "bg-orange-100 text-orange-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Inventory Management</h1>
          <p className="mt-1 text-muted-foreground text-pretty">Monitor and manage your stock levels</p>
        </div>
      </div>

      {activeView === "cards" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("stockReport")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Report</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Report</div>
              <p className="text-xs text-muted-foreground mt-1">Per tank stock summary</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("stockIn")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock In History</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockInMovements.length} Entries</div>
              <p className="text-xs text-muted-foreground mt-1">Stock received & adjusted in</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("stockOut")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Out History</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockOutMovements.length} Entries</div>
              <p className="text-xs text-muted-foreground mt-1">Sales & deductions</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("tankManagement")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tank Management</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage Tanks</div>
              <p className="text-xs text-muted-foreground mt-1">Stock levels & transfers</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("dispenserManagement")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispenser Management</CardTitle>
              <Fuel className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage Dispensers</div>
              <p className="text-xs text-muted-foreground mt-1">Add dispensers & assign tanks</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("nozzleManagement")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nozzle Management</CardTitle>
              <Fuel className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage Nozzles</div>
              <p className="text-xs text-muted-foreground mt-1">Add & configure nozzles</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("itemPricing")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item Pricing</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Set Prices</div>
              <p className="text-xs text-muted-foreground mt-1">Branch-specific item prices</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "cards" && reportTotals && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Stock Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700">Total Received</p>
                <p className="text-xl font-bold text-green-800">{reportTotals.total_received.toLocaleString()} L</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">Total Sold</p>
                <p className="text-xl font-bold text-blue-800">{reportTotals.total_sold.toLocaleString()} L</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-700">Adjusted In/Out</p>
                <p className="text-xl font-bold text-yellow-800">
                  +{reportTotals.total_adjusted_in.toLocaleString()} / -{reportTotals.total_adjusted_out.toLocaleString()} L
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">Current Stock</p>
                <p className="text-xl font-bold text-purple-800">{reportTotals.current_stock.toLocaleString()} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeView === "stockReport" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={fetchStockReport} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Stock Report by Tank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="w-64">
                  <Label>Branch</Label>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl w-48"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl w-48"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : reportSummary.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedBranchId ? "No stock data found" : "Select a branch to view report"}
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tank</TableHead>
                        <TableHead>Fuel Type</TableHead>
                        <TableHead className="text-right">Capacity</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right text-green-700">Received</TableHead>
                        <TableHead className="text-right text-yellow-700">Adjusted +/-</TableHead>
                        <TableHead className="text-right text-blue-700">Sold</TableHead>
                        <TableHead className="text-right text-purple-700">Transferred In/Out</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportSummary.map((row) => (
                        <TableRow key={row.tank_id}>
                          <TableCell className="font-medium">{row.tank_name}</TableCell>
                          <TableCell>{row.fuel_type}</TableCell>
                          <TableCell className="text-right">{Number(row.capacity).toLocaleString()} L</TableCell>
                          <TableCell className="text-right font-medium">{Number(row.current_stock).toLocaleString()} L</TableCell>
                          <TableCell className="text-right text-green-600">+{Number(row.total_received).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-yellow-600">
                            +{Number(row.total_adjusted_in).toLocaleString()} / -{Number(row.total_adjusted_out).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">{Number(row.total_sold).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-purple-600">
                            +{Number(row.total_transferred_in).toLocaleString()} / -{Number(row.total_transferred_out).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {reportMovements.length > 0 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Recent Stock Movements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tank</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Before</TableHead>
                        <TableHead className="text-right">After</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>KRA Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportMovements.slice(0, 20).map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="text-sm">{formatDate(movement.created_at)}</TableCell>
                          <TableCell className="font-medium">{movement.tank_name}</TableCell>
                          <TableCell>
                            <Badge className={getAdjustmentTypeBadge(movement.adjustment_type)}>
                              {movement.adjustment_type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity >= 0 ? '+' : ''}{Number(movement.quantity).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{Number(movement.previous_stock).toLocaleString()}</TableCell>
                          <TableCell className="text-right">{Number(movement.new_stock).toLocaleString()}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{movement.reason || '-'}</TableCell>
                          <TableCell>
                            {movement.kra_sync_status === 'synced' ? (
                              <Badge className="bg-green-100 text-green-800">Synced</Badge>
                            ) : movement.kra_sync_status === 'failed' ? (
                              <Badge className="bg-red-100 text-red-800">Failed</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-600">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(activeView === "stockIn" || activeView === "stockOut") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={fetchStockReport} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{activeView === "stockIn" ? "Stock In History" : "Stock Out History"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="w-64">
                  <Label>Branch</Label>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 relative">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by tank or reason..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl w-48"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl w-48"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tank</TableHead>
                        <TableHead>Fuel Type</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>KRA Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activeView === "stockIn" ? stockInMovements : stockOutMovements)
                        .filter(m => 
                          searchQuery === "" ||
                          m.tank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.reason?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">{formatDate(item.created_at)}</TableCell>
                            <TableCell className="font-medium">{item.tank_name}</TableCell>
                            <TableCell>{item.fuel_type}</TableCell>
                            <TableCell>
                              <Badge className={getAdjustmentTypeBadge(item.adjustment_type)}>
                                {item.adjustment_type.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${activeView === "stockIn" ? 'text-green-600' : 'text-red-600'}`}>
                              {activeView === "stockIn" ? '+' : '-'}{Math.abs(Number(item.quantity)).toLocaleString()} L
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{item.reason || '-'}</TableCell>
                            <TableCell>
                              {item.kra_sync_status === 'synced' ? (
                                <Badge className="bg-green-100 text-green-800">Synced</Badge>
                              ) : item.kra_sync_status === 'failed' ? (
                                <Badge className="bg-red-100 text-red-800">Failed</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      {(activeView === "stockIn" ? stockInMovements : stockOutMovements).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {selectedBranchId ? "No stock movements found" : "Select a branch to view history"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "tankManagement" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
          </div>
          <TankManagement branchId={selectedBranchId} />
        </div>
      )}

      {activeView === "dispenserManagement" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
          </div>
          <DispenserManagement branchId={selectedBranchId} />
        </div>
      )}

      {activeView === "nozzleManagement" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
          </div>
          <NozzleManagement branchId={selectedBranchId} />
        </div>
      )}

      {activeView === "itemPricing" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
          </div>
          <BranchItemPricing />
        </div>
      )}
    </div>
  )
}
