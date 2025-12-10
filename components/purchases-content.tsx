"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Plus, Search } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

// Sample purchase data
const allPurchases = [
  {
    id: "PO-001",
    supplier: "Tech Supplies Ltd",
    date: "2024-01-15",
    amount: 35000,
    status: "approved",
    items: 12,
  },
  {
    id: "PO-002",
    supplier: "Office Solutions Inc",
    date: "2024-01-16",
    amount: 22500,
    status: "approved",
    items: 8,
  },
  {
    id: "PO-003",
    supplier: "Global Distributors",
    date: "2024-01-17",
    amount: 58000,
    status: "rejected",
    items: 15,
  },
  {
    id: "PO-004",
    supplier: "Metro Wholesale",
    date: "2024-01-18",
    amount: 41200,
    status: "approved",
    items: 10,
  },
  {
    id: "PO-005",
    supplier: "Industrial Supplies Co",
    date: "2024-01-19",
    amount: 19800,
    status: "rejected",
    items: 5,
  },
  {
    id: "PO-006",
    supplier: "Prime Vendors",
    date: "2024-01-20",
    amount: 67500,
    status: "approved",
    items: 20,
  },
]

export function PurchasesContent() {
  const [activeTab, setActiveTab] = useState("all")
  const { formatCurrency } = useCurrency()
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [purchaseForm, setPurchaseForm] = useState({
    poNumber: "",
    orderDate: new Date().toISOString().split("T")[0],
    supplier: "",
    orderType: "",
    branch: "Nairobi Branch",
    productName: "",
    orderQuantity: "",
    supplyPrice: "",
    unitOfMeasurement: "",
    storageIndex: "",
  })

  const approvedPurchases = allPurchases.filter((purchase) => purchase.status === "approved")
  const rejectedPurchases = allPurchases.filter((purchase) => purchase.status === "rejected")

  const handleSubmitPurchase = () => {
    console.log("[v0] Purchase submitted:", purchaseForm)
    alert("Purchase order submitted successfully!")
    setIsPurchaseFormOpen(false)
    setPurchaseForm({
      poNumber: "",
      orderDate: new Date().toISOString().split("T")[0],
      supplier: "",
      orderType: "",
      branch: "Nairobi Branch",
      productName: "",
      orderQuantity: "",
      supplyPrice: "",
      unitOfMeasurement: "",
      storageIndex: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Purchases</h1>
          <p className="mt-1 text-muted-foreground text-pretty">Manage your purchase orders and supplier invoices</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsPurchaseFormOpen(true)}
            className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Purchase
          </Button>
          <Button className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="h-4 w-4" />
            Update Purchases
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
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
                className="rounded-xl w-40"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="rounded-xl w-40"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="rounded-xl bg-transparent gap-2">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-muted">
                All Purchases
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-muted">
                Approved Purchases
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-muted">
                Rejected Purchases
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchase Order ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.id}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>{purchase.items}</TableCell>
                        <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={purchase.status === "approved" ? "default" : "destructive"}
                            className="rounded-lg"
                          >
                            {purchase.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchase Order ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.id}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>{purchase.items}</TableCell>
                        <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="rounded-lg">
                            {purchase.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchase Order ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.id}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>{purchase.items}</TableCell>
                        <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="rounded-lg">
                            {purchase.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isPurchaseFormOpen} onOpenChange={setIsPurchaseFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Purchase Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new purchase order</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po-number">P.O Number *</Label>
                <Input
                  id="po-number"
                  placeholder="e.g., PO-001"
                  value={purchaseForm.poNumber}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, poNumber: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-date">Order Date *</Label>
                <Input
                  id="order-date"
                  type="date"
                  value={purchaseForm.orderDate}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, orderDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Input
                  id="supplier"
                  placeholder="Supplier name"
                  value={purchaseForm.supplier}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-type">Order Type *</Label>
                <Input
                  id="order-type"
                  placeholder="e.g., Stock Replenishment"
                  value={purchaseForm.orderType}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, orderType: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Input id="branch" value={purchaseForm.branch} disabled className="rounded-xl bg-muted" />
              <p className="text-xs text-muted-foreground">Current branch (auto-detected)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="Product name"
                  value={purchaseForm.productName}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, productName: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-quantity">Order Quantity *</Label>
                <Input
                  id="order-quantity"
                  type="number"
                  placeholder="Quantity"
                  value={purchaseForm.orderQuantity}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, orderQuantity: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supply-price">Supply Price per Unit *</Label>
                <Input
                  id="supply-price"
                  type="number"
                  placeholder="Price per unit"
                  value={purchaseForm.supplyPrice}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, supplyPrice: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-measurement">Unit of Measurement *</Label>
                <Select
                  value={purchaseForm.unitOfMeasurement}
                  onValueChange={(value) => setPurchaseForm({ ...purchaseForm, unitOfMeasurement: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="litres">Litres (L)</SelectItem>
                    <SelectItem value="metres">Metres (m)</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="cartons">Cartons</SelectItem>
                    <SelectItem value="dozens">Dozens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-index">Storage Index *</Label>
              <Select
                value={purchaseForm.storageIndex}
                onValueChange={(value) => setPurchaseForm({ ...purchaseForm, storageIndex: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select storage location" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="tank-1">Tank 1</SelectItem>
                  <SelectItem value="tank-2">Tank 2</SelectItem>
                  <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                  <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                  <SelectItem value="cold-storage">Cold Storage</SelectItem>
                  <SelectItem value="dry-storage">Dry Storage</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Storage indices can be configured in branch settings</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPurchaseFormOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPurchase}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
              disabled={
                !purchaseForm.poNumber ||
                !purchaseForm.supplier ||
                !purchaseForm.orderType ||
                !purchaseForm.productName ||
                !purchaseForm.orderQuantity ||
                !purchaseForm.supplyPrice ||
                !purchaseForm.unitOfMeasurement ||
                !purchaseForm.storageIndex
              }
            >
              Submit Purchase Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
