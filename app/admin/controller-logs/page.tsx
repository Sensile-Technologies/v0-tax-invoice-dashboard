"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, RefreshCw, Fuel, Activity, 
  Clock, Server, Download, Filter, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface PumpTransaction {
  id: string
  packet_id: number
  pts_id: string
  pump_number: number
  nozzle_number: number
  fuel_grade_id: number
  fuel_grade_name: string
  transaction_id: number
  volume: number
  tc_volume: number
  price: number
  amount: number
  total_volume: number
  total_amount: number
  tag: string
  user_id: number
  configuration_id: string
  transaction_start: string
  transaction_end: string
  processed: boolean
  sale_id: string | null
  created_at: string
  raw_packet: any
  raw_request: any
  raw_response: any
}

interface Summary {
  total_transactions: number
  total_volume: number
  total_amount: number
  unique_controllers: number
  unique_pumps: number
  processed_count: number
  pending_count: number
}

export default function ControllerLogsPage() {
  const [logs, setLogs] = useState<PumpTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    ptsId: ""
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<PumpTransaction | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("limit", "100")
      if (filters.startDate) params.append("start_date", filters.startDate)
      if (filters.endDate) params.append("end_date", filters.endDate)
      if (filters.ptsId) params.append("pts_id", filters.ptsId)

      const response = await fetch(`/api/controller-logs?${params}`)
      const data = await response.json()
      
      setLogs(data.logs || [])
      setSummary(data.summary || null)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching controller logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString()
  }

  const formatJSON = (data: any) => {
    if (!data) return "No data available"
    try {
      if (typeof data === "string") {
        return JSON.stringify(JSON.parse(data), null, 2)
      }
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const exportCSV = () => {
    const headers = ["Timestamp", "PTS ID", "Pump", "Nozzle", "Fuel", "Volume (L)", "Amount (KES)", "Transaction ID", "Processed"]
    const rows = logs.map(log => [
      formatDate(log.created_at),
      log.pts_id,
      log.pump_number,
      log.nozzle_number,
      log.fuel_grade_name,
      log.volume,
      log.amount,
      log.transaction_id,
      log.processed ? "Yes" : "No"
    ])
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `controller-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sales/summary">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Server className="h-6 w-6 text-blue-600" />
                Controller Logs
              </h1>
              <p className="text-slate-600">Pump transaction callbacks from PTS controllers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" onClick={exportCSV} disabled={logs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Controller ID (PTS ID)</Label>
                  <Input 
                    placeholder="e.g., 003A003A..."
                    value={filters.ptsId}
                    onChange={(e) => setFilters({...filters, ptsId: e.target.value})}
                  />
                </div>
                <Button onClick={fetchLogs}>Apply Filters</Button>
                <Button variant="outline" onClick={() => {
                  setFilters({ startDate: "", endDate: "", ptsId: "" })
                  setTimeout(fetchLogs, 100)
                }}>Clear</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{summary.total_transactions || 0}</div>
                <p className="text-sm text-slate-600">Total Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{Number(summary.total_volume || 0).toFixed(2)}L</div>
                <p className="text-sm text-slate-600">Total Volume</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">KES {Number(summary.total_amount || 0).toLocaleString()}</div>
                <p className="text-sm text-slate-600">Total Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-600">{summary.unique_controllers || 0}</div>
                <p className="text-sm text-slate-600">Controllers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-cyan-600">{summary.unique_pumps || 0}</div>
                <p className="text-sm text-slate-600">Pumps</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-emerald-600">{summary.processed_count || 0}</div>
                <p className="text-sm text-slate-600">Processed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-600">{summary.pending_count || 0}</div>
                <p className="text-sm text-slate-600">Pending</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transaction Logs
              <Badge variant="outline">{total} total</Badge>
            </CardTitle>
            <CardDescription>
              Real-time pump transaction data received from PTS controllers. Click a row to view payload/response details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No controller logs yet</p>
                <p className="text-sm">Pump transactions will appear here when received</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Controller</TableHead>
                      <TableHead>Pump</TableHead>
                      <TableHead>Nozzle</TableHead>
                      <TableHead>Fuel</TableHead>
                      <TableHead className="text-right">Volume (L)</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="cursor-pointer hover:bg-slate-50">
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                            {log.pts_id?.substring(0, 12)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.pump_number}</Badge>
                        </TableCell>
                        <TableCell>{log.nozzle_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Fuel className="h-3 w-3 text-orange-500" />
                            {log.fuel_grade_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(log.volume).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(log.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {Number(log.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{log.transaction_id}</code>
                        </TableCell>
                        <TableCell>
                          {log.processed ? (
                            <Badge className="bg-green-100 text-green-700">Processed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              Callback Details - Transaction #{selectedLog?.transaction_id}
            </DialogTitle>
            <DialogDescription>
              Pump {selectedLog?.pump_number} | {selectedLog?.fuel_grade_name} | {formatDate(selectedLog?.created_at || "")}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="payload" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payload">Request Payload</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="packet">Packet Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payload" className="flex-1 overflow-hidden mt-4">
              <div className="relative h-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(formatJSON(selectedLog?.raw_request), "payload")}
                >
                  {copiedField === "payload" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto h-[400px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {formatJSON(selectedLog?.raw_request)}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="response" className="flex-1 overflow-hidden mt-4">
              <div className="relative h-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(formatJSON(selectedLog?.raw_response), "response")}
                >
                  {copiedField === "response" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto h-[400px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {formatJSON(selectedLog?.raw_response)}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="packet" className="flex-1 overflow-hidden mt-4">
              <div className="relative h-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(formatJSON(selectedLog?.raw_packet), "packet")}
                >
                  {copiedField === "packet" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto h-[400px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {formatJSON(selectedLog?.raw_packet)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
