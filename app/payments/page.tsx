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
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { formatCurrency } = useCurrency()

  // Sample transaction data
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
    {
      id: "TXN-003",
      product: "Product C",
      description: "Furniture",
      rate: 15000,
      unit: "unit",
      quantity: 1,
      netAmount: 15000,
      vat: 2400,
      grossAmount: 17400,
      customerPin: "",
      method: "bank",
      date: "2023-10-03",
    },
    {
      id: "TXN-004",
      product: "Product D",
      description: "Software License",
      rate: 8000,
      unit: "license",
      quantity: 3,
      netAmount: 24000,
      vat: 3840,
      grossAmount: 27840,
      customerPin: "E456789123F",
      method: "card",
      date: "2023-10-04",
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                <p className="text-sm text-gray-500 mt-1">Manage all payment transactions</p>
              </div>
              <Button
                onClick={() => (window.location.href = "/payments/running-balance")}
                variant="outline"
                className="rounded-xl"
              >
                <FileText className="mr-2 h-4 w-4" />
                Running Balance Report
              </Button>
            </div>

            {!selectedMethod ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                  >
                    <CardContent className="p-6">
                      <div
                        className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${method.color} transition-transform group-hover:scale-110`}
                      >
                        <method.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">View {method.name.toLowerCase()} transactions</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setSelectedMethod(null)} className="rounded-xl">
                      ← Back
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {paymentMethods.find((m) => m.id === selectedMethod)?.name} Transactions
                    </h2>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl transition-all hover:shadow-lg">
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
                        <div className="grid grid-cols-2 gap-4">
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
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pcs">Pieces</SelectItem>
                                <SelectItem value="set">Set</SelectItem>
                                <SelectItem value="unit">Unit</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="ltr">Liter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" placeholder="0" className="rounded-xl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="netAmount">Net Amount (KES)</Label>
                            <Input id="netAmount" type="number" placeholder="0.00" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vat">VAT (KES)</Label>
                            <Input id="vat" type="number" placeholder="0.00" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="grossAmount">Gross Amount (KES)</Label>
                            <Input id="grossAmount" type="number" placeholder="0.00" className="rounded-xl" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerPin">Customer PIN (Optional)</Label>
                          <Input id="customerPin" placeholder="Enter customer PIN" className="rounded-xl" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="rounded-xl transition-all hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setIsAddDialogOpen(false)}
                          className="rounded-xl transition-all hover:shadow-lg"
                        >
                          Add Payment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by Transaction ID, Product, or PIN..."
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
                          placeholder="From"
                          className="rounded-xl w-40"
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          placeholder="To"
                          className="rounded-xl w-40"
                        />
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Net Amount</TableHead>
                          <TableHead>VAT</TableHead>
                          <TableHead>Gross Amount</TableHead>
                          <TableHead>Customer PIN</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredByDate.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.product}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{formatCurrency(transaction.rate)}</TableCell>
                            <TableCell>{transaction.unit}</TableCell>
                            <TableCell>{transaction.quantity}</TableCell>
                            <TableCell>{formatCurrency(transaction.netAmount)}</TableCell>
                            <TableCell>{formatCurrency(transaction.vat)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(transaction.grossAmount)}</TableCell>
                            <TableCell>{transaction.customerPin || "-"}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg transition-colors hover:bg-gray-200"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg cursor-pointer">Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                                    Download Receipt
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 rounded-lg cursor-pointer">
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
  )
}
