"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useCurrency } from "@/lib/currency-utils"

export function MetricsGrid() {
  const { formatCurrency } = useCurrency()

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(124563),
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      description: "from last month",
    },
    {
      title: "Sales",
      value: "2,345",
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
      description: "invoices generated",
    },
    {
      title: "Conversion Rate",
      value: "68.4%",
      change: "+4.1%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "purchase to payment",
    },
    {
      title: "Active Customers",
      value: "1,234",
      change: "-2.3%",
      trend: "down" as const,
      icon: Users,
      description: "compared to last month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <metric.icon className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-balance break-words">{metric.value}</div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 font-medium ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {metric.change}
              </span>
              <span className="text-muted-foreground">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
