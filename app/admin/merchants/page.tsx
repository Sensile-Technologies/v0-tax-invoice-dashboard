"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, Search, Phone, MapPin, 
  Store, FileText, Calendar, Edit2, Settings, Zap, Loader2
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
  pending_invoices: number
  created_at: string
}

interface Branch {
  id: string
  bhf_id: string
  name: string
  address: string
  status: string
  device_token?: string
  server_address?: string
  server_port?: string
  kra_pin?: string
  trading_name?: string
  bulk_sales_kra_percentage?: number
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [merchantBranches, setMerchantBranches] = useState<Branch[]>([])
  const [merchantInvoices, setMerchantInvoices] = useState<Invoice[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [branchEditDialogOpen, setBranchEditDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [branchEditForm, setBranchEditForm] = useState({
    bhf_id: "",
    device_token: "",
    server_address: "",
    server_port: "",
    kra_pin: "",
    device_serial_number: "",
    sr_number: "",
    bulk_sales_kra_percentage: "100"
  })
  const [initializingBranch, setInitializingBranch] = useState(false)

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

  const handleEditClick = (e: React.MouseEvent, merchant: Merchant) => {
    e.stopPropagation()
    setEditingMerchant(merchant)
    setEditForm({
      name: merchant.name || "",
      email: merchant.email || "",
      phone: merchant.phone || "",
      address: merchant.address || ""
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingMerchant) return

    try {
      const response = await fetch("/api/admin/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMerchant.id,
          ...editForm
        })
      })

      if (!response.ok) throw new Error("Failed to update merchant")

      toast.success("Merchant updated successfully")
      setEditDialogOpen(false)
      fetchMerchants()
    } catch (error) {
      toast.error("Failed to update merchant")
    }
  }

  const handleBranchEditClick = (e: React.MouseEvent, branch: Branch) => {
    e.stopPropagation()
    setEditingBranch(branch)
    setBranchEditForm({
      bhf_id: branch.bhf_id || "",
      device_token: branch.device_token || "",
      server_address: branch.server_address || "",
      server_port: branch.server_port || "",
      kra_pin: branch.kra_pin || "",
      device_serial_number: (branch as any).device_serial_number || "",
      sr_number: (branch as any).sr_number?.toString() || "",
      bulk_sales_kra_percentage: branch.bulk_sales_kra_percentage?.toString() || "100"
    })
    setBranchEditDialogOpen(true)
  }

  const handleSaveBranchEdit = async () => {
    if (!editingBranch || !selectedMerchant) return

    try {
      const response = await fetch(`/api/admin/vendors/${selectedMerchant.id}/branches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: editingBranch.id,
          ...branchEditForm
        })
      })

      if (!response.ok) throw new Error("Failed to update branch")

      toast.success("Branch KRA configuration updated")
      setBranchEditDialogOpen(false)
      fetchMerchantDetails(selectedMerchant)
    } catch (error) {
      toast.error("Failed to update branch configuration")
    }
  }

  const handleInitializeBranch = async () => {
    if (!editingBranch) return

    setInitializingBranch(true)
    try {
      const response = await fetch("/api/kra/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: editingBranch.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to initialize")
        return
      }

      if (result.success) {
        toast.success("KRA initialization successful - logged to branch profile")
      } else {
        toast.warning("KRA initialization completed with errors - check branch logs")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize branch")
    } finally {
      setInitializingBranch(false)
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEditClick(e, merchant)}
                    title="Edit Contact"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Badge className={getStatusColor(merchant.status)}>
                    {merchant.status}
                  </Badge>
                </div>
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
                  <p className="text-2xl font-bold text-orange-600">{Number(merchant.pending_invoices || 0)}</p>
                  <p className="text-xs text-slate-500">Invoices Pending</p>
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
                              <p className="font-medium">{branch.name || branch.trading_name}</p>
                              <p className="text-sm text-slate-500">{branch.address || "No address"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleBranchEditClick(e, branch)}
                              title="Edit KRA Configuration"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <div className="text-right">
                              <Badge variant="outline" className="font-mono">
                                BHF-ID: {branch.bhf_id || "Not set"}
                              </Badge>
                              <div className="mt-1">
                                <Badge className={getStatusColor(branch.status || 'active')}>
                                  {branch.status || 'active'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        {(branch.server_address || branch.device_token) && (
                          <div className="mt-3 pt-3 border-t text-xs text-slate-500 space-y-1">
                            {branch.server_address && (
                              <p>Server: {branch.server_address}:{branch.server_port || "8088"}</p>
                            )}
                            {branch.device_token && (
                              <p>Token: {branch.device_token.substring(0, 8)}...{branch.device_token.substring(branch.device_token.length - 4)}</p>
                            )}
                          </div>
                        )}
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Merchant Contact</DialogTitle>
            <DialogDescription>
              Update the contact information for this merchant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Merchant name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+254 xxx xxx xxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Business address"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={branchEditDialogOpen} onOpenChange={setBranchEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Branch KRA Configuration
            </DialogTitle>
            <DialogDescription>
              Update KRA TIMS settings for {editingBranch?.name || editingBranch?.trading_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="branch-bhf-id">Branch ID (BHF ID)</Label>
              <Input
                id="branch-bhf-id"
                value={branchEditForm.bhf_id}
                onChange={(e) => setBranchEditForm({ ...branchEditForm, bhf_id: e.target.value })}
                placeholder="00"
              />
              <p className="text-xs text-muted-foreground">
                KRA Branch ID (e.g., 00 for main branch)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-kra-pin">KRA PIN</Label>
              <Input
                id="branch-kra-pin"
                value={branchEditForm.kra_pin}
                onChange={(e) => setBranchEditForm({ ...branchEditForm, kra_pin: e.target.value })}
                placeholder="P000000000X"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-device-token">Device Token</Label>
              <Input
                id="branch-device-token"
                value={branchEditForm.device_token}
                onChange={(e) => setBranchEditForm({ ...branchEditForm, device_token: e.target.value })}
                placeholder="Enter device token"
              />
              <p className="text-xs text-muted-foreground">
                KRA VSCU device token for this branch
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch-server-address">Server Address</Label>
                <Input
                  id="branch-server-address"
                  value={branchEditForm.server_address}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, server_address: e.target.value })}
                  placeholder="5.189.171.160"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-server-port">Server Port</Label>
                <Input
                  id="branch-server-port"
                  value={branchEditForm.server_port}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, server_port: e.target.value })}
                  placeholder="8088"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch-device-serial">Device Serial Number</Label>
                <Input
                  id="branch-device-serial"
                  value={branchEditForm.device_serial_number}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, device_serial_number: e.target.value })}
                  placeholder="Device serial number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-sr-number">SR Number</Label>
                <Input
                  id="branch-sr-number"
                  value={branchEditForm.sr_number}
                  onChange={(e) => setBranchEditForm({ ...branchEditForm, sr_number: e.target.value })}
                  placeholder="SR number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-bulk-percentage">Bulk Sales KRA Transmission (%)</Label>
              <Input
                id="branch-bulk-percentage"
                type="number"
                min="0"
                max="100"
                value={branchEditForm.bulk_sales_kra_percentage}
                onChange={(e) => setBranchEditForm({ ...branchEditForm, bulk_sales_kra_percentage: e.target.value })}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of bulk sales to transmit to KRA (0-100). Default is 100%.
              </p>
            </div>
            <div className="flex justify-between items-center gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleInitializeBranch}
                disabled={initializingBranch}
                className="gap-2"
              >
                {initializingBranch ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Initialize
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBranchEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveBranchEdit}>
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
