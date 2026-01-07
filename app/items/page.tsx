"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, MoreVertical, Loader2, Package, RefreshCw, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/lib/currency-utils"
import { toast } from "sonner"
import Link from "next/link"

interface Item {
  item_id: string
  item_code: string
  item_name: string
  item_type: string
  class_code: string
  tax_type: string
  origin: string
  quantity_unit: string | null
  package_unit: string | null
  item_status: string
  branch_item_id: string | null
  branch_sale_price: number | null
  branch_purchase_price: number | null
  is_available: boolean | null
  kra_status: string | null
  kra_last_synced_at: string | null
  is_assigned: boolean
}

export default function ItemsListPage() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let branchId = ""
        
        const storedBranch = localStorage.getItem("selectedBranch")
        if (storedBranch) {
          const branch = JSON.parse(storedBranch)
          branchId = branch.id || ""
        }
        
        if (!branchId) {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const user = JSON.parse(storedUser)
            branchId = user.branch_id || user.branchId || ""
          }
        }

        if (!branchId || branchId === "hq") {
          setItems([])
          setLoading(false)
          return
        }

        const response = await fetch(`/api/branch-items?branchId=${branchId}`)
        const result = await response.json()

        if (result.success) {
          setItems(result.items || [])
        } else {
          toast.error("Failed to load items")
        }
      } catch (error) {
        console.error("Error fetching items:", error)
        toast.error("Failed to load items")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const [resendingItems, setResendingItems] = useState<Set<string>>(new Set())
  const [currentBranchId, setCurrentBranchId] = useState<string>("")

  useEffect(() => {
    const storedBranch = localStorage.getItem("selectedBranch")
    if (storedBranch) {
      const branch = JSON.parse(storedBranch)
      setCurrentBranchId(branch.id || "")
    } else {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setCurrentBranchId(user.branch_id || user.branchId || "")
      }
    }
  }, [])

  const handleResendToKra = async (itemId: string, isAssigned: boolean) => {
    setResendingItems(prev => new Set(prev).add(itemId))
    
    try {
      const url = isAssigned && currentBranchId
        ? `/api/items/${itemId}/resend-kra?branchId=${currentBranchId}`
        : `/api/items/${itemId}/resend-kra`
      
      const response = await fetch(url, {
        method: "POST"
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Item successfully submitted to KRA")
        setItems(items.map(item => 
          item.item_id === itemId 
            ? { ...item, kra_status: 'success', kra_last_synced_at: new Date().toISOString() }
            : item
        ))
      } else {
        toast.error(result.message || result.error || "Failed to submit item to KRA")
        setItems(items.map(item => 
          item.item_id === itemId 
            ? { ...item, kra_status: 'rejected', kra_last_synced_at: new Date().toISOString() }
            : item
        ))
      }
    } catch (error) {
      console.error("Error resending to KRA:", error)
      toast.error("Failed to resend item to KRA")
    } finally {
      setResendingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleToggleAvailability = async (item: Item) => {
    if (!item.branch_item_id) {
      toast.error("This item must be assigned to branch first")
      return
    }
    
    const newAvailability = !item.is_available
    
    try {
      const response = await fetch(`/api/branch-items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          branchItemId: item.branch_item_id,
          isAvailable: newAvailability 
        })
      })

      if (response.ok) {
        setItems(items.map(i => 
          i.item_id === item.item_id ? { ...i, is_available: newAvailability } : i
        ))
        toast.success(`Item ${newAvailability ? "enabled" : "disabled"} for this branch`)
      } else {
        const result = await response.json()
        toast.error(result.error || "Failed to update item")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Failed to update item")
    }
  }

  const handleRemoveFromBranch = async (item: Item) => {
    if (!item.is_assigned || !item.branch_item_id) {
      toast.error("Cannot remove - this is a legacy branch item")
      return
    }
    
    if (!confirm(`Remove "${item.item_name}" from this branch? The item will still exist in the catalog.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/branch-items?id=${item.branch_item_id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setItems(items.filter(i => i.item_id !== item.item_id))
        toast.success("Item removed from branch")
      } else {
        const result = await response.json()
        toast.error(result.error || "Failed to remove item")
      }
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
    }
  }

  const handleDeleteLegacyItem = async (item: Item) => {
    if (item.is_assigned) {
      toast.error("Cannot delete catalog item - use Remove from Branch instead")
      return
    }
    
    if (!confirm(`Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/items/${item.item_id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setItems(items.filter(i => i.item_id !== item.item_id))
        toast.success("Item deleted successfully")
      } else {
        const result = await response.json()
        toast.error(result.error || "Failed to delete item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    }
  }

  const handleLegacyStatusToggle = async (item: Item) => {
    if (item.is_assigned) {
      toast.error("Use availability toggle for catalog items")
      return
    }
    
    const newStatus = item.item_status === "active" ? "inactive" : "active"
    
    try {
      const response = await fetch(`/api/items/${item.item_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setItems(items.map(i => 
          i.item_id === item.item_id ? { ...i, item_status: newStatus } : i
        ))
        toast.success(`Item ${newStatus === "active" ? "activated" : "deactivated"}`)
      } else {
        const result = await response.json()
        toast.error(result.error || "Failed to update item status")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Failed to update item status")
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getItemTypeName = (code: string) => {
    const types: Record<string, string> = {
      "1": "Raw Material",
      "2": "Finished Product",
      "3": "Service"
    }
    return types[code] || code
  }

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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Items List</h1>
                <p className="text-sm text-muted-foreground text-pretty">Manage all items in your inventory</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Items</CardTitle>
                    <CardDescription>A complete list of all inventory items ({items.length} total)</CardDescription>
                  </div>
                  <Link href="/add-item">
                    <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">Add New Item</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-muted-foreground">Loading items...</span>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No items found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Try adjusting your search" : "Get started by adding your first item"}
                    </p>
                    {!searchTerm && (
                      <Link href="/add-item">
                        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">Add New Item</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                              Item Code <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                              Status <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                              Item Name <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </th>
                          <th className="p-3 text-left text-sm font-medium">Source</th>
                          <th className="p-3 text-left text-sm font-medium">Type</th>
                          <th className="p-3 text-left text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                              Purchase Price <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </th>
                          <th className="p-3 text-left text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                              Sale Price <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </th>
                          <th className="p-3 text-left text-sm font-medium">Unit</th>
                          <th className="p-3 text-left text-sm font-medium">Class Code</th>
                          <th className="p-3 text-left text-sm font-medium">Origin</th>
                          <th className="p-3 text-left text-sm font-medium">Tax Type</th>
                          <th className="p-3 text-left text-sm font-medium">KRA Status</th>
                          <th className="p-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.item_id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono font-medium text-sm">{item.item_code}</td>
                            <td className="p-3">
                              <Badge
                                className={`rounded-full ${
                                  item.item_status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.item_status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{item.item_name}</td>
                            <td className="p-3">
                              {item.is_assigned ? (
                                <Badge className="bg-blue-100 text-blue-800 rounded-full">Catalog</Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-full">Legacy</Badge>
                              )}
                            </td>
                            <td className="p-3">{getItemTypeName(item.item_type)}</td>
                            <td className="p-3">{item.branch_purchase_price ? formatCurrency(item.branch_purchase_price) : <span className="text-muted-foreground text-xs">Not set</span>}</td>
                            <td className="p-3">{item.branch_sale_price ? formatCurrency(item.branch_sale_price) : <span className="text-muted-foreground text-xs">Not set</span>}</td>
                            <td className="p-3 text-muted-foreground">{item.quantity_unit || "N/A"}</td>
                            <td className="p-3 text-muted-foreground font-mono text-xs">{item.class_code}</td>
                            <td className="p-3">{item.origin}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="rounded-full">
                                {item.tax_type}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={`rounded-full ${
                                  item.kra_status === "success" 
                                    ? "bg-green-100 text-green-800" 
                                    : item.kra_status === "rejected" 
                                    ? "bg-red-100 text-red-800" 
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.kra_status === "success" ? "Synced" : 
                                 item.kra_status === "rejected" ? "Rejected" : "Pending"}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  {item.is_assigned && item.branch_item_id ? (
                                    <>
                                      <DropdownMenuItem 
                                        className="rounded-lg"
                                        onClick={() => handleToggleAvailability(item)}
                                      >
                                        {item.is_available !== false ? "Disable for Branch" : "Enable for Branch"}
                                      </DropdownMenuItem>
                                      {(item.kra_status === "rejected" || item.kra_status === "pending" || !item.kra_status) && (
                                        <DropdownMenuItem 
                                          className="rounded-lg"
                                          onClick={() => handleResendToKra(item.item_id, true)}
                                          disabled={resendingItems.has(item.item_id)}
                                        >
                                          {resendingItems.has(item.item_id) ? (
                                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                                          ) : (
                                            <><RefreshCw className="h-4 w-4 mr-2" /> Sync to KRA</>
                                          )}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        className="rounded-lg text-orange-600 focus:text-orange-600"
                                        onClick={() => handleRemoveFromBranch(item)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" /> Remove from Branch
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <>
                                      <DropdownMenuItem 
                                        className="rounded-lg"
                                        onClick={() => handleLegacyStatusToggle(item)}
                                      >
                                        {item.item_status === "active" ? "Deactivate" : "Activate"}
                                      </DropdownMenuItem>
                                      {(item.kra_status === "rejected" || item.kra_status === "pending" || !item.kra_status) && (
                                        <DropdownMenuItem 
                                          className="rounded-lg"
                                          onClick={() => handleResendToKra(item.item_id, false)}
                                          disabled={resendingItems.has(item.item_id)}
                                        >
                                          {resendingItems.has(item.item_id) ? (
                                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                                          ) : (
                                            <><RefreshCw className="h-4 w-4 mr-2" /> Sync to KRA</>
                                          )}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        className="rounded-lg text-red-600 focus:text-red-600"
                                        onClick={() => handleDeleteLegacyItem(item)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
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
