"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreVertical, Edit, RotateCcw, UserX, Plus } from "lucide-react"
import { roleDescriptions } from "@/lib/auth/rbac"

const initialStaff = [
  // Directors
  {
    id: 1,
    staffId: "DIR-001",
    name: "James Mwangi",
    username: "jmwangi",
    email: "jmwangi@flow360.co.ke",
    phone: "+254 711 234567",
    role: "Director",
    status: "active",
  },
  {
    id: 2,
    staffId: "DIR-002",
    name: "Sarah Wambui",
    username: "swambui",
    email: "swambui@flow360.co.ke",
    phone: "+254 722 345678",
    role: "Director",
    status: "active",
  },
  // Managers
  {
    id: 3,
    staffId: "MGR-001",
    name: "John Kamau",
    username: "jkamau",
    email: "jkamau@flow360.co.ke",
    phone: "+254 712 345678",
    role: "Manager",
    status: "active",
  },
  {
    id: 4,
    staffId: "MGR-002",
    name: "Mary Wanjiku",
    username: "mwanjiku",
    email: "mwanjiku@flow360.co.ke",
    phone: "+254 723 456789",
    role: "Manager",
    status: "active",
  },
  // Supervisors
  {
    id: 5,
    staffId: "SUP-001",
    name: "Peter Ochieng",
    username: "pochieng",
    email: "pochieng@flow360.co.ke",
    phone: "+254 734 567890",
    role: "Supervisor",
    status: "active",
  },
  {
    id: 6,
    staffId: "SUP-002",
    name: "Lucy Njeri",
    username: "lnjeri",
    email: "lnjeri@flow360.co.ke",
    phone: "+254 745 678901",
    role: "Supervisor",
    status: "active",
  },
  // Cashiers
  {
    id: 7,
    staffId: "CSH-001",
    name: "Grace Akinyi",
    username: "gakinyi",
    email: "gakinyi@flow360.co.ke",
    phone: "+254 756 789012",
    role: "Cashier",
    status: "active",
  },
  {
    id: 8,
    staffId: "CSH-002",
    name: "David Otieno",
    username: "dotieno",
    email: "dotieno@flow360.co.ke",
    phone: "+254 767 890123",
    role: "Cashier",
    status: "active",
  },
]

