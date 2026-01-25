"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface Invoice {
  id: string
  invoice_number: string
  branch_name: string
  branch_id: string
  amount: number
  due_date: string
  status: 'paid' | 'pending' | 'overdue'
  period_start: string
  period_end: string
  created_at: string
}

export default function SubscriptionPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)
  const [branchName, setBranchName] = useState<string>("")

  useEffect(() => {
    const storedBranch = localStorage.getItem("selectedBranch")
    if (storedBranch) {
      try {
        const branch = JSON.parse(storedBranch)
        if (branch?.id && branch.id !== 'hq') {
          setBranchId(branch.id)
          setBranchName(branch.name || '')
          fetchInvoices(branch.id)
          return
        }
      } catch (e) {
        console.error("Error parsing stored branch:", e)
      }
    }
    setLoading(false)
  }, [])

  const fetchInvoices = async (branchIdParam: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/subscription/invoices?branch_id=${branchIdParam}`)
      const data = await response.json()
      if (data.success) {
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'paid'
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
    }
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
  }

  const overdueInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && new Date(inv.due_date) < new Date()
  )
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    Manage Subscription
                  </h1>
                  <p className="text-slate-600">View your billing and invoices for {branchName || 'this branch'}</p>
                </div>
              </div>

              {!branchId && !loading && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800">Please select a branch from the header to view subscription details.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {branchId && overdueInvoices.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-800">
                            {overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-red-700">
                            Total outstanding: KES {totalOverdue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="destructive">
                        Pay Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {branchId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Invoices
                    </CardTitle>
                    <CardDescription>
                      System usage invoices billed for {branchName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No invoices found</p>
                        <p className="text-sm">Invoices for system usage will appear here</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                              <TableCell>
                                {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right font-mono">
                                KES {invoice.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>{getStatusBadge(invoice.status, invoice.due_date)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
