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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Notification 1", message: "This is the first notification", time: "10:00 AM", unread: true },
    { id: 2, title: "Notification 2", message: "This is the second notification", time: "11:00 AM", unread: false },
  ])
  const [currentBranchName, setCurrentBranchName] = useState("Head Office")
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [canSwitchBranches, setCanSwitchBranches] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const branchIdFromUrl = searchParams.get('branch')

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
    <header className="flex h-16 items-center justify-between border-b bg-card px-3 md:px-6">
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
        <div className="flex items-center gap-2">
          <Image src="/flow360-logo.png" alt="Flow360 Logo" width={28} height={28} className="rounded-lg hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:block">Welcome back, {userName}</span>
            <span className="text-sm md:text-lg font-bold truncate max-w-[120px] sm:max-w-none">{currentBranchName}</span>
          </div>
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
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <MessageCircle className="mr-2 h-4 w-4" />
              In-App Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-72">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-accent rounded-lg cursor-pointer ${
                    notification.unread ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center rounded-lg">Mark all as read</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="/professional-avatar.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg">Account Preferences</DropdownMenuItem>
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
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 rounded-lg">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default DashboardHeader
