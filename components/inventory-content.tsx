"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package,
  TrendingUp,
  TrendingDown,
  UploadIcon,
  Edit,
  Search,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Fuel,
} from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import TankManagement from "./tank-management"

// Sample inventory data
const stockItems = [
  { code: "ITM-001", name: "Product A", price: 1250, quantity: 150, lastChange: "2024-01-15" },
  { code: "ITM-002", name: "Product B", price: 2500, quantity: 75, lastChange: "2024-01-16" },
  { code: "ITM-003", name: "Product C", price: 800, quantity: 200, lastChange: "2024-01-17" },
  { code: "ITM-004", name: "Product D", price: 3200, quantity: 50, lastChange: "2024-01-18" },
  { code: "ITM-005", name: "Product E", price: 1800, quantity: 120, lastChange: "2024-01-19" },
]

const stockInHistory = [
  { code: "ITM-001", name: "Product A", quantityAdded: 50, date: "2024-01-15", supplier: "Supplier X" },
  { code: "ITM-003", name: "Product C", quantityAdded: 100, date: "2024-01-16", supplier: "Supplier Y" },
  { code: "ITM-005", name: "Product E", quantityAdded: 30, date: "2024-01-17", supplier: "Supplier Z" },
  { code: "ITM-002", name: "Product B", quantityAdded: 25, date: "2024-01-18", supplier: "Supplier X" },
]

const stockOutHistory = [
  { code: "ITM-001", name: "Product A", quantityRemoved: 20, date: "2024-01-16", reason: "Sales" },
  { code: "ITM-004", name: "Product D", quantityRemoved: 10, date: "2024-01-17", reason: "Damaged" },
  { code: "ITM-002", name: "Product B", quantityRemoved: 15, date: "2024-01-18", reason: "Sales" },
  { code: "ITM-003", name: "Product C", quantityRemoved: 25, date: "2024-01-19", reason: "Sales" },
]

const stockMovementData = {
  day: [
    { time: "00:00", stockIn: 5, stockOut: 3 },
    { time: "04:00", stockIn: 8, stockOut: 5 },
    { time: "08:00", stockIn: 12, stockOut: 8 },
    { time: "12:00", stockIn: 15, stockOut: 12 },
    { time: "16:00", stockIn: 10, stockOut: 9 },
    { time: "20:00", stockIn: 7, stockOut: 6 },
  ],
  week: [
    { time: "Mon", stockIn: 45, stockOut: 32 },
    { time: "Tue", stockIn: 52, stockOut: 38 },
    { time: "Wed", stockIn: 48, stockOut: 35 },
    { time: "Thu", stockIn: 60, stockOut: 42 },
    { time: "Fri", stockIn: 55, stockOut: 40 },
    { time: "Sat", stockIn: 38, stockOut: 28 },
    { time: "Sun", stockIn: 30, stockOut: 22 },
  ],
  month: [
    { time: "Week 1", stockIn: 280, stockOut: 210 },
    { time: "Week 2", stockIn: 320, stockOut: 245 },
    { time: "Week 3", stockIn: 295, stockOut: 230 },
    { time: "Week 4", stockIn: 310, stockOut: 250 },
  ],
  "6months": [
    { time: "Jul", stockIn: 1250, stockOut: 980 },
    { time: "Aug", stockIn: 1320, stockOut: 1050 },
    { time: "Sep", stockIn: 1280, stockOut: 1020 },
    { time: "Oct", stockIn: 1350, stockOut: 1080 },
    { time: "Nov", stockIn: 1400, stockOut: 1120 },
    { time: "Dec", stockIn: 1380, stockOut: 1100 },
  ],
  year: [
    { time: "Jan", stockIn: 1200, stockOut: 950 },
    { time: "Feb", stockIn: 1150, stockOut: 920 },
    { time: "Mar", stockIn: 1300, stockOut: 1000 },
    { time: "Apr", stockIn: 1280, stockOut: 980 },
    { time: "May", stockIn: 1350, stockOut: 1050 },
    { time: "Jun", stockIn: 1320, stockOut: 1020 },
    { time: "Jul", stockIn: 1250, stockOut: 980 },
    { time: "Aug", stockIn: 1320, stockOut: 1050 },
    { time: "Sep", stockIn: 1280, stockOut: 1020 },
    { time: "Oct", stockIn: 1350, stockOut: 1080 },
    { time: "Nov", stockIn: 1400, stockOut: 1120 },
    { time: "Dec", stockIn: 1380, stockOut: 1100 },
  ],
}

