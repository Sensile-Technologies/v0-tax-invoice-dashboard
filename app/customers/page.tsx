"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, MoreVertical, FileText, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  cust_tin: string
  tin: string
  cust_nm: string
  email: string
  tel_no: string
  adrs: string
  branch_id: string
}

export default function CustomersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBranch, setCurrentBranch] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrentBranch()
    const interval = setInterval(() => {
      fetchCurrentBranch()
      if (currentBranch) {
        fetchCustomers()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentBranch) {
      fetchCustomers()
    }
  }, [currentBranch])

  const fetchCurrentBranch = async () => {
    try {
      const storedBranch = localStorage.getItem("selectedBranch")

      if (storedBranch) {
        const branchData = JSON.parse(storedBranch)
        setCurrentBranch(branchData)
        return
      }

      const response = await fetch('/api/branches?limit=1')
      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      if (result.data && result.data.length > 0) {
        setCurrentBranch(result.data[0])
      }
    } catch (error) {
      console.error("[v0] Error fetching current branch:", error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/customers?branch_id=${currentBranch.id}`)
      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setCustomers(result.data || [])
    } catch (error) {
      console.error("[v0] Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete ${customerName}?`)) return

    try {
      const response = await fetch(`/api/customers?id=${customerId}`, { method: 'DELETE' })
      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      toast({
        title: "Customer Deleted",
        description: `${customerName} has been removed successfully.`,
      })

      fetchCustomers()
    } catch (error) {
      console.error("[v0] Error deleting customer:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer.",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.cust_tin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cust_nm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
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

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Customer List</h1>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  {currentBranch ? `Viewing customers for ${currentBranch.name}` : "Manage your customer database"}
                </p>
              </div>
              <div className="relative w-full sm:w-72 md:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by PIN, name, or email..."
                  className="pl-10 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-3 md:p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchTerm ? "No customers found matching your search" : "No customers registered yet"}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden overflow-x-auto -mx-3 md:mx-0">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow className="text-xs md:text-sm">
                          <TableHead>PIN</TableHead>
                          <TableHead>Customer Name</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead className="hidden lg:table-cell">Phone</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="text-xs md:text-sm">
                            <TableCell className="font-medium">{customer.cust_tin || customer.tin || "N/A"}</TableCell>
                            <TableCell>{customer.cust_nm || "N/A"}</TableCell>
                            <TableCell className="hidden md:table-cell">{customer.email || "N/A"}</TableCell>
                            <TableCell className="hidden lg:table-cell">{customer.tel_no || "N/A"}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg">
                                    <FileText className="h-4 w-4" />
                                    Generate Statement
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg">
                                    <Edit className="h-4 w-4" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 cursor-pointer rounded-lg text-red-600"
                                    onClick={() => handleDeleteCustomer(customer.id, customer.cust_nm)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Customer
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
          </main>

          <footer className="border-t px-4 md:px-8 py-4 text-center text-sm text-muted-foreground">
            Powered by Sensile Technologies East Africa Ltd
          </footer>
        </div>
      </div>
    </div>
  )
}
