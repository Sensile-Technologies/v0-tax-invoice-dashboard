"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function DeviceInitializationPage() {
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
                    <h1 className="text-2xl font-bold tracking-tight text-balance">Device Initialization</h1>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      Initialize new devices with tax authority credentials
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
                    <CardTitle>Initialize New Device</CardTitle>
                    <CardDescription>Enter device details for tax authority registration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="pin">Tax Authority PIN/TIN *</Label>
                          <Input id="pin" placeholder="Enter PIN/TIN" className="rounded-xl" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trading-name">Trading Name *</Label>
                          <Input id="trading-name" placeholder="Enter trading name" className="rounded-xl" required />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" className="rounded-xl bg-transparent">
                          Cancel
                        </Button>
                        <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">
                          Initialize Device
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
