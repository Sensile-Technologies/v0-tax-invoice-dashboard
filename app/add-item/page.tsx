"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"

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

interface UserData {
  vendorId?: string
  branchId?: string
  bhfId?: string
}

export default function AddItemPage() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [originCodes, setOriginCodes] = useState<CodelistItem[]>([])
  const [taxTypeCodes, setTaxTypeCodes] = useState<CodelistItem[]>([])
  const [itemTypeCodes, setItemTypeCodes] = useState<CodelistItem[]>([])
  const [quantityUnitCodes, setQuantityUnitCodes] = useState<CodelistItem[]>([])
  const [packageUnitCodes, setPackageUnitCodes] = useState<CodelistItem[]>([])
  const [classificationCodes, setClassificationCodes] = useState<ClassificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userData, setUserData] = useState<UserData>({})

  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [batchNumber, setBatchNumber] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [sku, setSku] = useState("")
  const [selectedOrigin, setSelectedOrigin] = useState("")
  const [selectedTaxType, setSelectedTaxType] = useState("")
  const [selectedItemType, setSelectedItemType] = useState("")
  const [selectedQuantityUnit, setSelectedQuantityUnit] = useState("")
  const [selectedPackageUnit, setSelectedPackageUnit] = useState("")
  const [selectedClassCode, setSelectedClassCode] = useState("")

  useEffect(() => {
    const initUserData = async () => {
      let vendorId = ""
      let branchId = ""
      let bhfId = ""
      
      const storedBranch = localStorage.getItem("selectedBranch")
      if (storedBranch) {
        try {
          const branch = JSON.parse(storedBranch)
          branchId = branch.id || ""
        } catch (e) {
          console.error("Failed to parse selected branch:", e)
        }
      }
      
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          vendorId = user.vendorId || user.vendor_id || ""
          if (!branchId) {
            branchId = user.branchId || user.branch_id || ""
          }
          bhfId = user.bhfId || user.bhf_id || ""

          if (!vendorId || !branchId) {
            const response = await fetch(`/api/auth/session?userId=${user.id}`)
            const result = await response.json()
            if (result.success && result.user) {
              vendorId = result.user.vendor_id
              if (!branchId) {
                branchId = result.user.branch_id
              }
              bhfId = result.user.bhf_id
              const updatedUser = { ...user, vendor_id: vendorId, branch_id: branchId, bhf_id: bhfId }
              localStorage.setItem("user", JSON.stringify(updatedUser))
            }
          }

          setUserData({ vendorId, branchId, bhfId })
        } catch (e) {
          console.error("Failed to parse user data:", e)
        }
      }
    }

    initUserData()

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
        toast.error("Failed to load form data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const generatePreviewCode = () => {
    if (selectedOrigin && selectedItemType && selectedPackageUnit && selectedQuantityUnit) {
      return `${selectedOrigin}${selectedItemType}${selectedPackageUnit}${selectedQuantityUnit}XXXXXXX`
    }
    return "Select all required fields to preview"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userData.vendorId) {
      toast.error("Session expired. Please login again.")
      router.push("/auth/login")
      return
    }

    if (!itemName || !selectedItemType || !selectedClassCode || !selectedTaxType || 
        !selectedOrigin || !selectedQuantityUnit || !selectedPackageUnit) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: userData.vendorId,
          branchId: userData.branchId,
          itemName,
          description,
          itemType: selectedItemType,
          classCode: selectedClassCode,
          taxType: selectedTaxType,
          origin: selectedOrigin,
          batchNumber,
          purchasePrice: parseFloat(purchasePrice) || 0,
          salePrice: parseFloat(salePrice) || 0,
          sku,
          quantityUnit: selectedQuantityUnit,
          packageUnit: selectedPackageUnit
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Item created with code: ${result.itemCode}`)
        setItemName("")
        setDescription("")
        setBatchNumber("")
        setPurchasePrice("")
        setSalePrice("")
        setSku("")
        setSelectedOrigin("")
        setSelectedTaxType("")
        setSelectedItemType("")
        setSelectedQuantityUnit("")
        setSelectedPackageUnit("")
        setSelectedClassCode("")
      } else {
        toast.error(result.error || "Failed to create item")
      }
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error("Failed to create item. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Add New Item</h1>
                  <p className="text-muted-foreground text-pretty">Create a new item in your inventory</p>
                </div>
                <div className="relative w-full sm:w-auto max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Search items..." className="pl-9 rounded-xl" />
                </div>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                  <CardDescription>Fill in the information for the new item. Item code will be auto-generated.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Label className="text-sm text-blue-700 font-medium">Item Code Preview</Label>
                      <p className="text-lg font-mono font-semibold text-blue-900 mt-1">
                        {generatePreviewCode()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Format: Origin + ItemType + PackageUnit + QuantityUnit + SequenceNumber
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name *</Label>
                        <Input 
                          id="itemName" 
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g., Super Petrol" 
                          className="rounded-xl" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input 
                          id="batchNumber" 
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder="e.g., BATCH-2024-001" 
                          className="rounded-xl" 
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
                        <Label htmlFor="purchasePrice">Purchase Price (Incl.) *</Label>
                        <Input
                          id="purchasePrice"
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
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
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="0.00"
                          className="rounded-xl"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input 
                          id="sku" 
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="e.g., SKU-12345" 
                          className="rounded-xl" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter item description..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4 justify-end flex-wrap">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="rounded-xl bg-transparent"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="rounded-xl bg-blue-600 hover:bg-blue-700"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Add Item"
                        )}
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
    </div>
  )
}
