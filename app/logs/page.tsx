"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, Download, Filter, Building2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface ApiLog {
  id: string
  endpoint: string
  method: string
  payload: any
  response: any
  status_code: number
  error: string | null
  duration_ms: number
  created_at: string
  external_endpoint: string | null
  branch_id: string | null
}

interface Branch {
  id: string
  name: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchBranches = async () => {
    try {
      const response = await fetch(`/api/branches/list`, { credentials: 'include' })
      const data = await response.json()
      setBranches(data || [])
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const fetchLogs = async (branch?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const targetBranch = branch || branchFilter
      if (targetBranch && targetBranch !== "all") {
        params.append("branch_id", targetBranch)
      }
      const response = await fetch(`/api/logs${params.toString() ? '?' + params.toString() : ''}`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
    
    // Get selected branch from localStorage and use it as default filter
    const storedBranch = localStorage.getItem("selectedBranch")
    if (storedBranch) {
      try {
        const branch = JSON.parse(storedBranch)
        if (branch?.id && branch.id !== 'hq') {
          setBranchFilter(branch.id)
          fetchLogs(branch.id)
          return
        }
      } catch (e) {
        console.error("Error parsing stored branch:", e)
      }
    }
    fetchLogs()
  }, [])

  useEffect(() => {
    // Only refetch if branchFilter changes after initial load
    if (branchFilter) {
      fetchLogs()
    }
  }, [branchFilter])

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "success" && log.status_code >= 200 && log.status_code < 300) ||
      (filter === "error" && (log.status_code >= 400 || log.error))

    const matchesSearch =
      !searchTerm ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.method.toLowerCase().includes(searchTerm.toLowerCase())

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
    link.download = `api-logs-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (statusCode: number, error: string | null) => {
    if (error) {
      return <Badge variant="destructive">Error</Badge>
    }
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-600">Success</Badge>
    }
    if (statusCode >= 400) {
      return <Badge variant="destructive">{statusCode}</Badge>
    }
    return <Badge variant="secondary">{statusCode}</Badge>
  }

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
                  <div>
                    <CardTitle>API Logs</CardTitle>
                    <CardDescription>
                      Track all backend API calls with payloads, responses, and performance metrics
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={loading}>
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
                      placeholder="Search by endpoint or method..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="success">Success Only</SelectItem>
                      <SelectItem value="error">Errors Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px]">
                    <Table className="min-w-[700px]">
                      <TableHeader className="bg-muted sticky top-0">
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Loading logs...
                            </TableCell>
                          </TableRow>
                        ) : filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log) => (
                            <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-mono text-xs">
                                {new Date(log.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{log.method}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm max-w-[300px] truncate">{log.endpoint}</TableCell>
                              <TableCell>{getStatusBadge(log.status_code, log.error)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {log.duration_ms ? `${log.duration_ms}ms` : "-"}
                              </TableCell>
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
                            <CardTitle>Log Details</CardTitle>
                            <CardDescription className="font-mono text-xs mt-1">{selectedLog.endpoint}</CardDescription>
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
                                <span className="text-muted-foreground">Method:</span>{" "}
                                <Badge variant="outline">{selectedLog.method}</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>{" "}
                                {getStatusBadge(selectedLog.status_code, selectedLog.error)}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span> {selectedLog.duration_ms}ms
                              </div>
                              <div>
                                <span className="text-muted-foreground">Timestamp:</span>{" "}
                                {new Date(selectedLog.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Endpoints</h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Middleware Endpoint:</span>
                                <pre className="bg-muted p-2 rounded mt-1 font-mono text-xs overflow-x-auto">
                                  {selectedLog.endpoint}
                                </pre>
                              </div>
                              {selectedLog.external_endpoint && (
                                <div>
                                  <span className="text-muted-foreground">External KRA Endpoint:</span>
                                  <pre className="bg-muted p-2 rounded mt-1 font-mono text-xs overflow-x-auto">
                                    {selectedLog.external_endpoint}
                                  </pre>
                                </div>
                              )}
                              {selectedLog.payload?.tin && (
                                <div>
                                  <span className="text-muted-foreground">KRA PIN:</span>
                                  <pre className="bg-muted p-2 rounded mt-1 font-mono text-xs overflow-x-auto">
                                    {selectedLog.payload.tin}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedLog.payload && (
                            <div>
                              <h3 className="font-semibold mb-2">Payload</h3>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                {JSON.stringify(selectedLog.payload, null, 2)}
                              </pre>
                            </div>
                          )}

                          {selectedLog.response && (
                            <div>
                              <h3 className="font-semibold mb-2">Response</h3>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                {JSON.stringify(selectedLog.response, null, 2)}
                              </pre>
                            </div>
                          )}

                          {selectedLog.error && (
                            <div>
                              <h3 className="font-semibold mb-2 text-destructive">Error</h3>
                              <pre className="bg-destructive/10 p-4 rounded-lg overflow-x-auto text-xs text-destructive">
                                {selectedLog.error}
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
