"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const DashboardSidebar = dynamic(() => import("@/components/dashboard-sidebar"), { ssr: false })
const DashboardHeader = dynamic(() => import("@/components/dashboard-header"), { ssr: false })
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Printer, RefreshCw, Clock, Fuel, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"
import { ReportTabs } from "@/components/report-tabs"
import { useCurrency } from "@/lib/currency-utils"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface ShiftDetails {
  shift: any
  nozzleReadings: any[]
  tankReadings: any[]
  collections: any[]
  expenses: any[]
  banking: any[]
  salesSummary: { count: number; total_amount: number; total_quantity: number }
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalShiftsCount, setTotalShiftsCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 20

  const [userId, setUserId] = useState<string | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  
  // Shift details state
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)
  const [shiftDetails, setShiftDetails] = useState<ShiftDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Get the current selected branch from localStorage
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
      // Get initial branch selection
      const branchId = getSelectedBranchId()
      setSelectedBranchId(branchId)
      
      // Try localStorage first (backward compatibility)
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
      
      // Fall back to cookie-based session
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
    
    // Listen for branch changes (when user switches branch in header)
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "selectedBranch") {
        const newBranchId = getSelectedBranchId()
        setSelectedBranchId(newBranchId)
      }
    }
    
    // Also poll for changes (for same-tab localStorage updates)
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
  
  // Fetch shifts when userId or selectedBranchId changes
  useEffect(() => {
    if (userId) {
      setCurrentPage(0)
      fetchShifts(userId, dateFrom, dateTo, 0)
    }
  }, [userId, selectedBranchId])

  useEffect(() => {
    // Re-fetch when date filters change
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
      
      // Get branch_id from selectedBranch (header selection) first, then fall back to user's assigned branch
      let branchId: string | null = null
      
      // First priority: use the branch selected in the header (stored in selectedBranch)
      const selectedBranchStr = localStorage.getItem("selectedBranch")
      if (selectedBranchStr) {
        try {
          const selectedBranch = JSON.parse(selectedBranchStr)
          // "hq" means headquarters - no specific branch filter
          if (selectedBranch.id && selectedBranch.id !== "hq") {
            branchId = selectedBranch.id
          }
        } catch (e) {}
      }
      
      // Second priority: use user's assigned branch (for supervisors/managers)
      if (!branchId) {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            branchId = user.branch_id
          } catch (e) {}
        }
      }
      
      // Third priority: fetch from session
      if (!branchId) {
        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            branchId = sessionData.user?.branch_id
          }
        } catch (e) {}
      }
      
      if (branchId) {
        params.append('branch_id', branchId)
      }
      if (fromDate) params.append('date_from', fromDate)
      if (toDate) params.append('date_to', toDate)

      const response = await fetch(`/api/shifts/list?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setShifts(data.data || [])
        setTotalShiftsCount(data.pagination?.total || 0)
        setHasMore(data.pagination?.hasMore || false)
        
        const totalSales = data.data.reduce((sum: number, s: Shift) => sum + (s.total_sales || 0), 0)
        const totalMeterDiff = data.data.reduce((sum: number, s: Shift) => sum + ((s.total_closing_reading || 0) - (s.total_opening_reading || 0)), 0)
        setSummary({
          totalShifts: data.pagination?.total || data.data.length,
          totalSales,
          averagePerShift: data.data.length > 0 ? totalSales / data.data.length : 0,
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
  
  function handlePreviousPage() {
    if (currentPage > 0 && userId) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchShifts(userId, dateFrom, dateTo, newPage)
    }
  }
  
  function handleNextPage() {
    if (hasMore && userId) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchShifts(userId, dateFrom, dateTo, newPage)
    }
  }

  async function fetchShiftDetails(shiftId: string) {
    setSelectedShiftId(shiftId)
    setDetailsLoading(true)
    try {
      const response = await fetch(`/api/shifts/${shiftId}/details`)
      const data = await response.json()
      if (data.success) {
        setShiftDetails(data)
      } else {
        toast.error(data.error || 'Failed to fetch shift details')
      }
    } catch (error) {
      console.error('Error fetching shift details:', error)
      toast.error('Failed to fetch shift details')
    } finally {
      setDetailsLoading(false)
    }
  }

  function formatDateTime(dateString: string | null) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>
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
                  <p className="text-slate-600 mt-1">Cashier shift performance and reconciliation</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => {
                      const userStr = localStorage.getItem("user")
                      if (userStr) {
                        const user = JSON.parse(userStr)
                        setUserId(user.id)
                        fetchShifts(user.id)
                      }
                    }}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl mb-6">
                <CardHeader>
                  <CardTitle>Shift Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Total Shifts</p>
                      <p className="text-2xl font-bold">{summary.totalShifts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Sales</p>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Average Per Shift</p>
                      <p className="text-2xl font-bold">{formatCurrency(summary.averagePerShift)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Volume (L)</p>
                      <p className="text-2xl font-bold">
                        {summary.totalMeterDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-end">
                    <div className="text-sm text-slate-500">
                      Showing {shifts.length} of {totalShiftsCount} shifts
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-500">Loading shifts...</span>
                    </div>
                  ) : shifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Clock className="h-12 w-12 mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No shifts recorded yet</p>
                      <p className="text-sm">Shifts will appear here when cashiers start and end their shifts via the mobile app</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Branch</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Started By</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Start Time</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">End Time</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Volume Sold (L)</th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Amount</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shifts.map((shift) => (
                            <tr key={shift.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-4">{shift.branch_name || 'Unknown'}</td>
                              <td className="py-3 px-4">{shift.cashier}</td>
                              <td className="py-3 px-4">{formatDateTime(shift.start_time)}</td>
                              <td className="py-3 px-4">{formatDateTime(shift.end_time)}</td>
                              <td className="py-3 px-4 text-right font-mono">
                                {((shift.total_closing_reading || 0) - (shift.total_opening_reading || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(shift.total_sales)}</td>
                              <td className="py-3 px-4 text-center">
                                {getStatusBadge(shift.status)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => fetchShiftDetails(shift.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/reports/nozzle-sales?shift_id=${shift.id}`)}
                                  >
                                    <Fuel className="h-4 w-4 mr-1" />
                                    Nozzles
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Pagination Controls */}
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

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShiftId} onOpenChange={(open: boolean) => !open && setSelectedShiftId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Loading details...</span>
            </div>
          ) : shiftDetails ? (
            <div className="mt-6 space-y-6">
              {/* Shift Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-500">Branch</p>
                  <p className="font-medium">{shiftDetails.shift.branch_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Started By</p>
                  <p className="font-medium">{shiftDetails.shift.cashier}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Start Time</p>
                  <p className="font-medium">{formatDateTime(shiftDetails.shift.start_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">End Time</p>
                  <p className="font-medium">{formatDateTime(shiftDetails.shift.end_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Invoices</p>
                  <p className="font-medium">{shiftDetails.salesSummary.count}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Sales</p>
                  <p className="font-medium">{formatCurrency(shiftDetails.salesSummary.total_amount)}</p>
                </div>
              </div>

              <Tabs defaultValue="nozzles" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="nozzles">Nozzles</TabsTrigger>
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="banking">Banking</TabsTrigger>
                </TabsList>

                <TabsContent value="nozzles" className="mt-4">
                  <div className="space-y-3">
                    {shiftDetails.nozzleReadings.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No nozzle readings recorded</p>
                    ) : (
                      shiftDetails.nozzleReadings.map((reading: any) => (
                        <div key={reading.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">{reading.dispenser_name || 'Dispenser'} - Nozzle {reading.nozzle_number}</span>
                              <Badge className="ml-2" variant="outline">{reading.fuel_type}</Badge>
                            </div>
                            <span className="font-bold text-lg">{reading.meter_difference.toFixed(2)} L</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <div>Opening: {reading.opening_reading.toFixed(2)}</div>
                            <div>Closing: {reading.closing_reading.toFixed(2)}</div>
                            {reading.rtt > 0 && <div>RTT: {reading.rtt.toFixed(2)} L</div>}
                            {reading.self_fueling > 0 && <div>Self Fueling: {reading.self_fueling.toFixed(2)} L</div>}
                            {reading.prepaid_sale > 0 && <div>Prepaid: {reading.prepaid_sale.toFixed(2)} L</div>}
                            {reading.incoming_attendant_name && <div className="col-span-2">Incoming: {reading.incoming_attendant_name}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="collections" className="mt-4">
                  <div className="space-y-3">
                    {shiftDetails.collections.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No collections recorded</p>
                    ) : (
                      shiftDetails.collections.map((collection: any) => (
                        <div key={collection.staff_id} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">{collection.staff_name}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {collection.payments.cash > 0 && (
                              <div className="flex justify-between">
                                <span>Cash:</span>
                                <span className="font-medium">{formatCurrency(collection.payments.cash)}</span>
                              </div>
                            )}
                            {collection.payments.mpesa > 0 && (
                              <div className="flex justify-between">
                                <span>Mpesa:</span>
                                <span className="font-medium">{formatCurrency(collection.payments.mpesa)}</span>
                              </div>
                            )}
                            {collection.payments.mobile_money > 0 && (
                              <div className="flex justify-between">
                                <span>Mobile Money:</span>
                                <span className="font-medium">{formatCurrency(collection.payments.mobile_money)}</span>
                              </div>
                            )}
                            {collection.payments.card > 0 && (
                              <div className="flex justify-between">
                                <span>Card:</span>
                                <span className="font-medium">{formatCurrency(collection.payments.card)}</span>
                              </div>
                            )}
                            {collection.payments.credit > 0 && (
                              <div className="flex justify-between">
                                <span>Credit:</span>
                                <span className="font-medium">{formatCurrency(collection.payments.credit)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="mt-4">
                  <div className="space-y-3">
                    {shiftDetails.expenses.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No expenses recorded</p>
                    ) : (
                      shiftDetails.expenses.map((expense: any) => (
                        <div key={expense.id} className="p-3 border rounded-lg flex justify-between">
                          <div>
                            <div className="font-medium">{expense.expense_account_name}</div>
                            {expense.description && <div className="text-sm text-slate-500">{expense.description}</div>}
                          </div>
                          <div className="font-bold">{formatCurrency(expense.amount)}</div>
                        </div>
                      ))
                    )}
                    {shiftDetails.expenses.length > 0 && (
                      <div className="p-3 bg-slate-100 rounded-lg flex justify-between font-bold">
                        <span>Total Expenses</span>
                        <span>{formatCurrency(shiftDetails.expenses.reduce((sum: number, e: any) => sum + e.amount, 0))}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="banking" className="mt-4">
                  <div className="space-y-3">
                    {shiftDetails.banking.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No banking entries recorded</p>
                    ) : (
                      shiftDetails.banking.map((entry: any) => (
                        <div key={entry.id} className="p-3 border rounded-lg flex justify-between">
                          <div>
                            <div className="font-medium">{entry.account_name}</div>
                            <div className="text-sm text-slate-500">{entry.bank_name} - {entry.account_number}</div>
                            {entry.notes && <div className="text-sm text-slate-400">{entry.notes}</div>}
                          </div>
                          <div className="font-bold">{formatCurrency(entry.amount)}</div>
                        </div>
                      ))
                    )}
                    {shiftDetails.banking.length > 0 && (
                      <div className="p-3 bg-slate-100 rounded-lg flex justify-between font-bold">
                        <span>Total Banking</span>
                        <span>{formatCurrency(shiftDetails.banking.reduce((sum: number, b: any) => sum + b.amount, 0))}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
