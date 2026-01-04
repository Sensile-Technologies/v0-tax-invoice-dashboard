"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Monitor, Loader2 } from "lucide-react"
import { useHQAccess } from "@/lib/hooks/use-hq-access"

export default function DeviceInventoryPage() {
  const { isChecking, hasAccess } = useHQAccess()

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }
  const devices = [
    {
      id: "DEV-001",
      name: "POS Terminal 1",
      type: "POS",
      branch: "Nairobi Branch",
      status: "Active",
      lastSync: "2024-01-15 14:30",
    },
    {
      id: "DEV-002",
      name: "POS Terminal 2",
      type: "POS",
      branch: "Nairobi Branch",
      status: "Active",
      lastSync: "2024-01-15 14:25",
    },
    {
      id: "DEV-003",
      name: "Tablet 1",
      type: "Tablet",
      branch: "Nairobi Branch",
      status: "Inactive",
      lastSync: "2024-01-14 18:45",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader currentBranch="hq" />

        <main className="relative flex-1 overflow-y-auto">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="ml-6 mr-6 mt-6 mb-6 rounded-tl-[2rem] bg-white shadow-2xl min-h-[calc(100vh-3rem)]">
              <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-balance">Device Inventory</h1>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      Manage all devices across your organization
                    </p>
                  </div>
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search devices..."
                      className="pl-9 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>All Devices</CardTitle>
                    <CardDescription>Overview of all registered devices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Sync</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                {device.name}
                              </div>
                            </TableCell>
                            <TableCell>{device.type}</TableCell>
                            <TableCell>{device.branch}</TableCell>
                            <TableCell>
                              <Badge variant={device.status === "Active" ? "default" : "secondary"}>
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{device.lastSync}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                  Powered by <span className="font-semibold">Sensile Technologies East Africa Ltd</span>
                </footer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
