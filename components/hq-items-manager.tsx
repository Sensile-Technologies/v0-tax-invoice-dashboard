"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Package, Edit, RefreshCw, Building2 } from "lucide-react"
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

interface Branch {
  id: string
  name: string
  location: string
}

const COUNTRY_ORIGINS = [
  { cd: "KE", cd_nm: "Kenya" },
  { cd: "AE", cd_nm: "United Arab Emirates" },
  { cd: "CN", cd_nm: "China" },
  { cd: "DE", cd_nm: "Germany" },
  { cd: "EG", cd_nm: "Egypt" },
  { cd: "ET", cd_nm: "Ethiopia" },
  { cd: "FR", cd_nm: "France" },
  { cd: "GB", cd_nm: "United Kingdom" },
  { cd: "IN", cd_nm: "India" },
  { cd: "IT", cd_nm: "Italy" },
  { cd: "JP", cd_nm: "Japan" },
  { cd: "MY", cd_nm: "Malaysia" },
  { cd: "NL", cd_nm: "Netherlands" },
  { cd: "NG", cd_nm: "Nigeria" },
  { cd: "PK", cd_nm: "Pakistan" },
  { cd: "RU", cd_nm: "Russia" },
  { cd: "SA", cd_nm: "Saudi Arabia" },
  { cd: "SG", cd_nm: "Singapore" },
  { cd: "TH", cd_nm: "Thailand" },
  { cd: "TR", cd_nm: "Turkey" },
  { cd: "TZ", cd_nm: "Tanzania" },
  { cd: "UG", cd_nm: "Uganda" },
  { cd: "US", cd_nm: "United States" },
  { cd: "ZA", cd_nm: "South Africa" },
  { cd: "ZM", cd_nm: "Zambia" },
  { cd: "ZW", cd_nm: "Zimbabwe" },
  { cd: "RW", cd_nm: "Rwanda" },
  { cd: "BI", cd_nm: "Burundi" },
  { cd: "CD", cd_nm: "DR Congo" },
  { cd: "SS", cd_nm: "South Sudan" },
  { cd: "SO", cd_nm: "Somalia" },
  { cd: "DJ", cd_nm: "Djibouti" },
  { cd: "ER", cd_nm: "Eritrea" },
  { cd: "MW", cd_nm: "Malawi" },
  { cd: "MZ", cd_nm: "Mozambique" },
  { cd: "BW", cd_nm: "Botswana" },
  { cd: "NA", cd_nm: "Namibia" },
  { cd: "AU", cd_nm: "Australia" },
  { cd: "BR", cd_nm: "Brazil" },
  { cd: "CA", cd_nm: "Canada" },
  { cd: "ES", cd_nm: "Spain" },
  { cd: "ID", cd_nm: "Indonesia" },
  { cd: "KR", cd_nm: "South Korea" },
  { cd: "MX", cd_nm: "Mexico" },
  { cd: "PH", cd_nm: "Philippines" },
  { cd: "PL", cd_nm: "Poland" },
  { cd: "VN", cd_nm: "Vietnam" }
].sort((a, b) => a.cd_nm.localeCompare(b.cd_nm))

export function HqItemsManager() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [assignFormData, setAssignFormData] = useState({
    branchId: "",
    salePrice: ""
  })
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
    origins: COUNTRY_ORIGINS,
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
    fetchBranches()
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
        const uniqueByCode = (arr: any[]) => {
          const seen = new Set()
          return arr.filter((item: any) => {
            if (seen.has(item.cd)) return false
            seen.add(item.cd)
            return true
          })
        }
        const kraCountries = uniqueByCode(codesArray.filter((c: any) => c.cd_cls === "05").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm })))
        setCodes({
          itemTypes: uniqueByCode(codesArray.filter((c: any) => c.cd_cls === "24").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm }))),
          origins: kraCountries.length > 0 ? kraCountries : COUNTRY_ORIGINS,
          quantityUnits: uniqueByCode(codesArray.filter((c: any) => c.cd_cls === "10").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm }))),
          packageUnits: uniqueByCode(codesArray.filter((c: any) => c.cd_cls === "17").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm }))),
          taxTypes: uniqueByCode(codesArray.filter((c: any) => c.cd_cls === "04").map((c: any) => ({ cd: c.cd, cd_nm: c.cd_nm })))
        })
      }

      if (classificationsData.data) {
        setClassifications(classificationsData.data)
      }
    } catch (error) {
      console.error("Error fetching KRA data:", error)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches/list")
      const result = await response.json()
      // API returns array directly, not { success, branches }
      if (Array.isArray(result)) {
        setBranches(result)
      } else if (result.success && result.branches) {
        setBranches(result.branches)
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const openAssignDialog = (item: Item) => {
    setSelectedItem(item)
    setAssignFormData({
      branchId: "",
      salePrice: item.sale_price?.toString() || ""
    })
    setShowAssignDialog(true)
  }

  const handleAssignToBranch = async () => {
    if (!selectedItem || !assignFormData.branchId) {
      toast.error("Please select a branch")
      return
    }

    if (!assignFormData.salePrice) {
      toast.error("Please enter a sale price")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/branch-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: assignFormData.branchId,
          itemId: selectedItem.id,
          salePrice: parseFloat(assignFormData.salePrice)
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Item assigned to branch successfully")
        setShowAssignDialog(false)
        setSelectedItem(null)
        fetchItems()
      } else {
        toast.error(result.error || "Failed to assign item")
      }
    } catch (error) {
      console.error("Error assigning item:", error)
      toast.error("Failed to assign item to branch")
    } finally {
      setSaving(false)
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
          description: formData.description
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
            <Button onClick={() => router.push("/headquarters/items/add")} className="rounded-xl">
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
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openAssignDialog(item)} title="Assign to Branch">
                        <Building2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} title="Edit">
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
            <p className="text-xs text-muted-foreground mt-2">
              Prices are managed at the branch level. Use "Assign to Branch" to set initial selling prices.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditItem} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Item to Branch</DialogTitle>
            <DialogDescription>
              Assign "{selectedItem?.item_name}" to a branch with an initial selling price.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Code</Label>
              <Input value={selectedItem?.item_code || ""} disabled className="bg-muted font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Select Branch *</Label>
              <SearchableSelect
                value={assignFormData.branchId}
                onValueChange={(v) => setAssignFormData({ ...assignFormData, branchId: v })}
                placeholder="Select a branch"
                searchPlaceholder="Search branches..."
                options={branches.map((b) => ({ value: b.id, label: `${b.name} - ${b.location}` }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Selling Price *</Label>
              <Input
                type="number"
                value={assignFormData.salePrice}
                onChange={(e) => setAssignFormData({ ...assignFormData, salePrice: e.target.value })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                This is the initial selling price. The branch can update it later from Inventory &gt; Set Prices.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Purchase prices are set during the Purchase Order process.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignToBranch} disabled={saving}>
              {saving ? "Assigning..." : "Assign to Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
