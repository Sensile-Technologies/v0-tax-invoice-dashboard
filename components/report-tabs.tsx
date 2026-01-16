"use client"

import { usePathname, useRouter } from "next/navigation"
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

export function ReportTabs() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b border-slate-200 overflow-x-auto">
      {reportTabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
