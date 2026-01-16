"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const reportTabs = [
  { id: "daily-sales", label: "DSSR", href: "/reports/daily-sales" },
  { id: "shifts", label: "Shifts", href: "/reports/shifts" },
  { id: "x-report", label: "X/Z Report", href: "/reports/x-report" },
  { id: "profit-loss", label: "Profit & Loss", href: "/reports/profit-loss" },
  { id: "balance-sheet", label: "Balance Sheet", href: "/reports/balance-sheet" },
  { id: "cash-flow", label: "Cash Flow", href: "/reports/cash-flow" },
  { id: "customer-statement", label: "Customer Statement", href: "/reports/customer-statement" },
  { id: "vat-report", label: "VAT Report", href: "/reports/vat-report" },
  { id: "expense-report", label: "Expenses", href: "/reports/expense-report" },
]

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    router.push("/reports/daily-sales")
  }, [router])

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-8 my-0 lg:my-6 mr-0 lg:mr-6 relative z-10">
        <div className="bg-white lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-600">Select a report to view</p>
              </div>

              <div className="flex flex-wrap gap-2 pb-4 border-b">
                {reportTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.href)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Card>
                <CardContent className="p-8 text-center text-slate-500">
                  <p>Redirecting to DSSR...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
