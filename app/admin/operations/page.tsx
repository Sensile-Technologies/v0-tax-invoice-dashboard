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
import { 
  Settings2, HardDrive, UserPlus, ClipboardList, Search, 
  Plus, Building2, Server, Check, AlertCircle, ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Hardware {
  id: string
  serial_number: string
  device_type: string
  branch_id: string | null
  branch_name: string | null
  merchant_name: string | null
  status: string
  assigned_at: string | null
  created_at: string
}

interface OnboardingRequest {
  id: string
  type: string
  merchant_id: string
  merchant_name: string
  branch_id: string | null
  branch_name: string | null
  status: string
  created_at: string
}

interface SignupRequest {
  id: string
  lead_id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  status: string
  sales_person_name: string | null
  created_at: string
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
  const [newHardware, setNewHardware] = useState({
    serial_number: "",
    device_type: "token"
  })
  const [configData, setConfigData] = useState({
    device_token: "",
    bhf_id: "",
    server_address: "",
    server_port: ""
  })

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

    try {
      const response = await fetch("/api/admin/operations/hardware", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHardware)
      })

      if (!response.ok) throw new Error("Failed to add hardware")

      toast.success("Hardware added successfully")
      setHardwareDialogOpen(false)
      setNewHardware({ serial_number: "", device_type: "token" })
      fetchData()
    } catch (error) {
      toast.error("Failed to add hardware")
    }
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

  const handleConfigureOnboarding = async () => {
    if (!selectedRequest) return

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

      if (!response.ok) throw new Error("Failed to configure")

      toast.success("Configuration saved successfully")
      setConfigDialogOpen(false)
      setSelectedRequest(null)
      setConfigData({ device_token: "", bhf_id: "", server_address: "", server_port: "" })
      fetchData()
    } catch (error) {
      toast.error("Failed to save configuration")
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
            {onboardingRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-orange-500">{onboardingRequests.filter(r => r.status === 'pending').length}</Badge>
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
            <Dialog open={hardwareDialogOpen} onOpenChange={setHardwareDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hardware
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Hardware</DialogTitle>
                  <DialogDescription>Register a new hardware device</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      value={newHardware.serial_number}
                      onChange={(e) => setNewHardware({ ...newHardware, serial_number: e.target.value })}
                      placeholder="SN-XXXX-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Device Type</Label>
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
                  <Button onClick={handleAddHardware} className="w-full">
                    Add Hardware
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredHardware.map((hw) => (
              <Card key={hw.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <HardDrive className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{hw.serial_number}</span>
                          <Badge className={getStatusColor(hw.status)}>{hw.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                          {hw.device_type} 
                          {hw.branch_name && ` - ${hw.branch_name}`}
                          {hw.merchant_name && ` (${hw.merchant_name})`}
                        </div>
                      </div>
                    </div>
                    {hw.status === 'available' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedHardware(hw)
                          setAssignDialogOpen(true)
                        }}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
              <Card key={request.id} className={request.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${request.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'}`}>
                        {request.status === 'pending' ? (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{request.merchant_name}</span>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                          {request.type === 'new_merchant' ? 'New Merchant Registration' : `New Branch: ${request.branch_name}`}
                          <span className="mx-2">-</span>
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request)
                          setConfigDialogOpen(true)
                        }}
                      >
                        <Server className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {onboardingRequests.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No pending onboarding requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="signups" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pending Signups (Onboarding Stage)</h2>
              {signupRequests.map((request) => (
                <Card key={request.id}>
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
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
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

            <div>
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
              Assign device token, BHF ID, and server settings for {selectedRequest?.merchant_name}
              {selectedRequest?.branch_name && ` - ${selectedRequest.branch_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <Button onClick={handleConfigureOnboarding} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
