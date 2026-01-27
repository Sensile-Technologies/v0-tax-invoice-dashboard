"use client"

import {
  Bell,
  Search,
  Building2,
  User,
  CreditCard,
  LogOut,
  HelpCircle,
  BookOpen,
  LinkIcon,
  MessageCircle,
  Mail,
  Shield,
  FileText,
  Menu,
  Activity,
  Sparkles,
  Phone,
  QrCode,
  Download,
  X,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import Image from "next/image"
import { signOut, getCurrentUser } from "@/lib/auth/client"
import { useRouter, useSearchParams } from "next/navigation"
import { LuluChat } from "@/components/lulu-chat"

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

interface DashboardHeaderProps {
  currentBranch?: string
  onBranchChange?: (branchId: string) => void
  showSearch?: boolean
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({
  currentBranch = "nairobi",
  onBranchChange,
  showSearch = false,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const [selectedBranch, setSelectedBranch] = useState(currentBranch)
  const [branches, setBranches] = useState<Array<{ id: string; name: string; type: string; status?: string }>>([{ id: "hq", name: "Head Office", type: "headquarters", status: "active" }])
  const [notifications, setNotifications] = useState<Array<{
    id: number
    title: string
    message: string
    type: string
    created_at: string
  }>>([])
  const [currentBranchName, setCurrentBranchName] = useState("Head Office")
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [canSwitchBranches, setCanSwitchBranches] = useState(true)
  const [isLuluOpen, setIsLuluOpen] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [theme, setTheme] = useState<VendorTheme>(defaultTheme)
  const router = useRouter()
  const searchParams = useSearchParams()
  const branchIdFromUrl = searchParams.get('branch')

  useEffect(() => {
    async function fetchTheme() {
      try {
        const domain = window.location.hostname
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

  useEffect(() => {
    const initSession = async () => {
      // SECURITY: Fetch role from server (don't trust localStorage)
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            const serverUser = data.user
            setUserName(serverUser.username || serverUser.email?.split('@')[0] || "User")
            
            const role = (serverUser.role || '').toLowerCase()
            setUserRole(role)
            
            // Supervisors and Managers can only access their assigned branch - no switching allowed
            const restrictedRoles = ['supervisor', 'manager']
            const canSwitch = !restrictedRoles.includes(role)
            setCanSwitchBranches(canSwitch)
            
            // For restricted roles, always use their assigned branch
            if (!canSwitch && serverUser.branch_name && serverUser.branch_id) {
              setCurrentBranchName(serverUser.branch_name)
              setSelectedBranch(serverUser.branch_id)
              localStorage.setItem("selectedBranch", JSON.stringify({
                id: serverUser.branch_id,
                name: serverUser.branch_name,
                type: "branch",
                status: "active"
              }))
              // Update localStorage with server data
              localStorage.setItem("currentUser", JSON.stringify(serverUser))
              localStorage.setItem("user", JSON.stringify(serverUser))
              return
            }
            
            // Update localStorage with server data for consistency
            localStorage.setItem("currentUser", JSON.stringify(serverUser))
            localStorage.setItem("user", JSON.stringify(serverUser))
            
            // For directors/vendors, default to HQ if no branch is selected
            const hqRoles = ['director', 'vendor']
            const storedBranch = localStorage.getItem("selectedBranch")
            
            if (hqRoles.includes(role) && !storedBranch) {
              // Directors/vendors start at HQ by default
              setSelectedBranch("hq")
              setCurrentBranchName("Head Office")
            } else if (storedBranch) {
              // Restore from localStorage for users who can switch branches
              try {
                const parsedBranch = JSON.parse(storedBranch)
                if (parsedBranch?.id && parsedBranch?.name) {
                  setSelectedBranch(parsedBranch.id)
                  setCurrentBranchName(parsedBranch.name)
                }
              } catch (e) {
                console.error("Error parsing stored branch:", e)
              }
            }
            
            // Fetch branches after role is determined
            fetchBranchesWithRole(canSwitch)
            return
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      }
      
      // If no session, still try to fetch branches
      fetchBranchesWithRole(true)
      
      // Fallback to localStorage for branch name display
      const storedBranch = localStorage.getItem("selectedBranch")
      if (storedBranch) {
        try {
          const parsedBranch = JSON.parse(storedBranch)
          if (parsedBranch?.name) {
            setCurrentBranchName(parsedBranch.name)
          }
        } catch (e) {
          console.error("Error parsing stored branch:", e)
        }
      }
    }
    initSession()
  }, [])

  useEffect(() => {
    // fetchBranches is called after session is initialized
    // to ensure canSwitchBranches is set correctly
  }, [])

  // Handle branch from URL query parameter
  useEffect(() => {
    if (branchIdFromUrl && branches.length > 1) {
      const branchFromUrl = branches.find(b => b.id === branchIdFromUrl)
      if (branchFromUrl) {
        setSelectedBranch(branchFromUrl.id)
        setCurrentBranchName(branchFromUrl.name)
        localStorage.setItem("selectedBranch", JSON.stringify(branchFromUrl))
      }
    }
  }, [branchIdFromUrl, branches])

  // Fetch notifications from admin
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setNotifications(data.notifications || [])
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }
    fetchNotifications()
  }, [])

  const fetchBranchesWithRole = async (canSwitch: boolean) => {
    try {
      // API now uses session cookie for vendor scoping - no need to pass user_id
      const response = await fetch('/api/branches/list', { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        
        // Server already filters branches based on role and vendor
        // For directors/vendors, always add HQ option (even if no branches exist)
        if (canSwitch) {
          const branchList = [
            { id: "hq", name: "Head Office", type: "headquarters", status: "active" },
            ...data.map((b: any) => ({
              id: b.id,
              name: b.name,
              type: "branch",
              status: b.status || "active",
            })),
          ]
          setBranches(branchList)
        } else {
          // Managers/supervisors get only their assigned branch (already filtered by server)
          setBranches(data.map((b: any) => ({
            id: b.id,
            name: b.name,
            type: "branch",
            status: b.status || "active",
          })))
        }
      }
    } catch (error) {
      // Silently ignore network errors during HMR/development
      if (process.env.NODE_ENV === 'development') return
      console.error("Error fetching branches:", error)
    }
  }

  const handleBranchChange = (branchId: string) => {
    // Security: Block branch switching for restricted roles
    if (!canSwitchBranches) {
      console.warn("Branch switching is not allowed for this role")
      return
    }
    
    setSelectedBranch(branchId)
    if (branchId === "hq") {
      localStorage.removeItem("selectedBranch")
      setCurrentBranchName("Head Office")
      router.push("/headquarters")
    } else {
      const branch = branches.find((b) => b.id === branchId)
      if (branch) {
        localStorage.setItem("selectedBranch", JSON.stringify(branch))
        setCurrentBranchName(branch.name)
        router.push(`/sales/summary?branch=${branchId}`)
      }
      if (onBranchChange) {
        onBranchChange(branchId)
      }
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-3 md:px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        {onMobileMenuToggle && (
          <Button
            variant="outline"
            size="icon"
            onClick={onMobileMenuToggle}
            className="lg:hidden h-10 w-10 flex-shrink-0 border-slate-300 bg-slate-100 hover:bg-slate-200"
          >
            <Menu className="h-6 w-6 text-slate-700" />
          </Button>
        )}
        <div className="flex flex-col">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:block">Welcome back{userName ? `, ${userName}` : ''}</span>
          <span className="text-sm md:text-lg font-bold truncate max-w-[120px] sm:max-w-none">{currentBranchName}</span>
        </div>
        {showSearch && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="pl-9 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {canSwitchBranches && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">{currentBranchName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl">
              <DropdownMenuLabel>Switch Branch</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => {
                    if (branch.status === "pending_onboarding") {
                      return
                    }
                    handleBranchChange(branch.id)
                  }}
                  className={`cursor-pointer rounded-lg ${branch.status === "pending_onboarding" ? "opacity-60" : ""}`}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{branch.name}</span>
                  {branch.status === "pending_onboarding" ? (
                    <Badge variant="outline" className="ml-auto rounded-full text-orange-600 border-orange-300">Pending Admin Approval</Badge>
                  ) : branch.id === selectedBranch ? (
                    <Badge className="ml-auto rounded-full">Active</Badge>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <BookOpen className="mr-2 h-4 w-4" />
              User Manuals
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <LinkIcon className="mr-2 h-4 w-4" />
              Helpful Links
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer rounded-lg"
              onClick={() => window.location.href = 'mailto:taxsupport@sensiletechnologies.com'}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer rounded-lg"
              onClick={() => setIsLuluOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Lulu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-72">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-accent rounded-lg cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                        notification.type === 'billing' ? 'bg-amber-500' : 
                        notification.type === 'enhancement' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="bg-slate-200">
                <AvatarFallback className="bg-slate-200">
                  <User className="h-5 w-5 text-slate-600" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <p className="font-medium">{userName || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole || 'Loading...'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/subscription")} className="cursor-pointer rounded-lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/security-settings")} className="cursor-pointer rounded-lg">
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/controller-logs")} className="cursor-pointer rounded-lg">
              <Activity className="mr-2 h-4 w-4" />
              Controller Logs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/logs")} className="cursor-pointer rounded-lg">
              <FileText className="mr-2 h-4 w-4" />
              Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowQRCode(true)} className="cursor-pointer rounded-lg">
              <QrCode className="mr-2 h-4 w-4" />
              Download Mobile App
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 rounded-lg">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LuluChat isOpen={isLuluOpen} onClose={() => setIsLuluOpen(false)} />

      {showQRCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowQRCode(false)}>
          <div 
            className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Download Mobile App</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowQRCode(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4">
                <QRCodeSVG 
                  value={typeof window !== 'undefined' ? `${window.location.origin}` : 'https://flow360.app'} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600">
                  Scan this QR code with your phone to install the Flow360 app
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Download className="h-3 w-3" />
                  <span>Works on iOS and Android</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg w-full">
                <p className="text-xs text-blue-700 text-center">
                  <strong>Tip:</strong> After scanning, tap "Add to Home Screen" in your browser menu to install
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default DashboardHeader
