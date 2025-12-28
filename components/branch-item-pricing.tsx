"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, RefreshCw, Edit, Check, X, DollarSign } from "lucide-react"
import { toast } from "react-toastify"
import { useCurrency } from "@/lib/currency-utils"

interface BranchItem {
  item_id: string
  item_code: string
  item_name: string
  item_type: string
  class_code: string
  tax_type: string
  origin: string
  quantity_unit: string
  package_unit: string
  default_purchase_price: number
  default_sale_price: number
  item_status: string
  branch_item_id: string | null
  branch_sale_price: number | null
  branch_purchase_price: number | null
  is_available: boolean | null
  is_assigned: boolean
  kra_status: string | null
  kra_last_synced_at: string | null
}

interface BranchItemPricingProps {
  branchId: string | null
}

export default function BranchItemPricing({ branchId }: BranchItemPricingProps) {
  const [items, setItems] = useState<BranchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BranchItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { formatCurrency } = useCurrency()

  const [priceForm, setPriceForm] = useState({
    salePrice: "",
    purchasePrice: "",
    isAvailable: true
  })

  useEffect(() => {
    if (branchId) {
      fetchBranchItems()
    }
  }, [branchId])

  const fetchBranchItems = async () => {
    if (!branchId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/branch-items?branchId=${branchId}`)
      const result = await response.json()
      if (result.success) {
        setItems(result.items || [])
      } else {
        toast.error(result.error || "Failed to fetch items")
      }
    } catch (error) {
      console.error("Error fetching branch items:", error)
      toast.error("Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  const openPriceDialog = (item: BranchItem) => {
    setSelectedItem(item)
    setPriceForm({
      salePrice: item.branch_sale_price?.toString() || item.default_sale_price?.toString() || "",
      purchasePrice: item.branch_purchase_price?.toString() || item.default_purchase_price?.toString() || "",
      isAvailable: item.is_available !== false
    })
    setShowPriceDialog(true)
  }

  const handleSavePrice = async () => {
    if (!selectedItem || !branchId) return

    if (!priceForm.salePrice) {
      toast.error("Sale price is required")
      return
    }

    setSaving(true)
    try {
      if (selectedItem.is_assigned && selectedItem.branch_item_id) {
        const response = await fetch("/api/branch-items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchItemId: selectedItem.branch_item_id,
            salePrice: parseFloat(priceForm.salePrice),
            purchasePrice: priceForm.purchasePrice ? parseFloat(priceForm.purchasePrice) : null,
            isAvailable: priceForm.isAvailable
          })
        })

        const result = await response.json()
        if (result.success) {
          toast.success("Item price updated")
          setShowPriceDialog(false)
          fetchBranchItems()
        } else {
          toast.error(result.error || "Failed to update price")
        }
      } else {
        const response = await fetch("/api/branch-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId,
            itemId: selectedItem.item_id,
            salePrice: parseFloat(priceForm.salePrice),
            purchasePrice: priceForm.purchasePrice ? parseFloat(priceForm.purchasePrice) : null
          })
        })

        const result = await response.json()
        if (result.success) {
          toast.success("Item assigned to branch with custom pricing")
          setShowPriceDialog(false)
          fetchBranchItems()
        } else {
          toast.error(result.error || "Failed to assign item")
        }
      }
    } catch (error) {
      console.error("Error saving price:", error)
      toast.error("Failed to save price")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFromBranch = async (item: BranchItem) => {
    if (!item.branch_item_id) return

    if (!confirm("Remove this item from the branch? This will make it unavailable for sales at this location.")) {
      return
    }

    try {
      const response = await fetch(`/api/branch-items?id=${item.branch_item_id}`, {
        method: "DELETE"
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Item removed from branch")
        fetchBranchItems()
      } else {
        toast.error(result.error || "Failed to remove item")
      }
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
    }
  }

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const assignedItems = filteredItems.filter(i => i.is_assigned)
  const unassignedItems = filteredItems.filter(i => !i.is_assigned)

  if (!branchId) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Please select a branch to manage item pricing
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-lg border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Branch Item Pricing
            </CardTitle>
            <CardDescription>
              Set branch-specific prices for items from the vendor catalog
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchBranchItems} className="rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items in vendor catalog. Items must be created at headquarters first.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Assigned Items ({assignedItems.length})
                </h3>
                {assignedItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No items assigned to this branch yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Sale Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedItems.map((item) => (
                        <TableRow key={item.item_id}>
                          <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                          <TableCell className="font-medium">{item.item_name}</TableCell>
                          <TableCell>{item.item_type}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.branch_sale_price || 0)}
                            {item.branch_sale_price !== item.default_sale_price && (
                              <span className="text-xs text-muted-foreground ml-1">
                                (default: {formatCurrency(item.default_sale_price)})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.is_available !== false ? (
                              <Badge className="bg-green-100 text-green-800">Available</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => openPriceDialog(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFromBranch(item)}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {unassignedItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                    Available to Assign ({unassignedItems.length})
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Default Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedItems.map((item) => (
                        <TableRow key={item.item_id} className="opacity-70 hover:opacity-100">
                          <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>{item.item_type}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.default_sale_price)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => openPriceDialog(item)}>
                              Assign & Set Price
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.is_assigned ? "Edit Item Price" : "Assign Item to Branch"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.is_assigned 
                ? "Update the branch-specific price for this item"
                : "Set the price for this item at your branch"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Item</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedItem?.item_name}</p>
                <p className="text-sm text-muted-foreground">{selectedItem?.item_code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sale Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceForm.salePrice}
                  onChange={(e) => setPriceForm({ ...priceForm, salePrice: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Default: {formatCurrency(selectedItem?.default_sale_price || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceForm.purchasePrice}
                  onChange={(e) => setPriceForm({ ...priceForm, purchasePrice: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Default: {formatCurrency(selectedItem?.default_purchase_price || 0)}
                </p>
              </div>
            </div>

            {selectedItem?.is_assigned && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Available for Sale</Label>
                  <p className="text-sm text-muted-foreground">Disable to temporarily remove from branch</p>
                </div>
                <Switch
                  checked={priceForm.isAvailable}
                  onCheckedChange={(checked) => setPriceForm({ ...priceForm, isAvailable: checked })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePrice} disabled={saving}>
              {saving ? "Saving..." : selectedItem?.is_assigned ? "Update Price" : "Assign Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
