"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Server, CreditCard, Bell, Shield } from "lucide-react"
import { toast } from "sonner"

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

  useEffect(() => {
    const savedConfig = localStorage.getItem("backendConfig")
    if (savedConfig) {
      try {
        setBackendConfig(JSON.parse(savedConfig))
      } catch (e) {}
    }
  }, [])

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
