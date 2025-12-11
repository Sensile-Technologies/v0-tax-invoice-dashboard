"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Ticket, FileText, TrendingUp, AlertCircle, Clock } from "lucide-react"

interface DashboardData {
  vendors: {
    total_vendors: number
    active_vendors: number
    new_vendors_30d: number
  }
  tickets: {
    total_tickets: number
    open_tickets: number
    in_progress_tickets: number
    resolved_tickets: number
    high_priority_open: number
  }
  invoices: {
    total_invoices: number
    pending_invoices: number
    paid_invoices: number
    pending_amount: number
    received_amount: number
  }
  recentTickets: any[]
  recentVendors: any[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage vendors, support, and billing across Flow360 platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Vendors</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(data?.vendors?.total_vendors || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {Number(data?.vendors?.active_vendors || 0)} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Open Tickets</CardTitle>
            <Ticket className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(data?.tickets?.open_tickets || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {Number(data?.tickets?.high_priority_open || 0)} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Invoices</CardTitle>
            <FileText className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(data?.invoices?.pending_invoices || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(Number(data?.invoices?.pending_amount || 0))} outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Revenue (Paid)</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(Number(data?.invoices?.received_amount || 0))}</div>
            <p className="text-xs text-slate-500 mt-1">
              {Number(data?.invoices?.paid_invoices || 0)} invoices paid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Recent Tickets
            </CardTitle>
            <CardDescription>Open and in-progress support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentTickets && data.recentTickets.length > 0 ? (
              <div className="space-y-3">
                {data.recentTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{ticket.subject}</span>
                        <Badge 
                          variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{ticket.vendor_name}</p>
                    </div>
                    <Badge 
                      style={{ backgroundColor: ticket.category_color }}
                      className="text-white text-xs"
                    >
                      {ticket.category_name || 'General'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No open tickets</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Vendors
            </CardTitle>
            <CardDescription>Newly registered vendors</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentVendors && data.recentVendors.length > 0 ? (
              <div className="space-y-3">
                {data.recentVendors.map((vendor: any) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{vendor.name}</p>
                      <p className="text-xs text-slate-500">{vendor.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{Number(vendor.branch_count)} branches</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No vendors yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
