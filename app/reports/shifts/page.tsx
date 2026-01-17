"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const DashboardSidebar = dynamic(() => import("@/components/dashboard-sidebar"), { ssr: false })
const DashboardHeader = dynamic(() => import("@/components/dashboard-header"), { ssr: false })
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, RefreshCw, Clock, Fuel, ChevronLeft, ChevronRight } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"
import { useCurrency } from "@/lib/currency-utils"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Shift {
  id: string
  branch_id: string
  staff_id: string
  start_time: string
  end_time: string | null
  opening_cash: number
  closing_cash: number
  total_sales: number
  status: string
  notes: string | null
  branch_name: string
  cashier: string
  variance: number
  total_opening_reading: number
  total_closing_reading: number
}




export default function ShiftsReportPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { formatCurrency } = useCurrency()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalShifts: 0,
    totalSales: 0,
    averagePerShift: 0,
    totalMeterDiff: 0
  })
  
  const [currentPage, setCurrentPage] = useState(0)
  const [totalShiftsCount, setTotalShiftsCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 20

  const [userId, setUserId] = useState<string | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)

  function getSelectedBranchId(): string | null {
    try {
      const selectedBranchStr = localStorage.getItem("selectedBranch")
      if (selectedBranchStr) {
        const selectedBranch = JSON.parse(selectedBranchStr)
        return selectedBranch.id && selectedBranch.id !== "hq" ? selectedBranch.id : null
      }
    } catch (e) {}
    return null
  }

  useEffect(() => {
    async function loadUserAndShifts() {
      const branchId = getSelectedBranchId()
      setSelectedBranchId(branchId)
      
      const userStr = localStorage.getItem("user")
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserId(user.id)
          return
        } catch (e) {
          console.error('[ShiftsReport] Error parsing localStorage user:', e)
        }
      }
      
      try {
        const sessionRes = await fetch('/api/auth/session')
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          if (sessionData.user?.id) {
            setUserId(sessionData.user.id)
            return
          }
        }
      } catch (e) {
        console.error('[ShiftsReport] Error fetching session:', e)
      }
      
      setLoading(false)
    }
    
    loadUserAndShifts()
    
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "selectedBranch") {
        const newBranchId = getSelectedBranchId()
        setSelectedBranchId(newBranchId)
      }
    }
    
    const pollInterval = setInterval(() => {
      const newBranchId = getSelectedBranchId()
      setSelectedBranchId(prev => prev !== newBranchId ? newBranchId : prev)
    }, 1000)
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
    }
  }, [])
  
  useEffect(() => {
    if (userId) {
      setCurrentPage(0)
      fetchShifts(userId, dateFrom, dateTo, 0)
    }
  }, [userId, selectedBranchId])

  useEffect(() => {
    if (userId) {
      setCurrentPage(0)
      fetchShifts(userId, dateFrom, dateTo, 0)
    }
  }, [dateFrom, dateTo])

  async function fetchShifts(uid: string, fromDate?: string, toDate?: string, page: number = 0) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('user_id', uid)
      params.append('limit', PAGE_SIZE.toString())
      params.append('offset', (page * PAGE_SIZE).toString())
      
      if (selectedBranchId) {
        params.append('branch_id', selectedBranchId)
      }
      
      if (fromDate) params.append('date_from', fromDate)
      if (toDate) params.append('date_to', toDate)
      
      const response = await fetch(`/api/shifts/list?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        const shiftsData = data.data || []
        setShifts(shiftsData)
        setTotalShiftsCount(data.pagination?.total || 0)
        setHasMore(data.pagination?.hasMore || false)
        
        const totalSales = shiftsData.reduce((sum: number, s: Shift) => sum + (s.total_sales || 0), 0)
        const totalMeterDiff = shiftsData.reduce((sum: number, s: Shift) => sum + ((s.total_closing_reading || 0) - (s.total_opening_reading || 0)), 0)
        
        setSummary({
          totalShifts: data.pagination?.total || shiftsData.length,
          totalSales,
          averagePerShift: shiftsData.length ? totalSales / shiftsData.length : 0,
          totalMeterDiff
        })
      } else {
        toast.error(data.error || 'Failed to fetch shifts')
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
      toast.error('Failed to fetch shifts')
    } finally {
      setLoading(false)
    }
  }

  function handleNextPage() {
    if (hasMore && userId) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchShifts(userId, dateFrom, dateTo, nextPage)
    }
  }

  function handlePreviousPage() {
    if (currentPage > 0 && userId) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      fetchShifts(userId, dateFrom, dateTo, prevPage)
    }
  }

  function handleExportCSV() {
    if (shifts.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Branch', 'Cashier', 'Started', 'Status', 'Opening Reading', 'Closing Reading', 'Meter Diff', 'Total Sales']
    const rows = shifts.map(s => [
      s.branch_name,
      s.cashier,
      formatDateTime(s.start_time),
      s.status,
      s.total_opening_reading?.toFixed(2) || '0.00',
      s.total_closing_reading?.toFixed(2) || '0.00',
      ((s.total_closing_reading || 0) - (s.total_opening_reading || 0)).toFixed(2),
      s.total_sales?.toFixed(2) || '0.00'
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shifts-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function formatDateTime(dateString: string | null) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-KE', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'closed':
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <ReportTabs />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Shifts Report</h1>
                  <p className="text-slate-600 mt-1">View and analyze shift performance</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => userId && fetchShifts(userId, dateFrom, dateTo, currentPage)} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">From:</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">To:</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Shifts</p>
                        <p className="text-2xl font-bold">{summary.totalShifts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Fuel className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Sales</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Avg per Shift</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.averagePerShift)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 rounded-full">
                        <Fuel className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Meter Diff</p>
                        <p className="text-2xl font-bold">{summary.totalMeterDiff.toFixed(2)} L</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Shifts History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : shifts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      No shifts found for the selected criteria
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 text-left font-medium text-slate-500">Branch</th>
                            <th className="py-3 px-4 text-left font-medium text-slate-500">Starter</th>
                            <th className="py-3 px-4 text-left font-medium text-slate-500">Started</th>
                            <th className="py-3 px-4 text-right font-medium text-slate-500">Opening</th>
                            <th className="py-3 px-4 text-right font-medium text-slate-500">Closing</th>
                            <th className="py-3 px-4 text-right font-medium text-slate-500">Meter Diff</th>
                            <th className="py-3 px-4 text-right font-medium text-slate-500">Total Sales</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-500">Status</th>
                            <th className="py-3 px-4 text-center font-medium text-slate-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shifts.map((shift) => (
                            <tr key={shift.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4 font-medium">{shift.branch_name}</td>
                              <td className="py-3 px-4">{shift.cashier}</td>
                              <td className="py-3 px-4">{formatDateTime(shift.start_time)}</td>
                              <td className="py-3 px-4 text-right">{(shift.total_opening_reading || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right">{(shift.total_closing_reading || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right font-medium">
                                {((shift.total_closing_reading || 0) - (shift.total_opening_reading || 0)).toFixed(2)} L
                              </td>
                              <td className="py-3 px-4 text-right font-medium">{formatCurrency(shift.total_sales || 0)}</td>
                              <td className="py-3 px-4 text-center">
                                {getStatusBadge(shift.status)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/reports/nozzle-sales?shift_id=${shift.id}`)}
                                >
                                  <Fuel className="h-4 w-4 mr-1" />
                                  Nozzles
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 0 || loading}
                          className="rounded-xl"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-slate-500">
                          Page {currentPage + 1} of {Math.max(1, Math.ceil(totalShiftsCount / PAGE_SIZE))}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!hasMore || loading}
                          className="rounded-xl"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-navy-900">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>

    </div>
  )
}
