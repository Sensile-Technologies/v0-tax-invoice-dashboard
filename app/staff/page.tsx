"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"

export default function BranchStaffPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [branchStaff, setBranchStaff] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBranchStaff = async () => {
      try {
        const selectedBranch = localStorage.getItem("selectedBranch")
        if (!selectedBranch) {
          setIsLoading(false)
          return
        }
        
        const branch = JSON.parse(selectedBranch)
        const response = await fetch(`/api/staff/list?branch_id=${branch.id}`)
        
        if (response.ok) {
          const data = await response.json()
          const staffList = (data.staff || data || []).map((s: any, index: number) => ({
            id: s.id,
            staffId: s.staff_id || `STF-${String(index + 1).padStart(3, "0")}`,
            name: s.full_name || s.name || "",
            username: s.username || s.email?.split("@")[0] || "",
            email: s.email || "",
            phone: s.phone_number || s.phone || "",
            role: s.role || "Cashier",
            status: s.status || "active",
            branch: s.branch_name || "Branch",
          }))
          setBranchStaff(staffList)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching branch staff:", error)
        setIsLoading(false)
      }
    }

    fetchBranchStaff()
  }, [])

  const filteredStaff = branchStaff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col ml-8 my-6 mr-6">
        <div className="bg-white rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Branch Staff</h1>
                <p className="mt-1 text-muted-foreground text-pretty">View staff members assigned to this branch</p>
              </div>
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading staff members...</p>
                    </div>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No staff members found</p>
                    </div>
                  </div>
                ) : (
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
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStaff.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.staffId}</TableCell>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.username}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-lg">
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={member.status === "active" ? "default" : "secondary"}
                                className="rounded-lg"
                              >
                                {member.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To add, edit, or manage staff assignments, please visit the{" "}
                <a href="/headquarters" className="underline font-semibold hover:text-blue-900">
                  Headquarters
                </a>{" "}
                page and access the Users Management section.
              </p>
            </div>
          </main>

          <footer className="border-t px-8 py-4 text-center text-sm text-navy-900">
            Powered by Sensile Technologies East Africa Ltd
          </footer>
        </div>
      </div>
    </div>
  )
}
