"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddImportPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Add New Import</h1>
                  <p className="text-muted-foreground text-pretty">Register a new import declaration</p>
                </div>
                <div className="relative w-full sm:w-auto max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Search imports..." className="pl-9 rounded-xl" />
                </div>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Import Declaration Details</CardTitle>
                  <CardDescription>Fill in the import information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="opCode">Op Code *</Label>
                        <Input id="opCode" placeholder="e.g., OP-001" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="declarationDate">Declaration Date *</Label>
                        <Input id="declarationDate" type="date" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hsCode">HS CODE *</Label>
                        <Input id="hsCode" placeholder="e.g., 8471.30.00" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="itemCode">Item Code *</Label>
                        <Input id="itemCode" placeholder="e.g., ITM-001" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name *</Label>
                        <Input id="itemName" placeholder="e.g., Computer Hardware" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier *</Label>
                        <Input id="supplier" placeholder="e.g., ABC Trading Ltd" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent">Agent</Label>
                        <Input id="agent" placeholder="e.g., XYZ Clearing Agency" className="rounded-xl" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invoiceAmount">Invoice Amount *</Label>
                        <Input
                          id="invoiceAmount"
                          type="number"
                          placeholder="0.00"
                          className="rounded-xl"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invoiceCurrency">Invoice Currency *</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="origin">Origin *</Label>
                        <Input id="origin" placeholder="e.g., China, USA, Germany" className="rounded-xl" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" placeholder="e.g., SKU-12345" className="rounded-xl" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rate">Rate *</Label>
                        <Input id="rate" type="number" placeholder="0.00" className="rounded-xl" step="0.01" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="approvalStatus">Approval Status *</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="under-review">Under Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter import description..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4 justify-end flex-wrap">
                      <Button type="button" variant="outline" className="rounded-xl bg-transparent">
                        Cancel
                      </Button>
                      <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">
                        Add Import
                      </Button>
                    </div>
                  </form>
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
