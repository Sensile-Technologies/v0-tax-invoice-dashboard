"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { Ticket, Plus, Search, Clock, User } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface SupportTicket {
  id: string
  ticket_number: string
  vendor_id: string
  vendor_name: string
  branch_name: string
  category_name: string
  category_color: string
  subject: string
  description: string
  status: string
  priority: string
  assigned_username: string
  created_by_username: string
  created_at: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [newTicket, setNewTicket] = useState({
    vendor_id: "",
    category_id: "",
    subject: "",
    description: "",
    priority: "medium"
  })

  useEffect(() => {
    fetchTickets()
    fetchVendors()
    fetchCategories()
  }, [statusFilter])

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/admin/tickets?${params}`)
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/admin/vendors")
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/db/ticket_categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.subject) {
      toast.error("Subject is required")
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTicket, created_by: user.id })
      })

      if (!response.ok) throw new Error("Failed to create ticket")

      toast.success("Ticket created successfully")
      setDialogOpen(false)
      setNewTicket({ vendor_id: "", category_id: "", subject: "", description: "", priority: "medium" })
      fetchTickets()
    } catch (error) {
      toast.error("Failed to create ticket")
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.ticket_number?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-slate-100 text-slate-800"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "secondary"
    }
  }

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
          <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-slate-600 mt-1">Manage support requests from vendors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Log a new support request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select
                  value={newTicket.vendor_id}
                  onValueChange={(v) => setNewTicket({ ...newTicket, vendor_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTicket.category_id}
                    onValueChange={(v) => setNewTicket({ ...newTicket, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Detailed description..."
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-slate-500">{ticket.ticket_number}</span>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                    <Badge variant={getPriorityColor(ticket.priority) as any}>
                      {ticket.priority}
                    </Badge>
                    {ticket.category_name && (
                      <Badge 
                        style={{ backgroundColor: ticket.category_color }}
                        className="text-white"
                      >
                        {ticket.category_name}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                  {ticket.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ticket.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.vendor_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")}
                    </span>
                    {ticket.assigned_username && (
                      <span>Assigned to: {ticket.assigned_username}</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No tickets found</p>
        </div>
      )}
    </div>
  )
}
