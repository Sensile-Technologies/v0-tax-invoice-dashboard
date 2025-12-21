"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { AlertCircle, ChevronDown, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrency } from "@/lib/currency-utils"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
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

export function SalesSummaryContent() {
  const { formatCurrency } = useCurrency()
  const [sales, setSales] = useState<any[]>([])
  const [nozzles, setNozzles] = useState<any[]>([])
  const [tanks, setTanks] = useState<any[]>([])
  const [dispensers, setDispensers] = useState<any[]>([])
  const [fuelPrices, setFuelPrices] = useState<any[]>([])
  const [nozzleReadings, setNozzleReadings] = useState<Record<string, string>>({})
  const [tankStocks, setTankStocks] = useState<Record<string, string>>({})
  const [tankStockReceived, setTankStockReceived] = useState<Record<string, string>>({})
  const [nozzleBaselines, setNozzleBaselines] = useState<Record<string, number>>({})
  const [tankBaselines, setTankBaselines] = useState<Record<string, number>>({})
  const [currentShift, setCurrentShift] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSaleDialog, setShowSaleDialog] = useState(false)
  const [showShiftDialog, setShowShiftDialog] = useState(false)
  const [shiftAction, setShiftAction] = useState<"start" | "end" | null>(null)
  const [currentBranchData, setCurrentBranchData] = useState<any>(null)
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<Array<{ id: string; name: string; pin: string }>>([])
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [saleForm, setSaleForm] = useState({
    nozzle_id: "",
    fuel_type: "",
    amount: "",
    payment_method: "cash",
    customer_name: "",
    vehicle_number: "",
    customer_pin: "",
    meter_reading_after: "",
    is_loyalty_sale: false,
    loyalty_customer_name: "",
    loyalty_customer_pin: "",
    discount_type: "fixed" as "fixed" | "percentage",
    discount_value: "",
  })

  const [shiftForm, setShiftForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    closing_cash: "",
    notes: "",
  })
  const [shiftLoading, setShiftLoading] = useState(false)

  useEffect(() => {
    const storedBranch = localStorage.getItem("selectedBranch")
    if (storedBranch) {
      setCurrentBranchData(JSON.parse(storedBranch))
    }
    const userStr = localStorage.getItem("flow360_user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserId(user.id)
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)

      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        setLoading(false)
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const [nozzlesRes, dispensersRes, pricesRes, shiftRes, tanksRes] = await Promise.all([
        fetch(`/api/nozzles?branch_id=${branchId}&status=active`),
        fetch(`/api/dispensers?branch_id=${branchId}`),
        fetch(`/api/fuel-prices?branch_id=${branchId}`),
        fetch(`/api/shifts?branch_id=${branchId}&status=active`),
        fetch(`/api/tanks?branch_id=${branchId}`)
      ])

      const [nozzlesResult, dispensersResult, pricesResult, shiftResult, tanksResult] = await Promise.all([
        nozzlesRes.json(),
        dispensersRes.json(),
        pricesRes.json(),
        shiftRes.json(),
        tanksRes.json()
      ])

      if (nozzlesResult.success) {
        setNozzles(nozzlesResult.data || [])
      }

      if (dispensersResult.success) {
        setDispensers(dispensersResult.data || [])
      }

      if (pricesResult.success) {
        setFuelPrices(pricesResult.data || [])
      }

      if (tanksResult.success) {
        setTanks(tanksResult.data || [])
      }

      if (shiftResult.success && shiftResult.data) {
        setCurrentShift(shiftResult.data)
        await fetchSales(shiftResult.data.id)
      } else {
        setCurrentShift(null)
        setSales([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load sales data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function fetchLoyaltyCustomers() {
      try {
        const response = await fetch(`/api/customers?branch_id=${currentBranchData?.id}`)
        const result = await response.json()

        if (result.success) {
          setLoyaltyCustomers(
            (result.data || []).map((c: any) => ({
              id: c.id,
              name: c.cust_nm || "",
              pin: c.cust_tin || "",
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching loyalty customers:", error)
      }
    }

    if (currentBranchData?.id) {
      fetchLoyaltyCustomers()
    }
  }, [currentBranchData?.id])

  async function fetchSales(shiftId?: string) {
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) return

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      let url = `/api/sales?branch_id=${branchId}&limit=50`
      if (shiftId) {
        url += `&shift_id=${shiftId}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        const processedSales = (result.data || []).map((sale: any) => ({
          ...sale,
          quantity: Number(sale.quantity) || 0,
          unit_price: Number(sale.unit_price) || 0,
          total_amount: Number(sale.total_amount) || 0,
          meter_reading_after: Number(sale.meter_reading_after) || 0,
          loyalty_points_earned: Number(sale.loyalty_points_earned) || 0,
        }))
        setSales(processedSales)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
    }
  }

  async function handleCreateSale() {
    if (!saleForm.nozzle_id || !saleForm.fuel_type || !saleForm.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!currentShift) {
      toast.error("Please start a shift before recording sales")
      return
    }

    setLoading(true)
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        setLoading(false)
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const fuelPrice = fuelPrices.find((p) => p.fuel_type === saleForm.fuel_type)
      if (!fuelPrice) {
        toast.error(`No price configured for ${saleForm.fuel_type}`)
        setLoading(false)
        return
      }

      const selectedNozzle = nozzles.find((n) => n.id === saleForm.nozzle_id)

      const prevSalesRes = await fetch(`/api/sales?nozzle_id=${saleForm.nozzle_id}`)
      const prevSalesResult = await prevSalesRes.json()
      const previousSales = prevSalesResult.success ? prevSalesResult.data : []

      let calculatedMeterReading = Number(selectedNozzle?.initial_meter_reading) || 0
      if (previousSales && previousSales.length > 0) {
        const totalPreviousSales = previousSales.reduce((sum: number, sale: any) => sum + Number(sale.quantity), 0)
        calculatedMeterReading = calculatedMeterReading + totalPreviousSales
      }
      const grossAmount = Number.parseFloat(saleForm.amount)
      const unitPrice = Number.parseFloat(fuelPrice.price)
      
      let discountAmount = 0
      if (saleForm.discount_value && Number.parseFloat(saleForm.discount_value) > 0) {
        if (saleForm.discount_type === "percentage") {
          const pct = Math.min(Number.parseFloat(saleForm.discount_value), 100)
          discountAmount = (grossAmount * pct) / 100
        } else {
          discountAmount = Math.min(Number.parseFloat(saleForm.discount_value), grossAmount)
        }
      }
      const totalAmount = Math.max(grossAmount - discountAmount, 0)
      const quantity = totalAmount / unitPrice
      calculatedMeterReading = calculatedMeterReading + quantity

      const invoiceNumber = `INV-${Date.now()}`
      const receiptNumber = `RCP-${Date.now()}`

      const saleResponse = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          shift_id: currentShift.id,
          nozzle_id: saleForm.nozzle_id,
          fuel_type: saleForm.fuel_type,
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          payment_method: saleForm.payment_method,
          customer_name: saleForm.customer_name || null,
          vehicle_number: saleForm.vehicle_number || null,
          customer_pin: saleForm.customer_pin || null,
          invoice_number: invoiceNumber,
          meter_reading_after: calculatedMeterReading,
          transmission_status: "pending",
          receipt_number: receiptNumber,
          is_loyalty_sale: saleForm.is_loyalty_sale,
          loyalty_customer_name: saleForm.is_loyalty_sale ? saleForm.loyalty_customer_name : null,
          loyalty_customer_pin: saleForm.is_loyalty_sale ? saleForm.loyalty_customer_pin : null,
        })
      })

      const saleResult = await saleResponse.json()

      if (!saleResponse.ok || !saleResult.success) {
        console.error("Sale creation error:", saleResult.error)
        toast.error(`Error recording sale: ${saleResult.error || 'Unknown error'}`)
      } else {
        const data = saleResult.data
        try {
          const kraResponse = await fetch("/api/kra/test-sale", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              branch_id: branchId,
              invoice_number: data.invoice_number,
              receipt_number: data.receipt_number,
              fuel_type: saleForm.fuel_type,
              quantity,
              unit_price: unitPrice,
              total_amount: totalAmount,
              payment_method: saleForm.payment_method,
              customer_name: saleForm.customer_name || "Walk-in Customer",
              customer_pin: saleForm.customer_pin || "",
            }),
          })
          
          const kraResult = await kraResponse.json()
          console.log("KRA API Response:", JSON.stringify(kraResult, null, 2))
        } catch (kraError) {
          console.error("Error calling KRA endpoint:", kraError)
        }
        
        toast.success("Sale recorded successfully!")
        setSaleForm({
          nozzle_id: "",
          fuel_type: "",
          amount: "",
          payment_method: "cash",
          customer_name: "",
          vehicle_number: "",
          customer_pin: "",
          meter_reading_after: "",
          is_loyalty_sale: false,
          loyalty_customer_name: "",
          loyalty_customer_pin: "",
          discount_type: "fixed",
          discount_value: "",
        })
        setShowSaleDialog(false)
        setLoading(false)
        fetchSales(currentShift?.id).catch(console.error)
        return
      }
    } catch (error) {
      console.error("Sale creation error:", error)
      toast.error("Failed to record sale")
    } finally {
      setLoading(false)
    }
  }

  async function handleStartShift() {
    if (!shiftForm.date || !shiftForm.time) {
      toast.error("Please select date and time")
      return
    }

    setShiftLoading(true)
    try {
      const currentBranch = localStorage.getItem("selectedBranch")

      if (!currentBranch) {
        toast.error("No branch selected. Please select a branch from the header.")
        setShiftLoading(false)
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const startTime = new Date(`${shiftForm.date}T${shiftForm.time}`)

      const shiftData = {
        branch_id: branchId,
        start_time: startTime.toISOString(),
        status: "active",
        opening_cash: 0,
        notes: shiftForm.notes || null,
      }

      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      })
      
      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error("Error starting shift:", result.error)
        toast.error(`Failed to start shift: ${result.error || 'Unknown error'}`)
      } else {
        toast.success("Shift started successfully")
        setCurrentShift(result.data)
        setShowShiftDialog(false)
        setShiftForm({
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().slice(0, 5),
          closing_cash: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error starting shift:", error)
      toast.error(`Failed to start shift: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setShiftLoading(false)
    }
  }

  async function handleEndShift() {
    if (!currentShift) {
      toast.error("No active shift to end")
      return
    }

    setShiftLoading(true)
    try {
      const totalSales = sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0)
      
      const nozzleReadingsData = Object.entries(nozzleReadings)
        .filter(([_, value]) => value !== "")
        .map(([nozzleId, reading]) => ({
          nozzle_id: nozzleId,
          closing_reading: parseFloat(reading)
        }))
      
      const tankStocksData = Object.entries(tankStocks)
        .filter(([_, value]) => value !== "")
        .map(([tankId, stock]) => ({
          tank_id: tankId,
          closing_reading: parseFloat(stock),
          stock_received: parseFloat(tankStockReceived[tankId] || "0") || 0
        }))
      
      const response = await fetch('/api/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentShift.id,
          end_time: new Date().toISOString(),
          status: "completed",
          closing_cash: shiftForm.closing_cash ? Number.parseFloat(shiftForm.closing_cash) : 0,
          total_sales: totalSales,
          notes: shiftForm.notes || null,
          nozzle_readings: nozzleReadingsData,
          tank_stocks: tankStocksData,
        })
      })
      
      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error("Error ending shift:", result.error)
        toast.error(result.error || "Failed to end shift")
      } else {
        toast.success("Shift ended & new shift started")
        if (result.newShift) {
          setCurrentShift(result.newShift)
        }
        setShowShiftDialog(false)
        setShiftForm({
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().slice(0, 5),
          closing_cash: "",
          notes: "",
        })
        setNozzleReadings({})
        setTankStocks({})
        setTankStockReceived({})
        fetchData()
      }
    } catch (error) {
      console.error("Error ending shift:", error)
      toast.error("Failed to end shift")
    } finally {
      setShiftLoading(false)
    }
  }

  async function openShiftDialog(action: "start" | "end") {
    setShiftAction(action)
    setShowShiftDialog(true)
    
    if (action === "end" && currentBranchData?.id) {
      try {
        const res = await fetch(`/api/shifts/baselines?branch_id=${currentBranchData.id}`)
        const data = await res.json()
        if (data.success) {
          setNozzleBaselines(data.nozzleBaselines || {})
          setTankBaselines(data.tankBaselines || {})
        }
      } catch (error) {
        console.error("Error fetching baselines:", error)
      }
    }
  }

  const shiftStartTime = currentShift
    ? new Date(currentShift.start_time).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales Summary</h2>
          <p className="text-slate-600">Overview of sales performance and trends</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Shift Management <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openShiftDialog("start")} disabled={!!currentShift}>
                Start Shift
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openShiftDialog("end")} disabled={!currentShift}>
                End Shift
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowSaleDialog(true)} disabled={!currentShift}>
            <Plus className="h-4 w-4 mr-2" />
            Record Sale
          </Button>
        </div>
      </div>

      {currentShift ? (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Current ongoing shift started at {shiftStartTime}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            No active shift. Please start a shift before recording sales.
          </AlertDescription>
        </Alert>
      )}

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
                <CardDescription className="text-xs text-black/70">Loyalty vs Walk-in sales</CardDescription>
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
                          { name: "Walk-in", value: nonLoyaltyTotal },
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
                <CardDescription className="text-xs text-black/70">Month-to-date comparison</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={(() => {
                      const now = new Date()
                      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                      const monthSales = sales.filter((s) => new Date(s.sale_date) >= monthStart)

                      const totalRevenue = monthSales.reduce((sum, s) => sum + s.total_amount, 0)
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

          <Card className="rounded-2xl md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-black">Daily Sales Trend</CardTitle>
              <CardDescription className="text-xs text-black/70">Sales per product over 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={(() => {
                    const days = []
                    for (let i = 6; i >= 0; i--) {
                      const date = new Date()
                      date.setDate(date.getDate() - i)
                      const dateStr = date.toISOString().split("T")[0]

                      const daySales: any = { date: dateStr }
                      const uniqueFuelTypes = [...new Set(sales.map((s) => s.fuel_type))]

                      uniqueFuelTypes.forEach((fuelType) => {
                        const total = sales
                          .filter((s) => s.sale_date.startsWith(dateStr) && s.fuel_type === fuelType)
                          .reduce((sum, s) => sum + s.total_amount, 0)
                        daySales[fuelType] = total
                      })

                      days.push(daySales)
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
            <p className="text-slate-500">No sales data available. Start a shift and record sales to see performance metrics.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{shiftAction === "start" ? "Start New Shift" : "End Current Shift"}</DialogTitle>
            <DialogDescription>
              {shiftAction === "start" ? "Enter details to start a new shift" : "Enter closing details to end the shift"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {shiftAction === "start" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shift-date">Date</Label>
                  <Input
                    id="shift-date"
                    type="date"
                    value={shiftForm.date}
                    onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shift-time">Time</Label>
                  <Input
                    id="shift-time"
                    type="time"
                    value={shiftForm.time}
                    onChange={(e) => setShiftForm({ ...shiftForm, time: e.target.value })}
                  />
                </div>
              </div>
            )}
            {shiftAction === "end" && currentShift && (
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4 pr-4">
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-slate-700">Shift Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Started:</span>
                        <span className="ml-2 font-medium">{shiftStartTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Duration:</span>
                        <span className="ml-2 font-medium">
                          {Math.round((Date.now() - new Date(currentShift.start_time).getTime()) / 3600000)}h
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Opening Cash:</span>
                        <span className="ml-2 font-medium">KES {(currentShift.opening_cash || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Total Sales:</span>
                        <span className="ml-2 font-medium text-green-600">
                          KES {sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {nozzles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700">Nozzle Meter Readings</h4>
                      <div className="grid gap-3">
                        {nozzles.map((nozzle) => {
                          const dispenser = dispensers.find((d: any) => d.id === nozzle.dispenser_id)
                          const openingReading = nozzleBaselines[nozzle.id] || 0
                          return (
                            <div key={nozzle.id} className="bg-slate-50 p-3 rounded-lg space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {dispenser?.name || 'Dispenser'} - Nozzle {nozzle.nozzle_number}
                                  </p>
                                  <p className="text-xs text-slate-500 capitalize">
                                    {nozzle.fuel_type} - Opening: {openingReading.toLocaleString()}
                                  </p>
                                </div>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={openingReading}
                                  placeholder="Closing reading"
                                  className="w-36"
                                  value={nozzleReadings[nozzle.id] || ""}
                                  onChange={(e) => setNozzleReadings({ ...nozzleReadings, [nozzle.id]: e.target.value })}
                                />
                              </div>
                              {nozzleReadings[nozzle.id] && parseFloat(nozzleReadings[nozzle.id]) < openingReading && (
                                <p className="text-xs text-red-500">Closing reading cannot be less than opening ({openingReading})</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {tanks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700">Tank Closing Stock</h4>
                      <div className="grid gap-3">
                        {tanks.map((tank) => {
                          const openingStock = tankBaselines[tank.id] || 0
                          const closingStock = parseFloat(tankStocks[tank.id] || "0") || 0
                          const needsStockReceived = closingStock > openingStock
                          return (
                            <div key={tank.id} className="bg-slate-50 p-3 rounded-lg space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{tank.tank_name}</p>
                                  <p className="text-xs text-slate-500 capitalize">
                                    {tank.fuel_type} - Opening: {openingStock.toLocaleString()} L
                                  </p>
                                </div>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Closing stock (L)"
                                  className="w-36"
                                  value={tankStocks[tank.id] || ""}
                                  onChange={(e) => setTankStocks({ ...tankStocks, [tank.id]: e.target.value })}
                                />
                              </div>
                              {needsStockReceived && (
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                                  <span className="text-xs text-amber-600 flex-1">Stock increased - enter fuel received:</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Stock received (L)"
                                    className="w-36"
                                    value={tankStockReceived[tank.id] || ""}
                                    onChange={(e) => setTankStockReceived({ ...tankStockReceived, [tank.id]: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="closing-cash">Closing Cash Amount</Label>
                    <Input
                      id="closing-cash"
                      type="number"
                      placeholder="Enter actual cash in drawer"
                      value={shiftForm.closing_cash}
                      onChange={(e) => setShiftForm({ ...shiftForm, closing_cash: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter the actual cash amount in the drawer to calculate variance</p>
                  </div>
                  <div>
                    <Label htmlFor="shift-notes">Notes (Optional)</Label>
                    <Textarea
                      id="shift-notes"
                      placeholder="Add any notes about this shift"
                      value={shiftForm.notes}
                      onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </ScrollArea>
            )}
            {shiftAction === "start" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shift-notes">Notes (Optional)</Label>
                  <Textarea
                    id="shift-notes"
                    placeholder="Add any notes about this shift"
                    value={shiftForm.notes}
                    onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowShiftDialog(false)}>Cancel</Button>
            <Button onClick={shiftAction === "start" ? handleStartShift : handleEndShift} disabled={shiftLoading}>
              {shiftAction === "start" ? "Start Shift" : "End Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Fuel Sale</DialogTitle>
            <DialogDescription>Enter sale details to record a new fuel transaction</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nozzle">Nozzle *</Label>
                <Select value={saleForm.nozzle_id} onValueChange={(value) => {
                  const nozzle = nozzles.find((n) => n.id === value)
                  setSaleForm({ ...saleForm, nozzle_id: value, fuel_type: nozzle?.fuel_type || "" })
                }}>
                  <SelectTrigger><SelectValue placeholder="Select nozzle" /></SelectTrigger>
                  <SelectContent>
                    {nozzles.map((nozzle) => {
                      const dispenser = dispensers.find((d) => d.id === nozzle.dispenser_id)
                      return (
                        <SelectItem key={nozzle.id} value={nozzle.id}>
                          {dispenser ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : `Nozzle ${nozzle.nozzle_number}`} - {nozzle.fuel_type}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fuel-type">Fuel Type *</Label>
                <Input id="fuel-type" value={saleForm.fuel_type} readOnly className="bg-slate-50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={saleForm.amount}
                  onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={saleForm.payment_method} onValueChange={(value) => setSaleForm({ ...saleForm, payment_method: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select value={saleForm.discount_type} onValueChange={(value: "fixed" | "percentage") => setSaleForm({ ...saleForm, discount_type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount-value">Discount Value</Label>
                <Input
                  id="discount-value"
                  type="number"
                  placeholder={saleForm.discount_type === "percentage" ? "0%" : "0.00"}
                  value={saleForm.discount_value}
                  onChange={(e) => setSaleForm({ ...saleForm, discount_value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  placeholder="Walk-in Customer"
                  value={saleForm.customer_name}
                  onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicle-number">Vehicle Number</Label>
                <Input
                  id="vehicle-number"
                  placeholder="KAA 123A"
                  value={saleForm.vehicle_number}
                  onChange={(e) => setSaleForm({ ...saleForm, vehicle_number: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-loyalty"
                checked={saleForm.is_loyalty_sale}
                onChange={(e) => setSaleForm({ ...saleForm, is_loyalty_sale: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is-loyalty">Loyalty Customer</Label>
            </div>
            {saleForm.is_loyalty_sale && (
              <div>
                <Label>Select Loyalty Customer</Label>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {saleForm.loyalty_customer_name || "Select customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {loyaltyCustomers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSaleForm({
                                  ...saleForm,
                                  loyalty_customer_name: customer.name,
                                  loyalty_customer_pin: customer.pin,
                                })
                                setCustomerSearchOpen(false)
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", saleForm.loyalty_customer_name === customer.name ? "opacity-100" : "opacity-0")} />
                              {customer.name} ({customer.pin})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaleDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSale} disabled={loading}>Record Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