type SortField = string
type SortDirection = "asc" | "desc" | null

export function InventoryContent() {
  const [activeView, setActiveView] = useState<
    "cards" | "status" | "stockIn" | "stockOut" | "update" | "tankManagement"
  >("cards")
  const [updateTab, setUpdateTab] = useState("external")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortField, setSortField] = useState<SortField>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month" | "6months" | "year">("week")
  const { formatCurrency } = useCurrency()

  // Sort function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort icon component
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

  // Filtered and sorted data
  const filteredStockItems = useMemo(() => {
    let filtered = stockItems.filter(
      (item) =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (startDate || endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.lastChange)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()
        return itemDate >= start && itemDate <= end
      })
    }

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a]
        const bValue = b[sortField as keyof typeof b]
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [searchQuery, startDate, endDate, sortField, sortDirection])

  const filteredStockIn = useMemo(() => {
    let filtered = stockInHistory.filter(
      (item) =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (startDate || endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()
        return itemDate >= start && itemDate <= end
      })
    }

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a]
        const bValue = b[sortField as keyof typeof b]
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [searchQuery, startDate, endDate, sortField, sortDirection])

  const filteredStockOut = useMemo(() => {
    let filtered = stockOutHistory.filter(
      (item) =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (startDate || endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()
        return itemDate >= start && itemDate <= end
      })
    }

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a]
        const bValue = b[sortField as keyof typeof b]
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [searchQuery, startDate, endDate, sortField, sortDirection])

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
            onClick={() => {
              setActiveView("status")
              setSortField("")
              setSortDirection(null)
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockItems.length} Items</div>
              <p className="text-xs text-muted-foreground mt-1">View current inventory</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setActiveView("stockIn")
              setSortField("")
              setSortDirection(null)
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock In History</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockInHistory.length} Entries</div>
              <p className="text-xs text-muted-foreground mt-1">Items added to stock</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setActiveView("stockOut")
              setSortField("")
              setSortDirection(null)
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Out History</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockOutHistory.length} Entries</div>
              <p className="text-xs text-muted-foreground mt-1">Items removed from stock</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView("update")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Update</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Add Entry</div>
              <p className="text-xs text-muted-foreground mt-1">Update inventory records</p>
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
        </div>
      )}

      {activeView === "cards" && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Stock Movement Over Time</CardTitle>
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as typeof timePeriod)}>
              <TabsList className="rounded-xl bg-transparent gap-2">
                <TabsTrigger value="day" className="rounded-lg data-[state=active]:bg-muted">
                  1 Day
                </TabsTrigger>
                <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-muted">
                  1 Week
                </TabsTrigger>
                <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-muted">
                  1 Month
                </TabsTrigger>
                <TabsTrigger value="6months" className="rounded-lg data-[state=active]:bg-muted">
                  6 Months
                </TabsTrigger>
                <TabsTrigger value="year" className="rounded-lg data-[state=active]:bg-muted">
                  1 Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockMovementData[timePeriod]} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="stockIn"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  name="Stock In"
                  dot={{ fill: "#1e3a8a", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="stockOut"
                  stroke="#fb923c"
                  strokeWidth={2}
                  name="Stock Out"
                  dot={{ fill: "#fb923c", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {(activeView === "status" || activeView === "stockIn" || activeView === "stockOut") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                    className="pl-9 rounded-xl w-48"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End date"
                    className="pl-9 rounded-xl w-48"
                  />
                </div>
              </div>

              {activeView === "status" && (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("code")}>
                          Code <SortIcon field="code" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                          Name <SortIcon field="name" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("price")}>
                          Price <SortIcon field="price" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("quantity")}>
                          Current Quantity <SortIcon field="quantity" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("lastChange")}>
                          Last Change Date <SortIcon field="lastChange" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockItems.map((item) => (
                        <TableRow key={item.code}>
                          <TableCell className="font-medium">{item.code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.lastChange}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeView === "stockIn" && (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("code")}>
                          Code <SortIcon field="code" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                          Name <SortIcon field="name" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("quantityAdded")}>
                          Quantity Added <SortIcon field="quantityAdded" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("date")}>
                          Date <SortIcon field="date" />
                        </TableHead>
                        <TableHead>Supplier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockIn.map((item, idx) => (
                        <TableRow key={`${item.code}-${idx}`}>
                          <TableCell className="font-medium">{item.code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-green-600 font-medium">+{item.quantityAdded}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeView === "stockOut" && (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("code")}>
                          Code <SortIcon field="code" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                          Name <SortIcon field="name" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("quantityRemoved")}>
                          Quantity Decreased <SortIcon field="quantityRemoved" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("date")}>
                          Date <SortIcon field="date" />
                        </TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockOut.map((item, idx) => (
                        <TableRow key={`${item.code}-${idx}`}>
                          <TableCell className="font-medium">{item.code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-red-600 font-medium">-{item.quantityRemoved}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "update" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setActiveView("cards")}>
              ← Back to Overview
            </Button>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <Tabs value={updateTab} onValueChange={setUpdateTab}>
                <TabsList className="rounded-xl bg-transparent gap-2">
                  <TabsTrigger value="external" className="rounded-lg data-[state=active]:bg-muted">
                    Add External Entry
                  </TabsTrigger>
                  <TabsTrigger value="internal" className="rounded-lg data-[state=active]:bg-muted">
                    Add Internal Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="external" className="mt-6 space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="supplier">Supplier Name</Label>
                      <Input id="supplier" placeholder="Enter supplier name" className="rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="itemCode">Item Code</Label>
                        <Input id="itemCode" placeholder="ITM-XXX" className="rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input id="itemName" placeholder="Product name" className="rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="0" className="rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unitPrice">Unit Price</Label>
                        <Input id="unitPrice" type="number" placeholder="0.00" className="rounded-xl" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="invoiceNumber">Invoice/Receipt Number</Label>
                      <Input id="invoiceNumber" placeholder="Enter invoice number" className="rounded-xl" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" placeholder="Additional information..." className="rounded-xl" rows={3} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="attachment">Upload Attachment</Label>
                      <div className="flex items-center gap-2">
                        <Input id="attachment" type="file" className="rounded-xl" />
                        <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                          <UploadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Upload invoice, receipt, or delivery note</p>
                    </div>

                    <Button className="w-full rounded-xl">Submit External Entry</Button>
                  </div>
                </TabsContent>

                <TabsContent value="internal" className="mt-6 space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fromWarehouse">From Warehouse</Label>
                        <Input id="fromWarehouse" placeholder="Select warehouse" className="rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="toWarehouse">To Warehouse</Label>
                        <Input id="toWarehouse" placeholder="Select warehouse" className="rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="internalItemCode">Item Code</Label>
                        <Input id="internalItemCode" placeholder="ITM-XXX" className="rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="internalItemName">Item Name</Label>
                        <Input id="internalItemName" placeholder="Product name" className="rounded-xl" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="transferQuantity">Transfer Quantity</Label>
                      <Input id="transferQuantity" type="number" placeholder="0" className="rounded-xl" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="adjustmentType">Adjustment Type</Label>
                      <select
                        id="adjustmentType"
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option>Transfer Between Warehouses</option>
                        <option>Damaged Goods</option>
                        <option>Return to Supplier</option>
                        <option>Stock Adjustment</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="internalNotes">Reason for Adjustment</Label>
                      <Textarea
                        id="internalNotes"
                        placeholder="Explain the reason for this internal adjustment..."
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>

                    <Button className="w-full rounded-xl">Submit Internal Entry</Button>
                  </div>
                </TabsContent>
              </Tabs>
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
          <TankManagement
            branchId={(() => {
              try {
                const branchData = localStorage.getItem("selectedBranch")
                if (!branchData) return ""
                const parsed = JSON.parse(branchData)
                return parsed.id || ""
              } catch {
                return ""
              }
            })()}
          />
        </div>
      )}
    </div>
  )
}
