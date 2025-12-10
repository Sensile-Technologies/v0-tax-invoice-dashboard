"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Shield, Server, CheckCircle, AlertCircle } from "lucide-react"

export default function SecuritySettingsPage() {
  const [backendUrl, setBackendUrl] = useState("")
  const [backendPort, setBackendPort] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved backend configuration
    const savedConfig = localStorage.getItem("backendConfig")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setBackendUrl(config.url || "")
      setBackendPort(config.port || "")
    }
  }, [])

  const handleSaveConfiguration = () => {
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

    const config = {
      url: backendUrl,
      port: backendPort,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem("backendConfig", JSON.stringify(config))

    toast({
      title: "Configuration Saved",
      description: "Backend configuration has been updated successfully",
    })

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
      console.log("[v0] Testing connection via proxy")

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
      console.error("[v0] Connection test error:", error)
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
    localStorage.removeItem("backendConfig")
    setConnectionStatus("idle")
    toast({
      title: "Configuration Reset",
      description: "Backend configuration has been reset to default",
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
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
                      type="number"
                      placeholder="8080"
                      value={backendPort}
                      onChange={(e) => setBackendPort(e.target.value)}
                      className="rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Specify a custom port if your backend uses a non-standard port
                    </p>
                  </div>

                  {connectionStatus !== "idle" && (
                    <div
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        connectionStatus === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {connectionStatus === "success" ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Connection successful</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Connection failed</span>
                        </>
                      )}
                    </div>
                  )}

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
                  <li>Configuration is stored locally in your browser and will persist across sessions</li>
                  <li>Test the connection after saving to ensure the configuration is correct</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
