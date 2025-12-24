"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { PartnersManager } from "@/components/partners-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TransportersPage() {
  const router = useRouter()

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
          <h1 className="text-3xl font-bold tracking-tight">Transporter Management</h1>
          <p className="mt-1 text-muted-foreground">Manage your organization's transporters</p>
        </div>

        <PartnersManager vendorId="" partnerType="transporter" title="Transporters" />
      </main>
    </div>
  )
}
