"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, MoreVertical, FileText, Edit, Trash2, Loader2, Download, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/lib/currency-utils"

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

interface Transaction {
  id: string
  date: string
  invoice_number: string
  fuel_type: string
  quantity: number
  amount: number
  payment_method: string
  branch_name: string
}

interface StatementData {
  customer: {
    id: string
    name: string
    pin: string
    phone: string
    email: string
    address: string
  }
  transactions: Transaction[]
  summary: {
    totalTransactions: number
    totalAmount: number
    totalQuantity: number
    paymentBreakdown: Record<string, number>
    periodStart: string | null
    periodEnd: string | null
  }
}

export default function CustomersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBranch, setCurrentBranch] = useState<any>(null)
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editForm, setEditForm] = useState({
    cust_nm: "",
    cust_tin: "",
    tel_no: "",
    email: "",
    adrs: ""
  })
  const [saving, setSaving] = useState(false)

  // Statement dialog state
  const [statementDialogOpen, setStatementDialogOpen] = useState(false)
  const [statementData, setStatementData] = useState<StatementData | null>(null)
  const [statementLoading, setStatementLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchCurrentBranch()
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

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditForm({
      cust_nm: customer.cust_nm || "",
      cust_tin: customer.cust_tin || customer.tin || "",
      tel_no: customer.tel_no || "",
      email: customer.email || "",
      adrs: customer.adrs || ""
    })
    setEditDialogOpen(true)
  }

  const handleSaveCustomer = async () => {
    if (!selectedCustomer) return

    setSaving(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCustomer.id,
          ...editForm
        })
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      toast({
        title: "Success",
        description: "Customer updated successfully.",
      })

      setEditDialogOpen(false)
      fetchCustomers()
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: "Failed to update customer.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateStatement = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setStatementData(null)
    setStartDate("")
    setEndDate("")
    setStatementDialogOpen(true)
  }

  const fetchStatement = async () => {
    if (!selectedCustomer) return

    setStatementLoading(true)
    try {
      let url = `/api/customers/statement?customer_id=${selectedCustomer.id}&branch_id=${currentBranch?.id || ''}`
      if (startDate) url += `&start_date=${startDate}`
      if (endDate) url += `&end_date=${endDate}`

      const response = await fetch(url)
      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setStatementData(result.data)
    } catch (error) {
      console.error("Error fetching statement:", error)
      toast({
        title: "Error",
        description: "Failed to generate statement.",
        variant: "destructive",
      })
    } finally {
      setStatementLoading(false)
    }
  }

  const handlePrintStatement = () => {
    if (!statementData) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Statement - ${statementData.customer.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e40af; }
          .header { margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; padding: 10px; background: #f3f4f6; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #1e40af; color: white; }
          tr:nth-child(even) { background: #f9fafb; }
          .summary { margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px; }
          .total { font-size: 1.2em; font-weight: bold; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Customer Statement</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${statementData.summary.periodStart ? `<p>Period: ${statementData.summary.periodStart} to ${statementData.summary.periodEnd || 'Present'}</p>` : ''}
        </div>
        
        <div class="customer-info">
          <h3>${statementData.customer.name}</h3>
          <p>PIN: ${statementData.customer.pin || 'N/A'}</p>
          <p>Phone: ${statementData.customer.phone || 'N/A'}</p>
          <p>Email: ${statementData.customer.email || 'N/A'}</p>
        </div>

        <h3>Transaction History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${statementData.transactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.invoice_number || 'N/A'}</td>
                <td>${t.fuel_type || 'N/A'}</td>
                <td>${t.quantity || 0} L</td>
                <td>KES ${parseFloat(String(t.amount || 0)).toLocaleString()}</td>
                <td>${t.payment_method || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <h3>Summary</h3>
          <p>Total Transactions: ${statementData.summary.totalTransactions}</p>
          <p>Total Quantity: ${statementData.summary.totalQuantity.toLocaleString()} L</p>
          <p class="total">Total Amount: KES ${statementData.summary.totalAmount.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
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
                                  <DropdownMenuItem 
                                    className="gap-2 cursor-pointer rounded-lg"
                                    onClick={() => handleGenerateStatement(customer)}
                                  >
                                    <FileText className="h-4 w-4" />
                                    Generate Statement
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="gap-2 cursor-pointer rounded-lg"
                                    onClick={() => handleEditCustomer(customer)}
                                  >
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

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cust_nm">Customer Name</Label>
              <Input
                id="cust_nm"
                value={editForm.cust_nm}
                onChange={(e) => setEditForm({ ...editForm, cust_nm: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust_tin">PIN/TIN</Label>
              <Input
                id="cust_tin"
                value={editForm.cust_tin}
                onChange={(e) => setEditForm({ ...editForm, cust_tin: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tel_no">Phone Number</Label>
              <Input
                id="tel_no"
                value={editForm.tel_no}
                onChange={(e) => setEditForm({ ...editForm, tel_no: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adrs">Address</Label>
              <Input
                id="adrs"
                value={editForm.adrs}
                onChange={(e) => setEditForm({ ...editForm, adrs: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveCustomer} disabled={saving} className="rounded-xl">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={statementDialogOpen} onOpenChange={setStatementDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Statement</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.cust_nm || "Customer"} - Transaction History
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl w-40"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl w-40"
                />
              </div>
              <Button onClick={fetchStatement} disabled={statementLoading} className="rounded-xl">
                {statementLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate
              </Button>
              {statementData && (
                <Button variant="outline" onClick={handlePrintStatement} className="rounded-xl gap-2">
                  <Download className="h-4 w-4" />
                  Print/Download
                </Button>
              )}
            </div>

            {statementLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : statementData ? (
              <div className="space-y-4">
                <Card className="rounded-xl">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Customer Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Name: {statementData.customer.name}</div>
                      <div>PIN: {statementData.customer.pin || "N/A"}</div>
                      <div>Phone: {statementData.customer.phone || "N/A"}</div>
                      <div>Email: {statementData.customer.email || "N/A"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{statementData.summary.totalTransactions}</div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statementData.summary.totalQuantity.toLocaleString()} L</div>
                        <div className="text-sm text-muted-foreground">Total Quantity</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(statementData.summary.totalAmount)}</div>
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {statementData.transactions.length > 0 ? (
                  <div className="rounded-xl border overflow-hidden overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statementData.transactions.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                            <TableCell>{t.invoice_number || "N/A"}</TableCell>
                            <TableCell>{t.fuel_type || "N/A"}</TableCell>
                            <TableCell>{t.quantity || 0} L</TableCell>
                            <TableCell>{formatCurrency(t.amount || 0)}</TableCell>
                            <TableCell className="capitalize">{t.payment_method || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found for the selected period
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a date range and click Generate to view the statement
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
