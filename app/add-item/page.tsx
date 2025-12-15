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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch codelists and classifications in parallel
        const [codelistResponse, classificationsResponse] = await Promise.all([
          fetch("/api/kra/saved-data?type=codelist"),
          fetch("/api/kra/saved-data?type=classifications")
        ])
        
        const codelistResult = await codelistResponse.json()
        const classificationsResult = await classificationsResponse.json()
        
        if (codelistResult.data) {
          // cd_cls 05 = Country codes (Origin)
          setOriginCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "05"))
          // cd_cls 04 = Tax Type codes
          setTaxTypeCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "04"))
          // cd_cls 24 = Item Type codes
          setItemTypeCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "24"))
          // cd_cls 10 = Quantity Unit (UoM) codes
          setQuantityUnitCodes(codelistResult.data.filter((item: CodelistItem) => item.cd_cls === "10"))
          // cd_cls 17 = Package Unit codes
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
                      <Label htmlFor="itemType">Item Type *</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={loading ? "Loading..." : "Select item type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypeCodes.length > 0 ? (
                            itemTypeCodes.map((item) => (
                              <SelectItem key={item.cd} value={item.cd}>
                                {item.cd} - {item.cd_nm}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="1">1 - Raw Material</SelectItem>
                              <SelectItem value="2">2 - Finished Product</SelectItem>
                              <SelectItem value="3">3 - Service</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="classCode">Class Code *</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={loading ? "Loading..." : "Select item classification"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {classificationCodes.length > 0 ? (
                            classificationCodes.map((item) => (
                              <SelectItem key={item.item_cls_cd} value={item.item_cls_cd}>
                                {item.item_cls_cd} - {item.item_cls_nm}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="01">01 - General</SelectItem>
                              <SelectItem value="02">02 - Electronics</SelectItem>
                              <SelectItem value="03">03 - Services</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin *</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={loading ? "Loading..." : "Select origin country"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {originCodes.length > 0 ? (
                            originCodes.map((item) => (
                              <SelectItem key={item.cd} value={item.cd}>
                                {item.cd} - {item.cd_nm}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="KE">KE - KENYA</SelectItem>
                              <SelectItem value="CN">CN - CHINA</SelectItem>
                              <SelectItem value="US">US - UNITED STATES</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxType">Tax Type *</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={loading ? "Loading..." : "Select tax type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {taxTypeCodes.length > 0 ? (
                            taxTypeCodes.map((item) => (
                              <SelectItem key={item.cd} value={item.cd}>
                                {item.cd} - {item.cd_nm}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="A">A - Exempt</SelectItem>
                              <SelectItem value="B">B - 16% VAT</SelectItem>
                              <SelectItem value="C">C - Zero Rated</SelectItem>
                              <SelectItem value="D">D - Non-VAT</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantityUnit">Quantity Unit (UoM) *</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={loading ? "Loading..." : "Select quantity unit"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {quantityUnitCodes.length > 0 ? (
                            quantityUnitCodes.map((item) => (
                              <SelectItem key={item.cd} value={item.cd}>
                                {item.cd} - {item.cd_nm}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="BA">BA - Barrel</SelectItem>
                              <SelectItem value="KG">KG - Kilogram</SelectItem>
                              <SelectItem value="LT">LT - Litre</SelectItem>
                              <SelectItem value="U">U - Unit</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="packageUnit">Package Unit *</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={loading ? "Loading..." : "Select package unit"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {packageUnitCodes.length > 0 ? (
                            packageUnitCodes.map((item) => (
                              <SelectItem key={item.cd} value={item.cd}>
                                {item.cd} - {item.cd_nm}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="BG">BG - Bag</SelectItem>
                              <SelectItem value="BT">BT - Bottle</SelectItem>
                              <SelectItem value="CT">CT - Carton</SelectItem>
                              <SelectItem value="NT">NT - Net</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
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
