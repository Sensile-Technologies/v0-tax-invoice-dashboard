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
} from "@/components/ui/dialog" // Added DialogFooter
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
} from "@/components/ui/dropdown-menu" // Added DropdownMenuSub components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"

import { GlobalShiftUploadDialog } from "@/components/global-shift-upload-dialog"
import { useCurrency } from "@/lib/currency-utils" // Added useCurrency hook
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
  branchPerformance: { branch: string; sales: number; purchases: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
}

export default function HeadquartersPage() {
  const router = useRouter()
  const [createBranchOpen, setCreateBranchOpen] = useState(false)
  const [editBranchOpen, setEditBranchOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [globalUploadsOpen, setGlobalUploadsOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const [branches, setBranches] = useState<any[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)

  const [globalShiftUploadOpen, setGlobalShiftUploadOpen] = useState(false)

  const [hqStats, setHqStats] = useState<HQStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const [endAllShiftsOpen, setEndAllShiftsOpen] = useState(false)
  const [activeShifts, setActiveShifts] = useState<any[]>([])
  const [isLoadingActiveShifts, setIsLoadingActiveShifts] = useState(false)
  const [endingShifts, setEndingShifts] = useState(false)
  const [shiftFormData, setShiftFormData] = useState<Record<string, {
    closing_cash: string
    nozzle_readings: Record<string, string>
    tank_stocks: Record<string, { closing_reading: string; stock_received: string }>
  }>>({})

  const { formatCurrency } = useCurrency()

  useEffect(() => {
    fetchBranches()
    fetchHQStats()
  }, [])

  const fetchHQStats = async () => {
    try {
      setIsLoadingStats(true)
      const currentUser = getCurrentUser()
      const userId = currentUser?.id
      const url = userId ? `/api/headquarters/stats?user_id=${userId}` : '/api/headquarters/stats'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setHqStats(data)
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
          revenue: branch.monthly_revenue || 4250000,
          monthToDateRevenue: branch.mtd_revenue || 2450000,
          currentShiftRevenue: branch.current_shift_revenue || 145000,
          transactions: branch.transactions || 1245,
          inventory: branch.inventory || 342,
          performance: branch.performance || "+12.5%",
          gradient: "from-blue-600 via-blue-500 to-cyan-400",
          manager: branch.manager,
          phone: branch.phone,
          email: branch.email,
          bhfId: branch.bhf_id,
          tankConfig: branch.tank_config || {},
          storageIndices: branch.storage_indices || [],
          device_token: branch.device_token,
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

  const fetchActiveShifts = async () => {
    try {
      setIsLoadingActiveShifts(true)
      const currentUser = getCurrentUser()
      const userId = currentUser?.id
      const url = userId ? `/api/shifts/end-all?user_id=${userId}` : '/api/shifts/end-all'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const shifts = data.data || []
        setActiveShifts(shifts)
        
        const initialFormData: Record<string, any> = {}
        for (const shift of shifts) {
          const nozzleReadings: Record<string, string> = {}
          for (const nozzle of shift.nozzles || []) {
            nozzleReadings[nozzle.id] = nozzle.current_reading?.toString() || ''
          }
          const tankStocks: Record<string, { closing_reading: string; stock_received: string }> = {}
          for (const tank of shift.tanks || []) {
            tankStocks[tank.id] = {
              closing_reading: tank.current_stock?.toString() || '',
              stock_received: ''
            }
          }
          initialFormData[shift.id] = {
            closing_cash: '',
            nozzle_readings: nozzleReadings,
            tank_stocks: tankStocks
          }
        }
        setShiftFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error fetching active shifts:', error)
    } finally {
      setIsLoadingActiveShifts(false)
    }
  }

  const openEndAllShiftsDialog = () => {
    fetchActiveShifts()
    setEndAllShiftsOpen(true)
  }

  const updateShiftClosingCash = (shiftId: string, value: string) => {
    setShiftFormData(prev => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        closing_cash: value
      }
    }))
  }

  const updateNozzleReading = (shiftId: string, nozzleId: string, value: string) => {
    setShiftFormData(prev => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        nozzle_readings: {
          ...prev[shiftId]?.nozzle_readings,
          [nozzleId]: value
        }
      }
    }))
  }

  const updateTankStock = (shiftId: string, tankId: string, field: 'closing_reading' | 'stock_received', value: string) => {
    setShiftFormData(prev => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        tank_stocks: {
          ...prev[shiftId]?.tank_stocks,
          [tankId]: {
            ...prev[shiftId]?.tank_stocks?.[tankId],
            [field]: value
          }
        }
      }
    }))
  }

  const handleEndAllShifts = async () => {
    if (activeShifts.length === 0) return

    setEndingShifts(true)
    try {
      const shiftsPayload = activeShifts.map(shift => {
        const formData = shiftFormData[shift.id] || {}
        return {
          id: shift.id,
          closing_cash: parseFloat(formData.closing_cash) || 0,
          nozzle_readings: Object.entries(formData.nozzle_readings || {}).map(([nozzle_id, closing_reading]) => ({
            nozzle_id,
            closing_reading: parseFloat(closing_reading as string) || 0
          })),
          tank_stocks: Object.entries(formData.tank_stocks || {}).map(([tank_id, data]) => ({
            tank_id,
            closing_reading: parseFloat((data as any).closing_reading) || 0,
            stock_received: parseFloat((data as any).stock_received) || 0
          }))
        }
      })

      const response = await fetch('/api/shifts/end-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shifts: shiftsPayload })
      })

      const result = await response.json()

      if (result.success) {
        const closedCount = result.data?.closed?.length || 0
        const errorCount = result.data?.errors?.length || 0
        
        if (errorCount > 0) {
          alert(`Successfully ended ${closedCount} shift(s). ${errorCount} shift(s) had errors.`)
        } else {
          alert(`Successfully ended ${closedCount} shift(s) across all branches.`)
        }
        
        setEndAllShiftsOpen(false)
        setActiveShifts([])
        setShiftFormData({})
      } else {
        alert(`Failed to end shifts: ${result.error}`)
      }
    } catch (error) {
      console.error('Error ending shifts:', error)
      alert('An error occurred while ending shifts.')
    } finally {
      setEndingShifts(false)
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
      // Navigate to sales page with branch context (can be expanded to dedicated branch pages)
      router.push(`/sales?branch=${branchId}`)
    }
  }

  const handleOpenCreateDialog = () => {
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
      const branchRes = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: branchForm.name,
          location: branchForm.location,
          manager: branchForm.manager,
          email: branchForm.email,
          phone: branchForm.phone,
          status: "active",
          storage_indices: branchForm.storageIndices,
          county: branchForm.county,
          address: branchForm.address,
          local_tax_office: branchForm.localTaxOffice,
        })
      })
      
      const branchResult = await branchRes.json()

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
    const latestBranch = branches.find((b) => b.id === branch.id)
    setEditingBranch(latestBranch || branch)
    setBranchForm({
      name: branch.name || "",
      location: branch.location || "",
      manager: branch.manager || "",
      email: branch.email || "",
      phone: branch.phone || "",
      address: branch.address || "",
      county: branch.county || "",
      localTaxOffice: branch.local_tax_office || "",
      hardwareType: "",
      serialNumber: "",
      storageIndices: branch.storage_indices || [],
      newStorageIndex: "",
      tankConfig: branch.tank_config || {},
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardHeader currentBranch="hq" />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white">Headquarters Overview</h1>
            <p className="mt-1 text-white/80 text-pretty">Monitor all branches and organization performance</p>
          </div>
          <div className="flex gap-3">
            {/* Branches Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl bg-white hover:bg-gray-50">
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
                <Button variant="outline" className="gap-2 rounded-xl bg-white hover:bg-gray-50">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl bg-white hover:bg-gray-50">
                  <Clock className="mr-2 h-4 w-4" />
                  Shift Management
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem onSelect={openEndAllShiftsDialog} className="cursor-pointer rounded-lg text-red-600">
                  <StopCircle className="mr-2 h-4 w-4" />
                  End All Shifts
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setGlobalShiftUploadOpen(true)} className="cursor-pointer rounded-lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Global Shift Upload
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <a href="/reports/shifts">
                    <FileText className="mr-2 h-4 w-4" />
                    View Shift Reports
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
                <Label htmlFor="edit-branch-name">Branch Name *</Label>
                <Input
                  id="edit-branch-name"
                  placeholder="e.g., Nairobi Branch"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  placeholder="e.g., Nairobi, Kenya"
                  value={branchForm.location}
                  onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Physical Address</Label>
              <Input
                id="edit-address"
                placeholder="Street address, building, floor"
                value={branchForm.address}
                onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                className="rounded-xl"
              />
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

      <GlobalShiftUploadDialog open={globalShiftUploadOpen} onOpenChange={setGlobalShiftUploadOpen} />

      <Dialog open={endAllShiftsOpen} onOpenChange={setEndAllShiftsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <StopCircle className="h-5 w-5 text-red-500" />
              End All Active Shifts
            </DialogTitle>
            <DialogDescription>
              Close all active shifts across all branches. This will end the current shifts and start new ones.
            </DialogDescription>
          </DialogHeader>

          {isLoadingActiveShifts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Loading active shifts...</span>
            </div>
          ) : activeShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No Active Shifts</p>
              <p className="text-sm">There are no active shifts to end at this time.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{activeShifts.length} active shift(s) will be ended</span>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full" defaultValue={activeShifts.map(s => s.id)}>
                  {activeShifts.map((shift) => {
                    const formData = shiftFormData[shift.id] || { closing_cash: '', nozzle_readings: {}, tank_stocks: {} }
                    return (
                      <AccordionItem key={shift.id} value={shift.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-blue-500" />
                              <div className="text-left">
                                <p className="font-semibold">{shift.branch_name}</p>
                                <p className="text-sm text-slate-500">
                                  Started: {formatDateTime(shift.start_time)} | Sales: {formatCurrency(parseFloat(shift.total_sales) || 0)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                            <div className="space-y-2">
                              <Label>Closing Cash (KES)</Label>
                              <Input
                                type="number"
                                placeholder="Enter closing cash amount"
                                value={formData.closing_cash}
                                onChange={(e) => updateShiftClosingCash(shift.id, e.target.value)}
                                className="rounded-xl"
                              />
                            </div>

                            {shift.nozzles && shift.nozzles.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold">Nozzle Readings</Label>
                                  <div className="grid gap-2">
                                    {shift.nozzles.map((nozzle: any) => (
                                      <div key={nozzle.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            D{nozzle.dispenser_number} N{nozzle.nozzle_number} - {nozzle.fuel_type}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            Current: {parseFloat(nozzle.current_reading || 0).toLocaleString()}
                                          </p>
                                        </div>
                                        <Input
                                          type="number"
                                          placeholder="Closing"
                                          value={formData.nozzle_readings[nozzle.id] || ''}
                                          onChange={(e) => updateNozzleReading(shift.id, nozzle.id, e.target.value)}
                                          className="w-32 rounded-xl"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {shift.tanks && shift.tanks.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold">Tank Volumes</Label>
                                  <div className="grid gap-2">
                                    {shift.tanks.map((tank: any) => (
                                      <div key={tank.id} className="p-2 bg-white rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-medium">{tank.tank_name} - {tank.fuel_type}</p>
                                            <p className="text-xs text-slate-500">
                                              Current: {parseFloat(tank.current_stock || 0).toLocaleString()}L / {parseFloat(tank.capacity || 0).toLocaleString()}L
                                            </p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs text-slate-500">Closing Stock (L)</Label>
                                            <Input
                                              type="number"
                                              placeholder="Closing"
                                              value={formData.tank_stocks[tank.id]?.closing_reading || ''}
                                              onChange={(e) => updateTankStock(shift.id, tank.id, 'closing_reading', e.target.value)}
                                              className="rounded-xl"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs text-slate-500">Stock Received (L)</Label>
                                            <Input
                                              type="number"
                                              placeholder="0"
                                              value={formData.tank_stocks[tank.id]?.stock_received || ''}
                                              onChange={(e) => updateTankStock(shift.id, tank.id, 'stock_received', e.target.value)}
                                              className="rounded-xl"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEndAllShiftsOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndAllShifts}
              disabled={endingShifts || activeShifts.length === 0}
              className="rounded-xl"
            >
              {endingShifts ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ending Shifts...
                </>
              ) : (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  End All Shifts ({activeShifts.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
