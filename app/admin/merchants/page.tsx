"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, Plus, Search, Mail, Phone, MapPin, 
  Store, FileText, Calendar, ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Merchant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: string
  subscription_plan: string
  branch_count: number
  open_tickets: number
  created_at: string
}

interface Branch {
  id: string
  bhf_id: string
  bhf_nm: string
  address: string
  status: string
}

interface Invoice {
  id: string
  invoice_number: string
  status: string
  due_date: string
  total_amount: number
  paid_amount: number
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [merchantBranches, setMerchantBranches] = useState<Branch[]>([])
  const [merchantInvoices, setMerchantInvoices] = useState<Invoice[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [newMerchant, setNewMerchant] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    subscription_plan: "basic"
  })

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const response = await fetch("/api/admin/vendors")
      const data = await response.json()
      setMerchants(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching merchants:", error)
      setMerchants([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMerchantDetails = async (merchant: Merchant) => {
    setLoadingDetails(true)
    try {
      const [branchesRes, invoicesRes] = await Promise.all([
        fetch(`/api/admin/vendors/${merchant.id}/branches`),
        fetch(`/api/admin/vendors/${merchant.id}/invoices`)
      ])
      
      const branches = await branchesRes.json()
      const invoices = await invoicesRes.json()
      
      setMerchantBranches(Array.isArray(branches) ? branches : [])
      setMerchantInvoices(Array.isArray(invoices) ? invoices : [])
    } catch (error) {
      console.error("Error fetching merchant details:", error)
      setMerchantBranches([])
      setMerchantInvoices([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleMerchantClick = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
    setDetailDialogOpen(true)
    fetchMerchantDetails(merchant)
  }

  const handleCreateMerchant = async () => {
    if (!newMerchant.name || !newMerchant.email) {
      toast.error("Name and email are required")
      return
    }

    try {
      const response = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMerchant)
      })

      if (!response.ok) throw new Error("Failed to create merchant")

      toast.success("Merchant created successfully")
      setDialogOpen(false)
      setNewMerchant({ name: "", email: "", phone: "", address: "", subscription_plan: "basic" })
      fetchMerchants()
    } catch (error) {
      toast.error("Failed to create merchant")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "paid": return "bg-green-100 text-green-800"
      case "overdue": return "bg-red-100 text-red-800"
      case "partial": return "bg-blue-100 text-blue-800"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  const filteredMerchants = merchants.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingInvoices = merchantInvoices.filter(i => 
    i.status === "pending" || i.status === "overdue" || i.status === "partial"
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Merchants</h1>
          <p className="text-slate-600 mt-1">Manage all merchants on the platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Merchant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Merchant</DialogTitle>
              <DialogDescription>Create a new merchant account on the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={newMerchant.name}
                  onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
                  placeholder="Acme Fuel Stations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMerchant.email}
                  onChange={(e) => setNewMerchant({ ...newMerchant, email: e.target.value })}
                  placeholder="contact@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMerchant.phone}
                  onChange={(e) => setNewMerchant({ ...newMerchant, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newMerchant.address}
                  onChange={(e) => setNewMerchant({ ...newMerchant, address: e.target.value })}
                  placeholder="123 Main Street, Nairobi"
                />
              </div>
              <Button onClick={handleCreateMerchant} className="w-full">
                Create Merchant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerchants.map((merchant) => (
          <Card 
            key={merchant.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleMerchantClick(merchant)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{merchant.name}</CardTitle>
                    <CardDescription>{merchant.email}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(merchant.status)}>
                  {merchant.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {merchant.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  {merchant.phone}
                </div>
              )}
              {merchant.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {merchant.address}
                </div>
              )}
              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-slate-900">{Number(merchant.branch_count)}</p>
                  <p className="text-xs text-slate-500">Branches</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-orange-600">{Number(merchant.open_tickets)}</p>
                  <p className="text-xs text-slate-500">Open Tickets</p>
                </div>
                <div className="text-center flex-1">
                  <Badge variant="outline" className="text-xs">
                    {merchant.subscription_plan}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              {selectedMerchant?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMerchant?.email} {selectedMerchant?.phone && `| ${selectedMerchant.phone}`}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Tabs defaultValue="branches" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="branches">
                  <Store className="h-4 w-4 mr-2" />
                  Branches ({merchantBranches.length})
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  <FileText className="h-4 w-4 mr-2" />
                  Invoices ({pendingInvoices.length} pending)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branches" className="mt-4 space-y-3">
                {merchantBranches.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No branches found
                  </div>
                ) : (
                  merchantBranches.map((branch) => (
                    <Card key={branch.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Store className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{branch.bhf_nm}</p>
                              <p className="text-sm text-slate-500">{branch.address || "No address"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="font-mono">
                              BHF-ID: {branch.bhf_id}
                            </Badge>
                            <div className="mt-1">
                              <Badge className={getStatusColor(branch.status || 'active')}>
                                {branch.status || 'active'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="invoices" className="mt-4 space-y-3">
                {merchantInvoices.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No invoices found
                  </div>
                ) : (
                  merchantInvoices.map((invoice) => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-mono font-medium">{invoice.invoice_number}</p>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(Number(invoice.total_amount))}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {filteredMerchants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No merchants found</p>
        </div>
      )}
    </div>
  )
}
