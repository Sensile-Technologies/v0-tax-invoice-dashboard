"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Users, Award, Calendar, Leaf } from "lucide-react"
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

const impactData = [
  { category: "CO2 Offset", value: 2450 },
  { category: "Trees Equivalent", value: 112 },
  { category: "Carbon Credits", value: 89 },
  { category: "Green Purchases", value: 1248 },
]

const loyaltyCustomers = [
  { id: 1, name: "James Mwangi", points: 2450, tier: "Gold", purchases: 45, lastActivity: "2 days ago" },
  { id: 2, name: "Mary Njeri", points: 3200, tier: "Platinum", purchases: 67, lastActivity: "1 day ago" },
  { id: 3, name: "Peter Ochieng", points: 1850, tier: "Silver", purchases: 32, lastActivity: "5 days ago" },
  { id: 4, name: "Grace Wanjiku", points: 4100, tier: "Platinum", purchases: 89, lastActivity: "Today" },
  { id: 5, name: "John Kamau", points: 1200, tier: "Bronze", purchases: 18, lastActivity: "1 week ago" },
]

const earningRules = [
  { id: 1, rule: "Purchase", description: "Earn 1 point per KES 100 spent", multiplier: "1x", status: "Active" },
  {
    id: 2,
    rule: "Referral",
    description: "Earn 500 points per successful referral",
    multiplier: "5x",
    status: "Active",
  },
  { id: 3, rule: "Birthday", description: "Double points on birthday month", multiplier: "2x", status: "Active" },
  { id: 4, rule: "Review", description: "Earn 100 points for product review", multiplier: "1x", status: "Active" },
]

export default function LoyaltyPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const { formatCurrency } = useCurrency()
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLoyaltyTransactions = async () => {
      try {
        const selectedBranch = localStorage.getItem("selectedBranch")
        if (!selectedBranch) return

        const branch = JSON.parse(selectedBranch)
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data, error } = await supabase
          .from("loyalty_transactions")
          .select("*")
          .eq("branch_id", branch.id)
          .order("transaction_date", { ascending: false })

        if (error) throw error
        setLoyaltyTransactions(data || [])
      } catch (error) {
        console.error("Error fetching loyalty transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoyaltyTransactions()
    const interval = setInterval(fetchLoyaltyTransactions, 5000)
    return () => clearInterval(interval)
  }, [])

  const totalPointsIssued = loyaltyTransactions.reduce((sum, t) => sum + (t.points_earned || 0), 0)
  const uniqueCustomers = new Set(loyaltyTransactions.map((t) => t.customer_name)).size
  const totalRevenue = loyaltyTransactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0)

  const filteredCustomers = loyaltyCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Forest background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/images/image.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Sidebar with transparent background */}
      <div className="relative z-10">
        <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} transparent={true} />
      </div>

      {/* Main content area matching sales page structure */}
      <div className="flex flex-1 flex-col overflow-hidden -ml-6 mt-6 bg-white rounded-tl-3xl shadow-2xl z-10">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-balance">Tuzwa Loyalty Program</h1>
                  <p className="text-muted-foreground text-pretty">
                    Manage rewards, track engagement, and grow customer loyalty
                  </p>
                </div>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    {loyaltyTransactions.length > 0 ? (totalPointsIssued / loyaltyTransactions.length).toFixed(1) : "0"}
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
                                  <td className="p-3 text-right">{transaction.quantity?.toFixed(2) || "0.00"}</td>
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
                                      {transaction.points_earned?.toFixed(0) || 0} pts
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                          <div>Showing {loyaltyTransactions.length} transaction(s)</div>
                          <div className="flex items-center gap-4">
                            <div className="font-medium text-foreground">
                              Total Points: <span className="text-green-600">{totalPointsIssued.toFixed(0)} pts</span>
                            </div>
                            <div className="font-medium text-foreground">
                              Total Amount: <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Earning Rules Configuration</CardTitle>
                        <CardDescription>Define how customers earn loyalty points</CardDescription>
                      </div>
                      <Button className="rounded-xl bg-green-500 hover:bg-green-600 hover:shadow-lg transition-all">
                        Add New Rule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left text-sm font-medium">Rule</th>
                            <th className="p-3 text-left text-sm font-medium">Description</th>
                            <th className="p-3 text-left text-sm font-medium">Multiplier</th>
                            <th className="p-3 text-left text-sm font-medium">Status</th>
                            <th className="p-3 text-left text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earningRules.map((rule) => (
                            <tr key={rule.id} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="p-3 font-medium">{rule.rule}</td>
                              <td className="p-3 text-muted-foreground">{rule.description}</td>
                              <td className="p-3">
                                <Badge className="rounded-full bg-blue-100 text-blue-800">{rule.multiplier}</Badge>
                              </td>
                              <td className="p-3">
                                <Badge className="rounded-full bg-green-100 text-green-800">{rule.status}</Badge>
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                          <div className="text-3xl font-bold text-green-700">2,450 kg</div>
                          <p className="text-xs text-green-600 mt-1">+18.5% this month</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl border-blue-200 bg-blue-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-blue-700">Trees Equivalent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-700">112</div>
                          <p className="text-xs text-blue-600 mt-1">Trees planted equivalent</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl border-purple-200 bg-purple-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-purple-700">Carbon Credits</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-purple-700">89</div>
                          <p className="text-xs text-purple-600 mt-1">Credits earned</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl border-teal-200 bg-teal-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-teal-700">Green Purchases</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-teal-700">1,248</div>
                          <p className="text-xs text-teal-600 mt-1">Eco-friendly transactions</p>
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
            </Tabs>

            <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-navy-900">
              Powered by <span className="font-semibold">Sensile Technologies East Africa Ltd</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
