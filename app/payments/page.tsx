"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, Banknote, Building2, CreditCard, Plus, MoreVertical, Search, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/lib/currency-utils"

const paymentMethods = [
  { id: "mobile_money", name: "Mobile Money", icon: Smartphone, color: "from-green-500 to-green-700" },
  { id: "cash", name: "Cash", icon: Banknote, color: "from-blue-500 to-blue-700" },
  { id: "bank", name: "Bank", icon: Building2, color: "from-purple-500 to-purple-700" },
  { id: "card", name: "VISA/Mastercard", icon: CreditCard, color: "from-orange-500 to-orange-700" },
]

export default function PaymentsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { formatCurrency } = useCurrency()

  const transactions = [
    {
      id: "TXN-001",
      product: "Product A",
      description: "Electronic Device",
      rate: 5000,
      unit: "pcs",
      quantity: 2,
      netAmount: 10000,
      vat: 1600,
      grossAmount: 11600,
      customerPin: "A123456789B",
      method: "mobile_money",
      date: "2023-10-01",
    },
    {
      id: "TXN-002",
      product: "Product B",
      description: "Office Supplies",
      rate: 1500,
      unit: "set",
      quantity: 5,
      netAmount: 7500,
      vat: 1200,
      grossAmount: 8700,
      customerPin: "C987654321D",
      method: "cash",
      date: "2023-10-02",
    },
  ]

  const filteredTransactions = selectedMethod ? transactions.filter((t) => t.method === selectedMethod) : []

  const filteredBySearch = filteredTransactions.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerPin.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredByDate = filteredBySearch.filter((t) => {
    const transactionDate = new Date(t.date)
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo) : null

    if (fromDate && transactionDate < fromDate) return false
    if (toDate && transactionDate > toDate) return false

    return true
  })

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
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments</h1>
                <p className="text-sm text-gray-500 mt-1">Manage all payment transactions</p>
              </div>
              <Button
                onClick={() => (window.location.href = "/payments/running-balance")}
                variant="outline"
                className="rounded-xl w-full sm:w-auto"
              >
                <FileText className="mr-2 h-4 w-4" />
                Running Balance Report
              </Button>
            </div>

            {!selectedMethod ? (
              <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div
                        className={`mb-3 md:mb-4 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${method.color} transition-transform group-hover:scale-110`}
                      >
                        <method.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {method.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">View transactions</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setSelectedMethod(null)} className="rounded-xl">
                      ← Back
                    </Button>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                    </h2>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl transition-all hover:shadow-lg w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Payment</DialogTitle>
                        <DialogDescription>Fill in the payment details below</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction ID</Label>
                            <Input id="transactionId" placeholder="TXN-XXX" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product">Product</Label>
                            <Input id="product" placeholder="Product name" className="rounded-xl" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input id="description" placeholder="Product description" className="rounded-xl" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rate">Rate (KES)</Label>
                            <Input id="rate" type="number" placeholder="0.00" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Select>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pcs">Pieces</SelectItem>
                                <SelectItem value="set">Set</SelectItem>
                                <SelectItem value="unit">Unit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Qty</Label>
                            <Input id="quantity" type="number" placeholder="0" className="rounded-xl" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                          Add Payment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="rounded-2xl">
                  <CardContent className="p-3 md:p-6">
                    <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="rounded-xl w-full md:w-32"
                        />
                        <span className="text-sm text-muted-foreground hidden md:inline">to</span>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="rounded-xl w-full md:w-32"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto -mx-3 md:mx-0">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow className="text-xs md:text-sm">
                            <TableHead>ID</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="hidden lg:table-cell">PIN</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredByDate.map((transaction) => (
                            <TableRow key={transaction.id} className="text-xs md:text-sm">
                              <TableCell className="font-medium">{transaction.id}</TableCell>
                              <TableCell>{transaction.product}</TableCell>
                              <TableCell className="hidden md:table-cell">{transaction.description}</TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(transaction.grossAmount)}</TableCell>
                              <TableCell className="hidden lg:table-cell">{transaction.customerPin || "-"}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-xl">
                                    <DropdownMenuItem className="rounded-lg cursor-pointer">View Details</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg cursor-pointer">Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 rounded-lg cursor-pointer">Delete</DropdownMenuItem>
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
              </div>
            )}

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
