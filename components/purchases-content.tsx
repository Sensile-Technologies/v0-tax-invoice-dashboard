"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Plus, Search, Loader2, Package } from "lucide-react"
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
  status: string
  purchase_type?: string
  payment_type?: string
  remark?: string
  created_at: string
}

export function PurchasesContent() {
  const [activeTab, setActiveTab] = useState("all")
  const { formatCurrency } = useCurrency()
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<any>(null)
  
  const [purchaseForm, setPurchaseForm] = useState({
    poNumber: "",
    orderDate: new Date().toISOString().split("T")[0],
    supplier: "",
    supplierTin: "",
    orderType: "",
    branch: "",
    productName: "",
    orderQuantity: "",
    supplyPrice: "",
    unitOfMeasurement: "",
    storageIndex: "",
  })

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
        setCurrentBranch(branch)
        setPurchaseForm(prev => ({ ...prev, branch: branch.name }))
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

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  const approvedPurchases = purchases.filter((purchase) => purchase.status === "approved")
  const rejectedPurchases = purchases.filter((purchase) => purchase.status === "rejected")

  const getDisplayPurchases = () => {
    switch (activeTab) {
      case "approved":
        return approvedPurchases
      case "rejected":
        return rejectedPurchases
      default:
        return purchases
    }
  }

  const handleSubmitPurchase = async () => {
    if (!currentBranch) {
      toast.error("Please select a branch first")
      return
    }

    setSubmitting(true)
    try {
      const totalAmount = parseFloat(purchaseForm.orderQuantity) * parseFloat(purchaseForm.supplyPrice)
      const taxAmount = totalAmount * 0.16

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: currentBranch.id,
          tin: currentBranch.tin || "",
          bhf_id: currentBranch.bhf_id || "00",
          supplier_name: purchaseForm.supplier,
          supplier_tin: purchaseForm.supplierTin,
          purchase_date: purchaseForm.orderDate,
          purchase_type: purchaseForm.orderType,
          payment_type: "01",
          total_amount: totalAmount,
          tax_amount: taxAmount,
          remark: `${purchaseForm.productName} - ${purchaseForm.orderQuantity} ${purchaseForm.unitOfMeasurement}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Purchase order submitted successfully!")
        setIsPurchaseFormOpen(false)
        setPurchaseForm({
          poNumber: "",
          orderDate: new Date().toISOString().split("T")[0],
          supplier: "",
          supplierTin: "",
          orderType: "",
          branch: currentBranch?.name || "",
          productName: "",
          orderQuantity: "",
          supplyPrice: "",
          unitOfMeasurement: "",
          storageIndex: "",
        })
        fetchPurchases()
      } else {
        toast.error(result.error || "Failed to submit purchase order")
      }
    } catch (error) {
      console.error("Error submitting purchase:", error)
      toast.error("Failed to submit purchase order")
    } finally {
      setSubmitting(false)
    }
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
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
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
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Manage your purchase orders and supplier invoices</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => setIsPurchaseFormOpen(true)}
            className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Purchase</span>
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
                <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-muted text-xs md:text-sm">
                  Approved ({approvedPurchases.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-muted text-xs md:text-sm">
                  Rejected ({rejectedPurchases.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 md:mt-6">
                {renderPurchaseTable(purchases)}
              </TabsContent>

              <TabsContent value="approved" className="mt-4 md:mt-6">
                {renderPurchaseTable(approvedPurchases)}
              </TabsContent>

              <TabsContent value="rejected" className="mt-4 md:mt-6">
                {renderPurchaseTable(rejectedPurchases)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPurchaseFormOpen} onOpenChange={setIsPurchaseFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">Add New Purchase Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new purchase order</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="supplier-tin">Supplier TIN</Label>
                <Input
                  id="supplier-tin"
                  placeholder="e.g., P051234567A"
                  value={purchaseForm.supplierTin}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierTin: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-type">Order Type *</Label>
                <Select
                  value={purchaseForm.orderType}
                  onValueChange={(value) => setPurchaseForm({ ...purchaseForm, orderType: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="01">Normal Purchase</SelectItem>
                    <SelectItem value="02">Import</SelectItem>
                    <SelectItem value="03">Credit Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Input id="branch" value={purchaseForm.branch || "Select a branch"} disabled className="rounded-xl bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                submitting ||
                !purchaseForm.supplier ||
                !purchaseForm.orderType ||
                !purchaseForm.productName ||
                !purchaseForm.orderQuantity ||
                !purchaseForm.supplyPrice ||
                !purchaseForm.unitOfMeasurement ||
                !purchaseForm.storageIndex
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Purchase Order"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
