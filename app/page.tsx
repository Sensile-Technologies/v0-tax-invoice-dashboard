"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Mail, Phone, Hash, FileText, Map, Landmark, Users } from "lucide-react"

export default function BranchDetails() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [branchDetails, setBranchDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchBranchDetails = async () => {
      const branchParam = searchParams.get("branch")

      if (!branchParam) {
        setLoading(false)
        return
      }

      try {
        const branchName = branchParam.split("-").join(" ")
        const response = await fetch(`/api/branches/list?name=${encodeURIComponent(branchName)}`)

        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setBranchDetails(data[0])
          }
        }
      } catch (error) {
        console.error("Error fetching branch details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBranchDetails()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-center text-muted-foreground">Loading branch details...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!branchDetails) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-center text-muted-foreground">
                No branch selected. Please select a branch from headquarters.
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Branch Details</h1>
              <p className="mt-2 text-muted-foreground">View comprehensive information about this branch</p>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Branch Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Branch Name</span>
                  </div>
                  <p className="text-base font-semibold">{branchDetails.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-base font-semibold">{branchDetails.location}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">BHF ID</span>
                  </div>
                  <p className="text-base font-semibold">{branchDetails.bhf_id || "N/A"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-base font-semibold capitalize">{branchDetails.status}</p>
                </div>

                {branchDetails.address && (
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Map className="h-4 w-4" />
                      <span className="font-medium">Physical Address</span>
                    </div>
                    <p className="text-base font-semibold">{branchDetails.address}</p>
                  </div>
                )}

                {branchDetails.county && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Map className="h-4 w-4" />
                      <span className="font-medium">County</span>
                    </div>
                    <p className="text-base font-semibold">{branchDetails.county}</p>
                  </div>
                )}

                {branchDetails.local_tax_office && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Landmark className="h-4 w-4" />
                      <span className="font-medium">Local Tax Office</span>
                    </div>
                    <p className="text-base font-semibold">{branchDetails.local_tax_office}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Staff Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {branchDetails.manager && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Branch Manager</span>
                    </div>
                    <p className="text-base font-semibold">{branchDetails.manager}</p>
                  </div>
                )}

                {branchDetails.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-base font-semibold">{branchDetails.email}</p>
                  </div>
                )}

                {branchDetails.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-base font-semibold">{branchDetails.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <footer className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
              Powered by <span className="font-semibold text-foreground">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
