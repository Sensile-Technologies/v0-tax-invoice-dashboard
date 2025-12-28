"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Settings2, HardDrive, UserPlus, ClipboardList, Search, 
  Plus, Building2, Server, Check, AlertCircle, ExternalLink, MoreHorizontal, Pencil, Download, Smartphone, Trash2, Zap, Loader2
} from "lucide-react"
import {
  DropdownMenu as ActionsMenu,
  DropdownMenuContent as ActionsMenuContent,
  DropdownMenuItem as ActionsMenuItem,
  DropdownMenuTrigger as ActionsMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"

interface Hardware {
  id: string
  serial_number: string
  device_type: string
  branch_id: string | null
  branch_name: string | null
  merchant_name: string | null
  assigned_to: string | null
  assigned_user_name: string | null
  status: string
  assigned_at: string | null
  created_at: string
}

interface OnboardingRequest {
  id: string
  type: string
  merchant_id: string | null
  merchant_name: string
  trading_name: string | null
  kra_pin: string | null
  branch_id: string | null
  branch_name: string | null
  status: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  location: string | null
  county: string | null
  address: string | null
  created_at: string
}

interface SignupRequest {
  lead_id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  status: string
  sales_person_name: string | null
  created_at: string
  trading_name?: string
  kra_pin?: string
  location?: string
  county?: string
  address?: string
}

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("hardware")
  const [hardware, setHardware] = useState<Hardware[]>([])
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([])
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [hardwareDialogOpen, setHardwareDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedHardware, setSelectedHardware] = useState<Hardware | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null)
  const [selectedHardwareIds, setSelectedHardwareIds] = useState<string[]>([])
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false)
  const [bulkAssignMerchant, setBulkAssignMerchant] = useState("")
  const [bulkAssignBranch, setBulkAssignBranch] = useState("")
  const [newHardware, setNewHardware] = useState({
    serial_number: "",
    device_type: "token",
    status: "active",
    branch_id: "",
    assigned_to: ""
  })
  const [editHardwareDialogOpen, setEditHardwareDialogOpen] = useState(false)
  const [editHardware, setEditHardware] = useState<Hardware | null>(null)
  const [editMerchant, setEditMerchant] = useState("")
  const [addMerchant, setAddMerchant] = useState("")
  const [addBranches, setAddBranches] = useState<any[]>([])
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedSignup, setSelectedSignup] = useState<SignupRequest | null>(null)
  const [reviewData, setReviewData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    trading_name: "",
    kra_pin: "",
    location: "",
    county: "",
    address: ""
  })
  const [configData, setConfigData] = useState({
    device_token: "",
    bhf_id: "",
    server_address: "",
    server_port: "",
    hardware_type: "",
    hardware_serial: "",
    device_serial_number: "",
    sr_number: ""
  })
  const [initializingBranch, setInitializingBranch] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [hwRes, onboardRes, signupRes, merchantsRes] = await Promise.all([
        fetch("/api/admin/operations/hardware"),
        fetch("/api/admin/operations/onboarding"),
        fetch("/api/admin/operations/signups"),
        fetch("/api/admin/vendors")
      ])

      const hwData = await hwRes.json()
      const onboardData = await onboardRes.json()
      const signupData = await signupRes.json()
      const merchantsData = await merchantsRes.json()

      setHardware(Array.isArray(hwData) ? hwData : [])
      setOnboardingRequests(Array.isArray(onboardData) ? onboardData : [])
      setSignupRequests(Array.isArray(signupData) ? signupData : [])
      setMerchants(Array.isArray(merchantsData) ? merchantsData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async (merchantId: string) => {
    try {
      const response = await fetch(`/api/admin/vendors/${merchantId}/branches`)
      const data = await response.json()
      setBranches(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching branches:", error)
      setBranches([])
    }
  }

  const handleAddHardware = async () => {
    if (!newHardware.serial_number) {
      toast.error("Please enter a serial number")
      return
    }
    if (!addMerchant) {
      toast.error("Please select a merchant")
      return
    }
    if (!newHardware.branch_id) {
      toast.error("Please select a branch")
      return
    }

    try {
      const response = await fetch("/api/admin/operations/hardware", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial_number: newHardware.serial_number,
          device_type: newHardware.device_type,
          status: newHardware.status,
          branch_id: newHardware.branch_id,
          assigned_to: newHardware.assigned_to || null
        })
      })

      if (!response.ok) throw new Error("Failed to add hardware")

      toast.success("Hardware added successfully")
      setHardwareDialogOpen(false)
      setNewHardware({ serial_number: "", device_type: "token", status: "active", branch_id: "", assigned_to: "" })
      setAddMerchant("")
      setAddBranches([])
      fetchData()
    } catch (error) {
      toast.error("Failed to add hardware")
    }
  }

  const handleEditHardware = async () => {
    if (!editHardware) return

    try {
      const response = await fetch("/api/admin/operations/hardware", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editHardware.id,
          serial_number: editHardware.serial_number,
          device_type: editHardware.device_type,
          status: editHardware.status
        })
      })

      if (!response.ok) throw new Error("Failed to update hardware")

      toast.success("Hardware updated successfully")
      setEditHardwareDialogOpen(false)
      setEditHardware(null)
      fetchData()
    } catch (error) {
      toast.error("Failed to update hardware")
    }
  }

  const handleSaveSignupChanges = async (leadId: string) => {
    try {
      const response = await fetch("/api/admin/operations/signups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, ...reviewData })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message) {
          toast.error(data.message)
        } else {
          toast.error(data.error || "Failed to save changes")
        }
        return
      }

      toast.success("Changes saved successfully")
      setReviewDialogOpen(false)
      setSelectedSignup(null)
      fetchData()
    } catch (error) {
      toast.error("Failed to save changes")
    }
  }

  const handleRemoveSignupRequest = async (leadId: string, companyName: string) => {
    if (!confirm(`Remove "${companyName}" from signup requests? This will move the lead back to the contracting stage in the sales pipeline.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/operations/signups?id=${leadId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to remove from signup requests")
        return
      }

      toast.success("Lead moved back to contracting stage")
      fetchData()
    } catch (error) {
      toast.error("Failed to remove from signup requests")
    }
  }

  const openReviewDialog = (signup: SignupRequest) => {
    setSelectedSignup(signup)
    setReviewData({
      company_name: signup.company_name || "",
      contact_name: signup.contact_name || "",
      email: signup.email || "",
      phone: signup.phone || "",
      trading_name: signup.trading_name || "",
      kra_pin: signup.kra_pin || "",
      location: signup.location || "",
      county: signup.county || "",
      address: signup.address || ""
    })
    setReviewDialogOpen(true)
  }

  const handleAssignHardware = async (branchId: string) => {
    if (!selectedHardware) return

    try {
      const response = await fetch("/api/admin/operations/hardware", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedHardware.id, branch_id: branchId })
      })

      if (!response.ok) throw new Error("Failed to assign hardware")

      toast.success("Hardware assigned successfully")
      setAssignDialogOpen(false)
      setSelectedHardware(null)
      fetchData()
    } catch (error) {
      toast.error("Failed to assign hardware")
    }
  }

  const handleBulkAssign = async () => {
    if (selectedHardwareIds.length === 0 || !bulkAssignBranch) {
      toast.error("Please select hardware and a branch")
      return
    }

    try {
      let successCount = 0
      let failCount = 0
      
      for (const hwId of selectedHardwareIds) {
        const response = await fetch("/api/admin/operations/hardware", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: hwId, branch_id: bulkAssignBranch })
        })
        
        if (response.ok) {
          successCount++
        } else {
          failCount++
        }
      }

      if (failCount > 0) {
        toast.warning(`${successCount} device(s) assigned, ${failCount} failed`)
      } else {
        toast.success(`${successCount} device(s) assigned successfully`)
      }
      
      setBulkAssignDialogOpen(false)
      setSelectedHardwareIds([])
      setBulkAssignMerchant("")
      setBulkAssignBranch("")
      fetchData()
    } catch (error) {
      toast.error("Failed to assign hardware")
    }
  }

  const toggleHardwareSelection = (hwId: string) => {
    setSelectedHardwareIds(prev =>
      prev.includes(hwId) ? prev.filter(id => id !== hwId) : [...prev, hwId]
    )
  }

  const availableHardware = hardware.filter(h => h.status === 'available')

  const handleConfigureOnboarding = async () => {
    if (!selectedRequest) {
      console.error("[Onboarding] No selected request")
      toast.error("No request selected")
      return
    }

    console.log("[Onboarding] Saving configuration for:", selectedRequest.id, configData)

    try {
      const response = await fetch("/api/admin/operations/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRequest.id,
          branch_id: selectedRequest.branch_id,
          ...configData
        })
      })

      console.log("[Onboarding] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[Onboarding] Error:", errorData)
        throw new Error(errorData.error || "Failed to configure")
      }

      const result = await response.json()
      console.log("[Onboarding] Success:", result)
      
      toast.success("Configuration saved successfully")
      setConfigDialogOpen(false)
      setSelectedRequest(null)
      setConfigData({ device_token: "", bhf_id: "", server_address: "", server_port: "", hardware_type: "", hardware_serial: "", device_serial_number: "", sr_number: "" })
      fetchData()
    } catch (error: any) {
      console.error("[Onboarding] Error:", error)
      toast.error(error.message || "Failed to save configuration")
    }
  }

  const handleInitializeBranch = async () => {
    if (!selectedRequest?.branch_id) {
      toast.error("Branch ID not available for initialization")
      return
    }

    setInitializingBranch(true)
    try {
      const response = await fetch("/api/kra/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: selectedRequest.branch_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to initialize")
        return
      }

      if (result.success) {
        toast.success("KRA initialization successful - logged to branch profile")
      } else {
        toast.warning("KRA initialization completed with errors - check branch logs")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize branch")
    } finally {
      setInitializingBranch(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800"
      case "assigned": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-green-100 text-green-800"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  const filteredHardware = hardware.filter(h =>
    h.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
    h.merchant_name?.toLowerCase().includes(search.toLowerCase()) ||
    h.branch_name?.toLowerCase().includes(search.toLowerCase())
  )

  const signupInstructions = `
## Merchant Signup Instructions

### Step 1: Account Creation
1. Go to the Flow360 portal at https://flow360.co.ke
2. Click on "Sign Up" or "Register"
3. Fill in company details:
   - Company Name
   - Business Registration Number
   - KRA PIN
   - Primary Contact Email
   - Phone Number

### Step 2: Branch Setup
1. After account creation, log in to the dashboard
2. Navigate to "Branches" section
3. Click "Add Branch" for each fuel station location
4. Provide:
   - Branch Name
   - Physical Address
   - County/Town

### Step 3: Operations Configuration
1. Contact the Operations team to receive:
   - Device Token
   - BHF ID (Branch Fiscal ID)
   - Server Address and Port
2. These will be configured by our team after hardware assignment

### Step 4: Hardware Installation
1. Our team will ship the assigned hardware token
2. Installation guide will be provided with the device
3. Technical support available at support@flow360.co.ke

### Support
- Email: support@flow360.co.ke
- Phone: +254 700 000 000
- WhatsApp: +254 700 000 000
`

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operations</h1>
          <p className="text-slate-600 mt-1">Manage hardware, onboarding, and merchant signups</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hardware">
            <HardDrive className="h-4 w-4 mr-2" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <ClipboardList className="h-4 w-4 mr-2" />
            Onboarding Requests
            {onboardingRequests.length > 0 && (
              <Badge className="ml-2 bg-orange-500">{onboardingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="signups">
            <UserPlus className="h-4 w-4 mr-2" />
            Signup Requests
            {signupRequests.length > 0 && (
              <Badge className="ml-2 bg-blue-500">{signupRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hardware" className="space-y-4 mt-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Flow360 Mobile App (APK)</h3>
                  <p className="text-sm text-slate-600">Download and install on Sunmi V2S POS devices</p>
                </div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="https://expo.dev/artifacts/eas/dcUYY5o4dxff5X3VZU23f8.apk" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download APK
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search hardware..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {selectedHardwareIds.length > 0 && (
                <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Building2 className="h-4 w-4 mr-2" />
                      Assign {selectedHardwareIds.length} Device(s)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Hardware to Branch</DialogTitle>
                      <DialogDescription>Assign {selectedHardwareIds.length} selected device(s) to a branch</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Merchant</Label>
                        <Select
                          value={bulkAssignMerchant}
                          onValueChange={(v) => {
                            setBulkAssignMerchant(v)
                            setBulkAssignBranch("")
                            fetchBranches(v)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select merchant" />
                          </SelectTrigger>
                          <SelectContent>
                            {merchants.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {bulkAssignMerchant && (
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Select
                            value={bulkAssignBranch}
                            onValueChange={setBulkAssignBranch}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>{b.bhf_nm || b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button onClick={handleBulkAssign} className="w-full" disabled={!bulkAssignBranch}>
                        Assign to Branch
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={hardwareDialogOpen} onOpenChange={setHardwareDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hardware
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Hardware</DialogTitle>
                    <DialogDescription>Register a new hardware device</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Serial Number *</Label>
                      <Input
                        value={newHardware.serial_number}
                        onChange={(e) => setNewHardware({ ...newHardware, serial_number: e.target.value })}
                        placeholder="SN-XXXX-XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Device Type *</Label>
                      <Select
                        value={newHardware.device_type}
                        onValueChange={(v) => setNewHardware({ ...newHardware, device_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="token">Hardware Token</SelectItem>
                          <SelectItem value="printer">Fiscal Printer</SelectItem>
                          <SelectItem value="terminal">POS Terminal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={newHardware.status}
                        onValueChange={(v) => setNewHardware({ ...newHardware, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Merchant *</Label>
                      <Select
                        value={addMerchant}
                        onValueChange={(v) => {
                          setAddMerchant(v)
                          setNewHardware({ ...newHardware, branch_id: "" })
                          fetch(`/api/admin/vendors/${v}/branches`)
                            .then(res => res.json())
                            .then(data => setAddBranches(Array.isArray(data) ? data : []))
                            .catch(() => setAddBranches([]))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select merchant" />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Branch *</Label>
                      <Select
                        value={newHardware.branch_id}
                        onValueChange={(v) => setNewHardware({ ...newHardware, branch_id: v })}
                        disabled={!addMerchant}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={addMerchant ? "Select branch" : "Select merchant first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {addBranches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddHardware} className="w-full">
                      Add Hardware
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={availableHardware.length > 0 && selectedHardwareIds.length === availableHardware.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedHardwareIds(availableHardware.map(h => h.id))
                          } else {
                            setSelectedHardwareIds([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHardware.map((hw) => (
                    <TableRow key={hw.id}>
                      <TableCell>
                        {hw.status === 'available' && (
                          <Checkbox
                            checked={selectedHardwareIds.includes(hw.id)}
                            onCheckedChange={() => toggleHardwareSelection(hw.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">{hw.serial_number}</TableCell>
                      <TableCell className="capitalize">{hw.device_type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(hw.status)}>{hw.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {hw.branch_name ? (
                          <div>
                            <div className="font-medium">{hw.branch_name}</div>
                            {hw.merchant_name && <div className="text-sm text-slate-500">{hw.merchant_name}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(hw.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <ActionsMenu>
                          <ActionsMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </ActionsMenuTrigger>
                          <ActionsMenuContent align="end">
                            <ActionsMenuItem
                              onClick={() => {
                                setEditHardware(hw)
                                setEditHardwareDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </ActionsMenuItem>
                            <ActionsMenuItem
                              onClick={() => {
                                setSelectedHardware(hw)
                                setAssignDialogOpen(true)
                              }}
                            >
                              <Building2 className="h-4 w-4 mr-2" />
                              {hw.branch_id ? 'Reassign' : 'Assign'}
                            </ActionsMenuItem>
                          </ActionsMenuContent>
                        </ActionsMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredHardware.length === 0 && (
            <div className="text-center py-12">
              <HardDrive className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hardware registered yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {onboardingRequests.map((request) => (
              <Card key={request.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{request.merchant_name}</span>
                          <Badge className="bg-orange-100 text-orange-700">Pending Onboarding</Badge>
                        </div>
                        {request.trading_name && (
                          <div className="text-sm text-slate-600">
                            Trading Name: {request.trading_name}
                          </div>
                        )}
                        {request.kra_pin && (
                          <div className="text-sm text-slate-600">
                            KRA PIN: {request.kra_pin}
                          </div>
                        )}
                        <div className="text-sm text-slate-500">
                          {request.contact_name && `Contact: ${request.contact_name}`}
                          {request.contact_email && ` - ${request.contact_email}`}
                          {request.contact_phone && ` - ${request.contact_phone}`}
                        </div>
                        <div className="text-sm text-slate-500">
                          {request.location && `${request.location}`}
                          {request.county && `, ${request.county}`}
                          {(request.location || request.county) && ` - `}
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedRequest(request)
                        setConfigDialogOpen(true)
                      }}
                    >
                      <Server className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {onboardingRequests.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No leads pending onboarding configuration</p>
              <p className="text-sm text-slate-400 mt-2">Leads that have signed up will appear here for configuration</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="signups" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pending Signups (Onboarding Stage)</h2>
              {signupRequests.map((request) => (
                <Card key={request.lead_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{request.company_name}</div>
                          <div className="text-sm text-slate-500">
                            {request.contact_name} - {request.email}
                          </div>
                          <div className="text-sm text-slate-500">
                            {request.phone}
                            {request.sales_person_name && ` - Sales: ${request.sales_person_name}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" onClick={() => openReviewDialog(request)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleRemoveSignupRequest(request.lead_id, request.company_name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {signupRequests.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No pending signup requests</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Signup Instructions</CardTitle>
                  <CardDescription>Guide for merchants on how to sign up</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="font-semibold text-base mb-2">Step 1: Account Creation</h3>
                        <ol className="list-decimal list-inside space-y-1 text-slate-600">
                          <li>Go to the Flow360 portal</li>
                          <li>Click on "Sign Up" or "Register"</li>
                          <li>Fill in company details (Name, KRA PIN, Email, Phone)</li>
                        </ol>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-2">Step 2: Branch Setup</h3>
                        <ol className="list-decimal list-inside space-y-1 text-slate-600">
                          <li>Log in to the dashboard</li>
                          <li>Navigate to "Branches" section</li>
                          <li>Add each fuel station location</li>
                        </ol>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-2">Step 3: Operations Configuration</h3>
                        <ol className="list-decimal list-inside space-y-1 text-slate-600">
                          <li>Contact Operations team for Device Token, BHF ID</li>
                          <li>Receive Server Address and Port</li>
                          <li>Configuration done by Operations team</li>
                        </ol>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-2">Support</h3>
                        <ul className="space-y-1 text-slate-600">
                          <li>Email: support@flow360.co.ke</li>
                          <li>Phone: +254 700 000 000</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Hardware</DialogTitle>
            <DialogDescription>
              Assign {selectedHardware?.serial_number} to a branch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Select onValueChange={(v) => fetchBranches(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select onValueChange={handleAssignHardware}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.bhf_nm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Onboarding</DialogTitle>
            <DialogDescription>
              Configure device settings for {selectedRequest?.merchant_name}
              {selectedRequest?.branch_name && ` - ${selectedRequest.branch_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(selectedRequest?.trading_name || selectedRequest?.kra_pin) && (
              <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                <div className="text-sm font-medium text-slate-700">Business Details</div>
                {selectedRequest?.trading_name && (
                  <div className="text-sm text-slate-600">Trading Name: <span className="font-medium">{selectedRequest.trading_name}</span></div>
                )}
                {selectedRequest?.kra_pin && (
                  <div className="text-sm text-slate-600">KRA PIN: <span className="font-medium">{selectedRequest.kra_pin}</span></div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Device Token</Label>
              <Input
                value={configData.device_token}
                onChange={(e) => setConfigData({ ...configData, device_token: e.target.value })}
                placeholder="Enter device token"
              />
            </div>
            <div className="space-y-2">
              <Label>BHF ID (Branch Fiscal ID)</Label>
              <Input
                value={configData.bhf_id}
                onChange={(e) => setConfigData({ ...configData, bhf_id: e.target.value })}
                placeholder="e.g., 01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Server Address</Label>
                <Input
                  value={configData.server_address}
                  onChange={(e) => setConfigData({ ...configData, server_address: e.target.value })}
                  placeholder="api.kra.go.ke"
                />
              </div>
              <div className="space-y-2">
                <Label>Server Port</Label>
                <Input
                  value={configData.server_port}
                  onChange={(e) => setConfigData({ ...configData, server_port: e.target.value })}
                  placeholder="8080"
                />
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <Label className="text-base font-semibold mb-3 block">Device Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Serial Number</Label>
                  <Input
                    value={configData.device_serial_number}
                    onChange={(e) => setConfigData({ ...configData, device_serial_number: e.target.value })}
                    placeholder="Device serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SR Number</Label>
                  <Input
                    value={configData.sr_number}
                    onChange={(e) => setConfigData({ ...configData, sr_number: e.target.value })}
                    placeholder="SR number"
                  />
                </div>
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <Label className="text-base font-semibold mb-3 block">Hardware Assignment</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hardware Type</Label>
                  <Select
                    value={configData.hardware_type}
                    onValueChange={(v) => setConfigData({ ...configData, hardware_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="token">Hardware Token</SelectItem>
                      <SelectItem value="printer">Fiscal Printer</SelectItem>
                      <SelectItem value="terminal">POS Terminal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    value={configData.hardware_serial}
                    onChange={(e) => setConfigData({ ...configData, hardware_serial: e.target.value })}
                    placeholder="SN-XXXX-XXXX"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Hardware will be registered and assigned to this branch when configuration is saved.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleInitializeBranch}
                disabled={initializingBranch}
                className="gap-2"
              >
                {initializingBranch ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Initialize
              </Button>
              <Button onClick={handleConfigureOnboarding} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Signup Request</DialogTitle>
            <DialogDescription>
              Review and edit details before moving to onboarding
            </DialogDescription>
          </DialogHeader>
          {selectedSignup && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={reviewData.company_name}
                    onChange={(e) => setReviewData({ ...reviewData, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trading Name</Label>
                  <Input
                    value={reviewData.trading_name}
                    onChange={(e) => setReviewData({ ...reviewData, trading_name: e.target.value })}
                    placeholder="Trading/Business Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name *</Label>
                  <Input
                    value={reviewData.contact_name}
                    onChange={(e) => setReviewData({ ...reviewData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KRA PIN</Label>
                  <Input
                    value={reviewData.kra_pin}
                    onChange={(e) => setReviewData({ ...reviewData, kra_pin: e.target.value })}
                    placeholder="e.g., P051234567Z"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={reviewData.email}
                    onChange={(e) => setReviewData({ ...reviewData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={reviewData.phone}
                    onChange={(e) => setReviewData({ ...reviewData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={reviewData.location}
                    onChange={(e) => setReviewData({ ...reviewData, location: e.target.value })}
                    placeholder="Town/Area"
                  />
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Input
                    value={reviewData.county}
                    onChange={(e) => setReviewData({ ...reviewData, county: e.target.value })}
                    placeholder="County"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={reviewData.address}
                  onChange={(e) => setReviewData({ ...reviewData, address: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => handleSaveSignupChanges(selectedSignup.lead_id)} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editHardwareDialogOpen} onOpenChange={setEditHardwareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hardware</DialogTitle>
            <DialogDescription>Update hardware device details</DialogDescription>
          </DialogHeader>
          {editHardware && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  value={editHardware.serial_number}
                  onChange={(e) => setEditHardware({ ...editHardware, serial_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select
                  value={editHardware.device_type}
                  onValueChange={(v) => setEditHardware({ ...editHardware, device_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token">Hardware Token</SelectItem>
                    <SelectItem value="printer">Fiscal Printer</SelectItem>
                    <SelectItem value="terminal">POS Terminal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editHardware.status}
                  onValueChange={(v) => setEditHardware({ ...editHardware, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditHardware} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
