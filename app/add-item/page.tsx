"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"

interface CodelistItem {
  cd_cls: string
  cd: string
  cd_nm: string
  cd_desc?: string
  use_yn: string
}

interface ClassificationItem {
  item_cls_cd: string
  item_cls_nm: string
  item_cls_lvl: number
  tax_ty_cd: string
  use_yn: string
}

export default function AddItemPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [originCodes, setOriginCodes] = useState<CodelistItem[]>([])
  const [taxTypeCodes, setTaxTypeCodes] = useState<CodelistItem[]>([])
  const [itemTypeCodes, setItemTypeCodes] = useState<CodelistItem[]>([])
  const [quantityUnitCodes, setQuantityUnitCodes] = useState<CodelistItem[]>([])
  const [packageUnitCodes, setPackageUnitCodes] = useState<CodelistItem[]>([])
  const [classificationCodes, setClassificationCodes] = useState<ClassificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedOrigin, setSelectedOrigin] = useState("")
  const [selectedTaxType, setSelectedTaxType] = useState("")
  const [selectedItemType, setSelectedItemType] = useState("")
  const [selectedQuantityUnit, setSelectedQuantityUnit] = useState("")
  const [selectedPackageUnit, setSelectedPackageUnit] = useState("")
  const [selectedClassCode, setSelectedClassCode] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codelistResponse, classificationsResponse] = await Promise.all([
          fetch("/api/kra/saved-data?type=codelist"),
          fetch("/api/kra/saved-data?type=classifications")
        ])
        
        const codelistResult = await codelistResponse.json()
        const classificationsResult = await classificationsResponse.json()
        
        if (codelistResult.data) {
          setOriginCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "05"))
          setTaxTypeCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "04"))
          setItemTypeCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "24"))
          setQuantityUnitCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "10"))
          setPackageUnitCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "17"))
        }
        
        if (classificationsResult.data) {
          setClassificationCodes(classificationsResult.data)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const originOptions = originCodes.map(item => ({
    value: item.cd,
    label: `${item.cd} - ${item.cd_nm}`
  }))

  const taxTypeOptions = taxTypeCodes.map(item => ({
    value: item.cd,
    label: `${item.cd} - ${item.cd_nm}`
  }))

  const itemTypeOptions = itemTypeCodes.map(item => ({
    value: item.cd,
    label: `${item.cd} - ${item.cd_nm}`
  }))

  const quantityUnitOptions = quantityUnitCodes.map(item => ({
    value: item.cd,
    label: `${item.cd} - ${item.cd_nm}`
  }))

  const packageUnitOptions = packageUnitCodes.map(item => ({
    value: item.cd,
    label: `${item.cd} - ${item.cd_nm}`
  }))

  const classificationOptions = classificationCodes.map(item => ({
    value: item.item_cls_cd,
    label: `${item.item_cls_cd} - ${item.item_cls_nm}`
  }))

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Add New Item</h1>
                <p className="text-muted-foreground text-pretty">Create a new item in your inventory</p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Search items..." className="pl-9 rounded-xl" />
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Fill in the information for the new item</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="itemCode">Item Code *</Label>
                      <Input id="itemCode" placeholder="e.g., ITM-001" className="rounded-xl" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="itemName">Item Name *</Label>
                      <Input id="itemName" placeholder="e.g., Laptop Computer" className="rounded-xl" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batchNumber">Batch Number</Label>
                      <Input id="batchNumber" placeholder="e.g., BATCH-2024-001" className="rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <Label>Item Type *</Label>
                      <SearchableSelect
                        options={itemTypeOptions}
                        value={selectedItemType}
                        onValueChange={setSelectedItemType}
                        placeholder={loading ? "Loading..." : "Select item type"}
                        searchPlaceholder="Search item types..."
                        emptyMessage="No item types found."
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price (Incl.) *</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        placeholder="0.00"
                        className="rounded-xl"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Sale Price *</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        placeholder="0.00"
                        className="rounded-xl"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="e.g., SKU-12345" className="rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <Label>Class Code *</Label>
                      <SearchableSelect
                        options={classificationOptions}
                        value={selectedClassCode}
                        onValueChange={setSelectedClassCode}
                        placeholder={loading ? "Loading..." : "Select item classification"}
                        searchPlaceholder="Search classifications..."
                        emptyMessage="No classifications found."
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Origin *</Label>
                      <SearchableSelect
                        options={originOptions}
                        value={selectedOrigin}
                        onValueChange={setSelectedOrigin}
                        placeholder={loading ? "Loading..." : "Select origin country"}
                        searchPlaceholder="Search countries..."
                        emptyMessage="No countries found."
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tax Type *</Label>
                      <SearchableSelect
                        options={taxTypeOptions}
                        value={selectedTaxType}
                        onValueChange={setSelectedTaxType}
                        placeholder={loading ? "Loading..." : "Select tax type"}
                        searchPlaceholder="Search tax types..."
                        emptyMessage="No tax types found."
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity Unit (UoM) *</Label>
                      <SearchableSelect
                        options={quantityUnitOptions}
                        value={selectedQuantityUnit}
                        onValueChange={setSelectedQuantityUnit}
                        placeholder={loading ? "Loading..." : "Select quantity unit"}
                        searchPlaceholder="Search units..."
                        emptyMessage="No units found."
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Package Unit *</Label>
                      <SearchableSelect
                        options={packageUnitOptions}
                        value={selectedPackageUnit}
                        onValueChange={setSelectedPackageUnit}
                        placeholder={loading ? "Loading..." : "Select package unit"}
                        searchPlaceholder="Search package units..."
                        emptyMessage="No package units found."
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter item description..."
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button type="button" variant="outline" className="rounded-xl bg-transparent">
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">
                      Add Item
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
              Powered by <span className="font-semibold text-foreground">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
