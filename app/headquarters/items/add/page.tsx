"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ArrowLeft, Package, Save } from "lucide-react"
import { toast } from "react-toastify"

interface KraCode {
  cd: string
  cd_nm: string
}

interface Classification {
  item_cls_cd: string
  item_cls_nm: string
}

const COUNTRY_ORIGINS = [
  { cd: "KE", cd_nm: "Kenya" },
  { cd: "AE", cd_nm: "United Arab Emirates" },
  { cd: "CN", cd_nm: "China" },
  { cd: "DE", cd_nm: "Germany" },
  { cd: "GB", cd_nm: "United Kingdom" },
  { cd: "IN", cd_nm: "India" },
  { cd: "JP", cd_nm: "Japan" },
  { cd: "SA", cd_nm: "Saudi Arabia" },
  { cd: "TZ", cd_nm: "Tanzania" },
  { cd: "UG", cd_nm: "Uganda" },
  { cd: "US", cd_nm: "United States" },
  { cd: "ZA", cd_nm: "South Africa" },
].sort((a, b) => a.cd_nm.localeCompare(b.cd_nm))

export default function AddItemPage() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [saving, setSaving] = useState(false)
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
    fetchKraData()
  }, [])

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

  const handleSubmit = async () => {
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
        body: JSON.stringify({
          itemName: formData.itemName,
          description: formData.description,
          itemType: formData.itemType,
          classCode: formData.classCode,
          taxType: formData.taxType,
          origin: formData.origin,
          batchNumber: formData.batchNumber,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          sku: formData.sku,
          quantityUnit: formData.quantityUnit,
          packageUnit: formData.packageUnit
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Item created successfully")
        router.push("/headquarters/items")
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/headquarters/items")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Items
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Add New Item</CardTitle>
                    <CardDescription>
                      Create a new item in the vendor catalog. This item will be available for assignment to all branches.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Item Name <span className="text-red-500">*</span></Label>
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
                        placeholder="Optional stock keeping unit"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description of the item"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">KRA Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Item Type <span className="text-red-500">*</span></Label>
                        <SearchableSelect
                          value={formData.itemType}
                          onValueChange={(v) => setFormData({ ...formData, itemType: v })}
                          placeholder="Select type"
                          searchPlaceholder="Search item types..."
                          options={codes.itemTypes.map((t) => ({ value: t.cd, label: t.cd_nm }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country of Origin <span className="text-red-500">*</span></Label>
                        <SearchableSelect
                          value={formData.origin}
                          onValueChange={(v) => setFormData({ ...formData, origin: v })}
                          placeholder="Select country"
                          searchPlaceholder="Search countries..."
                          options={codes.origins.map((o) => ({ value: o.cd, label: `${o.cd_nm} (${o.cd})` }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Classification Code <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={formData.classCode}
                        onValueChange={(v) => setFormData({ ...formData, classCode: v })}
                        placeholder="Select classification"
                        searchPlaceholder="Search classifications..."
                        options={classifications.map((c) => ({ value: c.item_cls_cd, label: `${c.item_cls_cd} - ${c.item_cls_nm}` }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Type <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={formData.taxType}
                        onValueChange={(v) => setFormData({ ...formData, taxType: v })}
                        placeholder="Select tax type"
                        searchPlaceholder="Search tax types..."
                        options={codes.taxTypes.map((t) => ({ value: t.cd, label: t.cd_nm }))}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Units & Packaging</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Quantity Unit <span className="text-red-500">*</span></Label>
                        <SearchableSelect
                          value={formData.quantityUnit}
                          onValueChange={(v) => setFormData({ ...formData, quantityUnit: v })}
                          placeholder="Select unit"
                          searchPlaceholder="Search units..."
                          options={codes.quantityUnits.map((u) => ({ value: u.cd, label: u.cd_nm }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Package Unit <span className="text-red-500">*</span></Label>
                        <SearchableSelect
                          value={formData.packageUnit}
                          onValueChange={(v) => setFormData({ ...formData, packageUnit: v })}
                          placeholder="Select package"
                          searchPlaceholder="Search packages..."
                          options={codes.packageUnits.map((p) => ({ value: p.cd, label: p.cd_nm }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Default Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Default Purchase Price</Label>
                        <Input
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Branches can set their own prices</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Default Sale Price</Label>
                        <Input
                          type="number"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Branches can set their own prices</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/headquarters/items")}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Creating..." : "Create Item"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
