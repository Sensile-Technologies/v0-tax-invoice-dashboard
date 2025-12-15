"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, MoreVertical, Loader2, Package, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/lib/currency-utils"
import { toast } from "sonner"
import Link from "next/link"

interface Item {
  id: string
  item_code: string
  item_name: string
  batch_number: string | null
  item_type: string
  purchase_price: number
  sale_price: number
  description: string | null
  origin: string
  sku: string | null
  class_code: string
  tax_type: string
  status: string
  quantity_unit: string | null
  package_unit: string | null
  kra_status: string | null
  kra_response: string | null
  kra_last_synced_at: string | null
  created_at: string
}

export default function ItemsListPage() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        let vendorId = ""
        
        if (storedUser) {
          const user = JSON.parse(storedUser)
          vendorId = user.vendorId || user.vendor_id || ""
        }

        const url = vendorId ? `/api/items?vendorId=${vendorId}` : "/api/items"
        const response = await fetch(url)
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

  const handleResendToKra = async (itemId: string) => {
    setResendingItems(prev => new Set(prev).add(itemId))
    
    try {
      const response = await fetch(`/api/items/${itemId}/resend-kra`, {
        method: "POST"
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Item successfully submitted to KRA")
        setItems(items.map(item => 
          item.id === itemId 
            ? { ...item, kra_status: 'success', kra_last_synced_at: new Date().toISOString() }
            : item
        ))
      } else {
        toast.error(result.message || "Failed to submit item to KRA")
        setItems(items.map(item => 
          item.id === itemId 
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

  const handleStatusToggle = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setItems(items.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        ))
        toast.success(`Item ${newStatus === "active" ? "activated" : "deactivated"}`)
      } else {
        toast.error("Failed to update item status")
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
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col ml-8 my-6 mr-6">
        <div className="bg-white rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Items List</h1>
                <p className="text-muted-foreground text-pretty">Manage all items in your inventory</p>
              </div>
              <div className="relative w-full max-w-xs">
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
                          <th className="p-3 text-left text-sm font-medium">Batch Number</th>
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
                          <th className="p-3 text-left text-sm font-medium">SKU</th>
                          <th className="p-3 text-left text-sm font-medium">Class Code</th>
                          <th className="p-3 text-left text-sm font-medium">Origin</th>
                          <th className="p-3 text-left text-sm font-medium">Tax Type</th>
                          <th className="p-3 text-left text-sm font-medium">KRA Status</th>
                          <th className="p-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono font-medium text-sm">{item.item_code}</td>
                            <td className="p-3">
                              <Badge
                                className={`rounded-full ${
                                  item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{item.item_name}</td>
                            <td className="p-3 text-muted-foreground">{item.batch_number || "N/A"}</td>
                            <td className="p-3">{getItemTypeName(item.item_type)}</td>
                            <td className="p-3">{formatCurrency(item.purchase_price)}</td>
                            <td className="p-3">{formatCurrency(item.sale_price)}</td>
                            <td className="p-3 text-muted-foreground">{item.sku || "N/A"}</td>
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
                                  <DropdownMenuItem 
                                    className="rounded-lg"
                                    onClick={() => handleStatusToggle(item.id, item.status)}
                                  >
                                    {item.status === "active" ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  {(item.kra_status === "rejected" || item.kra_status === "pending" || !item.kra_status) && (
                                    <DropdownMenuItem 
                                      className="rounded-lg"
                                      onClick={() => handleResendToKra(item.id)}
                                      disabled={resendingItems.has(item.id)}
                                    >
                                      {resendingItems.has(item.id) ? (
                                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                                      ) : (
                                        <><RefreshCw className="h-4 w-4 mr-2" /> Resend to KRA</>
                                      )}
                                    </DropdownMenuItem>
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
