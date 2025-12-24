"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { PartnersManager } from "@/components/partners-manager"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TransportersPage() {
  const [vendorId, setVendorId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const currentUser = getCurrentUser()
        if (currentUser?.id) {
          const response = await fetch(`/api/vendors/current?user_id=${currentUser.id}`)
          const result = await response.json()
          if (result.success && result.vendor_id) {
            setVendorId(result.vendor_id)
          }
        }
      } catch (error) {
        console.error("Error fetching vendor ID:", error)
      } finally {
        setLoading(false)
      }
    }
    
    // Small delay to ensure localStorage is available after hydration
    const timer = setTimeout(fetchVendorId, 100)
    return () => clearTimeout(timer)
  }, [])

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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : vendorId ? (
          <PartnersManager vendorId={vendorId} partnerType="transporter" title="Transporters" />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Unable to load vendor information. Please try again.
          </div>
        )}
      </main>
    </div>
  )
}
