"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Upload, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterCustomerPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [currentBranch, setCurrentBranch] = useState<any>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    pin: "",
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
    branchScope: "current" as "current" | "all",
  })

  useEffect(() => {
    fetchBranches()
    loadCurrentBranch()
    const interval = setInterval(() => {
      loadCurrentBranch()
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadCurrentBranch = () => {
    const storedBranch = localStorage.getItem("selectedBranch")
    if (storedBranch) {
      try {
        const branchData = JSON.parse(storedBranch)
        setCurrentBranch(branchData)
      } catch (error) {
        console.error("[v0] Error parsing stored branch:", error)
      }
    }
  }

  const fetchBranches = async () => {
    try {
      // Use branches/list which has proper vendor scoping
      const response = await fetch('/api/branches/list')
      const result = await response.json()

      // branches/list returns array directly, not wrapped in success/data
      const branchesData = Array.isArray(result) ? result : (result.data || [])
      setBranches(branchesData)

      if (branchesData.length > 0) {
        const storedBranch = localStorage.getItem("selectedBranch")
        if (!storedBranch) {
          setCurrentBranch(branchesData[0])
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = `PIN,Customer Name,Email,Phone,Address,City,Postal Code,Notes,Branch
P051234567A,Sample Customer,customer@example.com,+254 700 000000,123 Main Street,Nairobi,00100,Sample notes,current
P051234568B,Another Customer,another@example.com,+254 700 000001,456 Oak Avenue,Mombasa,80100,More notes,all`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "customer_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: "Customer CSV template with branch selection has been downloaded.",
    })
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCsv(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").slice(1)

      const customersToInsert = []

      for (const line of lines) {
        if (!line.trim()) continue

        const [pin, name, email, phone, address, city, postalCode, notes, branchScope] = line.split(",")
        const scope = branchScope?.trim().toLowerCase()

        const customerBase = {
          tin: pin?.trim(),
          cust_tin: pin?.trim(),
          cust_nm: name?.trim(),
          email: email?.trim() || null,
          tel_no: phone?.trim() || null,
          adrs: `${address?.trim() || ""}, ${city?.trim() || ""}, ${postalCode?.trim() || ""}`.trim() || null,
          remark: notes?.trim() || null,
          use_yn: "Y",
        }

        if (scope === "all") {
          for (const branch of branches) {
            customersToInsert.push({
              ...customerBase,
              branch_id: branch.id,
              bhf_id: branch.bhf_id,
            })
          }
        } else {
          customersToInsert.push({
            ...customerBase,
            branch_id: currentBranch?.id,
            bhf_id: currentBranch?.bhf_id,
          })
        }
      }

      for (const customer of customersToInsert) {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        })
      }

      toast({
        title: "Customers Imported",
        description: `Successfully imported ${customersToInsert.length} customer record(s).`,
      })

      e.target.value = ""
    } catch (error) {
      console.error("[v0] CSV upload error:", error)
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import customers.",
        variant: "destructive",
      })
    } finally {
      setUploadingCsv(false)
    }
  }

  const handleRegisterCustomer = async () => {
    if (!formData.pin || !formData.customerName) {
      toast({
        title: "Validation Error",
        description: "PIN and Customer Name are required fields.",
        variant: "destructive",
      })
      return
    }

    loadCurrentBranch()

    if (!currentBranch) {
      toast({
        title: "No Branch Found",
        description: "Please select a branch first.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const branchRes = await fetch(`/api/branches?limit=100`)
      const branchResult = await branchRes.json()
      const allBranches = branchResult.success ? branchResult.data : []
      
      const branchData = allBranches.find((b: any) => b.id === currentBranch.id)

      if (!branchData) {
        throw new Error("Could not find branch details. Please try again.")
      }

      if (!branchData.bhf_id) {
        throw new Error(
          `Branch "${branchData.name}" does not have a BHF ID configured. Please configure it in settings.`,
        )
      }

      const customersToInsert = []

      const customerBase = {
        tin: formData.pin,
        cust_tin: formData.pin,
        cust_nm: formData.customerName,
        email: formData.email || null,
        tel_no: formData.phone || null,
        adrs: `${formData.address}, ${formData.city}, ${formData.postalCode}`.replace(/^, |, $/g, "").trim() || null,
        remark: formData.notes || null,
        use_yn: "Y",
      }

      if (formData.branchScope === "all") {
        for (const branch of allBranches || []) {
          if (!branch.bhf_id) {
            console.warn(`[v0] Skipping branch "${branch.name}" - no BHF ID configured`)
            continue
          }
          customersToInsert.push({
            ...customerBase,
            branch_id: branch.id,
            bhf_id: branch.bhf_id,
          })
        }
      } else {
        customersToInsert.push({
          ...customerBase,
          branch_id: branchData.id,
          bhf_id: branchData.bhf_id,
        })
      }

      if (customersToInsert.length === 0) {
        throw new Error("No branches with valid BHF IDs found. Please configure branch BHF IDs in settings.")
      }

      for (const customer of customersToInsert) {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        })
      }

      toast({
        title: "Customer Registered",
        description: `${formData.customerName} has been added to ${formData.branchScope === "all" ? "all branches" : branchData.name}.`,
      })

      setFormData({
        pin: "",
        customerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        notes: "",
        branchScope: "current",
      })
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register customer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearForm = () => {
    setFormData({
      pin: "",
      customerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      notes: "",
      branchScope: "current",
    })
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Register Customer</h1>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">Add a new customer to your database</p>
              </div>
              <div className="relative w-full sm:w-72 md:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-10 rounded-xl" />
              </div>
            </div>

            <Card className="rounded-2xl mb-6">
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload multiple customers at once using a CSV file. Download the template to see the required format.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl bg-transparent" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingCsv}
                    />
                    <Button className="rounded-xl" disabled={uploadingCsv}>
                      {uploadingCsv ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl max-w-3xl">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 p-4 border rounded-xl bg-muted/30">
                  <Label>Register Customer For</Label>
                  <RadioGroup
                    value={formData.branchScope}
                    onValueChange={(value: "current" | "all") => setFormData({ ...formData, branchScope: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="current" id="current" />
                      <Label htmlFor="current" className="font-normal cursor-pointer">
                        Current Branch Only ({currentBranch?.name || "No branch selected"})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal cursor-pointer">
                        All Branches ({branches.length} branches)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin">Tax Authority PIN *</Label>
                    <Input
                      id="pin"
                      placeholder="Enter PIN"
                      className="rounded-xl"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      className="rounded-xl"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="customer@example.com"
                      className="rounded-xl"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+254 700 000000"
                      className="rounded-xl"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    className="rounded-xl"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      className="rounded-xl"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="Enter postal code"
                      className="rounded-xl"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional information"
                    className="rounded-xl"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="rounded-xl" onClick={handleRegisterCustomer} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register Customer"
                    )}
                  </Button>
                  <Button variant="outline" className="rounded-xl bg-transparent" onClick={handleClearForm}>
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>

          <footer className="border-t px-8 py-4 text-center text-sm text-muted-foreground">
            Powered by Sensile Technologies East Africa Ltd
          </footer>
        </div>
      </div>
    </div>
  )
}
