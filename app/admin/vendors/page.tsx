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
import { Building2, Plus, Search, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"

interface Vendor {
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

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    subscription_plan: "basic"
  })

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/admin/vendors")
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVendor = async () => {
    if (!newVendor.name || !newVendor.email) {
      toast.error("Name and email are required")
      return
    }

    try {
      const response = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVendor)
      })

      if (!response.ok) throw new Error("Failed to create vendor")

      toast.success("Vendor created successfully")
      setDialogOpen(false)
      setNewVendor({ name: "", email: "", phone: "", address: "", subscription_plan: "basic" })
      fetchVendors()
    } catch (error) {
      toast.error("Failed to create vendor")
    }
  }

  const filteredVendors = vendors.filter(v => 
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-1">Manage all vendors on the platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>Create a new vendor account on the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Acme Fuel Stations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  placeholder="contact@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  placeholder="123 Main Street, Nairobi"
                />
              </div>
              <Button onClick={handleCreateVendor} className="w-full">
                Create Vendor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <CardDescription>{vendor.email}</CardDescription>
                  </div>
                </div>
                <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                  {vendor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  {vendor.phone}
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {vendor.address}
                </div>
              )}
              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-slate-900">{Number(vendor.branch_count)}</p>
                  <p className="text-xs text-slate-500">Branches</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-orange-600">{Number(vendor.open_tickets)}</p>
                  <p className="text-xs text-slate-500">Open Tickets</p>
                </div>
                <div className="text-center flex-1">
                  <Badge variant="outline" className="text-xs">
                    {vendor.subscription_plan}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No vendors found</p>
        </div>
      )}
    </div>
  )
}
