"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Printer, Download, Loader2, Package } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

interface InventoryItem {
  code: string
  name: string
  category: string
  qty: number
  unit_cost: number
  total_cost: number
}

export default function InventoryValuationPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const { formatCurrency } = useCurrency()

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      const params = new URLSearchParams()
      if (branchId) params.append("branchId", branchId)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/items?${params.toString()}`)
      const result = await response.json()

      if (result.success && result.items) {
        const items = result.items.map((item: any) => ({
          code: item.item_code || item.code || 'N/A',
          name: item.item_name || item.name || 'Unknown',
          category: item.category || item.item_cls_cd || 'General',
          qty: parseFloat(item.available_stock) || parseFloat(item.quantity) || 0,
          unit_cost: parseFloat(item.purchase_price) || parseFloat(item.unit_price) || 0,
          total_cost: (parseFloat(item.available_stock) || 0) * (parseFloat(item.purchase_price) || 0),
        }))
        setInventoryData(items)
      } else {
        setInventoryData([])
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setInventoryData([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const totalValue = inventoryData.reduce((sum, item) => sum + item.total_cost, 0)
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.qty, 0)

  const handlePrint = () => window.print()

  const handleExport = () => {
    const csvContent = [
      ["Item Code", "Item Name", "Category", "Quantity", "Unit Cost", "Total Value"],
      ...inventoryData.map(item => [
        item.code, item.name, item.category, item.qty.toString(),
        item.unit_cost.toString(), item.total_cost.toString()
      ]),
      ["TOTAL", "", "", totalQuantity.toString(), "", totalValue.toString()]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventory-valuation-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Inventory Valuation Report</h1>
                  <p className="text-sm text-slate-600 mt-1">Stock valuation as of {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Total Inventory Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totalValue)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : inventoryData.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Total Quantity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${totalQuantity.toLocaleString()} units`}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Avg. Value/Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold text-navy-900">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(inventoryData.length > 0 ? totalValue / inventoryData.length : 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg md:text-xl">Inventory Items</CardTitle>
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-xl"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading inventory...</span>
                    </div>
                  ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No inventory items found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery ? "Try adjusting your search" : "Add items to see inventory valuation"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-3 md:mx-0">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b text-xs md:text-sm">
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Item Code</th>
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Item Name</th>
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700 hidden md:table-cell">Category</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Quantity</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700 hidden sm:table-cell">Unit Cost</th>
                            <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-slate-700">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, index) => (
                            <tr key={item.code + index} className="border-b hover:bg-slate-50 text-xs md:text-sm">
                              <td className="py-2 md:py-3 px-2 md:px-4">{item.code}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4">{item.name}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">{item.category}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right">{item.qty.toLocaleString()}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden sm:table-cell">{formatCurrency(item.unit_cost)}</td>
                              <td className="py-2 md:py-3 px-2 md:px-4 text-right font-semibold">{formatCurrency(item.total_cost)}</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-slate-50 text-xs md:text-sm">
                            <td colSpan={3} className="py-2 md:py-3 px-2 md:px-4">TOTAL</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-right">{totalQuantity.toLocaleString()}</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden sm:table-cell">-</td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-right">{formatCurrency(totalValue)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
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
