"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreVertical, ArrowUpDown } from "lucide-react"

const sampleImports = [
  {
    id: 1,
    opCode: "OP-2024-001",
    declarationDate: "2024-01-15",
    hsCode: "8471.30.00",
    itemCode: "ITM-001",
    itemName: "Laptop Computer",
    supplier: "Tech Suppliers Ltd",
    agent: "Quick Clearing",
    invoiceAmount: 125000,
    invoiceCurrency: "USD",
    origin: "China",
    sku: "SKU-LAP-001",
    rate: 145.5,
    approvalStatus: "approved",
    description: "Dell Latitude laptops - 50 units",
    status: "active",
  },
  {
    id: 2,
    opCode: "OP-2024-002",
    declarationDate: "2024-01-20",
    hsCode: "8528.72.00",
    itemCode: "ITM-002",
    itemName: "LED Monitor",
    supplier: "Display Imports Inc",
    agent: "Clearance Pro",
    invoiceAmount: 45000,
    invoiceCurrency: "USD",
    origin: "South Korea",
    sku: "SKU-MON-002",
    rate: 145.5,
    approvalStatus: "pending",
    description: "Samsung 27-inch monitors",
    status: "active",
  },
]

export default function ImportsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredImports = sampleImports.filter((item) =>
    Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Import List</h1>
                <p className="text-sm text-muted-foreground text-pretty">Manage your import declarations</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search imports..."
                  className="pl-9 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Status
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Op Code
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Declaration Date
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            HS Code
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Item Code
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Item Name
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Supplier
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Invoice Amount
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Origin
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            Approval Status
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredImports.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge
                              variant={item.status === "active" ? "default" : "secondary"}
                              className="rounded-full"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{item.opCode}</TableCell>
                          <TableCell>{item.declarationDate}</TableCell>
                          <TableCell>{item.hsCode}</TableCell>
                          <TableCell>{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>
                            {item.invoiceAmount.toLocaleString()} {item.invoiceCurrency}
                          </TableCell>
                          <TableCell>{item.origin}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.approvalStatus === "approved"
                                  ? "default"
                                  : item.approvalStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="rounded-full capitalize"
                            >
                              {item.approvalStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem>
                                  {item.status === "active" ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
    </div>
  )
}
