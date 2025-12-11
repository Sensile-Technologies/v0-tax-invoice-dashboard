"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Plus, Search, Building2, User, Mail, Phone, 
  Calendar, DollarSign, Users, TrendingUp,
  MessageSquare, Presentation, FileSignature, UserCheck,
  ArrowRight, MoreVertical, Edit2, Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"

interface Lead {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  stage: string
  assigned_to: string
  assigned_to_name: string
  notes: string
  expected_value: number
  expected_close_date: string
  source: string
  created_at: string
  updated_at: string
}

interface SalesPerson {
  id: string
  name: string
  email: string
  phone: string
  is_active: boolean
  created_at: string
}

const STAGES = [
  { id: "contact", label: "Contact", icon: MessageSquare, color: "bg-slate-500" },
  { id: "negotiation", label: "Negotiation", icon: TrendingUp, color: "bg-blue-500" },
  { id: "demo", label: "Demo", icon: Presentation, color: "bg-purple-500" },
  { id: "contracting", label: "Contracting", icon: FileSignature, color: "bg-orange-500" },
  { id: "onboarding", label: "Onboarding", icon: UserCheck, color: "bg-green-500" },
]

const SOURCES = [
  "Website",
  "Referral",
  "Cold Call",
  "Trade Show",
  "LinkedIn",
  "Email Campaign",
  "Partner",
  "Other"
]

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("pipeline")
  const [leads, setLeads] = useState<Lead[]>([])
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)
  const [salesPersonDialogOpen, setSalesPersonDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [editingSalesPerson, setEditingSalesPerson] = useState<SalesPerson | null>(null)

  const [newLead, setNewLead] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    stage: "contact",
    assigned_to: "",
    notes: "",
    expected_value: "",
    expected_close_date: "",
    source: ""
  })

  const [newSalesPerson, setNewSalesPerson] = useState({
    name: "",
    email: "",
    phone: ""
  })

  useEffect(() => {
    fetchLeads()
    fetchSalesPeople()
  }, [stageFilter])

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (stageFilter !== "all") params.append("stage", stageFilter)
      
      const response = await fetch(`/api/admin/leads?${params}`)
      const data = await response.json()
      setLeads(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching leads:", error)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesPeople = async () => {
    try {
      const response = await fetch("/api/admin/sales-people")
      const data = await response.json()
      setSalesPeople(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching sales people:", error)
      setSalesPeople([])
    }
  }

  const handleCreateLead = async () => {
    if (!newLead.company_name) {
      toast.error("Please enter a company name")
      return
    }

    try {
      const response = await fetch("/api/admin/leads", {
        method: editingLead ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLead ? { ...newLead, id: editingLead.id } : newLead)
      })

      if (!response.ok) throw new Error("Failed to save lead")

      toast.success(editingLead ? "Lead updated successfully" : "Lead created successfully")
      setLeadDialogOpen(false)
      resetLeadForm()
      fetchLeads()
    } catch (error) {
      toast.error("Failed to save lead")
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      const response = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete lead")
      toast.success("Lead deleted")
      fetchLeads()
    } catch (error) {
      toast.error("Failed to delete lead")
    }
  }

  const handleUpdateStage = async (lead: Lead, newStage: string) => {
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, stage: newStage })
      })

      if (!response.ok) throw new Error("Failed to update stage")
      toast.success(`Moved to ${STAGES.find(s => s.id === newStage)?.label}`)
      fetchLeads()
    } catch (error) {
      toast.error("Failed to update stage")
    }
  }

  const handleCreateSalesPerson = async () => {
    if (!newSalesPerson.name) {
      toast.error("Please enter a name")
      return
    }

    try {
      const response = await fetch("/api/admin/sales-people", {
        method: editingSalesPerson ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSalesPerson ? { ...newSalesPerson, id: editingSalesPerson.id, is_active: true } : newSalesPerson)
      })

      if (!response.ok) throw new Error("Failed to save sales person")

      toast.success(editingSalesPerson ? "Sales person updated" : "Sales person added")
      setSalesPersonDialogOpen(false)
      resetSalesPersonForm()
      fetchSalesPeople()
    } catch (error) {
      toast.error("Failed to save sales person")
    }
  }

  const resetLeadForm = () => {
    setNewLead({
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      stage: "contact",
      assigned_to: "",
      notes: "",
      expected_value: "",
      expected_close_date: "",
      source: ""
    })
    setEditingLead(null)
  }

  const resetSalesPersonForm = () => {
    setNewSalesPerson({ name: "", email: "", phone: "" })
    setEditingSalesPerson(null)
  }

  const openEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setNewLead({
      company_name: lead.company_name,
      contact_name: lead.contact_name || "",
      contact_email: lead.contact_email || "",
      contact_phone: lead.contact_phone || "",
      stage: lead.stage,
      assigned_to: lead.assigned_to || "",
      notes: lead.notes || "",
      expected_value: lead.expected_value?.toString() || "",
      expected_close_date: lead.expected_close_date || "",
      source: lead.source || ""
    })
    setLeadDialogOpen(true)
  }

  const openEditSalesPerson = (person: SalesPerson) => {
    setEditingSalesPerson(person)
    setNewSalesPerson({
      name: person.name,
      email: person.email || "",
      phone: person.phone || ""
    })
    setSalesPersonDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStageColor = (stage: string) => {
    return STAGES.find(s => s.id === stage)?.color || "bg-slate-500"
  }

  const filteredLeads = leads.filter(lead =>
    lead.company_name.toLowerCase().includes(search.toLowerCase()) ||
    lead.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.contact_email?.toLowerCase().includes(search.toLowerCase())
  )

  const getLeadsByStage = (stage: string) => filteredLeads.filter(l => l.stage === stage)

  const totalPipelineValue = leads.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0)

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
          <h1 className="text-2xl font-bold text-slate-900">Sales Management</h1>
          <p className="text-slate-500">Track leads through your sales pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">In Contracting</p>
                <p className="text-2xl font-bold">{getLeadsByStage("contracting").length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileSignature className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Sales Team</p>
                <p className="text-2xl font-bold">{salesPeople.filter(s => s.is_active).length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="leads">All Leads</TabsTrigger>
          <TabsTrigger value="team">Sales Team</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={leadDialogOpen} onOpenChange={(open) => {
              setLeadDialogOpen(open)
              if (!open) resetLeadForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                  <DialogDescription>Enter the lead details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        value={newLead.company_name}
                        onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        value={newLead.contact_name}
                        onChange={(e) => setNewLead({ ...newLead, contact_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newLead.contact_email}
                        onChange={(e) => setNewLead({ ...newLead, contact_email: e.target.value })}
                        placeholder="john@acme.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={newLead.contact_phone}
                        onChange={(e) => setNewLead({ ...newLead, contact_phone: e.target.value })}
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stage</Label>
                      <Select
                        value={newLead.stage}
                        onValueChange={(v) => setNewLead({ ...newLead, stage: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assigned To</Label>
                      <Select
                        value={newLead.assigned_to}
                        onValueChange={(v) => setNewLead({ ...newLead, assigned_to: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sales person" />
                        </SelectTrigger>
                        <SelectContent>
                          {salesPeople.filter(s => s.is_active).map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Expected Value (KES)</Label>
                      <Input
                        type="number"
                        value={newLead.expected_value}
                        onChange={(e) => setNewLead({ ...newLead, expected_value: e.target.value })}
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Close Date</Label>
                      <Input
                        type="date"
                        value={newLead.expected_close_date}
                        onChange={(e) => setNewLead({ ...newLead, expected_close_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Select
                        value={newLead.source}
                        onValueChange={(v) => setNewLead({ ...newLead, source: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      placeholder="Additional notes about this lead..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateLead} className="w-full">
                    {editingLead ? "Update Lead" : "Create Lead"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-5 gap-4 overflow-x-auto">
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id)
              const StageIcon = stage.icon
              return (
                <div key={stage.id} className="min-w-[280px]">
                  <div className={`${stage.color} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <StageIcon className="h-4 w-4" />
                      <span className="font-medium">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-b-lg min-h-[400px] space-y-2">
                    {stageLeads.map((lead) => (
                      <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{lead.company_name}</h4>
                              {lead.contact_name && (
                                <p className="text-xs text-slate-500">{lead.contact_name}</p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditLead(lead)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {STAGES.filter(s => s.id !== lead.stage).map((s) => (
                                  <DropdownMenuItem 
                                    key={s.id} 
                                    onClick={() => handleUpdateStage(lead, s.id)}
                                  >
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Move to {s.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {Number(lead.expected_value) > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-2">
                              {formatCurrency(Number(lead.expected_value))}
                            </p>
                          )}
                          {lead.assigned_to_name && (
                            <div className="flex items-center gap-1 mt-2">
                              <User className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{lead.assigned_to_name}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{lead.company_name}</h3>
                          <Badge className={`${getStageColor(lead.stage)} text-white`}>
                            {STAGES.find(s => s.id === lead.stage)?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          {lead.contact_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {lead.contact_name}
                            </span>
                          )}
                          {lead.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.contact_email}
                            </span>
                          )}
                          {lead.assigned_to_name && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Users className="h-3 w-3" />
                              {lead.assigned_to_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {Number(lead.expected_value) > 0 && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(Number(lead.expected_value))}
                          </p>
                          {lead.expected_close_date && (
                            <p className="text-xs text-slate-500">
                              Close: {format(new Date(lead.expected_close_date), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditLead(lead)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No leads found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Sales Team</h2>
            <Dialog open={salesPersonDialogOpen} onOpenChange={(open) => {
              setSalesPersonDialogOpen(open)
              if (!open) resetSalesPersonForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sales Person
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSalesPerson ? "Edit Sales Person" : "Add Sales Person"}</DialogTitle>
                  <DialogDescription>Enter the sales team member details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newSalesPerson.name}
                      onChange={(e) => setNewSalesPerson({ ...newSalesPerson, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newSalesPerson.email}
                      onChange={(e) => setNewSalesPerson({ ...newSalesPerson, email: e.target.value })}
                      placeholder="john@flow360.co.ke"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newSalesPerson.phone}
                      onChange={(e) => setNewSalesPerson({ ...newSalesPerson, phone: e.target.value })}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <Button onClick={handleCreateSalesPerson} className="w-full">
                    {editingSalesPerson ? "Update" : "Add Sales Person"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesPeople.map((person) => {
              const assignedLeads = leads.filter(l => l.assigned_to === person.id)
              const totalValue = assignedLeads.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0)
              
              return (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{person.name}</h3>
                          <Badge variant={person.is_active ? "default" : "secondary"}>
                            {person.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openEditSalesPerson(person)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {person.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          {person.email}
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4" />
                          {person.phone}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Leads</p>
                        <p className="text-lg font-bold">{assignedLeads.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pipeline Value</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(totalValue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {salesPeople.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No sales team members added yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
