"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function AddItemPage() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Card className="max-w-lg mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Items Are Now Managed at Headquarters</CardTitle>
              <CardDescription>
                To ensure consistent item codes across all branches, items are now created and managed at the headquarters level. Branches can then assign items and set their own pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                <p className="mb-2">As a branch user, you can:</p>
                <ul className="text-left list-disc list-inside space-y-1">
                  <li>View items available from the headquarters catalog</li>
                  <li>Assign items to your branch</li>
                  <li>Set custom sale and purchase prices for your branch</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/items")} className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Go to Items List
                </Button>
                <Button variant="outline" onClick={() => router.push("/headquarters/items")} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to HQ Item Catalog
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
