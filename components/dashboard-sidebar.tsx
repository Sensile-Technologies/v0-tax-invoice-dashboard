"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import React, { useState, useEffect } from "react"
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

interface VendorTheme {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  companyName: string
}

const defaultTheme: VendorTheme = {
  logoUrl: '/flow360-logo.png',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  companyName: 'Flow360',
}

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
  { icon: CreditCard, label: "Accounting", href: "/accounting", hasDropdown: true },
  { icon: Users, label: "Customers", href: "/customers", hasDropdown: true },
  { icon: Box, label: "Items", href: "/items", hasDropdown: true },
  { icon: Upload, label: "Imports", href: "/imports", hasDropdown: true },
  { icon: UserCog, label: "Staff", href: "/staff" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Tax Service", href: "/configuration/tax-service" },
]

const headOfficeNavigationItems: NavigationItem[] = [
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
  const [theme, setTheme] = useState<VendorTheme>(defaultTheme)
  const navigationItems = isHeadquarters ? headOfficeNavigationItems : regularNavigationItems

  useEffect(() => {
    async function fetchTheme() {
      try {
        const domain = typeof window !== 'undefined' ? window.location.hostname : ''
        const response = await fetch(`/api/theme?domain=${encodeURIComponent(domain)}`, { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.theme) {
            setTheme(data.theme)
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error)
      }
    }
    fetchTheme()
  }, [])

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
      <div className="flex h-20 items-center justify-center px-4 mt-8">
        <Link href="/" className="flex items-center justify-center w-full">
          <Image 
            src={theme.logoUrl} 
            alt={`${theme.companyName} Logo`} 
            width={collapsed ? 36 : 64} 
            height={collapsed ? 36 : 64} 
            className="rounded-lg" 
            unoptimized={theme.logoUrl.startsWith('http') || theme.logoUrl.startsWith('/uploads')}
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 mt-2">
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
                        href="/items"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Items List
                      </Link>
                    </>
                  )}
                  {item.label === "Accounting" && (
                    <>
                      <Link
                        href="/accounting/collections"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Account Types
                      </Link>
                      <Link
                        href="/payments"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Payments
                      </Link>
                      <Link
                        href="/accounting/credit"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Credit
                      </Link>
                      <Link
                        href="/accounting/stock-takes"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/20"
                        onClick={handleLinkClick}
                      >
                        Stock Takes
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
                </CollapsibleContent>
              </Collapsible>
            )
          }

          if (
            (item.label === "Sales" ||
              item.label === "Customers" ||
              item.label === "Items" ||
              item.label === "Accounting" ||
              item.label === "Imports") &&
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
        <Link
          href="/loyalty"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-md transition-all cursor-pointer"
          title={collapsed ? "Explore Tuzwa" : undefined}
        >
          <Leaf className="h-5 w-5 flex-shrink-0 text-white" />
          {!collapsed && (
            <div className="text-white">
              <p className="text-sm font-semibold">Explore Tuzwa</p>
              <p className="text-xs opacity-80">Loyalty Rewards</p>
            </div>
          )}
        </Link>
      </nav>

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
