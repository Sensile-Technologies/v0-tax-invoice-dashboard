"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/client"

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      if (user.role === "admin") {
        router.replace("/admin")
      } else if (user.role === "sales") {
        router.replace("/admin/sales")
      } else {
        // Directors and vendors go to HQ, branch staff go to branch UI
        const role = (user.role || '').toLowerCase()
        if (role === 'director' || role === 'vendor') {
          router.replace("/headquarters")
        } else {
          router.replace("/sales/summary")
        }
      }
    } else {
      router.replace("/auth/login")
    }
    setChecking(false)
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return null
}
