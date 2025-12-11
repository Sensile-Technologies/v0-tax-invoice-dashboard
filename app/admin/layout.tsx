"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  ChevronDown,
  TrendingUp,
  Bell,
  ShieldAlert,
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isRestricted, setIsRestricted] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role !== "admin" && userData.role !== "sales") {
        router.push("/")
        return
      }
      setUser(userData)
      fetchNotifications(userData.id)
    } else {
      router.push("/auth/login")
      return
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (user?.role === "sales") {
      const allowedPaths = ["/admin/sales"]
      const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(path + "/"))
      setIsRestricted(!isAllowed)
    } else {
      setIsRestricted(false)
    }
  }, [pathname, user])

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications?user_id=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: true })
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const allNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "sales"] },
    { href: "/admin/merchants", label: "Merchants", icon: Building2, roles: ["admin"] },
    { href: "/admin/sales", label: "Sales", icon: TrendingUp, roles: ["admin", "sales"] },
    { href: "/admin/operations", label: "Operations", icon: Settings2, roles: ["admin"] },
    { href: "/admin/tickets", label: "Support Tickets", icon: Ticket, roles: ["admin"] },
    { href: "/admin/invoices", label: "Billing", icon: FileText, roles: ["admin"] },
      ]

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role || ""))
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="font-bold text-lg">Flow360 Core</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-700 transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-3 py-2 font-semibold border-b">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-slate-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="font-medium text-sm">{notification.title}</span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{notification.message}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-blue-700"
                onClick={() => router.push("/admin/settings")}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-blue-700">
                    <Users className="h-4 w-4 mr-2" />
                    {user?.username || user?.email}
                    {user?.role === "sales" && (
                      <Badge variant="secondary" className="ml-2 text-xs">Sales</Badge>
                    )}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRestricted ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-500 text-center max-w-md mb-6">
              You don't have permission to access this page. Your role only allows access to the Sales section.
            </p>
            <Button onClick={() => router.push("/admin/sales")}>
              Go to Sales
            </Button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
