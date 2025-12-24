"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  CreditCard,
  Users,
  Box,
  Upload,
  UserCog,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  DollarSign,
  LineChart,
  Leaf,
  ChevronDown,
  X,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"

interface DashboardSidebarProps {
  collapsed: boolean
  onToggle: () => void
  isHeadquarters?: boolean
  transparent?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

type NavigationItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  hasDropdown?: boolean
}

const regularNavigationItems: NavigationItem[] = [
  { icon: ShoppingCart, label: "Sales", href: "/sales/summary", hasDropdown: true },
  { icon: ShoppingBag, label: "Purchases", href: "/purchases" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Users, label: "Customers", href: "/customers", hasDropdown: true },
  { icon: Box, label: "Items", href: "/items", hasDropdown: true },
  { icon: Upload, label: "Imports", href: "/imports", hasDropdown: true },
  { icon: UserCog, label: "Staff", href: "/staff" },
  { icon: FileText, label: "Reports", href: "/reports", hasDropdown: true },
  { icon: Settings, label: "Tax Service", href: "/configuration/tax-service" },
]

const headquartersNavigationItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/headquarters" },
  { icon: TrendingUp, label: "Performance", href: "/headquarters/performance" },
  { icon: BarChart3, label: "Analytics", href: "/headquarters/analytics" },
  { icon: DollarSign, label: "Financials", href: "/headquarters/financials" },
  { icon: LineChart, label: "Growth Metrics", href: "/headquarters/growth" },
  { icon: Users, label: "Organization", href: "/headquarters/organization" },
  { icon: FileText, label: "Executive Reports", href: "/headquarters/reports" },
]

export function DashboardSidebar({
  collapsed,
  onToggle,
  isHeadquarters = false,
  transparent = false,
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})
  const navigationItems = isHeadquarters ? headquartersNavigationItems : regularNavigationItems

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          "flex flex-col text-white transition-transform duration-300 ease-in-out min-h-screen",
          "bg-transparent",
          "fixed lg:relative top-0 left-0 h-full",
          "lg:translate-x-0 z-50",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-16" : "w-72 lg:w-64",
        )}
      >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Image src="/flow360-logo.png" alt="Flow360 Logo" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold">Flow360</span>
          </Link>
        )}
        {collapsed && (
          <Image src="/flow360-logo.png" alt="Flow360 Logo" width={32} height={32} className="rounded-lg mx-auto" />
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigationItems.map((item) => {
          if (item.hasDropdown && !collapsed) {
            return (
              <Collapsible
                key={item.href}
                open={openSections[item.label] || false}
                onOpenChange={() => toggleSection(item.label)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    "hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-md",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", openSections[item.label] && "rotate-180")}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 pt-1 space-y-1">
                  {item.label === "Sales" && (
                    <>
                      <Link
                        href="/sales/summary"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Sales Summary
                      </Link>
                      <Link
                        href="/sales/reports"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Sales Reports
                      </Link>
                      <Link
                        href="/sales/automated"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Automated Sales
                      </Link>
                    </>
                  )}
                  {item.label === "Customers" && (
                    <>
                      <Link
                        href="/register-customer"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Register Customer
                      </Link>
                      <Link
                        href="/customers"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Customer List
                      </Link>
                    </>
                  )}
                  {item.label === "Items" && (
                    <>
                      <Link
                        href="/add-item"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Add Item
                      </Link>
                      <Link
                        href="/items"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Items List
                      </Link>
                      <Link
                        href="/item-composition"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Item Composition
                      </Link>
                    </>
                  )}
                  {item.label === "Imports" && (
                    <>
                      <Link
                        href="/add-import"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Add Import
                      </Link>
                      <Link
                        href="/imports"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Import List
                      </Link>
                    </>
                  )}
                  {item.label === "Reports" && (
                    <div className="max-h-96 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      <Link href="/reports/daily-sales" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Daily Sales Report
                      </Link>
                      <Link href="/reports/shifts" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Shift Reports
                      </Link>
                      <Link href="/reports/x-report" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        X Report
                      </Link>
                      <Link href="/reports/z-report" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Z Report
                      </Link>
                      <Link href="/reports/sales-summary" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Sales Summary
                      </Link>
                      <Link href="/reports/purchase-report" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Purchase Report
                      </Link>
                      <Link href="/reports/inventory-valuation" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Inventory Valuation
                      </Link>
                      <Link href="/reports/profit-loss" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Profit & Loss
                      </Link>
                      <Link href="/reports/balance-sheet" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Balance Sheet
                      </Link>
                      <Link href="/reports/cash-flow" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Cash Flow
                      </Link>
                      <Link href="/reports/trial-balance" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Trial Balance
                      </Link>
                      <Link href="/reports/general-ledger" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        General Ledger
                      </Link>
                      <Link href="/reports/aged-receivables" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Aged Receivables
                      </Link>
                      <Link href="/reports/aged-payables" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Aged Payables
                      </Link>
                      <Link href="/reports/customer-statement" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Customer Statement
                      </Link>
                      <Link href="/reports/supplier-statement" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Supplier Statement
                      </Link>
                      <Link href="/reports/vat-report" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        VAT Report
                      </Link>
                      <Link href="/reports/excise-duty" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Excise Duty Report
                      </Link>
                      <Link href="/reports/withholding-tax" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Withholding Tax
                      </Link>
                      <Link href="/reports/expense-report" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20" onClick={handleLinkClick}>
                        Expense Report
                      </Link>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          if (
            (item.label === "Sales" ||
              item.label === "Customers" ||
              item.label === "Items" ||
              item.label === "Imports" ||
              item.label === "Reports") &&
            !collapsed
          ) {
            return null
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-md",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 pb-6">
        <Link
          href="/loyalty"
          className="flex items-center gap-3 px-3 py-2.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700/10">
            <Leaf className="h-5 w-5 text-green-700" />
          </div>
          {!collapsed && (
            <div className="text-green-700">
              <p className="text-sm font-semibold">Explore Tuzwa</p>
              <p className="text-xs opacity-80">Loyalty Rewards</p>
            </div>
          )}
        </Link>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute right-2 top-5 h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white hidden lg:flex"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {mobileOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="absolute right-2 top-5 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </aside>
    </>
  )
}

export default DashboardSidebar
