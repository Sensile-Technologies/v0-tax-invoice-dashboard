"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const reportTabs = [
  { id: "daily-sales", label: "Daily Sales", href: "/reports/daily-sales" },
  { id: "shifts", label: "Shifts", href: "/reports/shifts" },
  { id: "x-report", label: "X Report", href: "/reports/x-report" },
  { id: "z-report", label: "Z Report", href: "/reports/z-report" },
  { id: "sales-summary", label: "Sales Summary", href: "/reports/sales-summary" },
  { id: "nozzle-sales", label: "Nozzle Sales", href: "/reports/nozzle-sales" },
  { id: "purchase-report", label: "Purchase", href: "/reports/purchase-report" },
  { id: "inventory-valuation", label: "Inventory", href: "/reports/inventory-valuation" },
  { id: "profit-loss", label: "Profit & Loss", href: "/reports/profit-loss" },
  { id: "balance-sheet", label: "Balance Sheet", href: "/reports/balance-sheet" },
  { id: "cash-flow", label: "Cash Flow", href: "/reports/cash-flow" },
  { id: "trial-balance", label: "Trial Balance", href: "/reports/trial-balance" },
  { id: "general-ledger", label: "General Ledger", href: "/reports/general-ledger" },
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
