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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, RefreshCw, DollarSign, MoreVertical, Edit, Trash2 } from "lucide-react"
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
  item_status: string
  branch_item_id: string | null
  branch_sale_price: number | null
  branch_purchase_price: number | null
  is_available: boolean | null
  is_assigned: boolean
  kra_status: string | null
  kra_last_synced_at: string | null
}

export default function BranchItemPricing() {
  const [items, setItems] = useState<BranchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BranchItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)
  const [branchName, setBranchName] = useState<string>("")
  const { formatCurrency } = useCurrency()

  const [priceForm, setPriceForm] = useState({
    salePrice: "",
    purchasePrice: "",
    isAvailable: true
  })

  useEffect(() => {
    fetchCurrentBranch()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchBranchItems()
    }
  }, [branchId])

  const fetchCurrentBranch = async () => {
    try {
      const branchData = localStorage.getItem("selectedBranch")
      if (branchData) {
        const parsed = JSON.parse(branchData)
        if (parsed.id) {
          setBranchId(parsed.id)
          setBranchName(parsed.name || "")
          return
        }
      }

      const response = await fetch("/api/auth/session")
      const result = await response.json()
      if (result.success && result.session?.branch_id) {
        setBranchId(result.session.branch_id)
        const branchRes = await fetch(`/api/branches/${result.session.branch_id}`)
        const branchResult = await branchRes.json()
        if (branchResult.success) {
          setBranchName(branchResult.branch?.name || "")
        }
      } else {
        const branchRes = await fetch("/api/branches")
        const branchResult = await branchRes.json()
        if (branchResult.success && branchResult.data?.length > 0) {
          const firstBranch = branchResult.data[0]
          setBranchId(firstBranch.id)
          setBranchName(firstBranch.name)
        }
      }
    } catch (error) {
      console.error("Error fetching branch:", error)
    }
  }

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
      salePrice: item.branch_sale_price?.toString() || "",
      purchasePrice: item.branch_purchase_price?.toString() || "",
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
          credentials: "include",
          body: JSON.stringify({
            branchItemId: selectedItem.branch_item_id,
            salePrice: parseFloat(priceForm.salePrice),
            purchasePrice: priceForm.purchasePrice ? parseFloat(priceForm.purchasePrice) : null,
            isAvailable: priceForm.isAvailable
          })
        })

        const result = await response.json()
        setSaving(false)
        
        if (!response.ok || !result.success) {
          toast.error(result.error || `Failed to update price (${response.status})`)
          return
        }
        
        toast.success("Item price updated")
        setShowPriceDialog(false)
        fetchBranchItems()
      } else {
        const response = await fetch("/api/branch-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            branchId,
            itemId: selectedItem.item_id,
            salePrice: parseFloat(priceForm.salePrice),
            purchasePrice: priceForm.purchasePrice ? parseFloat(priceForm.purchasePrice) : null
          })
        })

        const result = await response.json()
        setSaving(false)
        
        if (!response.ok || !result.success) {
          toast.error(result.error || `Failed to assign item (${response.status})`)
          return
        }
        
        toast.success("Item assigned to branch with custom pricing")
        setShowPriceDialog(false)
        fetchBranchItems()
      }
    } catch (error: any) {
      console.error("Error saving price:", error)
      toast.error(error?.message || "Failed to save price - network error")
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
        method: "DELETE",
        credentials: "include"
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

  if (!branchId) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading branch information...
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
              Set Prices
            </CardTitle>
            <CardDescription>
              Manage selling prices for items at {branchName || "your branch"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {branchName && (
              <Badge variant="outline" className="text-sm">
                {branchName}
              </Badge>
            )}
            <Button variant="outline" onClick={fetchBranchItems} className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
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
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items found. Add items in Item Management first.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.item_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.is_assigned && item.branch_sale_price !== null
                        ? formatCurrency(item.branch_sale_price)
                        : <span className="text-muted-foreground">Not set</span>
                      }
                    </TableCell>
                    <TableCell>
                      {item.is_assigned ? (
                        item.is_available !== false ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                        )
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Not Assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPriceDialog(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {item.is_assigned ? "Edit Price" : "Set Price"}
                          </DropdownMenuItem>
                          {item.is_assigned && item.branch_item_id && (
                            <DropdownMenuItem 
                              onClick={() => handleRemoveFromBranch(item)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Branch
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.is_assigned ? "Edit Selling Price" : "Set Selling Price"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.is_assigned 
                ? "Update the selling price for this item"
                : "Set the selling price for this item at your branch"}
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

            <div className="space-y-2">
              <Label htmlFor="salePrice">Selling Price *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={priceForm.salePrice}
                onChange={(e) => setPriceForm({ ...priceForm, salePrice: e.target.value })}
                placeholder="Enter selling price"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                This price is required for sales at this branch
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (Optional)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={priceForm.purchasePrice}
                onChange={(e) => setPriceForm({ ...priceForm, purchasePrice: e.target.value })}
                placeholder="Enter purchase price"
                className="rounded-xl"
              />
            </div>

            {selectedItem?.is_assigned && (
              <div className="flex items-center justify-between">
                <Label htmlFor="isAvailable">Item Available for Sale</Label>
                <Switch
                  id="isAvailable"
                  checked={priceForm.isAvailable}
                  onCheckedChange={(checked) => setPriceForm({ ...priceForm, isAvailable: checked })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSavePrice} disabled={saving} className="rounded-xl">
              {saving ? "Saving..." : "Save Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
