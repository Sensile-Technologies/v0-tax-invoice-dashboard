"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/lib/currency-utils"

const items = [
  {
    id: 1,
    code: "ITM-001",
    name: "Laptop Computer",
    batchNumber: "BATCH-2024-001",
    type: "Finished Goods",
    purchasePrice: 45000,
    salePrice: 65000,
    description: "High-performance laptop",
    origin: "China",
    sku: "SKU-12345",
    classCode: "CLS-001",
    taxType: "B - 16% VAT",
    status: "Active",
  },
  {
    id: 2,
    code: "ITM-002",
    name: "Office Chair",
    batchNumber: "BATCH-2024-002",
    type: "Goods",
    purchasePrice: 8500,
    salePrice: 12000,
    description: "Ergonomic office chair",
    origin: "Kenya",
    sku: "SKU-12346",
    classCode: "CLS-002",
    taxType: "B - 16% VAT",
    status: "Active",
  },
  {
    id: 3,
    code: "ITM-003",
    name: "Consulting Service",
    batchNumber: "N/A",
    type: "Service",
    purchasePrice: 0,
    salePrice: 25000,
    description: "Business consulting services",
    origin: "Kenya",
    sku: "SKU-12347",
    classCode: "CLS-003",
    taxType: "A - Exempt",
    status: "Active",
  },
  {
    id: 4,
    code: "ITM-004",
    name: "Raw Cotton",
    batchNumber: "BATCH-2024-003",
    type: "Raw Material",
    purchasePrice: 3500,
    salePrice: 5000,
    description: "Organic raw cotton",
    origin: "Uganda",
    sku: "SKU-12348",
    classCode: "CLS-004",
    taxType: "C - Zero Rated",
    status: "Inactive",
  },
]

export default function ItemsListPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { formatCurrency } = useCurrency()

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
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
                    <CardDescription>A complete list of all inventory items</CardDescription>
                  </div>
                  <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">Add New Item</Button>
                </div>
              </CardHeader>
              <CardContent>
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
                        <th className="p-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{item.code}</td>
                          <td className="p-3">
                            <Badge
                              className={`rounded-full ${
                                item.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-muted-foreground">{item.batchNumber}</td>
                          <td className="p-3">{item.type}</td>
                          <td className="p-3">{formatCurrency(item.purchasePrice)}</td>
                          <td className="p-3">{formatCurrency(item.salePrice)}</td>
                          <td className="p-3 text-muted-foreground">{item.sku}</td>
                          <td className="p-3 text-muted-foreground">{item.classCode}</td>
                          <td className="p-3">{item.origin}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="rounded-full">
                              {item.taxType}
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
                                <DropdownMenuItem className="rounded-lg">
                                  {item.status === "Active" ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
