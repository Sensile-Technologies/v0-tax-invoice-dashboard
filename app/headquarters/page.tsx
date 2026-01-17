"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Shield,
  CheckCircle2,
  Building2,
  TrendingUp,
  Users,
  ShoppingCart,
  Plus,
  ChevronDown,
  Package,
  Upload,
  DollarSign,
  Clock,
  FileText,
  Loader2,
  StopCircle,
  AlertCircle,
  Truck,
  ClipboardList,
  Droplet,
} from "lucide-react"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"

import { useCurrency } from "@/lib/currency-utils"
import { getCurrentUser } from "@/lib/auth/client"

interface HQStats {
  totalRevenue: number
  revenueGrowth: number
  totalTransactions: number
  totalEmployees: number
  totalInventory: number
  dieselStock: number
  petrolStock: number
  inventoryGrowth: number
  branchPerformance: { 
    branch: string
    sales: number
    purchases: number
    bulkSalesCount: number
    bulkSalesVolume: number
    bulkSalesAmount: number
  }[]
  monthlyRevenue: { month: string; revenue: number }[]
}

export default function HeadquartersPage() {
  const router = useRouter()
  const [createBranchOpen, setCreateBranchOpen] = useState(false)
  const [editBranchOpen, setEditBranchOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [globalUploadsOpen, setGlobalUploadsOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [hqStats, setHqStats] = useState<HQStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const { formatCurrency } = useCurrency()

  useEffect(() => {
    const checkAccess = async () => {
      // First check localStorage for immediate feedback
      const currentUser = getCurrentUser()
      if (currentUser) {
        const localRole = (currentUser.role || '').toLowerCase()
        const restrictedRoles = ['supervisor', 'manager', 'cashier']
        if (restrictedRoles.includes(localRole)) {
          setAccessDenied(true)
          const branchId = currentUser.branch_id
          router.replace(branchId ? `/sales/summary?branch=${branchId}` : '/sales/summary')
          return
        }
      }
      
      // Always verify role from server (don't trust localStorage alone)
      try {
        const response = await fetch('/api/headquarters/stats', { 
          credentials: 'include',
          method: 'GET'
        })
        if (response.status === 401 || response.status === 403) {
          setAccessDenied(true)
          const branchId = currentUser?.branch_id
          router.replace(branchId ? `/sales/summary?branch=${branchId}` : '/sales/summary')
          return
        }
        if (response.ok) {
          const data = await response.json()
          setHqStats(data)
          setIsLoadingStats(false)
        }
      } catch (error) {
        console.error('Error checking HQ access:', error)
      }
      setIsCheckingAccess(false)
    }
    checkAccess()
  }, [router])

  useEffect(() => {
    if (!isCheckingAccess && !accessDenied) {
      fetchBranches()
      // Stats already fetched during access check
    }
  }, [isCheckingAccess, accessDenied])

  const fetchHQStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/headquarters/stats', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setHqStats(data)
      } else if (response.status === 403) {
        setAccessDenied(true)
        router.replace('/sales/summary')
      }
    } catch (error) {
      console.error('Error fetching HQ stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const fetchBranches = async () => {
    try {
      setIsLoadingBranches(true)
      const currentUser = getCurrentUser()
      const userId = currentUser?.id
      const url = userId ? `/api/branches/list?user_id=${userId}` : "/api/branches/list"
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        const formattedBranches = data.map((branch: any) => ({
          id: branch.id,
          name: branch.name,
          location: branch.location,
          status: branch.status.charAt(0).toUpperCase() + branch.status.slice(1),
          revenue: branch.monthly_revenue || 0,
          monthToDateRevenue: branch.monthToDateRevenue || 0,
          currentShiftRevenue: branch.currentShiftRevenue || 0,
          transactions: branch.transactions || 0,
          inventory: branch.inventory || 0,
          performance: branch.performance || "+0%",
          gradient: "from-blue-600 via-blue-500 to-cyan-400",
          manager: branch.manager,
          phone: branch.phone,
          email: branch.email,
          address: branch.address,
          county: branch.county,
          local_tax_office: branch.local_tax_office,
          kra_pin: branch.kra_pin,
          bhfId: branch.bhf_id,
          tankConfig: branch.tank_config || {},
          storageIndices: branch.storage_indices || [],
          device_token: branch.device_token,
          vendor_id: branch.vendor_id,
          controller_id: branch.controller_id,
        }))
        setBranches(formattedBranches)
      } else {
        console.error("Failed to fetch branches:", response.status)
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGlobalUpload = async () => {
    if (!uploadFile) return

    try {
      const formData = new FormData()
      formData.append("file", uploadFile)

      const response = await fetch("/api/global-uploads", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("File uploaded successfully!")
        setGlobalUploadsOpen(false)
        setUploadFile(null)
      } else {
        alert("Failed to upload file")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading file")
    }
  }

  const [branchForm, setBranchForm] = useState({
    name: "",
    location: "",
    manager: "",
    phone: "",
    email: "",
    address: "",
    county: "",
    localTaxOffice: "",
    hardwareType: "",
    serialNumber: "",
    storageIndices: [] as string[],
    newStorageIndex: "",
    vendorId: "",
    kraPin: "",
    controllerId: "",
    tankConfig: {} as Record<
      string,
      { dispensers: string[]; initialStock: string; fuelType?: string; tankCapacity?: string }
    >,
  })

  const totalRevenue = hqStats?.totalRevenue || 0
  const totalTransactions = hqStats?.totalTransactions || 0
  const totalInventory = hqStats?.totalInventory || 0
  const totalEmployees = hqStats?.totalEmployees || 0
  const revenueGrowth = hqStats?.revenueGrowth || 0
  const inventoryGrowth = hqStats?.inventoryGrowth || 0

  const handleBranchClick = (branchId: string) => {
    if (branchId === "hq") {
      router.push("/headquarters")
    } else {
      // Navigate to sales summary page with branch context
      router.push(`/sales/summary?branch=${branchId}`)
    }
  }

  const handleOpenCreateDialog = () => {
    const existingVendorId = branches.find(b => b.vendor_id)?.vendor_id || ""
    setBranchForm({
      name: "",
      location: "",
      manager: "",
      email: "",
      phone: "",
      address: "",
      county: "",
      localTaxOffice: "",
      hardwareType: "",
      serialNumber: "",
      storageIndices: [],
      newStorageIndex: "",
      vendorId: existingVendorId,
      kraPin: "",
      controllerId: "",
      tankConfig: {},
    })
    setCreateBranchOpen(true)
  }

  const handleCreateBranch = async () => {
    if (
      !branchForm.name ||
      !branchForm.location ||
      !branchForm.county ||
      !branchForm.localTaxOffice
    ) {
      alert("Please fill in all required fields (Branch Name, Location, County, Local Tax Office)")
      return
    }

    setIsSubmitting(true)
    try {
      const currentUser = getCurrentUser()
      const branchRes = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id,
          vendor_id: branchForm.vendorId || undefined,
          name: branchForm.name,
          location: branchForm.location,
          manager: branchForm.manager,
          email: branchForm.email,
          phone: branchForm.phone,
          storage_indices: branchForm.storageIndices,
          county: branchForm.county,
          address: branchForm.address,
          local_tax_office: branchForm.localTaxOffice,
          controller_id: branchForm.controllerId || undefined,
        })
      })
      
      if (!branchRes.ok) {
        const errorText = await branchRes.text()
        console.error("[v0] Branch API error:", branchRes.status, errorText)
        alert(`Branch creation failed: Server returned ${branchRes.status}. ${errorText || 'Please try again.'}`)
        setIsSubmitting(false)
        return
      }

      const responseText = await branchRes.text()
      if (!responseText) {
        console.error("[v0] Empty response from branch API")
        alert("Branch creation failed: Empty response from server. Please try again.")
        setIsSubmitting(false)
        return
      }

      let branchResult
      try {
        branchResult = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[v0] Failed to parse branch response:", responseText)
        alert(`Branch creation failed: Invalid response from server. Please try again.`)
        setIsSubmitting(false)
        return
      }

      if (!branchResult.success) {
        console.error("[v0] Branch creation error:", branchResult.error)
        alert(`Branch creation failed: ${branchResult.error}`)
        setIsSubmitting(false)
        return
      }

      console.log("[v0] Branch created:", branchResult.data)
      const createdBranch = branchResult.data

      const dispenserFuelTypes = new Map<number, Set<string>>()
      const tanksToCreate: any[] = []

      Object.entries(branchForm.tankConfig).forEach(([storageIndex, config]) => {
        const tankConfig = config as {
          dispensers: string[]
          initialStock: string
          fuelType?: string
          tankCapacity?: string
        }

        const fuelType = tankConfig.fuelType || "Petrol"

        tanksToCreate.push({
          branch_id: createdBranch.id,
          tank_name: storageIndex,
          fuel_type: fuelType,
          capacity: Number.parseFloat(tankConfig.tankCapacity || "0"),
          current_stock: Number.parseFloat(tankConfig.initialStock || "0"),
          status: "active",
        })

        tankConfig.dispensers.forEach((dispenserName) => {
          const dispenserNumber = Number.parseInt(dispenserName.replace(/\D/g, "")) || dispenserFuelTypes.size + 1
          if (!dispenserFuelTypes.has(dispenserNumber)) {
            dispenserFuelTypes.set(dispenserNumber, new Set())
          }
          dispenserFuelTypes.get(dispenserNumber)!.add(fuelType)
        })
      })

      const dispensersToCreate = Array.from(dispenserFuelTypes.entries()).map(([dispenserNumber, fuelTypes]) => ({
        branch_id: createdBranch.id,
        dispenser_number: dispenserNumber,
        fuel_type: Array.from(fuelTypes)[0],
        status: "active",
      }))

      if (tanksToCreate.length > 0) {
        for (const tank of tanksToCreate) {
          await fetch('/api/tanks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tank)
          })
        }
        console.log("[v0] Tanks created:", tanksToCreate)
      }

      let nozzlesCreatedCount = 0
      if (dispensersToCreate.length > 0) {
        console.log("[v0] Creating dispensers:", { dispensersToCreate })
        const createdDispensers: any[] = []
        
        for (const dispenser of dispensersToCreate) {
          const dispRes = await fetch('/api/dispensers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dispenser)
          })
          const dispResult = await dispRes.json()
          if (dispResult.success) {
            createdDispensers.push(dispResult.data)
          }
        }

        console.log("[v0] Dispensers created:", createdDispensers)

        const nozzlesToCreate: any[] = []
        createdDispensers.forEach((dispenser: any) => {
          const fuelTypes = dispenserFuelTypes.get(dispenser.dispenser_number)
          if (fuelTypes) {
            let nozzleNumber = 1
            fuelTypes.forEach((fuelType) => {
              nozzlesToCreate.push({
                branch_id: createdBranch.id,
                dispenser_id: dispenser.id,
                nozzle_number: nozzleNumber++,
                fuel_type: fuelType,
                initial_meter_reading: 0,
                status: "active",
              })
            })
          }
        })

        if (nozzlesToCreate.length > 0) {
          console.log("[v0] Creating nozzles:", { nozzlesToCreate })
          for (const nozzle of nozzlesToCreate) {
            await fetch('/api/nozzles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(nozzle)
            })
          }
          nozzlesCreatedCount = nozzlesToCreate.length
        }
      }

      try {
        const backendResponse = await fetch("/api/branches/register-backend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId: createdBranch.id,
            name: branchForm.name,
            location: branchForm.location,
            county: branchForm.county,
            address: branchForm.address,
            organization: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
          }),
        })

        const backendData = await backendResponse.json()

        if (backendResponse.ok && backendData.success) {
          alert(
            `Branch "${branchForm.name}" created successfully!\n` +
              `Local database entry created\n` +
              `${tanksToCreate.length} tank(s) created\n` +
              `${dispensersToCreate.length} dispenser(s) created\n` +
              `${nozzlesCreatedCount} nozzle(s) created\n` +
              `Backend registration completed`,
          )
        } else {
          alert(
            `Branch "${branchForm.name}" created successfully!\n` +
              `Local database entry created\n` +
              `${tanksToCreate.length} tank(s) created\n` +
              `${dispensersToCreate.length} dispenser(s) created\n` +
              `${nozzlesCreatedCount} nozzle(s) created\n` +
              `Backend registration failed (can be retried later)`,
          )
        }
      } catch (backendError) {
        console.log("[v0] Backend registration failed:", backendError)
        alert(
          `Branch "${branchForm.name}" created successfully!\n` +
            `Local database entry created\n` +
            `${tanksToCreate.length} tank(s) created\n` +
            `${dispensersToCreate.length} dispenser(s) created\n` +
            `${nozzlesCreatedCount} nozzle(s) created\n` +
            `Backend registration unavailable (can be retried later)`,
        )
      }

      setCreateBranchOpen(false)
      setBranchForm({
        name: "",
        location: "",
        manager: "",
        email: "",
        phone: "",
        address: "",
        county: "",
        localTaxOffice: "",
        hardwareType: "",
        serialNumber: "",
        storageIndices: [],
        newStorageIndex: "",
        vendorId: "",
        kraPin: "",
        controllerId: "",
        tankConfig: {},
      })
      await fetchBranches()
    } catch (error: any) {
      console.error("Error creating branch:", error)
      alert(`Branch creation failed: ${error.message || "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditBranch = (branch: any) => {
    console.log("[v0] Opening edit dialog for branch:", branch)
    const latestBranch = branches.find((b) => b.id === branch.id) || branch
    setEditingBranch(latestBranch)
    setBranchForm({
      name: latestBranch.name || "",
      location: latestBranch.location || "",
      manager: latestBranch.manager || "",
      email: latestBranch.email || "",
      phone: latestBranch.phone || "",
      address: latestBranch.address || "",
      county: latestBranch.county || "",
      localTaxOffice: latestBranch.local_tax_office || "",
      hardwareType: "",
      serialNumber: "",
      storageIndices: latestBranch.storage_indices || [],
      newStorageIndex: "",
      vendorId: latestBranch.vendor_id || "",
      kraPin: latestBranch.kra_pin || "",
      controllerId: latestBranch.controller_id || "",
      tankConfig: latestBranch.tank_config || {},
    })
    setEditBranchOpen(true)
  }

  const handleUpdateBranch = async () => {
    if (!editingBranch) return
    console.log("[v0] Updating branch:", editingBranch.id, branchForm)

    // Basic validation for essential fields
    if (
      !branchForm.name ||
      !branchForm.location ||
      !branchForm.county ||
      !branchForm.localTaxOffice
    ) {
      alert("Please fill in all required fields (Branch Name, Location, County, Local Tax Office)")
      return
    }

    try {
      const response = await fetch(`/api/branches/${editingBranch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: branchForm.name,
          location: branchForm.location,
          manager: branchForm.manager,
          email: branchForm.email,
          phone: branchForm.phone,
          address: branchForm.address,
          county: branchForm.county,
          localTaxOffice: branchForm.localTaxOffice,
          storageIndices: branchForm.storageIndices,
          tankConfig: branchForm.tankConfig,
          kraPin: branchForm.kraPin,
          controllerId: branchForm.controllerId,
        }),
      })

      if (response.ok) {
        alert("Branch updated successfully!")
        setEditBranchOpen(false)
        setEditingBranch(null)
        await fetchBranches() // Refresh the list of branches
      } else {
        const errorData = await response.json()
        console.error("Update error:", errorData)
        alert(`Failed to update branch: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error updating branch:", error)
      alert("Error updating branch. Please try again.")
    }
  }

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`Are you sure you want to delete the branch "${branchName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert(`Branch "${branchName}" deleted successfully!`)
        await fetchBranches() // Refresh the list of branches
      } else {
        const errorData = await response.json()
        console.error("Delete error:", errorData)
        alert(`Failed to delete branch: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting branch:", error)
      alert("Error deleting branch. Please try again.")
    }
  }

  const handleDeactivateBranch = async (branchId: string, branchName: string) => {
    const currentBranch = branches.find((b) => b.id === branchId)
    const currentStatus = currentBranch?.status || "active"
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    const confirmationMessage =
      newStatus === "inactive"
        ? `Are you sure you want to deactivate the branch "${branchName}"?`
        : `Are you sure you want to activate the branch "${branchName}"?`

    if (!confirm(confirmationMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const message = newStatus === "inactive" ? "deactivated" : "activated"
        alert(`Branch "${branchName}" ${message} successfully!`)
        await fetchBranches()
        const updatedBranch = branches.find((b) => b.id === branchId)
        if (updatedBranch) {
          setEditingBranch({ ...updatedBranch, status: newStatus })
        }
      } else {
        const errorData = await response.json()
        console.error("Status update error:", errorData)
        alert(
          `Failed to ${newStatus === "inactive" ? "deactivate" : "activate"} branch: ${errorData.error || "Unknown error"}`,
        )
      }
    } catch (error) {
      console.error("Error updating branch status:", error)
      alert(`Error updating branch status. Please try again.`)
    }
  }

  if (isCheckingAccess || accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{accessDenied ? "Redirecting to your branch..." : "Checking access..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardHeader currentBranch="hq" />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white">Head Office Overview</h1>
            <p className="mt-1 text-white/80 text-pretty">Monitor all branches and organization performance</p>
          </div>
          <div className="flex gap-3">
            {/* Branches Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl bg-transparent text-white hover:bg-white/10">
                  <Building2 className="mr-2 h-4 w-4" />
                  Branches
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem onSelect={() => setCreateBranchOpen(true)} className="cursor-pointer rounded-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Branch
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer rounded-lg">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Branch Details
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-xl">
                    {branches.map((branch) => (
                      <DropdownMenuItem
                        key={branch.id}
                        onSelect={() => handleEditBranch(branch)}
                        className="cursor-pointer rounded-lg"
                      >
                        {branch.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  onSelect={() => router.push("/headquarters/inventory")}
                  className="cursor-pointer rounded-lg"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Inventory
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setGlobalUploadsOpen(true)} className="cursor-pointer rounded-lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Global Uploads
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Users Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-xl bg-transparent text-white hover:bg-white/10">
                  <Users className="h-4 w-4" />
                  Users
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/headquarters/staff-management" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Staff Management
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/headquarters/roles" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Roles & Permissions
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/headquarters/approvals" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Approval Workflows
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Item Management Button */}
            <Button
              variant="ghost"
              className="rounded-xl bg-transparent text-white hover:bg-white/10"
              onClick={() => router.push("/headquarters/items")}
            >
              <Package className="mr-2 h-4 w-4" />
              Items
            </Button>

            {/* Suppliers Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl bg-transparent text-white hover:bg-white/10">
                  <Truck className="mr-2 h-4 w-4" />
                  Suppliers
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/headquarters/suppliers" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Suppliers
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/headquarters/transporters" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Transporters
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/headquarters/purchase-orders" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Purchase Orders
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Organization Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Organization Summary</h2>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">MTD Revenue</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <p className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">MTD Transactions</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
                      <ShoppingCart className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 mt-1">Across all branches</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                  <p className="text-xs text-gray-600 mt-1">In {branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Tank Stock (L)</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalInventory.toLocaleString()}</div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs text-gray-600">Diesel: {(hqStats?.dieselStock || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-600">Petrol: {(hqStats?.petrolStock || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Performance Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Performance Analytics</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Revenue Trend (6 Months)</CardTitle>
                <CardDescription>Monthly revenue across all branches</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] w-full">
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : hqStats?.monthlyRevenue && hqStats.monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hqStats.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No revenue data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Branch Performance (MTD)</CardTitle>
                <CardDescription>Sales vs Purchases by branch (in thousands)</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] w-full">
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : hqStats?.branchPerformance && hqStats.branchPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hqStats.branchPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branch" />
                        <YAxis tickFormatter={(value) => `${value}K`} />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}K`, '']} />
                        <Legend />
                        <Bar dataKey="sales" fill="#22c55e" name="Sales" />
                        <Bar dataKey="purchases" fill="#f97316" name="Purchases" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No branch performance data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Sales by Branch */}
          {hqStats?.branchPerformance && hqStats.branchPerformance.some(b => b.bulkSalesCount > 0) && (
            <Card className="rounded-2xl mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  Bulk Sales by Branch (MTD)
                </CardTitle>
                <CardDescription>Bulk fuel sales performance across branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Branch</th>
                        <th className="text-right py-2 px-3 font-medium">Transactions</th>
                        <th className="text-right py-2 px-3 font-medium">Volume (L)</th>
                        <th className="text-right py-2 px-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hqStats.branchPerformance
                        .filter(b => b.bulkSalesCount > 0)
                        .sort((a, b) => b.bulkSalesAmount - a.bulkSalesAmount)
                        .map((branch, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2 px-3">{branch.branch}</td>
                            <td className="text-right py-2 px-3">{branch.bulkSalesCount.toLocaleString()}</td>
                            <td className="text-right py-2 px-3">{branch.bulkSalesVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="text-right py-2 px-3">{formatCurrency(branch.bulkSalesAmount)}</td>
                          </tr>
                        ))}
                      <tr className="bg-gray-100 font-medium">
                        <td className="py-2 px-3">Total</td>
                        <td className="text-right py-2 px-3">
                          {hqStats.branchPerformance.reduce((sum, b) => sum + b.bulkSalesCount, 0).toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-3">
                          {hqStats.branchPerformance.reduce((sum, b) => sum + b.bulkSalesVolume, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-2 px-3">
                          {formatCurrency(hqStats.branchPerformance.reduce((sum, b) => sum + b.bulkSalesAmount, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Branches */}
        {isLoadingBranches ? (
          <div className="text-center py-12 text-white">
            <p>Loading branches...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12 text-white">
            <p>No branches found. Create your first branch to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <Card
                key={branch.id}
                onClick={() => handleBranchClick(branch.id)}
                className="rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group hover:scale-105"
              >
                <div className={`h-3 bg-gradient-to-r ${branch.gradient}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${branch.gradient} shadow-lg`}
                      >
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="group-hover:text-blue-600 transition-colors text-base">
                          {branch.name}
                        </CardTitle>
                        <CardDescription className="text-xs">{branch.location}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full text-xs px-2 py-1 ${branch.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {branch.status}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditBranch(branch)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <Package className="h-3 w-3" />
                        MTD Revenue
                      </div>
                      <div className="font-semibold text-sm">{formatCurrency(branch.monthToDateRevenue)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <DollarSign className="h-3 w-3" /> {/* Changed from Users to DollarSign */}
                        Current Shift
                      </div>
                      <div className="font-semibold text-sm">{formatCurrency(branch.currentShiftRevenue)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        Growth
                      </div>
                      <div className="font-semibold text-sm text-green-600">{branch.performance}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Branch Dialog */}
      <Dialog open={createBranchOpen} onOpenChange={setCreateBranchOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenCreateDialog} size="lg" className="rounded-xl shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New Branch
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Branch</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new branch location with device initialization
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Branch Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Branch Name *</Label>
                  <Input
                    id="branch-name"
                    placeholder="e.g., Mombasa Branch"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mombasa, Kenya"
                    value={branchForm.location}
                    onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Input
                  id="address"
                  placeholder="Street address, building, floor"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="county">County *</Label>
                  <Input
                    id="county"
                    placeholder="e.g., Mombasa"
                    value={branchForm.county}
                    onChange={(e) => setBranchForm({ ...branchForm, county: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-office">Local Tax Office *</Label>
                  <Input
                    id="tax-office"
                    placeholder="e.g., Mombasa Tax Office"
                    value={branchForm.localTaxOffice}
                    onChange={(e) => setBranchForm({ ...branchForm, localTaxOffice: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-id">Vendor ID (optional - only if auto-detection fails)</Label>
                <Input
                  id="vendor-id"
                  placeholder="e.g., a30077a7-1f46-4292-aa21-a79eb38227f0"
                  value={branchForm.vendorId}
                  onChange={(e) => setBranchForm({ ...branchForm, vendorId: e.target.value })}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="controller-id">Controller ID (PTS ID)</Label>
                <Input
                  id="controller-id"
                  placeholder="e.g., 003A003A..."
                  value={branchForm.controllerId}
                  onChange={(e) => setBranchForm({ ...branchForm, controllerId: e.target.value })}
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Unique identifier for the pump controller. Used to match pump callbacks to this branch.</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Staff Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Branch Manager</Label>
                  <Input
                    id="manager"
                    placeholder="Manager name"
                    value={branchForm.manager}
                    onChange={(e) => setBranchForm({ ...branchForm, manager: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="branch@flow360.com"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254..."
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Hardware Assignment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hardware-type">Hardware Type</Label>
                  <Select
                    value={branchForm.hardwareType}
                    onValueChange={(value) => setBranchForm({ ...branchForm, hardwareType: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select hardware type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Controller">Controller</SelectItem>
                      <SelectItem value="MiniPC">Mini PC</SelectItem>
                      <SelectItem value="POS">POS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial-number">Serial Number</Label>
                  <Input
                    id="serial-number"
                    placeholder="e.g., SN-12345"
                    value={branchForm.serialNumber}
                    onChange={(e) => setBranchForm({ ...branchForm, serialNumber: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>


            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Storage Indices</h3>
              <p className="text-sm text-muted-foreground">
                Configure unique storage locations for this branch (e.g., Tank, Warehouse, Cold Storage)
              </p>
              <div className="flex gap-2">
                <Select
                  value={branchForm.newStorageIndex}
                  onValueChange={(value) => setBranchForm({ ...branchForm, newStorageIndex: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select storage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tank">Tank</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                    <SelectItem value="Dry Storage">Dry Storage</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="e.g., Tank 1"
                  value={branchForm.newStorageIndex ? branchForm.newStorageIndex.split(" ")[1] || "" : ""}
                  onChange={(e) => {
                    const type = branchForm.newStorageIndex ? branchForm.newStorageIndex.split(" ")[0] || "" : ""
                    setBranchForm({ ...branchForm, newStorageIndex: `${type} ${e.target.value}` })
                  }}
                  className="rounded-xl"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (branchForm.newStorageIndex.trim()) {
                      const storageName = branchForm.newStorageIndex.trim()
                      if (storageName.toLowerCase().includes("tank")) {
                        // Initialize tank configuration
                        setBranchForm({
                          ...branchForm,
                          storageIndices: [...branchForm.storageIndices, storageName],
                          tankConfig: {
                            ...branchForm.tankConfig,
                            [storageName]: { dispensers: [], initialStock: "", fuelType: "Petrol", tankCapacity: "" }, // Default to Petrol and empty capacity
                          },
                          newStorageIndex: "",
                        })
                      } else {
                        setBranchForm({
                          ...branchForm,
                          storageIndices: [...branchForm.storageIndices, storageName],
                          newStorageIndex: "",
                        })
                      }
                    }
                  }}
                  className="rounded-xl"
                >
                  Add
                </Button>
              </div>
              {branchForm.storageIndices.length > 0 && (
                <div className="space-y-4 mt-4">
                  {branchForm.storageIndices.map((index, i) => (
                    <div key={i} className="border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-lg">
                          {index}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => {
                            const newConfig = { ...branchForm.tankConfig }
                            delete newConfig[index]
                            setBranchForm({
                              ...branchForm,
                              storageIndices: branchForm.storageIndices.filter((_, idx) => idx !== i),
                              tankConfig: newConfig,
                            })
                          }}
                          className="text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      {index.toLowerCase().includes("tank") && (
                        <div className="space-y-4 bg-muted/50 p-3 rounded-lg">
                          <div className="space-y-2">
                            <Label>Fuel Type</Label>
                            <Select
                              value={branchForm.tankConfig[index]?.fuelType || "Petrol"}
                              onValueChange={(value) => {
                                const currentConfig = branchForm.tankConfig[index] || { dispensers: [], initialStock: "", fuelType: "Petrol", tankCapacity: "" }
                                setBranchForm({
                                  ...branchForm,
                                  tankConfig: {
                                    ...branchForm.tankConfig,
                                    [index]: { ...currentConfig, fuelType: value },
                                  },
                                })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Kerosene">Kerosene</SelectItem>
                                <SelectItem value="Super">Super</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Added tank capacity input field in the form */}
                          <div className="space-y-2">
                            <Label htmlFor={`tank-capacity-${i}`}>Tank Capacity (Litres) *</Label>
                            <Input
                              id={`tank-capacity-${i}`}
                              type="number"
                              placeholder="e.g., 10000"
                              value={branchForm.tankConfig[index]?.tankCapacity || ""}
                              onChange={(e) => {
                                const currentConfig = branchForm.tankConfig[index] || { dispensers: [], initialStock: "", fuelType: "Petrol", tankCapacity: "" }
                                setBranchForm({
                                  ...branchForm,
                                  tankConfig: {
                                    ...branchForm.tankConfig,
                                    [index]: {
                                      ...currentConfig,
                                      tankCapacity: e.target.value,
                                    },
                                  },
                                })
                              }}
                              className="rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Dispensers Served by This Tank *</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., Dispenser 01"
                                id={`new-dispenser-${index}`}
                                className="rounded-xl"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const input = document.getElementById(`new-dispenser-${index}`) as HTMLInputElement
                                  const dispenserName = input?.value?.trim()
                                  if (dispenserName) {
                                    const currentConfig = branchForm.tankConfig[index] || { dispensers: [], initialStock: "", fuelType: "Petrol", tankCapacity: "" }
                                    setBranchForm({
                                      ...branchForm,
                                      tankConfig: {
                                        ...branchForm.tankConfig,
                                        [index]: {
                                          ...currentConfig,
                                          dispensers: [
                                            ...(currentConfig.dispensers || []),
                                            dispenserName,
                                          ],
                                        },
                                      },
                                    })
                                    input.value = ""
                                  }
                                }}
                                className="rounded-xl"
                              >
                                Add Dispenser
                              </Button>
                            </div>

                            {branchForm.tankConfig[index]?.dispensers?.length > 0 && (
                              <div className="space-y-2 mt-2">
                                {branchForm.tankConfig[index].dispensers.map((dispenser, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="flex items-center justify-between bg-background p-2 rounded-lg"
                                  >
                                    <span className="text-sm font-medium">{dispenser}</span>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        placeholder="Initial meter reading"
                                        className="w-48 rounded-lg"
                                        id={`meter-${i}-${dIdx}`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentConfig = branchForm.tankConfig[index] || { dispensers: [], initialStock: "", fuelType: "Petrol", tankCapacity: "" }
                                          const dispensers = currentConfig.dispensers.filter(
                                            (_, idx) => idx !== dIdx,
                                          )
                                          setBranchForm({
                                            ...branchForm,
                                            tankConfig: {
                                              ...branchForm.tankConfig,
                                              [index]: {
                                                ...currentConfig,
                                                dispensers,
                                              },
                                            },
                                          })
                                        }}
                                        className="text-xs text-destructive hover:underline"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`tank-stock-${index}`}>Initial Stock Position (Litres) *</Label>
                            <Input
                              id={`tank-stock-${index}`}
                              type="number"
                              placeholder="e.g., 5000"
                              value={branchForm.tankConfig[index]?.initialStock || ""}
                              onChange={(e) => {
                                const currentConfig = branchForm.tankConfig[index] || { dispensers: [], initialStock: "", fuelType: "Petrol", tankCapacity: "" }
                                setBranchForm({
                                  ...branchForm,
                                  tankConfig: {
                                    ...branchForm.tankConfig,
                                    [index]: {
                                      ...currentConfig,
                                      initialStock: e.target.value,
                                    },
                                  },
                                })
                              }}
                              className="rounded-xl"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateBranchOpen(false)}
              className="rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
              disabled={
                !branchForm.name ||
                !branchForm.location ||
                !branchForm.county ||
                !branchForm.localTaxOffice ||
                isSubmitting
              }
            >
              {isSubmitting ? "Creating..." : "Create Branch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={editBranchOpen} onOpenChange={setEditBranchOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Branch Details</DialogTitle>
            <DialogDescription>Update the information for {editingBranch?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-branch-name" className="text-muted-foreground">Branch Name</Label>
                <Input
                  id="edit-branch-name"
                  value={branchForm.name}
                  disabled
                  className="rounded-xl bg-slate-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-muted-foreground">Location</Label>
                <Input
                  id="edit-location"
                  value={branchForm.location}
                  disabled
                  className="rounded-xl bg-slate-100 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-muted-foreground">Physical Address</Label>
              <Input
                id="edit-address"
                value={branchForm.address}
                disabled
                className="rounded-xl bg-slate-100 cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-county" className="text-muted-foreground">County</Label>
                <Input
                  id="edit-county"
                  value={branchForm.county}
                  disabled
                  className="rounded-xl bg-slate-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-local-tax-office" className="text-muted-foreground">Local Tax Office</Label>
                <Input
                  id="edit-local-tax-office"
                  value={branchForm.localTaxOffice}
                  disabled
                  className="rounded-xl bg-slate-100 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kra-pin" className="text-muted-foreground">KRA PIN</Label>
              <Input
                id="edit-kra-pin"
                value={branchForm.kraPin}
                disabled
                className="rounded-xl bg-slate-100 cursor-not-allowed font-mono"
              />
              <p className="text-xs text-muted-foreground">
                KRA PIN is set during signup and cannot be changed.
              </p>
            </div>
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Editable Fields</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-controller-id">Controller ID (PTS ID)</Label>
                <Input
                  id="edit-controller-id"
                  placeholder="e.g., 003A003A..."
                  value={branchForm.controllerId}
                  onChange={(e) => setBranchForm({ ...branchForm, controllerId: e.target.value })}
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for the pump controller. Used to match pump callbacks to this branch.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-manager">Branch Manager</Label>
                <Input
                  id="edit-manager"
                  placeholder="Manager name"
                  value={branchForm.manager}
                  onChange={(e) => setBranchForm({ ...branchForm, manager: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="branch@flow360.com"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+254..."
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Staff Password Reset</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!editingBranch) return
                  const userEmail = prompt("Enter the email or username of the staff member:")
                  if (!userEmail) return
                  
                  try {
                    const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}&branch_id=${editingBranch.id}`)
                    const userData = await userRes.json()
                    
                    if (!userData.success || !userData.data || userData.data.length === 0) {
                      alert("User not found in this branch")
                      return
                    }
                    
                    const user = userData.data[0]
                    const currentUser = getCurrentUser()
                    
                    const resetRes = await fetch('/api/auth/reset/issue', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: user.id,
                        admin_id: currentUser?.id
                      })
                    })
                    
                    const resetData = await resetRes.json()
                    
                    if (resetData.success) {
                      alert(`Reset code for ${resetData.user.username}: ${resetData.code}\n\nThis code expires in ${resetData.expires_in_minutes} minutes.\n\nGive this code to the user to reset their password.`)
                    } else {
                      alert(resetData.error || "Failed to generate reset code")
                    }
                  } catch (error) {
                    console.error("Error generating reset code:", error)
                    alert("Error generating reset code")
                  }
                }}
                className="rounded-xl"
              >
                Generate Reset Code
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate a password reset code for a staff member in this branch
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => {
                if (editingBranch) {
                  handleDeleteBranch(editingBranch.id, editingBranch.name)
                  setEditBranchOpen(false)
                }
              }}
              className="rounded-xl"
            >
              Delete Branch
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditBranchOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBranch}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
                disabled={
                  !branchForm.name ||
                  !branchForm.location ||
                  !branchForm.county ||
                  !branchForm.localTaxOffice
                }
              >
                Update Branch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Hardware Inventory</DialogTitle>
            <DialogDescription>View all hardware assigned to branches</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Hardware inventory data will be displayed here. Navigate to the Inventory page for full details.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={globalUploadsOpen} onOpenChange={setGlobalUploadsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Global Uploads</DialogTitle>
            <DialogDescription>Upload meter readings and stock positions for all branches</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">File Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Excel or CSV file format</li>
                <li>Must include: Branch Name, Dispenser ID, Opening Meter Reading, Closing Meter Reading</li>
                <li>Must include: Tank ID, Opening Stock, Closing Stock</li>
                <li>One row per dispenser/tank reading</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Label htmlFor="upload-file">Select File *</Label>
              <Input
                id="upload-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="rounded-xl"
              />
              {uploadFile && <p className="text-sm text-muted-foreground">Selected: {uploadFile.name}</p>}
            </div>

            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="text-sm font-semibold mb-2">Sample Format</h4>
              <div className="text-xs font-mono bg-background p-3 rounded-lg overflow-x-auto">
                <div>Branch,Dispenser,Opening,Closing,Tank,Opening Stock,Closing Stock</div>
                <div>Nairobi,Dispenser 01,1000,1500,Tank 1,5000,4200</div>
                <div>Mombasa,Dispenser 02,2000,2300,Tank 2,6000,5800</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGlobalUploadsOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleGlobalUpload} disabled={!uploadFile} className="rounded-xl">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
