"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  ClipboardList, 
  CheckCircle2, 
  XCircle,
  Eye,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/auth/client"

interface PurchaseOrder {
  id: string
  po_number: string
  branch_id: string
  branch_name: string
  supplier_id: string
  supplier_name: string
  transporter_name: string
  status: string
  approval_status: string
  expected_delivery: string
  notes: string
  transport_cost: number
  vehicle_registration: string
  driver_name: string
  driver_phone: string
  item_count: number
  total_amount: number
  issued_at: string
  created_by_name: string
  approved_by_name: string
  rejection_comments: string
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [rejectionComments, setRejectionComments] = useState("")

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/headquarters/purchase-orders")
      const result = await response.json()
      if (result.success) {
        setOrders(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserRole = useCallback(() => {
    try {
      const user = getCurrentUser()
      if (user?.role) {
        setUserRole(user.role.toLowerCase())
      }
    } catch (error) {
      console.error("Error getting user role:", error)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchUserRole()
  }, [fetchOrders, fetchUserRole])

  const canApprove = ['manager', 'director', 'admin', 'owner'].includes(userRole)

  const handleApprove = async (orderId: string) => {
    try {
      setProcessingId(orderId)
      const response = await fetch(`/api/headquarters/purchase-orders/${orderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'approve' })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message || "Purchase order approved")
        fetchOrders()
      } else {
        toast.error(result.error || "Failed to approve")
      }
    } catch (error) {
      console.error("Error approving:", error)
      toast.error("Failed to approve purchase order")
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectDialog = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setRejectionComments("")
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedOrder) return
    if (!rejectionComments.trim()) {
      toast.error("Please provide rejection comments")
      return
    }

    try {
      setProcessingId(selectedOrder.id)
      const response = await fetch(`/api/headquarters/purchase-orders/${selectedOrder.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: 'reject',
          rejection_comments: rejectionComments.trim()
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message || "Purchase order rejected")
        setRejectDialogOpen(false)
        fetchOrders()
      } else {
        toast.error(result.error || "Failed to reject")
      }
    } catch (error) {
      console.error("Error rejecting:", error)
      toast.error("Failed to reject purchase order")
    } finally {
      setProcessingId(null)
    }
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Pending Approval</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>
      default:
        return <Badge variant="outline">{status || 'Draft'}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending Delivery</Badge>
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Accepted</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Completed</Badge>
      default:
        return <Badge variant="outline">{status || '-'}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader currentBranch="hq" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/headquarters")}
              className="rounded-xl mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Headquarters
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <ClipboardList className="h-8 w-8" />
              Purchase Orders
            </h1>
            <p className="mt-1 text-muted-foreground">Create and manage purchase orders for branches</p>
          </div>
          <Button 
            className="rounded-xl" 
            onClick={() => router.push("/headquarters/purchase-orders/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No purchase orders yet</p>
                <p>Create your first purchase order to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.po_number}</TableCell>
                        <TableCell>{order.branch_name || "-"}</TableCell>
                        <TableCell>
                          <div>
                            <div>{order.supplier_name || "-"}</div>
                            {order.transporter_name && (
                              <div className="text-xs text-muted-foreground">
                                Transport: {order.transporter_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{order.item_count} items</TableCell>
                        <TableCell>
                          <div>
                            <div>{formatCurrency(parseFloat(String(order.total_amount)) || 0)}</div>
                            {parseFloat(String(order.transport_cost)) > 0 && (
                              <div className="text-xs text-muted-foreground">
                                +{formatCurrency(parseFloat(String(order.transport_cost)))} transport
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {getApprovalStatusBadge(order.approval_status)}
                            {order.approved_by_name && (
                              <div className="text-xs text-muted-foreground mt-1">
                                by {order.approved_by_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatDate(order.expected_delivery)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canApprove && order.approval_status === 'pending_approval' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(order.id)}
                                    disabled={processingId === order.id}
                                    className="text-green-600 focus:text-green-600"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openRejectDialog(order)}
                                    disabled={processingId === order.id}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {order.approval_status === 'rejected' && order.rejection_comments && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setRejectionComments(order.rejection_comments)
                                    setRejectDialogOpen(true)
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  View Rejection Reason
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedOrder?.po_number}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionComments}
              onChange={(e) => setRejectionComments(e.target.value)}
              placeholder="Enter rejection reason..."
              className="rounded-xl"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processingId !== null}
              className="rounded-xl"
            >
              {processingId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
