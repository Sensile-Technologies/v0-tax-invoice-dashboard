"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useCurrency } from "@/lib/currency-utils"

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 36000 },
  { month: "Jun", revenue: 67000, expenses: 40000 },
]

const salesData = [
  { month: "Jan", sales: 340 },
  { month: "Feb", sales: 385 },
  { month: "Mar", sales: 360 },
  { month: "Apr", sales: 420 },
  { month: "May", sales: 395 },
  { month: "Jun", sales: 445 },
]

const categoryData = [
  { category: "Electronics", amount: 35000 },
  { category: "Clothing", amount: 28000 },
  { category: "Food & Beverage", amount: 22000 },
  { category: "Services", amount: 18000 },
  { category: "Other", amount: 21563 },
]

export function PerformanceCharts() {
  const { formatCurrency } = useCurrency()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-full md:col-span-1 rounded-2xl">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue vs expenses for the current year</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "#1e3a8a",
              },
              expenses: {
                label: "Expenses",
                color: "#ff6b6b",
              },
            }}
            className="h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  domain={[0, "auto"]}
                  width={65}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1e3a8a"
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ fill: "#1e3a8a", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ff6b6b"
                  strokeWidth={3}
                  name="Expenses"
                  dot={{ fill: "#ff6b6b", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1 rounded-2xl">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Number of invoices per month</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                color: "#1e3a8a",
              },
            }}
            className="h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  domain={[0, "auto"]}
                  width={55}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full rounded-2xl">
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>Revenue breakdown by product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: {
                label: "Amount",
                color: "#1e3a8a",
              },
            }}
            className="h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  domain={[0, "auto"]}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  width={110}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="amount" fill="#1e3a8a" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
