"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Users, Award, Calendar, Leaf, ChevronLeft, ChevronRight, MessageSquare, Plus, X, Loader2, Gift, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useCurrency } from "@/lib/currency-utils"

const loyaltyData = [
  { month: "Jan", points: 12500 },
  { month: "Feb", points: 14200 },
  { month: "Mar", points: 15800 },
  { month: "Apr", points: 18500 },
  { month: "May", points: 21200 },
  { month: "Jun", points: 24800 },
]




export default function LoyaltyPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const { formatCurrency } = useCurrency()
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<any[]>([])
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [transactionsPagination, setTransactionsPagination] = useState({ total: 0, totalPages: 1 })
  const [transactionsAggregates, setTransactionsAggregates] = useState({ totalPoints: 0, totalRevenue: 0, uniqueCustomers: 0 })
  const [customersPage, setCustomersPage] = useState(1)
  const [customersPagination, setCustomersPagination] = useState({ total: 0, totalPages: 1 })
  const [customerSearch, setCustomerSearch] = useState("")
  const pageSize = 50
  const { toast } = useToast()
  
  // WhatsApp DSSR Notifications state
  const [branchId, setBranchId] = useState<string | null>(null)
  const [whatsappDirectors, setWhatsappDirectors] = useState<string[]>([])
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false)
  
  // User role and bulk redemption state
  const [userRole, setUserRole] = useState<string | null>(null)
  const [redemptionData, setRedemptionData] = useState<{customers: any[], summary: any} | null>(null)
  const [loadingRedemption, setLoadingRedemption] = useState(false)
  const [processingRedemption, setProcessingRedemption] = useState(false)
  
  // Earning Rules state
  const [earningRulesConfig, setEarningRulesConfig] = useState({
    loyalty_earn_type: 'per_amount' as 'per_litre' | 'per_amount',
    loyalty_points_per_litre: 1,
    loyalty_points_per_amount: 1,
    loyalty_amount_threshold: 100,
    redemption_points_per_ksh: 1,
    min_redemption_points: 100,
    max_redemption_percent: 50
  })
  const [loadingEarningRules, setLoadingEarningRules] = useState(false)
  const [savingEarningRules, setSavingEarningRules] = useState(false)

  // Calculate environmental impact metrics from real loyalty transaction data
  // Formulas based on fuel industry standards:
  // - CO2 Offset: ~0.5 kg CO2 saved per 100 KES of loyalty purchases (fuel efficiency incentives)
  // - Trees Equivalent: 1 tree absorbs ~22 kg CO2 per year
  // - Carbon Credits: 1 credit per 1000 KES of green transactions
  // - Green Purchases: Count of unique loyalty transactions
  const impactMetrics = useMemo(() => {
    const totalRevenue = Number(transactionsAggregates.totalRevenue) || 0
    const totalTransactions = Number(transactionsPagination.total) || 0
    
    const co2Offset = Math.round((totalRevenue / 100) * 0.5) // 0.5 kg CO2 per 100 KES
    const treesEquivalent = Math.round(co2Offset / 22) // 22 kg CO2 per tree per year
    const carbonCredits = Math.round(totalRevenue / 1000) // 1 credit per 1000 KES
    const greenPurchases = totalTransactions
    
    return {
      co2Offset,
      treesEquivalent,
      carbonCredits,
      greenPurchases
    }
  }, [transactionsAggregates.totalRevenue, transactionsPagination.total])

  // Data for the impact bar chart
  const impactData = useMemo(() => [
    { category: "CO2 Offset (kg)", value: impactMetrics.co2Offset },
    { category: "Trees Equivalent", value: impactMetrics.treesEquivalent },
    { category: "Carbon Credits", value: impactMetrics.carbonCredits },
    { category: "Green Purchases", value: impactMetrics.greenPurchases },
  ], [impactMetrics])

  const getTier = (points: number) => {
    if (points >= 4000) return "Platinum"
    if (points >= 2000) return "Gold"
    if (points >= 1000) return "Silver"
    return "Bronze"
  }

  const formatLastActivity = (date: string | null) => {
    if (!date) return "No activity"
    const activityDate = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - activityDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return "1 week ago"
    return `${Math.floor(diffDays / 7)} weeks ago`
  }

  useEffect(() => {
    const fetchLoyaltyTransactions = async () => {
      try {
        const selectedBranch = localStorage.getItem("selectedBranch")
        if (!selectedBranch) return

        const branch = JSON.parse(selectedBranch)
        const response = await fetch(`/api/loyalty-transactions?branch_id=${branch.id}&page=${transactionsPage}&pageSize=${pageSize}`)
        const result = await response.json()

        if (!result.success) throw new Error(result.error)
        setLoyaltyTransactions(result.data || [])
        if (result.pagination) {
          setTransactionsPagination({ total: result.pagination.total, totalPages: result.pagination.totalPages })
        }
        if (result.aggregates) {
          setTransactionsAggregates(result.aggregates)
        }
      } catch (error) {
        console.error("Error fetching loyalty transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoyaltyTransactions()
  }, [transactionsPage])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const selectedBranch = localStorage.getItem("selectedBranch")
        if (!selectedBranch) {
          setLoadingCustomers(false)
          return
        }

        const branch = JSON.parse(selectedBranch)
        const searchParam = customerSearch ? `&search=${encodeURIComponent(customerSearch)}` : ''
        const response = await fetch(`/api/customers?branch_id=${branch.id}&page=${customersPage}&pageSize=${pageSize}${searchParam}`)
        
        if (response.ok) {
          const data = await response.json()
          const customerList = (data.data || []).map((c: any) => ({
            id: c.id,
            name: c.cust_nm || "Unknown",
            points: parseInt(c.total_points) || 0,
            tier: getTier(parseInt(c.total_points) || 0),
            purchases: parseInt(c.total_purchases) || 0,
            lastActivity: formatLastActivity(c.last_activity),
            phone: c.tel_no,
            email: c.email,
            kra_pin: c.cust_tin,
          }))
          setLoyaltyCustomers(customerList)
          if (data.pagination) {
            setCustomersPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages })
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [customersPage, customerSearch])

  // Fetch branch ID and WhatsApp directors
  useEffect(() => {
    const fetchWhatsAppConfig = async () => {
      try {
        const selectedBranch = localStorage.getItem("selectedBranch")
        if (!selectedBranch) return

        const branch = JSON.parse(selectedBranch)
        setBranchId(branch.id)
        setLoadingWhatsapp(true)
        
        // Fetch user role
        try {
          const sessionRes = await fetch('/api/auth/session')
          const sessionData = await sessionRes.json()
          if (sessionData.user?.role) {
            setUserRole(sessionData.user.role)
          }
        } catch (e) {
          console.error('Failed to fetch session:', e)
        }

        const response = await fetch(`/api/branches/whatsapp-directors?branch_id=${branch.id}`)
        const data = await response.json()
        if (data.success) {
          setWhatsappDirectors(data.directors || [])
        }
      } catch (error) {
        console.error("Error fetching WhatsApp config:", error)
      } finally {
        setLoadingWhatsapp(false)
      }
    }

    fetchWhatsAppConfig()
  }, [])

  const addPhoneNumber = () => {
    if (!newPhoneNumber.trim()) return
    const cleaned = newPhoneNumber.trim()
    if (!cleaned.match(/^\+?[0-9]{10,15}$/)) {
      toast({ title: "Invalid phone number", description: "Use format: +254712345678", variant: "destructive" })
      return
    }
    if (whatsappDirectors.includes(cleaned)) {
      toast({ title: "Duplicate", description: "This number is already added", variant: "destructive" })
      return
    }
    setWhatsappDirectors([...whatsappDirectors, cleaned])
    setNewPhoneNumber("")
  }

  const removePhoneNumber = (phone: string) => {
    setWhatsappDirectors(whatsappDirectors.filter(p => p !== phone))
  }

  const saveWhatsAppSettings = async () => {
    if (!branchId) return
    setSavingWhatsapp(true)
    try {
      const response = await fetch("/api/branches/whatsapp-directors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_id: branchId, directors: whatsappDirectors })
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Saved", description: "WhatsApp settings updated successfully" })
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    } finally {
      setSavingWhatsapp(false)
    }
  }

  // Fetch earning rules when branch changes
  useEffect(() => {
    const fetchEarningRules = async () => {
      if (!branchId) return
      setLoadingEarningRules(true)
      try {
        const response = await fetch(`/api/branches/earning-rules?branch_id=${branchId}`, {
          credentials: "include"
        })
        const data = await response.json()
        if (data.success && data.data) {
          // Use nullish coalescing (??) not OR (||) - CRITICAL bug pattern
          setEarningRulesConfig({
            loyalty_earn_type: data.data.loyalty_earn_type ?? 'per_amount',
            loyalty_points_per_litre: Number(data.data.loyalty_points_per_litre ?? 1),
            loyalty_points_per_amount: Number(data.data.loyalty_points_per_amount ?? 1),
            loyalty_amount_threshold: Math.max(1, Number(data.data.loyalty_amount_threshold ?? 100)),
            redemption_points_per_ksh: Number(data.data.redemption_points_per_ksh ?? 1),
            min_redemption_points: Number(data.data.min_redemption_points ?? 100),
            max_redemption_percent: Number(data.data.max_redemption_percent ?? 50)
          })
        }
      } catch (error) {
        console.error("Failed to fetch earning rules:", error)
      } finally {
        setLoadingEarningRules(false)
      }
    }
    fetchEarningRules()
  }, [branchId])

  const saveEarningRules = async () => {
    if (!branchId) return
    setSavingEarningRules(true)
    try {
      const response = await fetch("/api/branches/earning-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          branch_id: branchId,
          ...earningRulesConfig
        })
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Saved", description: "Earning rules updated successfully" })
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save earning rules", variant: "destructive" })
    } finally {
      setSavingEarningRules(false)
    }
  }

  // Use aggregates from API for branch-wide totals (not from page data)
  const totalPointsIssued = transactionsAggregates.totalPoints
  const uniqueCustomers = transactionsAggregates.uniqueCustomers
  const totalRevenue = transactionsAggregates.totalRevenue

  // Customers are already filtered server-side via search param
  const filteredCustomers = loyaltyCustomers

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/images/image.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10">
        <DashboardSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
          transparent={true}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-8 my-2 lg:my-6 mx-2 lg:mr-6 relative z-10">
        <div className="bg-white rounded-2xl lg:rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-green-500">
                    <Leaf className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-balance">Tuzwa Loyalty Program</h1>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Manage rewards, track engagement, and grow customer loyalty
                    </p>
                  </div>
                </div>
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setCustomersPage(1)
                    }}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Points Issued</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPointsIssued.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total loyalty points earned</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Unique loyalty customers</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Impact</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">From loyalty sales</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Points/Sale</CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactionsPagination.total > 0 ? (totalPointsIssued / transactionsPagination.total).toFixed(1) : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Points per transaction</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="customers" className="space-y-4">
              <TabsList className="rounded-xl">
                <TabsTrigger value="customers" className="rounded-lg">
                  Loyalty Customers
                </TabsTrigger>
                <TabsTrigger value="transactions" className="rounded-lg">
                  Loyalty Transactions
                </TabsTrigger>
                <TabsTrigger value="rules" className="rounded-lg">
                  Earning Rules
                </TabsTrigger>
                <TabsTrigger value="points" className="rounded-lg">
                  Points Earned
                </TabsTrigger>
                <TabsTrigger value="impact" className="rounded-lg">
                  Impact Tracker
                </TabsTrigger>
                <TabsTrigger value="redemptions" className="rounded-lg">
                  <Gift className="h-4 w-4 mr-1" />
                  Bulk Redemption
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customers" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Loyalty Customers</CardTitle>
                        <CardDescription>Active members in your loyalty program</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          className="rounded-xl"
                        />
                        <Input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left text-sm font-medium">Customer</th>
                            <th className="p-3 text-left text-sm font-medium">Points</th>
                            <th className="p-3 text-left text-sm font-medium">Tier</th>
                            <th className="p-3 text-left text-sm font-medium">Purchases</th>
                            <th className="p-3 text-left text-sm font-medium">Last Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="p-3 font-medium">{customer.name}</td>
                              <td className="p-3">{customer.points.toLocaleString()}</td>
                              <td className="p-3">
                                <Badge
                                  className={`rounded-full ${
                                    customer.tier === "Platinum"
                                      ? "bg-purple-100 text-purple-800"
                                      : customer.tier === "Gold"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : customer.tier === "Silver"
                                          ? "bg-gray-100 text-gray-800"
                                          : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {customer.tier}
                                </Badge>
                              </td>
                              <td className="p-3">{customer.purchases}</td>
                              <td className="p-3 text-muted-foreground">{customer.lastActivity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <div>Showing {filteredCustomers.length} of {customersPagination.total} customer(s)</div>
                    </div>
                    {customersPagination.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomersPage(p => Math.max(1, p - 1))}
                          disabled={customersPage === 1}
                          className="rounded-lg"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">
                          Page {customersPage} of {customersPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomersPage(p => Math.min(customersPagination.totalPages, p + 1))}
                          disabled={customersPage === customersPagination.totalPages}
                          className="rounded-lg"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Loyalty Transactions Report</CardTitle>
                        <CardDescription>Track all loyalty customer transactions and points earned</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          className="rounded-xl"
                        />
                        <Input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          className="rounded-xl"
                        />
                        <Button variant="outline" className="rounded-xl bg-transparent">
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
                    ) : loyaltyTransactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No loyalty transactions found. Record a sale with a loyalty customer to see transactions here.
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left text-sm font-medium">Date</th>
                                <th className="p-3 text-left text-sm font-medium">Customer Name</th>
                                <th className="p-3 text-left text-sm font-medium">PIN</th>
                                <th className="p-3 text-left text-sm font-medium">Fuel Type</th>
                                <th className="p-3 text-right text-sm font-medium">Quantity (L)</th>
                                <th className="p-3 text-right text-sm font-medium">Amount</th>
                                <th className="p-3 text-left text-sm font-medium">Payment</th>
                                <th className="p-3 text-right text-sm font-medium">Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loyaltyTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                                  <td className="p-3 text-sm">
                                    {new Date(transaction.transaction_date).toLocaleDateString()}
                                  </td>
                                  <td className="p-3 font-medium">{transaction.customer_name}</td>
                                  <td className="p-3 text-sm">{transaction.customer_pin || "N/A"}</td>
                                  <td className="p-3">{transaction.fuel_type || "N/A"}</td>
                                  <td className="p-3 text-right">{(parseFloat(transaction.quantity) || 0).toFixed(2)}</td>
                                  <td className="p-3 text-right font-medium">
                                    {formatCurrency(transaction.transaction_amount)}
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline" className="capitalize">
                                      {transaction.payment_method || "Cash"}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right">
                                    <Badge className="bg-green-100 text-green-800 rounded-full">
                                      {(parseFloat(transaction.points_earned) || 0).toFixed(0)} pts
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                          <div>
                            Showing {loyaltyTransactions.length} of {transactionsPagination.total} transaction(s)
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="font-medium text-foreground">
                              Total Points: <span className="text-green-600">{totalPointsIssued.toFixed(0)} pts</span>
                            </div>
                            <div className="font-medium text-foreground">
                              Total Amount: <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
                            </div>
                          </div>
                        </div>
                        {transactionsPagination.totalPages > 1 && (
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTransactionsPage(p => Math.max(1, p - 1))}
                              disabled={transactionsPage === 1}
                              className="rounded-lg"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <span className="px-3 py-1 text-sm">
                              Page {transactionsPage} of {transactionsPagination.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTransactionsPage(p => Math.min(transactionsPagination.totalPages, p + 1))}
                              disabled={transactionsPage === transactionsPagination.totalPages}
                              className="rounded-lg"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div>
                      <CardTitle>Earning Rules Configuration</CardTitle>
                      <CardDescription>Define how customers earn loyalty points at this branch</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingEarningRules ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Points Earning Method</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setEarningRulesConfig(prev => ({ ...prev, loyalty_earn_type: 'per_litre' }))}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                earningRulesConfig.loyalty_earn_type === 'per_litre'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">Per Litre</div>
                              <div className="text-sm text-muted-foreground">Earn points based on fuel volume purchased</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEarningRulesConfig(prev => ({ ...prev, loyalty_earn_type: 'per_amount' }))}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                earningRulesConfig.loyalty_earn_type === 'per_amount'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">Per Amount Spent</div>
                              <div className="text-sm text-muted-foreground">Earn points based on money spent</div>
                            </button>
                          </div>
                        </div>

                        {earningRulesConfig.loyalty_earn_type === 'per_litre' ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Points per Litre</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={earningRulesConfig.loyalty_points_per_litre}
                                onChange={(e) => setEarningRulesConfig(prev => ({
                                  ...prev,
                                  loyalty_points_per_litre: parseFloat(e.target.value) || 0
                                }))}
                                className="w-32 rounded-xl"
                              />
                              <span className="text-sm text-muted-foreground">points per litre purchased</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Example: If set to 2, a 50L purchase earns 100 points
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Points Earned</label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={earningRulesConfig.loyalty_points_per_amount}
                                  onChange={(e) => setEarningRulesConfig(prev => ({
                                    ...prev,
                                    loyalty_points_per_amount: parseFloat(e.target.value) || 0
                                  }))}
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Per Amount ({formatCurrency(earningRulesConfig.loyalty_amount_threshold).split(' ')[0]})</label>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={earningRulesConfig.loyalty_amount_threshold}
                                  onChange={(e) => setEarningRulesConfig(prev => ({
                                    ...prev,
                                    loyalty_amount_threshold: Math.max(1, parseFloat(e.target.value) || 1)
                                  }))}
                                  className="rounded-xl"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Example: Earn {earningRulesConfig.loyalty_points_per_amount} point(s) for every {formatCurrency(earningRulesConfig.loyalty_amount_threshold)} spent
                            </p>
                          </div>
                        )}

                        {/* Redemption Rules Section */}
                        <div className="pt-6 mt-6 border-t">
                          <h4 className="font-semibold text-base mb-4">Redemption Rules</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure how customers can redeem their earned points for discounts
                          </p>
                          
                          <div className="grid gap-4">
                            <div>
                              <label className="text-sm font-medium">Points per KES 1</label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={earningRulesConfig.redemption_points_per_ksh}
                                onChange={(e) => setEarningRulesConfig(prev => ({
                                  ...prev,
                                  redemption_points_per_ksh: Math.max(1, parseInt(e.target.value) || 1)
                                }))}
                                className="mt-1 rounded-xl"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Example: {earningRulesConfig.redemption_points_per_ksh} point(s) = KES 1 discount
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Minimum Points to Redeem</label>
                              <Input
                                type="number"
                                min="0"
                                step="10"
                                value={earningRulesConfig.min_redemption_points}
                                onChange={(e) => setEarningRulesConfig(prev => ({
                                  ...prev,
                                  min_redemption_points: Math.max(0, parseInt(e.target.value) || 0)
                                }))}
                                className="mt-1 rounded-xl"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Customer must have at least {earningRulesConfig.min_redemption_points} points to redeem
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Max Discount Percentage</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="5"
                                value={earningRulesConfig.max_redemption_percent}
                                onChange={(e) => setEarningRulesConfig(prev => ({
                                  ...prev,
                                  max_redemption_percent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                                }))}
                                className="mt-1 rounded-xl"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Maximum {earningRulesConfig.max_redemption_percent}% of transaction can be covered by points
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <Button
                            onClick={saveEarningRules}
                            disabled={savingEarningRules}
                            className="rounded-xl bg-green-500 hover:bg-green-600 hover:shadow-lg transition-all"
                          >
                            {savingEarningRules ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Earning & Redemption Rules"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* WhatsApp DSSR Notifications */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>WhatsApp DSSR Notifications</CardTitle>
                        <CardDescription>
                          Configure phone numbers to receive Daily Sales Summary Reports via WhatsApp when shifts are reconciled
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingWhatsapp ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter phone number (e.g., +254712345678)"
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPhoneNumber()}
                            className="flex-1 rounded-xl"
                          />
                          <Button onClick={addPhoneNumber} className="rounded-xl bg-green-500 hover:bg-green-600">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {whatsappDirectors.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            No director numbers configured. Add phone numbers to receive DSSR notifications via WhatsApp.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {whatsappDirectors.map((phone, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                                <span className="font-medium">{phone}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removePhoneNumber(phone)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button 
                          onClick={saveWhatsAppSettings} 
                          disabled={savingWhatsapp}
                          className="rounded-xl bg-green-500 hover:bg-green-600"
                        >
                          {savingWhatsapp ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save WhatsApp Settings"
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="points" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Loyalty Points Earned Over Time</CardTitle>
                    <CardDescription>Track how points are accumulated across your program</CardDescription>
                  </CardHeader>
                  <CardContent className="px-2">
                    <ChartContainer
                      config={{
                        points: {
                          label: "Points",
                          color: "#22c55e",
                        },
                      }}
                      className="h-[400px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={loyaltyData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" height={40} />
                          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" width={70} domain={[0, "auto"]} />
                          <Tooltip
                            formatter={(value: number) => [value.toLocaleString(), "Points"]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="points"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: "#22c55e", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="impact" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Environmental Impact Tracker</CardTitle>
                    <CardDescription>
                      Track CO2 offset and environmental benefits from the loyalty program
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                      <Card className="rounded-xl border-green-200 bg-green-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-green-700">CO2 Offset Achieved</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-700">{impactMetrics.co2Offset.toLocaleString()} kg</div>
                          <p className="text-xs text-green-600 mt-1">Based on loyalty revenue</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl border-blue-200 bg-blue-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-blue-700">Trees Equivalent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-700">{impactMetrics.treesEquivalent.toLocaleString()}</div>
                          <p className="text-xs text-blue-600 mt-1">~22 kg CO2 per tree/year</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl border-purple-200 bg-purple-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-purple-700">Carbon Credits</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-purple-700">{impactMetrics.carbonCredits.toLocaleString()}</div>
                          <p className="text-xs text-purple-600 mt-1">1 credit per KES 1,000</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl border-teal-200 bg-teal-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-teal-700">Green Purchases</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-teal-700">{impactMetrics.greenPurchases.toLocaleString()}</div>
                          <p className="text-xs text-teal-600 mt-1">Total loyalty transactions</p>
                        </CardContent>
                      </Card>
                    </div>
                    <ChartContainer
                      config={{
                        value: {
                          label: "Value",
                          color: "#16a34a",
                        },
                      }}
                      className="h-[350px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impactData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="category"
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                            height={60}
                            angle={-15}
                            textAnchor="end"
                          />
                          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" width={70} domain={[0, "auto"]} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                          <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bulk Redemption */}
              <TabsContent value="redemptions" className="space-y-4">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                          <Gift className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle>Bulk Point Redemption</CardTitle>
                          <CardDescription>
                            Redeem loyalty points for all eligible customers at once (e.g., monthly redemption)
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={async () => {
                            if (!branchId) return
                            setLoadingRedemption(true)
                            try {
                              const response = await fetch(`/api/loyalty/bulk-redeem?branch_id=${branchId}`, {
                                credentials: 'include'
                              })
                              const data = await response.json()
                              if (data.success) {
                                setRedemptionData(data)
                              } else {
                                toast({ title: 'Error', description: data.error, variant: 'destructive' })
                              }
                            } catch (error: any) {
                              toast({ title: 'Error', description: error.message, variant: 'destructive' })
                            } finally {
                              setLoadingRedemption(false)
                            }
                          }}
                          disabled={loadingRedemption || !branchId}
                          className="rounded-xl"
                        >
                          {loadingRedemption ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load Eligible Customers'
                          )}
                        </Button>
                      </div>

                      {redemptionData && (
                        <>
                          {/* Summary Cards */}
                          <div className="grid gap-4 md:grid-cols-4">
                            <Card className="rounded-xl bg-purple-50">
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Total Customers</p>
                                <p className="text-2xl font-bold">{redemptionData.summary.total_customers}</p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl bg-green-50">
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Eligible Customers</p>
                                <p className="text-2xl font-bold text-green-600">{redemptionData.summary.eligible_customers}</p>
                                <p className="text-xs text-muted-foreground">Min {redemptionData.summary.min_points} points</p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl bg-blue-50">
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Total Points</p>
                                <p className="text-2xl font-bold text-blue-600">{redemptionData.summary.total_points.toLocaleString()}</p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl bg-amber-50">
                              <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold text-amber-600">{formatCurrency(redemptionData.summary.total_value)}</p>
                                <p className="text-xs text-muted-foreground">{redemptionData.summary.points_per_ksh} pts = KES 1</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Customer List */}
                          <div className="rounded-xl border">
                            <div className="max-h-[400px] overflow-auto">
                              <table className="w-full">
                                <thead className="bg-muted/50 sticky top-0">
                                  <tr>
                                    <th className="text-left p-3 font-medium">Customer</th>
                                    <th className="text-left p-3 font-medium">Phone/PIN</th>
                                    <th className="text-right p-3 font-medium">Points</th>
                                    <th className="text-right p-3 font-medium">Value</th>
                                    <th className="text-center p-3 font-medium">Eligible</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {redemptionData.customers.map((customer: any, index: number) => (
                                    <tr key={index} className="border-t">
                                      <td className="p-3">{customer.customer_name}</td>
                                      <td className="p-3 text-muted-foreground">{customer.customer_pin}</td>
                                      <td className="p-3 text-right font-medium">{customer.point_balance.toLocaleString()}</td>
                                      <td className="p-3 text-right">{formatCurrency(customer.point_balance / redemptionData.summary.points_per_ksh)}</td>
                                      <td className="p-3 text-center">
                                        {customer.eligible ? (
                                          <Badge className="bg-green-100 text-green-700">Eligible</Badge>
                                        ) : (
                                          <Badge variant="secondary">Below minimum</Badge>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Redemption Action */}
                          {redemptionData.summary.eligible_customers > 0 && (
                            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <div>
                                  <p className="font-medium">Ready to redeem points?</p>
                                  <p className="text-sm text-muted-foreground">
                                    This will redeem {redemptionData.summary.total_points.toLocaleString()} points for {redemptionData.summary.eligible_customers} customers worth {formatCurrency(redemptionData.summary.total_value)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={async () => {
                                  if (!branchId) return
                                  if (!confirm(`Are you sure you want to redeem ${redemptionData.summary.total_points.toLocaleString()} points for ${redemptionData.summary.eligible_customers} customers? This action cannot be undone.`)) {
                                    return
                                  }
                                  setProcessingRedemption(true)
                                  try {
                                    const response = await fetch('/api/loyalty/bulk-redeem', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify({ branch_id: branchId, redeem_all: true })
                                    })
                                    const data = await response.json()
                                    if (data.success) {
                                      toast({ 
                                        title: 'Redemption Complete', 
                                        description: `${data.summary.customers_processed} customers redeemed ${data.summary.total_points_redeemed.toLocaleString()} points worth ${formatCurrency(data.summary.total_value)}` 
                                      })
                                      setRedemptionData(null) // Clear data to refresh
                                    } else {
                                      toast({ title: 'Error', description: data.error, variant: 'destructive' })
                                    }
                                  } catch (error: any) {
                                    toast({ title: 'Error', description: error.message, variant: 'destructive' })
                                  } finally {
                                    setProcessingRedemption(false)
                                  }
                                }}
                                disabled={processingRedemption}
                                className="rounded-xl bg-purple-600 hover:bg-purple-700"
                              >
                                {processingRedemption ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Gift className="mr-2 h-4 w-4" />
                                    Redeem All Points
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>

            <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-navy-900">
              Powered by <span className="font-semibold">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
    </div>
  )
}
