"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Package, Edit, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"
import { useCurrency } from "@/lib/currency-utils"

interface Item {
  id: string
  item_code: string
  item_name: string
  description?: string
  item_type: string
  class_code: string
  tax_type: string
  origin: string
  quantity_unit: string
  package_unit: string
  purchase_price: number
  sale_price: number
  status: string
  assigned_branches: number
  created_at: string
}

interface KraCode {
  cd: string
  cd_nm: string
}

interface Classification {
  item_cls_cd: string
  item_cls_nm: string
}

export function HqItemsManager() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const { formatCurrency } = useCurrency()

  const [classifications, setClassifications] = useState<Classification[]>([])
  const [codes, setCodes] = useState<{
    itemTypes: KraCode[]
    origins: KraCode[]
    quantityUnits: KraCode[]
    packageUnits: KraCode[]
    taxTypes: KraCode[]
  }>({
    itemTypes: [],
    origins: [],
    quantityUnits: [],
    packageUnits: [],
    taxTypes: []
  })

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    itemType: "",
    classCode: "",
    taxType: "",
    origin: "",
    batchNumber: "",
    purchasePrice: "",
    salePrice: "",
    sku: "",
    quantityUnit: "",
    packageUnit: ""
  })

  useEffect(() => {
    fetchItems()
    fetchKraData()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/headquarters/items")
      const result = await response.json()
      if (result.success) {
        setItems(result.items || [])
      } else {
        toast.error(result.error || "Failed to fetch items")
      }
    } catch (error) {
      console.error("Error fetching items:", error)
      toast.error("Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  const fetchKraData = async () => {
    try {
      const [codelistRes, classificationsRes] = await Promise.all([
        fetch("/api/kra/saved-data?type=codelist"),
        fetch("/api/kra/saved-data?type=classifications")
      ])

      const codelistData = await codelistRes.json()
      const classificationsData = await classificationsRes.json()

      if (codelistData.data) {
        const codesArray = codelistData.data
        setCodes({
          itemTypes: codesArray.filter((c: any) => c.cd_cls === "17").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm })),
          origins: codesArray.filter((c: any) => c.cd_cls === "20").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm })),
          quantityUnits: codesArray.filter((c: any) => c.cd_cls === "10").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm })),
          packageUnits: codesArray.filter((c: any) => c.cd_cls === "17").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm })),
          taxTypes: codesArray.filter((c: any) => c.cd_cls === "04").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm }))
        })
      }

      if (classificationsData.data) {
        setClassifications(classificationsData.data)
      }
    } catch (error) {
      console.error("Error fetching KRA data:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      itemName: "",
      description: "",
      itemType: "",
      classCode: "",
      taxType: "",
      origin: "",
      batchNumber: "",
      purchasePrice: "",
      salePrice: "",
      sku: "",
      quantityUnit: "",
      packageUnit: ""
    })
  }

  const handleAddItem = async () => {
    if (!formData.itemName || !formData.itemType || !formData.classCode || 
        !formData.taxType || !formData.origin || !formData.quantityUnit || !formData.packageUnit) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/headquarters/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message || "Item created successfully")
        setShowAddDialog(false)
        resetForm()
        fetchItems()
      } else {
        toast.error(result.error || "Failed to create item")
      }
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error("Failed to create item")
    } finally {
      setSaving(false)
    }
  }

  const handleEditItem = async () => {
    if (!selectedItem) return

    setSaving(true)
    try {
      const response = await fetch("/api/headquarters/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          itemName: formData.itemName,
          description: formData.description,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          salePrice: parseFloat(formData.salePrice) || 0
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Item updated successfully")
        setShowEditDialog(false)
        setSelectedItem(null)
        resetForm()
        fetchItems()
      } else {
        toast.error(result.error || "Failed to update item")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Failed to update item")
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (item: Item) => {
    setSelectedItem(item)
    setFormData({
      itemName: item.item_name,
      description: item.description || "",
      itemType: item.item_type,
      classCode: item.class_code,
      taxType: item.tax_type,
      origin: item.origin,
      batchNumber: "",
      purchasePrice: item.purchase_price?.toString() || "",
      salePrice: item.sale_price?.toString() || "",
      sku: "",
      quantityUnit: item.quantity_unit,
      packageUnit: item.package_unit
    })
    setShowEditDialog(true)
  }

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-lg border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item Catalog
            </CardTitle>
            <CardDescription>
              Vendor-level items that can be assigned to branches with custom pricing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchItems} className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
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
              {searchQuery ? "No items match your search" : "No items found. Create your first item to get started."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead className="text-right">Default Price</TableHead>
                  <TableHead className="text-center">Branches</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.item_type}</TableCell>
                    <TableCell>{item.class_code}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.sale_price)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{item.assigned_branches || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Create a new item in the vendor catalog. This item will be available for all branches.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g., Super Petrol"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Type *</Label>
                <Select value={formData.itemType} onValueChange={(v) => setFormData({ ...formData, itemType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.itemTypes.map((t) => (
                      <SelectItem key={t.cd} value={t.cd}>{t.cd_nm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origin *</Label>
                <Select value={formData.origin} onValueChange={(v) => setFormData({ ...formData, origin: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.origins.map((o) => (
                      <SelectItem key={o.cd} value={o.cd}>{o.cd_nm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Classification Code *</Label>
                <Select value={formData.classCode} onValueChange={(v) => setFormData({ ...formData, classCode: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {classifications.map((c) => (
                      <SelectItem key={c.item_cls_cd} value={c.item_cls_cd}>
                        {c.item_cls_cd} - {c.item_cls_nm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax Type *</Label>
                <Select value={formData.taxType} onValueChange={(v) => setFormData({ ...formData, taxType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.taxTypes.map((t) => (
                      <SelectItem key={t.cd} value={t.cd}>{t.cd_nm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity Unit *</Label>
                <Select value={formData.quantityUnit} onValueChange={(v) => setFormData({ ...formData, quantityUnit: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.quantityUnits.map((u) => (
                      <SelectItem key={u.cd} value={u.cd}>{u.cd_nm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Package Unit *</Label>
                <Select value={formData.packageUnit} onValueChange={(v) => setFormData({ ...formData, packageUnit: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.packageUnits.map((p) => (
                      <SelectItem key={p.cd} value={p.cd}>{p.cd_nm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Purchase Price</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Default Sale Price</Label>
                <Input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={saving}>
              {saving ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update item details. Item code and KRA settings cannot be changed after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Code</Label>
              <Input value={selectedItem?.item_code || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Purchase Price</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Sale Price</Label>
                <Input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditItem} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
