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
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  currentBranch?: string
  onBranchChange?: (branchId: string) => void
  showSearch?: boolean
}

export function DashboardHeader({
  currentBranch = "nairobi",
  onBranchChange,
  showSearch = false,
}: DashboardHeaderProps) {
  const [selectedBranch, setSelectedBranch] = useState(currentBranch)
  const [branches, setBranches] = useState([{ id: "hq", name: "Headquarters", type: "headquarters" }])
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Notification 1", message: "This is the first notification", time: "10:00 AM", unread: true },
    { id: 2, title: "Notification 2", message: "This is the second notification", time: "11:00 AM", unread: false },
  ])
  const [currentBranchName, setCurrentBranchName] = useState("Headquarters")
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUserName(currentUser.username || currentUser.full_name || currentUser.email?.split('@')[0] || "User")
    }
    
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
    } else if (currentUser?.branch_name) {
      setCurrentBranchName(currentUser.branch_name)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const currentUser = getCurrentUser()
      const userId = currentUser?.id
      const url = userId ? `/api/branches/list?user_id=${userId}` : "/api/branches/list"
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        const branchList = [
          { id: "hq", name: "Headquarters", type: "headquarters" },
          ...data.map((b: any) => ({
            id: b.id,
            name: b.name,
            type: "branch",
          })),
        ]
        setBranches(branchList)
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId)
    if (branchId === "hq") {
      localStorage.removeItem("selectedBranch")
      setCurrentBranchName("Headquarters")
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
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          <Image src="/flow360-logo.png" alt="Flow360 Logo" width={28} height={28} className="rounded-lg" />
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Welcome back, {userName}</span>
            <span className="text-lg font-bold">{currentBranchName}</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{currentBranchName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>Switch Branch</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => handleBranchChange(branch.id)}
                className="cursor-pointer rounded-lg"
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{branch.name}</span>
                {branch.id === selectedBranch && <Badge className="ml-auto rounded-full">Active</Badge>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
