"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { HqItemsManager } from "@/components/hq-items-manager"
import { HqItemComposition } from "@/components/hq-item-composition"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, Layers } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HqItemsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("catalog")

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader currentBranch="hq" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/headquarters")}
            className="rounded-xl mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Headquarters
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Item Management</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage items centrally. Items created here will be available for all branches to use with their own pricing.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Item Catalog
            </TabsTrigger>
            <TabsTrigger value="composition" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Item Composition
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <HqItemsManager />
          </TabsContent>

          <TabsContent value="composition">
            <HqItemComposition />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
