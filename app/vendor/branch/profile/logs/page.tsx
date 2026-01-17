"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, Download, Filter, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface BranchLog {
  id: string
  log_type: string
  endpoint: string
  payload: any
  response: any
  status: string
  status_code: number
  created_at: string
  branch_id: string | null
}

interface Branch {
  id: string
  name: string
}

export default function BranchLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<BranchLog[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [logTypeFilter, setLogTypeFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLog, setSelectedLog] = useState<BranchLog | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const branchStr = localStorage.getItem("flow360_selected_branch")
    if (branchStr) {
      try {
        const branch = JSON.parse(branchStr)
        setCurrentBranch(branch)
      } catch (e) {
        console.error("Error parsing branch:", e)
      }
    }
  }, [])

  const fetchLogs = async () => {
    if (!currentBranch?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("branch_id", currentBranch.id)
      if (logTypeFilter && logTypeFilter !== "all") {
        params.append("log_type", logTypeFilter)
      }
      const response = await fetch(`/api/logs?${params.toString()}`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch?.id) {
      fetchLogs()
    }
  }, [currentBranch?.id, logTypeFilter])

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "success" && log.status === "success") ||
      (filter === "error" && log.status === "error")

    const matchesSearch =
      !searchTerm ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.log_type.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) return

    try {
      await fetch("/api/logs", { method: "DELETE" })
      fetchLogs()
    } catch (error) {
      console.error("Error clearing logs:", error)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kra-logs-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return <Badge className="bg-green-600">Success</Badge>
    }
    return <Badge variant="destructive">Error</Badge>
  }

  const getLogTypeBadge = (logType: string) => {
    const colors: Record<string, string> = {
      kra_save_sales: "bg-blue-600",
      kra_stock_items: "bg-purple-600",
      kra_stock_master: "bg-indigo-600",
      kra_save_item: "bg-cyan-600",
      kra_stock_sync: "bg-teal-600",
      kra_initialize: "bg-orange-600",
    }
    return (
      <Badge className={colors[logType] || "bg-gray-600"}>
        {logType.replace("kra_", "").replace(/_/g, " ").toUpperCase()}
      </Badge>
    )
  }

  const logTypes = [
    { value: "all", label: "All Types" },
    { value: "kra_save_sales", label: "Sales" },
    { value: "kra_stock_items", label: "Stock Items" },
    { value: "kra_stock_master", label: "Stock Master" },
    { value: "kra_save_item", label: "Save Item" },
    { value: "kra_stock_sync", label: "Stock Sync" },
    { value: "kra_initialize", label: "Initialize" },
  ]

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/vendor/branch/profile")}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <div>
                      <CardTitle>API Logs</CardTitle>
                      <CardDescription>
                        {currentBranch?.name ? `${currentBranch.name} - ` : ""}Track all backend API calls with payloads, responses, and performance metrics
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearLogs}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Search by endpoint or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {logTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px]">
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-muted sticky top-0">
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Loading logs...
                            </TableCell>
                          </TableRow>
                        ) : filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No KRA logs found. Make a sale or sync stock to see logs here.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log) => (
                            <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-mono text-xs">
                                {new Date(log.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>{getLogTypeBadge(log.log_type)}</TableCell>
                              <TableCell className="font-mono text-sm max-w-[300px] truncate">
                                {log.endpoint}
                              </TableCell>
                              <TableCell>{getStatusBadge(log.status)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedLog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Log Details
                              {getLogTypeBadge(selectedLog.log_type)}
                            </CardTitle>
                            <CardDescription className="font-mono text-xs mt-1">
                              {selectedLog.endpoint}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                            Close
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">Request Info</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Type:</span>{" "}
                                {getLogTypeBadge(selectedLog.log_type)}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>{" "}
                                {getStatusBadge(selectedLog.status)}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Timestamp:</span>{" "}
                                {new Date(selectedLog.created_at).toLocaleString()}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Endpoint:</span>{" "}
                                <span className="font-mono text-xs">{selectedLog.endpoint}</span>
                              </div>
                            </div>
                          </div>

                          {selectedLog.payload && (
                            <div>
                              <h3 className="font-semibold mb-2">Request Payload</h3>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-[300px] overflow-y-auto">
                                {JSON.stringify(selectedLog.payload, null, 2)}
                              </pre>
                            </div>
                          )}

                          {selectedLog.response && (
                            <div>
                              <h3 className="font-semibold mb-2">Response</h3>
                              <pre className={`p-4 rounded-lg overflow-x-auto text-xs max-h-[300px] overflow-y-auto ${
                                selectedLog.status === "error" ? "bg-destructive/10" : "bg-muted"
                              }`}>
                                {JSON.stringify(selectedLog.response, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
