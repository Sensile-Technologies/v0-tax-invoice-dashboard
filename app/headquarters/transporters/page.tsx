"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { PartnersManager } from "@/components/partners-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useHQAccess } from "@/lib/hooks/use-hq-access"

export default function TransportersPage() {
  const { isChecking, hasAccess } = useHQAccess()
  const router = useRouter()

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
