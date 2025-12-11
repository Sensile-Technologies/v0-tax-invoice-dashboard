"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Server, CreditCard, Bell, Shield, Store, Building2 } from "lucide-react"
import { toast } from "sonner"

interface ConnectedBranch {
  id: string
  bhf_id: string
  bhf_nm: string
  vendor_name: string
  vendor_id: string
  status: string
}

export default function SettingsPage() {
  const [backendConfig, setBackendConfig] = useState({
    url: "http://20.224.40.56",
    port: "8088"
  })
  const [billingSettings, setBillingSettings] = useState({
    defaultTaxRate: "16",
    currency: "KES",
    invoicePrefix: "INV"
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    ticketAlerts: true,
    invoiceReminders: true
  })
  const [connectedBranches, setConnectedBranches] = useState<ConnectedBranch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(true)

  useEffect(() => {
    const savedConfig = localStorage.getItem("backendConfig")
    if (savedConfig) {
      try {
        setBackendConfig(JSON.parse(savedConfig))
      } catch (e) {}
    }
    fetchConnectedBranches()
  }, [])

  const fetchConnectedBranches = async () => {
    try {
      const response = await fetch("/api/admin/branches")
      const data = await response.json()
      setConnectedBranches(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching branches:", error)
      setConnectedBranches([])
    } finally {
      setLoadingBranches(false)
    }
  }

  const handleSaveBackendConfig = () => {
    localStorage.setItem("backendConfig", JSON.stringify(backendConfig))
    toast.success("Backend configuration saved")
  }

  const handleSaveBillingSettings = () => {
    localStorage.setItem("billingSettings", JSON.stringify(billingSettings))
    toast.success("Billing settings saved")
  }

  const handleSaveNotifications = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications))
    toast.success("Notification settings saved")
  }

  const vendorGroups = connectedBranches.reduce((groups: Record<string, ConnectedBranch[]>, branch) => {
    const key = branch.vendor_name || "Unknown"
    if (!groups[key]) groups[key] = []
    groups[key].push(branch)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-600 mt-1">Configure Flow360 Core platform settings</p>
      </div>

      <Tabs defaultValue="server" className="space-y-6">
        <TabsList>
          <TabsTrigger value="server" className="gap-2">
            <Server className="h-4 w-4" />
            Server
          </TabsTrigger>
          <TabsTrigger value="branches" className="gap-2">
            <Store className="h-4 w-4" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="server">
          <Card>
            <CardHeader>
              <CardTitle>KRA Backend Configuration</CardTitle>
              <CardDescription>Configure the KRA TIMS backend server connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Backend URL</Label>
                  <Input
                    id="url"
                    value={backendConfig.url}
                    onChange={(e) => setBackendConfig({ ...backendConfig, url: e.target.value })}
                    placeholder="http://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={backendConfig.port}
                    onChange={(e) => setBackendConfig({ ...backendConfig, port: e.target.value })}
                    placeholder="8088"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveBackendConfig}>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Connected Branches</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {connectedBranches.length} Total
                </Badge>
              </CardTitle>
              <CardDescription>All branches connected to the platform with their BHF-IDs</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBranches ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : connectedBranches.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No branches connected yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(vendorGroups).map(([vendorName, branches]) => (
                    <div key={vendorName} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Building2 className="h-4 w-4" />
                        {vendorName}
                        <Badge variant="secondary" className="ml-2">
                          {branches.length} branch{branches.length !== 1 ? 'es' : ''}
                        </Badge>
                      </div>
                      <div className="grid gap-2 pl-6">
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                <Store className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{branch.bhf_nm}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono bg-white">
                                BHF-ID: {branch.bhf_id}
                              </Badge>
                              <Badge 
                                variant={branch.status === 'active' ? 'default' : 'secondary'}
                                className={branch.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {branch.status || 'active'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Configure default billing and invoicing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={billingSettings.defaultTaxRate}
                    onChange={(e) => setBillingSettings({ ...billingSettings, defaultTaxRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={billingSettings.currency}
                    onChange={(e) => setBillingSettings({ ...billingSettings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={billingSettings.invoicePrefix}
                    onChange={(e) => setBillingSettings({ ...billingSettings, invoicePrefix: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveBillingSettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and alert notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive email notifications for important events</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailNotifications: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ticket Alerts</p>
                  <p className="text-sm text-slate-500">Get notified when new support tickets are created</p>
                </div>
                <Switch
                  checked={notifications.ticketAlerts}
                  onCheckedChange={(v) => setNotifications({ ...notifications, ticketAlerts: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invoice Reminders</p>
                  <p className="text-sm text-slate-500">Send automatic reminders for overdue invoices</p>
                </div>
                <Switch
                  checked={notifications.invoiceReminders}
                  onCheckedChange={(v) => setNotifications({ ...notifications, invoiceReminders: v })}
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveNotifications}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500 mt-1">Enhanced security for admin accounts</p>
                <Button variant="outline" className="mt-3" disabled>
                  Coming Soon
                </Button>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium">API Keys Management</p>
                <p className="text-sm text-slate-500 mt-1">Manage API keys for third-party integrations</p>
                <Button variant="outline" className="mt-3" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