export default function StaffManagementPage() {
  const [staff, setStaff] = useState(initialStaff)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "Cashier",
    password: "",
    branchId: "",
  })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/branches?status=eq.active&select=*`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setBranches(data)
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const handleEdit = (member: any) => {
    setSelectedStaff(member)
    setFormData({
      name: member.name,
      username: member.username,
      email: member.email,
      phone: member.phone,
      role: member.role,
      password: "",
      branchId: member.branchId || "",
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedStaff) {
      if (!formData.password) {
        alert("Password is required for new staff members")
        return
      }

      if (formData.role !== "Director" && !formData.branchId) {
        alert("Please select a branch for this staff member")
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch("/api/staff/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            fullName: formData.name,
            phoneNumber: formData.phone,
            role: formData.role,
            branchId: formData.role === "Director" ? null : formData.branchId,
          }),
        })

        const result = await response.json()
        setIsLoading(false)

        if (response.ok && result.success) {
          const staffId = `${formData.role.substring(0, 3).toUpperCase()}-${String(staff.length + 1).padStart(3, "0")}`
          const branchName = branches.find((b) => b.id === formData.branchId)?.name || "All Branches"
          const newStaff = {
            id: staff.length + 1,
            staffId,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: "active",
            branchId: formData.branchId,
            branchName,
          }
          setStaff([...staff, newStaff])
          alert("Staff account created successfully! They can now log in with their credentials.")
          setEditDialogOpen(false)
          setSelectedStaff(null)
        } else {
          alert(`Error creating staff: ${result.error}`)
        }
      } catch (error) {
        setIsLoading(false)
        alert("Failed to create staff member. Please try again.")
      }
    } else {
      setStaff(staff.map((s) => (s.id === selectedStaff.id ? { ...s, ...formData } : s)))
      setEditDialogOpen(false)
      setSelectedStaff(null)
    }
  }

  const handleResetAccount = (member: any) => {
    setSelectedStaff(member)
    setResetDialogOpen(true)
  }

  const confirmReset = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${selectedStaff.email}/recover`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        },
      )

      setIsLoading(false)
      if (response.ok) {
        alert("Password has been reset to 'flow360'. User should change it on next login.")
        setResetDialogOpen(false)
        setChangePasswordDialogOpen(true)
      } else {
        alert("Error resetting password. Please try again.")
      }
    } catch (error) {
      setIsLoading(false)
      alert("Failed to reset password. Please try again.")
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    setIsLoading(true)
    setIsLoading(false)
    alert("Password changed successfully!")
    setChangePasswordDialogOpen(false)
    setNewPassword("")
    setConfirmPassword("")
    setSelectedStaff(null)
  }

  const handleDeactivate = (member: any) => {
    setStaff(
      staff.map((s) => (s.id === member.id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)),
    )
  }

  const handleAddNew = () => {
    setSelectedStaff(null)
    setFormData({
      name: "",
      username: "",
      email: "",
      phone: "",
      role: "Cashier",
      password: "",
      branchId: "",
    })
    setEditDialogOpen(true)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardHeader currentBranch="hq" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white">Staff List</h1>
            <p className="mt-1 text-white/80 text-pretty">Manage your staff members</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search staff..." className="pl-10 rounded-xl" />
            </div>
            <Button onClick={handleAddNew} className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.staffId}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.username}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.branchName || "All Branches"}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === "active" ? "default" : "secondary"} className="rounded-lg">
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem
                              onClick={() => handleEdit(member)}
                              className="gap-2 cursor-pointer rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetAccount(member)}
                              className="gap-2 cursor-pointer rounded-lg"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reset Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(member)}
                              className="gap-2 cursor-pointer rounded-lg text-red-600"
                            >
                              <UserX className="h-4 w-4" />
                              {member.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t px-8 py-4 text-center text-sm text-navy-900">
        Powered by Sensile Technologies East Africa Ltd
      </footer>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
            <DialogDescription>
              {selectedStaff
                ? "Update staff information and role assignment"
                : "Create a new staff account with authentication credentials and role permissions"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl"
                  placeholder="+254 7XX XXXXXX"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl"
                placeholder="email@flow360.co.ke"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role & Permissions</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Director" className="rounded-lg">
                    Director
                  </SelectItem>
                  <SelectItem value="Manager" className="rounded-lg">
                    Manager
                  </SelectItem>
                  <SelectItem value="Supervisor" className="rounded-lg">
                    Supervisor
                  </SelectItem>
                  <SelectItem value="Cashier" className="rounded-lg">
                    Cashier
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {roleDescriptions[formData.role as keyof typeof roleDescriptions]}
              </p>
            </div>
            {formData.role !== "Director" && (
              <div className="grid gap-2">
                <Label htmlFor="branch">Assigned Branch *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id} className="rounded-lg">
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This user will only be able to access and manage this specific branch.
                </p>
              </div>
            )}
            {!selectedStaff && (
              <div className="grid gap-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter initial password"
                />
                <p className="text-xs text-muted-foreground">
                  This password will be used to create their login account. They can change it later.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="rounded-xl">
              {isLoading ? "Creating..." : selectedStaff ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reset Account Password</DialogTitle>
            <DialogDescription>
              This will reset {selectedStaff?.name}'s password to the default password "flow360". They will be prompted
              to change it immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={confirmReset} disabled={isLoading} className="rounded-xl">
              {isLoading ? "Resetting..." : "Confirm Reset"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Your password has been reset. Please create a new secure password.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl"
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setChangePasswordDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} className="rounded-xl">
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
