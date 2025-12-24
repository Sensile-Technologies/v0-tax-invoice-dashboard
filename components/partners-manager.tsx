"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Partner {
  id: string
  vendor_id: string
  partner_type: "supplier" | "transporter"
  name: string
  tin: string | null
  physical_address: string | null
  contact_person: string | null
  phone: string | null
  status: string
  created_at: string
  updated_at: string
}

interface PartnersManagerProps {
  vendorId: string
  partnerType: "supplier" | "transporter"
  title: string
}

export function PartnersManager({ vendorId, partnerType, title }: PartnersManagerProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    tin: "",
    physical_address: "",
    contact_person: "",
    phone: "",
  })

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendors/partners?partner_type=${partnerType}`)
      const result = await response.json()
      if (result.success) {
        setPartners(result.data || [])
      } else if (result.error === "Unauthorized") {
        console.error("User not authenticated")
      }
    } catch (error) {
      console.error("Error fetching partners:", error)
    } finally {
      setLoading(false)
    }
  }, [partnerType])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const resetForm = () => {
    setFormData({
      name: "",
      tin: "",
      physical_address: "",
      contact_person: "",
      phone: "",
    })
    setSelectedPartner(null)
  }

  const handleOpenDialog = (partner?: Partner) => {
    if (partner) {
      setSelectedPartner(partner)
      setFormData({
        name: partner.name || "",
        tin: partner.tin || "",
        physical_address: partner.physical_address || "",
        contact_person: partner.contact_person || "",
        phone: partner.phone || "",
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Name is required")
      return
    }
    
    setIsSubmitting(true)
    try {
      const url = selectedPartner 
        ? `/api/vendors/partners/${selectedPartner.id}`
        : `/api/vendors/partners`
      
      const method = selectedPartner ? "PUT" : "POST"
      
      const body = selectedPartner
        ? formData
        : { ...formData, partner_type: partnerType }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      if (result.success) {
        await fetchPartners()
        setDialogOpen(false)
        resetForm()
      } else {
        alert(result.error || "Failed to save partner")
      }
    } catch (error) {
      console.error("Error saving partner:", error)
      alert("Failed to save partner")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPartner) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/vendors/partners/${selectedPartner.id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        await fetchPartners()
        setDeleteDialogOpen(false)
        setSelectedPartner(null)
      } else {
        alert(result.error || "Failed to delete partner")
      }
    } catch (error) {
      console.error("Error deleting partner:", error)
      alert("Failed to delete partner")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.tin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeLabel = partnerType === "supplier" ? "Supplier" : "Transporter"

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${partnerType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Add {typeLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? `No ${partnerType}s found matching "${searchQuery}"` : `No ${partnerType}s added yet`}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>TIN</TableHead>
                <TableHead>Physical Address</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partner.tin || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{partner.physical_address || "-"}</TableCell>
                  <TableCell>{partner.contact_person || "-"}</TableCell>
                  <TableCell>{partner.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(partner)}
                        className="rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPartner(partner)
                          setDeleteDialogOpen(true)
                        }}
                        className="rounded-lg text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPartner ? `Edit ${typeLabel}` : `Add New ${typeLabel}`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${partnerType} name`}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">TIN (Tax Identification Number)</Label>
              <Input
                id="tin"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                placeholder="Enter TIN"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physical_address">Physical Address</Label>
              <Input
                id="physical_address"
                value={formData.physical_address}
                onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                placeholder="Enter physical address"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Enter contact person name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedPartner ? "Update" : "Add"} {typeLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete {typeLabel}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedPartner?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
