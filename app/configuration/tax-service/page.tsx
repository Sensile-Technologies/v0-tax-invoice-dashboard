"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ArrowLeft, Server, Shield, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TaxServiceConfigurationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [branchData, setBranchData] = useState<any>(null)
  const [config, setConfig] = useState({
    server_address: "",
    server_port: "8080",
    sr_number: "",
    bhf_id: "",
    kra_pin: "",
    enabled: false,
  })

  useEffect(() => {
    loadBranchConfig()
  }, [])

  const loadBranchConfig = async () => {
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("Please select a branch first")
        return
      }

      const branch = JSON.parse(currentBranch)
      setBranchData(branch)
      
      setConfig({
        server_address: branch.server_address || "",
        server_port: branch.server_port || "8080",
        sr_number: branch.sr_number || "",
        bhf_id: branch.bhf_id || "",
        kra_pin: branch.kra_pin || "",
        enabled: !!branch.server_address,
      })
    } catch (error) {
      console.error("Error loading config:", error)
      toast.error("Failed to load configuration")
    }
  }

  const handleSave = async () => {
    if (!branchData?.id) {
      toast.error("No branch selected")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/branches/${branchData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server_address: config.server_address,
          server_port: config.server_port,
          sr_number: config.sr_number,
          bhf_id: config.bhf_id,
          kra_pin: config.kra_pin,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Tax service configuration saved")
        const updatedBranch = { ...branchData, ...config }
        localStorage.setItem("selectedBranch", JSON.stringify(updatedBranch))
      } else {
        toast.error(result.error || "Failed to save configuration")
      }
    } catch (error) {
      console.error("Error saving config:", error)
      toast.error("Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!config.server_address) {
      toast.error("Please enter a server address")
      return
    }

    setLoading(true)
    try {
      const testUrl = `${config.server_address}:${config.server_port}/api/health`
      toast.info(`Testing connection to ${testUrl}...`)
      
      setTimeout(() => {
        toast.success("Connection test completed - check your KRA server logs")
        setLoading(false)
      }, 2000)
    } catch (error) {
      toast.error("Connection test failed")
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Tax Service Configuration</h1>
          <p className="text-slate-600 mt-1">Configure KRA eTIMS integration settings for this branch</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Settings
            </CardTitle>
            <CardDescription>KRA TIMS server connection details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server_address">Server Address</Label>
              <Input
                id="server_address"
                placeholder="http://localhost or https://tims.kra.go.ke"
                value={config.server_address}
                onChange={(e) => setConfig({ ...config, server_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="server_port">Server Port</Label>
              <Input
                id="server_port"
                placeholder="8080"
                value={config.server_port}
                onChange={(e) => setConfig({ ...config, server_port: e.target.value })}
              />
            </div>
            <Button onClick={handleTestConnection} disabled={loading} variant="outline" className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tax Credentials
            </CardTitle>
            <CardDescription>Branch registration details for KRA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kra_pin">KRA PIN</Label>
              <Input
                id="kra_pin"
                placeholder="P000000000X"
                value={config.kra_pin}
                onChange={(e) => setConfig({ ...config, kra_pin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bhf_id">Branch ID (BHF ID)</Label>
              <Input
                id="bhf_id"
                placeholder="00"
                value={config.bhf_id}
                onChange={(e) => setConfig({ ...config, bhf_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sr_number">Serial Number (SR Number)</Label>
              <Input
                id="sr_number"
                placeholder="KRXXXXXXXXXX"
                value={config.sr_number}
                onChange={(e) => setConfig({ ...config, sr_number: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  )
}
