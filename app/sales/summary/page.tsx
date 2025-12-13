"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/currency-utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

export default function SalesSummaryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { formatCurrency } = useCurrency()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSales()
  }, [dateFilter])

  async function fetchSales() {
    try {
      setLoading(true)
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const { data: salesData, error } = await supabase
        .from("sales")
        .select("*")
        .eq("branch_id", branchId)
        .gte("sale_date", `${dateFilter.startDate}T00:00:00`)
        .lte("sale_date", `${dateFilter.endDate}T23:59:59`)
        .order("sale_date", { ascending: false })

      if (error) {
        console.error("Error fetching sales:", error)
      } else {
        const processedSales = (salesData || []).map((sale: any) => ({
          ...sale,
          quantity: Number(sale.quantity) || 0,
          unit_price: Number(sale.unit_price) || 0,
          total_amount: Number(sale.total_amount) || 0,
        }))
        setSales(processedSales)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
      toast.error("Failed to load sales data")
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0)
  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0)
  const totalTransactions = sales.length
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col ml-8 my-6 mr-6">
        <div className="bg-white rounded-tl-3xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Sales Summary</h2>
                  <p className="text-slate-600">Overview of sales statistics and trends</p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="start-date" className="text-sm whitespace-nowrap">From:</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                      className="w-40 h-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date" className="text-sm whitespace-nowrap">To:</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                      className="w-40 h-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setDateFilter({
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                      endDate: new Date().toISOString().split("T")[0],
                    })
                  }}>
                    Last 7 Days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setDateFilter({
                      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                      endDate: new Date().toISOString().split("T")[0],
                    })
                  }}>
                    Last 30 Days
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Quantity (L)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalQuantity.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTransactions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Avg. Transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(averageTransaction)}</div>
                  </CardContent>
                </Card>
              </div>

              {sales.length > 0 && (
                <>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-black">Sales by Fuel Type</CardTitle>
                        <CardDescription className="text-xs text-black/70">Revenue by fuel type</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={(() => {
                                const fuelSales = sales.reduce((acc: any, sale) => {
                                  acc[sale.fuel_type] = (acc[sale.fuel_type] || 0) + sale.total_amount
                                  return acc
                                }, {})
                                return Object.entries(fuelSales).map(([name, value]) => ({ name, value }))
                              })()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => {
                                const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                                return (
                                  <text x={x} y={y} fill="#000000" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="11" fontWeight="500">
                                    {`${name} ${(percent * 100).toFixed(0)}%`}
                                  </text>
                                )
                              }}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(() => {
                                const FUEL_COLORS: any = { Diesel: "#FFFF00", Petrol: "#FF0000", Unleaded: "#FF0000", Super: "#10B981" }
                                const fuelSales = sales.reduce((acc: any, sale) => {
                                  acc[sale.fuel_type] = (acc[sale.fuel_type] || 0) + sale.total_amount
                                  return acc
                                }, {})
                                return Object.keys(fuelSales).map((fuelType, index) => (
                                  <Cell key={`cell-${index}`} fill={FUEL_COLORS[fuelType] || "#6B7280"} />
                                ))
                              })()}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ color: "#000" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-black">Payment Methods</CardTitle>
                        <CardDescription className="text-xs text-black/70">Payment breakdown</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={(() => {
                                const normalizePaymentMethod = (method: string) => {
                                  const m = (method || "cash").toLowerCase()
                                  if (m === "mpesa" || m === "m-pesa" || m === "mobile_money") return "Mobile Money"
                                  if (m === "card") return "Card"
                                  if (m === "credit") return "Credit"
                                  return "Cash"
                                }
                                const paymentSales = sales.reduce((acc: any, sale) => {
                                  const method = normalizePaymentMethod(sale.payment_method)
                                  acc[method] = (acc[method] || 0) + sale.total_amount
                                  return acc
                                }, {})
                                return Object.entries(paymentSales).map(([name, value]) => ({ name, value }))
                              })()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => {
                                const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                                const displayName = name === "Mobile Money" ? "M.Money" : name
                                return (
                                  <text x={x} y={y} fill="#000000" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="11" fontWeight="500">
                                    {`${displayName} ${(percent * 100).toFixed(0)}%`}
                                  </text>
                                )
                              }}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(() => {
                                const PAYMENT_COLORS: any = { Cash: "#3A7085", "Mobile Money": "#008C51", Card: "#F59E0B", Credit: "#EF4444" }
                                const normalizePaymentMethod = (method: string) => {
                                  const m = (method || "cash").toLowerCase()
                                  if (m === "mpesa" || m === "m-pesa" || m === "mobile_money") return "Mobile Money"
                                  if (m === "card") return "Card"
                                  if (m === "credit") return "Credit"
                                  return "Cash"
                                }
                                const paymentSales = sales.reduce((acc: any, sale) => {
                                  const method = normalizePaymentMethod(sale.payment_method)
                                  acc[method] = (acc[method] || 0) + sale.total_amount
                                  return acc
                                }, {})
                                return Object.keys(paymentSales).map((method, index) => (
                                  <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[method] || "#6B7280"} />
                                ))
                              })()}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ color: "#000" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-black">Loyalty Program</CardTitle>
                        <CardDescription className="text-xs text-black/70">Loyalty vs non-loyalty sales</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={(() => {
                                const loyaltyTotal = sales.filter((s) => s.is_loyalty_sale).reduce((sum, s) => sum + s.total_amount, 0)
                                const nonLoyaltyTotal = sales.filter((s) => !s.is_loyalty_sale).reduce((sum, s) => sum + s.total_amount, 0)
                                return [
                                  { name: "Loyalty", value: loyaltyTotal },
                                  { name: "Non-Loyalty", value: nonLoyaltyTotal },
                                ]
                              })()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => {
                                const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                                return (
                                  <text x={x} y={y} fill="#000000" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="11" fontWeight="500">
                                    {`${name} ${(percent * 100).toFixed(0)}%`}
                                  </text>
                                )
                              }}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#C8A2C8" />
                              <Cell fill="#87CEEB" />
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ color: "#000" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-black">Revenue vs VAT</CardTitle>
                        <CardDescription className="text-xs text-black/70">Period comparison</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={(() => {
                              const vat = totalRevenue * 0.16
                              return [
                                { name: "Revenue", value: totalRevenue },
                                { name: "VAT", value: vat },
                              ]
                            })()}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: "#000", fontSize: 11 }} />
                            <YAxis tick={{ fill: "#000", fontSize: 10 }} />
                            <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ color: "#000" }} />
                            <Bar dataKey="value">
                              <Cell fill="#15426D" />
                              <Cell fill="#D55402" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-black">Daily Sales Trend</CardTitle>
                      <CardDescription className="text-xs text-black/70">Sales per product over selected period</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={(() => {
                            const start = new Date(dateFilter.startDate)
                            const end = new Date(dateFilter.endDate)
                            const days = []
                            const current = new Date(start)
                            
                            while (current <= end) {
                              const dateStr = current.toISOString().split("T")[0]
                              const daySales: any = { date: dateStr }
                              const uniqueFuelTypes = [...new Set(sales.map((s) => s.fuel_type))]

                              uniqueFuelTypes.forEach((fuelType) => {
                                const total = sales
                                  .filter((s) => s.sale_date.startsWith(dateStr) && s.fuel_type === fuelType)
                                  .reduce((sum, s) => sum + s.total_amount, 0)
                                daySales[fuelType] = total
                              })

                              days.push(daySales)
                              current.setDate(current.getDate() + 1)
                            }
                            return days
                          })()}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: "#000" }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          />
                          <YAxis tick={{ fontSize: 11, fill: "#000" }} />
                          <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ color: "#000" }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                          />
                          {[...new Set(sales.map((s) => s.fuel_type))].map((fuelType) => {
                            const FUEL_COLORS: any = { Diesel: "#FFFF00", Petrol: "#FF0000", Unleaded: "#FF0000", Super: "#10B981" }
                            return (
                              <Line
                                key={fuelType}
                                type="monotone"
                                dataKey={fuelType}
                                stroke={FUEL_COLORS[fuelType] || "#000"}
                                strokeWidth={2}
                                dot={{ fill: FUEL_COLORS[fuelType] || "#000" }}
                                name={fuelType}
                              />
                            )
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {sales.length === 0 && !loading && (
                <Card className="rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <p className="text-slate-500">No sales data available for the selected period</p>
                  </CardContent>
                </Card>
              )}

              <footer className="mt-12 border-t pt-6 pb-4 text-center text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-foreground">Sensile Technologies East Africa Ltd</span>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
