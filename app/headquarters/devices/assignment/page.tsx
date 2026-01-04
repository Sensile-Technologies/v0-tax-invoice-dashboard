"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2 } from "lucide-react"
import { useHQAccess } from "@/lib/hooks/use-hq-access"

export default function DeviceAssignmentPage() {
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
                    <h1 className="text-2xl font-bold tracking-tight text-balance">Device Assignment</h1>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      Assign devices to branches and staff members
                    </p>
                  </div>
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search assignments..."
                      className="pl-9 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Assign Device</CardTitle>
                    <CardDescription>Link a device to a branch and staff member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="device">Select Device *</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Choose a device" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dev1">POS Terminal 1 (DEV-001)</SelectItem>
                              <SelectItem value="dev2">POS Terminal 2 (DEV-002)</SelectItem>
                              <SelectItem value="dev3">Tablet 1 (DEV-003)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="branch">Assign to Branch *</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Choose a branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nairobi">Nairobi Branch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="staff">Assign to Staff Member (Optional)</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Choose a staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff1">John Mwangi (Director)</SelectItem>
                            <SelectItem value="staff2">James Kamau (Director)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" className="rounded-xl bg-transparent">
                          Cancel
                        </Button>
                        <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">
                          Assign Device
                        </Button>
                      </div>
                    </form>
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
