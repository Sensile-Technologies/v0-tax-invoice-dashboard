"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreVertical, ArrowUpDown, Loader2, Package, RefreshCw } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

interface ImportItem {
  id: string
  op_code: string
  declaration_date: string | null
  hs_code: string
  item_code: string
  item_name: string
  origin: string
  invoice_amount: number
  invoice_currency: string
  approval_status: string
  status: string
  remark: string | null
}

export default function ImportsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [imports, setImports] = useState<ImportItem[]>([])
  const [loading, setLoading] = useState(true)
  const { formatCurrency } = useCurrency()

  const fetchImports = useCallback(async () => {
    try {
      setLoading(true)
      const storedBranch = localStorage.getItem("selectedBranch")
      let branchId = ""
      
      if (storedBranch) {
        const branch = JSON.parse(storedBranch)
        branchId = branch.id
      }

      const params = new URLSearchParams()
      if (branchId) params.append("branch_id", branchId)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/imports?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setImports(result.imports || [])
      }
    } catch (error) {
      console.error("Error fetching imports:", error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchImports()
  }, [fetchImports])

  const filteredImports = imports.filter((item) =>
    Object.values(item).some((value) => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ),
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
                <div className="flex items-center gap-2">
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
                  <Button
                    onClick={fetchImports}
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading imports...</span>
                    </div>
                  ) : filteredImports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No imports found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm ? "Try adjusting your search" : "Import declarations will appear here"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs md:text-sm">
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
                            <TableHead className="hidden md:table-cell">
                              <Button variant="ghost" size="sm" className="h-8 gap-1">
                                Declaration Date
                                <ArrowUpDown className="h-3 w-3" />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">HS Code</TableHead>
                            <TableHead className="hidden sm:table-cell">Item Code</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="hidden md:table-cell">Invoice Amount</TableHead>
                            <TableHead className="hidden lg:table-cell">Origin</TableHead>
                            <TableHead>Approval</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredImports.map((item) => (
                            <TableRow key={item.id} className="text-xs md:text-sm">
                              <TableCell>
                                <Badge
                                  variant={item.status === "active" ? "default" : "secondary"}
                                  className="rounded-full text-xs"
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.op_code}</TableCell>
                              <TableCell className="hidden md:table-cell">{item.declaration_date || 'N/A'}</TableCell>
                              <TableCell className="hidden lg:table-cell">{item.hs_code}</TableCell>
                              <TableCell className="hidden sm:table-cell">{item.item_code}</TableCell>
                              <TableCell>{item.item_name}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {formatCurrency(item.invoice_amount)} {item.invoice_currency}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">{item.origin}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.approval_status === "approved"
                                      ? "default"
                                      : item.approval_status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="rounded-full capitalize text-xs"
                                >
                                  {item.approval_status}
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
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
