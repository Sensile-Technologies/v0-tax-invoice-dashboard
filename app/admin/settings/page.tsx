"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Server, CreditCard, Bell, Shield, Store, Building2, Activity, RefreshCw, ChevronLeft, ChevronRight, Clock, Filter, User, MessageSquare, Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface ConnectedBranch {
  id: string
  bhf_id: string
  bhf_nm: string
  vendor_name: string
  vendor_id: string
  status: string
}

interface ActivityLog {
  id: number
  user_id: string
  user_email: string
  user_name: string
  branch_id: string
  branch_name: string
  vendor_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
}

export default function SettingsPage() {
  const [backendConfig, setBackendConfig] = useState({
    url: "http://5.189.171.160",
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
  const [whatsappDirectors, setWhatsappDirectors] = useState<string[]>([])
  const [newDirectorNumber, setNewDirectorNumber] = useState("")
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [connectedBranches, setConnectedBranches] = useState<ConnectedBranch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(0)
  const [logsHasMore, setLogsHasMore] = useState(false)
  const [logsFilter, setLogsFilter] = useState({
    action: '',
    dateFrom: '',
    dateTo: ''
  })
  const PAGE_SIZE = 25

  useEffect(() => {
    const savedConfig = localStorage.getItem("backendConfig")
    if (savedConfig) {
      try {
        setBackendConfig(JSON.parse(savedConfig))
      } catch (e) {}
    }
    fetchConnectedBranches()
    fetchWhatsappDirectors()
  }, [])

  const fetchWhatsappDirectors = async () => {
    try {
      const response = await fetch('/api/vendors/whatsapp-directors')
      const data = await response.json()
      if (data.success) {
        setWhatsappDirectors(data.directors || [])
      }
    } catch (error) {
      console.error("Error fetching WhatsApp directors:", error)
    }
  }

  const handleAddDirector = () => {
    if (!newDirectorNumber.trim()) return
    const cleaned = newDirectorNumber.replace(/\s/g, '')
    if (whatsappDirectors.includes(cleaned)) {
      toast.error("This number is already added")
      return
    }
    setWhatsappDirectors([...whatsappDirectors, cleaned])
    setNewDirectorNumber("")
  }

  const handleRemoveDirector = (number: string) => {
    setWhatsappDirectors(whatsappDirectors.filter(n => n !== number))
  }

  const handleSaveWhatsappDirectors = async () => {
    setSavingWhatsapp(true)
    try {
      const response = await fetch('/api/vendors/whatsapp-directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directors: whatsappDirectors })
      })
      const data = await response.json()
      if (data.success) {
        toast.success(data.message || "WhatsApp directors saved")
        setWhatsappDirectors(data.directors || whatsappDirectors)
      } else {
        toast.error(data.error || "Failed to save")
      }
    } catch (error) {
      toast.error("Failed to save WhatsApp directors")
    } finally {
      setSavingWhatsapp(false)
    }
  }

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

  const fetchActivityLogs = async (page: number = 0) => {
    setLoadingLogs(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', PAGE_SIZE.toString())
      params.append('offset', (page * PAGE_SIZE).toString())
      if (logsFilter.action) params.append('action', logsFilter.action)
      if (logsFilter.dateFrom) params.append('date_from', logsFilter.dateFrom)
      if (logsFilter.dateTo) params.append('date_to', logsFilter.dateTo)
      
      const response = await fetch(`/api/activity-logs?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setActivityLogs(data.data || [])
        setLogsTotal(data.pagination?.total || 0)
        setLogsHasMore(data.pagination?.hasMore || false)
      } else {
        toast.error(data.error || 'Failed to load activity logs')
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error)
      toast.error('Failed to load activity logs')
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleLogsPageChange = (newPage: number) => {
    setLogsPage(newPage)
    fetchActivityLogs(newPage)
  }

  const formatLogTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-green-100 text-green-800'
      case 'LOGOUT': return 'bg-slate-100 text-slate-800'
      case 'CREATE': return 'bg-blue-100 text-blue-800'
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
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
          <TabsTrigger value="activity" className="gap-2" onClick={() => { if (activityLogs.length === 0) fetchActivityLogs(0) }}>
            <Activity className="h-4 w-4" />
            Activity Logs
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

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp DSSR Notifications
              </CardTitle>
              <CardDescription>
                DSSR notifications are now configured at the branch level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  WhatsApp DSSR notifications are now configured per branch. Go to <strong>Explore Tuzwa → Earning Rules</strong> tab within each branch to configure director phone numbers for that branch.
                </p>
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

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Activity Logs</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {logsTotal} Total
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchActivityLogs(logsPage)}
                    disabled={loadingLogs}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Track all user actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Filter:</span>
                </div>
                <Select
                  value={logsFilter.action}
                  onValueChange={(value) => setLogsFilter({ ...logsFilter, action: value === 'all' ? '' : value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={logsFilter.dateFrom}
                  onChange={(e) => setLogsFilter({ ...logsFilter, dateFrom: e.target.value })}
                  className="w-36"
                  placeholder="From"
                />
                <span className="text-slate-400">to</span>
                <Input
                  type="date"
                  value={logsFilter.dateTo}
                  onChange={(e) => setLogsFilter({ ...logsFilter, dateTo: e.target.value })}
                  className="w-36"
                  placeholder="To"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => { setLogsPage(0); fetchActivityLogs(0); }}
                >
                  Apply
                </Button>
                {(logsFilter.action || logsFilter.dateFrom || logsFilter.dateTo) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { 
                      setLogsFilter({ action: '', dateFrom: '', dateTo: '' }); 
                      setLogsPage(0);
                      fetchActivityLogs(0);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {loadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-500">Loading activity logs...</span>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No activity logs found</p>
                  <p className="text-sm mt-1">User activities will appear here as they occur</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.user_name || log.user_email || 'Unknown User'}</span>
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {log.resource_type && <span className="capitalize">{log.resource_type}</span>}
                            {log.resource_id && <span className="text-slate-400"> #{log.resource_id.slice(0, 8)}</span>}
                          </p>
                          {log.branch_name && (
                            <p className="text-xs text-slate-400 mt-1">
                              <Store className="h-3 w-3 inline mr-1" />
                              {log.branch_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatLogTime(log.created_at)}
                        </div>
                        {log.ip_address && log.ip_address !== 'unknown' && (
                          <p className="text-xs text-slate-400 mt-1">{log.ip_address}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogsPageChange(logsPage - 1)}
                      disabled={logsPage === 0 || loadingLogs}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-slate-500">
                      Page {logsPage + 1} of {Math.max(1, Math.ceil(logsTotal / PAGE_SIZE))}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogsPageChange(logsPage + 1)}
                      disabled={!logsHasMore || loadingLogs}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
