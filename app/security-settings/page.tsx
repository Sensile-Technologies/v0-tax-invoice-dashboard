"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Shield, Server, CheckCircle, AlertCircle, Key, Hash } from "lucide-react"

interface BranchConfig {
  id: string
  name: string
  bhf_id: string | null
  device_token: string | null
  server_address: string | null
  server_port: string | null
  trading_name: string | null
  kra_pin: string | null
}

export default function SecuritySettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [branchConfig, setBranchConfig] = useState<BranchConfig | null>(null)
  const [backendUrl, setBackendUrl] = useState("")
  const [backendPort, setBackendPort] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initBranchConfig = async () => {
      let branchId: string | null = null
      
      // First try to get from localStorage
      const storedBranch = localStorage.getItem("selectedBranch")
      if (storedBranch) {
        try {
          const branch = JSON.parse(storedBranch)
          if (branch && branch.id) {
            branchId = branch.id
          }
        } catch (e) {
          console.error("Error parsing stored branch:", e)
        }
      }
      
      // If no stored branch, fetch user's branches from API
      if (!branchId) {
        try {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const user = JSON.parse(storedUser)
            if (user && user.id) {
              const response = await fetch(`/api/branches/list?user_id=${user.id}`)
              if (response.ok) {
                const branches = await response.json()
                if (branches.length > 0) {
                  branchId = branches[0].id
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching branches:", error)
        }
      }
      
      // Fetch branch config if we have a branch ID
      if (branchId) {
        setCurrentBranchId(branchId)
        try {
          const response = await fetch(`/api/branch/config?branch_id=${branchId}`)
          if (response.ok) {
            const data = await response.json()
            setBranchConfig(data)
            setBackendUrl(data.server_address || "")
            setBackendPort(data.server_port || "")
          }
        } catch (error) {
          console.error("Error fetching branch config:", error)
        }
      }
      
      setIsLoading(false)
    }
    
    initBranchConfig()
  }, [])

  const handleSaveConfiguration = async () => {
    if (!backendUrl) {
      toast({
        title: "Validation Error",
        description: "Backend URL is required",
        variant: "destructive",
      })
      return
    }

    try {
      const url = new URL(backendUrl)
      if (url.protocol === "http:") {
        toast({
          title: "Security Warning",
          description: "KRA TIMS API requires HTTPS. Your HTTP URL will be automatically converted to HTTPS.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://api.example.com)",
        variant: "destructive",
      })
      return
    }

    try {
      const url = currentBranchId 
        ? `/api/branch/config?branch_id=${currentBranchId}` 
        : "/api/branch/config"
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server_address: backendUrl,
          server_port: backendPort,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBranchConfig(data)
        toast({
          title: "Configuration Saved",
          description: "Backend configuration has been updated successfully",
        })
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      })
    }

    setConnectionStatus("idle")
  }

  const handleTestConnection = async () => {
    if (!backendUrl) {
      toast({
        title: "Validation Error",
        description: "Backend URL is required to test connection",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionDetails(null)

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: backendUrl,
          port: backendPort,
        }),
      })

      const result = await response.json()
      setConnectionDetails(result)

      if (result.success) {
        setConnectionStatus("success")
        toast({
          title: "Connection Successful",
          description: `Connected to ${result.url} in ${result.duration}ms`,
        })
      } else {
        setConnectionStatus("error")
        toast({
          title: "Connection Failed",
          description: result.error || "Unable to connect to the backend server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Connection test error:", error)
      setConnectionStatus("error")
      setConnectionDetails({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      toast({
        title: "Connection Failed",
        description: "Failed to test connection. Please check your configuration.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleResetToDefault = () => {
    setBackendUrl("")
    setBackendPort("")
    setConnectionStatus("idle")
    toast({
      title: "Configuration Reset",
      description: "Backend configuration has been reset to default",
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Security Settings
              </h1>
              <p className="text-muted-foreground mt-2">Configure backend connection and security preferences</p>
            </div>

            {branchConfig && (branchConfig.bhf_id || branchConfig.device_token) && (
              <Card className="rounded-xl mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Key className="h-5 w-5" />
                    Branch Credentials
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    KRA TIMS credentials assigned to this branch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-blue-700">BHF ID (Branch Fiscal ID)</Label>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-medium">{branchConfig.bhf_id || "Not assigned"}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-blue-700">Device Token</Label>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200">
                        <Key className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-medium text-sm">
                          {branchConfig.device_token 
                            ? `${branchConfig.device_token.substring(0, 8)}...${branchConfig.device_token.substring(branchConfig.device_token.length - 4)}`
                            : "Not assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {branchConfig.trading_name && (
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Trading Name:</span> {branchConfig.trading_name}
                    </div>
                  )}
                  {branchConfig.kra_pin && (
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">KRA PIN:</span> {branchConfig.kra_pin}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="rounded-xl mb-6 border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900">HTTPS Required for KRA TIMS</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      The KRA TIMS backend requires HTTPS connections. Please configure your backend URL with{" "}
                      <code className="bg-amber-100 px-1 rounded">https://</code> protocol.
                    </p>
                    <p className="text-sm text-amber-800 mt-2">
                      Example: <code className="bg-amber-100 px-1 rounded">https://20.224.40.56:8088</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Backend Configuration
                </CardTitle>
                <CardDescription>
                  Configure the backend server URL and port for KRA TIMS integration and other services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading configuration...</div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="backendUrl">Backend URL *</Label>
                        <Input
                          id="backendUrl"
                          type="url"
                          placeholder="https://20.224.40.56:8088"
                          value={backendUrl}
                          onChange={(e) => setBackendUrl(e.target.value)}
                          className="rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the full URL with HTTPS protocol (e.g., https://20.224.40.56:8088). KRA TIMS requires HTTPS.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backendPort">Backend Port (Optional)</Label>
                        <Input
                          id="backendPort"
                          type="text"
                          placeholder="8080"
                          value={backendPort}
                          onChange={(e) => setBackendPort(e.target.value)}
                          className="rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Specify a custom port if your backend uses a non-standard port
                        </p>
                      </div>

                      {connectionDetails && (
                        <div className="space-y-3">
                          <div
                            className={`flex items-center gap-2 p-3 rounded-lg ${
                              connectionDetails.success
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {connectionDetails.success ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Connection successful</p>
                                  <p className="text-xs mt-1">Response time: {connectionDetails.duration}ms</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-5 w-5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Connection failed</p>
                                  <p className="text-xs mt-1">{connectionDetails.error}</p>
                                </div>
                              </>
                            )}
                          </div>

                          {connectionDetails.success && connectionDetails.data && (
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-xs font-medium mb-1">Server Response:</p>
                              <pre className="text-xs text-muted-foreground overflow-x-auto">
                                {typeof connectionDetails.data === "string"
                                  ? connectionDetails.data.substring(0, 500)
                                  : JSON.stringify(connectionDetails.data, null, 2).substring(0, 500)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSaveConfiguration} className="rounded-lg">
                        Save Configuration
                      </Button>
                      <Button
                        onClick={handleTestConnection}
                        variant="outline"
                        className="rounded-lg bg-transparent"
                        disabled={isTestingConnection}
                      >
                        {isTestingConnection ? "Testing..." : "Test Connection"}
                      </Button>
                      <Button
                        onClick={handleResetToDefault}
                        variant="outline"
                        className="rounded-lg ml-auto bg-transparent"
                      >
                        Reset to Default
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">Current Configuration</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">URL:</span> {backendUrl || "Not configured"}
                        </p>
                        <p>
                          <span className="font-medium">Port:</span> {backendPort || "Default"}
                        </p>
                        <p>
                          <span className="font-medium">Full Endpoint:</span>{" "}
                          {backendUrl
                            ? (() => {
                                let displayUrl = backendUrl.trim()
                                if (displayUrl.endsWith("/")) displayUrl = displayUrl.slice(0, -1)
                                if (backendPort) {
                                  try {
                                    const urlObj = new URL(displayUrl)
                                    urlObj.port = backendPort
                                    return urlObj.toString().replace(/\/$/, "")
                                  } catch {
                                    return `${displayUrl}:${backendPort}`
                                  }
                                }
                                return displayUrl
                              })()
                            : "Not configured"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl mt-6">
              <CardHeader>
                <CardTitle>Usage Notes</CardTitle>
                <CardDescription>Important information about backend configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>The backend URL is used for KRA TIMS integration and other external services</li>
                  <li>Make sure your backend server is running and accessible before testing the connection</li>
                  <li>Port is optional and only needed if your backend uses a non-standard port</li>
                  <li>Configuration is stored in the database and will persist across sessions</li>
                  <li>Test the connection after saving to ensure the configuration is correct</li>
                  <li>BHF ID and Device Token are assigned during the onboarding process</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
