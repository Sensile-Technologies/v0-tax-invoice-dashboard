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
import { AlertCircle, ChevronDown, Plus, MoreVertical, FileText, CreditCard, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrency } from "@/lib/currency-utils"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ShiftManagementDialog } from "@/components/shift-management-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown } from "lucide-react"
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

export function SalesContent() {
  const { formatCurrency } = useCurrency()
  const [sales, setSales] = useState<any[]>([])
  const [nozzles, setNozzles] = useState<any[]>([])
  const [dispensers, setDispensers] = useState<any[]>([])
  const [fuelPrices, setFuelPrices] = useState<any[]>([])
  const [currentShift, setCurrentShift] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSaleDialog, setShowSaleDialog] = useState(false)
  const [showShiftDialog, setShowShiftDialog] = useState(false)
  const [shiftAction, setShiftAction] = useState<"start" | "end" | null>(null)
  const [showCreditNoteDialog, setShowCreditNoteDialog] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [shiftManagementOpen, setShiftManagementOpen] = useState(false)
  const [currentBranchData, setCurrentBranchData] = useState<any>(null)
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<Array<{ id: string; name: string; pin: string }>>([])
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)

  const [filters, setFilters] = useState({
    date: "",
    invoiceNumber: "",
    fuelType: "",
    nozzle: "",
    loyalty: "all", // all, loyalty, non-loyalty
  })

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

  const [creditNoteForm, setCreditNoteForm] = useState({
    reason: "",
    return_quantity: "",
    refund_amount: "",
    approved_by: "",
    customer_signature: "",
    notes: "",
  })

  const [shiftForm, setShiftForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    opening_cash: "",
    closing_cash: "",
    notes: "",
  })

  const supabase = createClient()

  useEffect(() => {
    const storedBranch = localStorage.getItem("selectedBranch")
    if (storedBranch) {
      setCurrentBranchData(JSON.parse(storedBranch))
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

      // Fetch nozzles
      const { data: nozzlesData, error: nozzlesError } = await supabase
        .from("nozzles")
        .select("*")
        .eq("branch_id", branchId)
        .eq("status", "active")

      if (nozzlesError) {
        console.error("Error fetching nozzles:", nozzlesError)
      } else {
        setNozzles(nozzlesData || [])
      }

      const { data: dispensersData, error: dispensersError } = await supabase
        .from("dispensers")
        .select("*")
        .eq("branch_id", branchId)

      if (dispensersError) {
        console.error("Error fetching dispensers:", dispensersError)
      } else {
        setDispensers(dispensersData || [])
      }

      // Fetch fuel prices
      const { data: pricesData, error: pricesError } = await supabase
        .from("fuel_prices")
        .select("*")
        .eq("branch_id", branchId)
        .order("effective_date", { ascending: false })

      if (pricesError) {
        console.error("Error fetching fuel prices:", pricesError)
      } else {
        setFuelPrices(pricesData || [])
      }

      // Fetch active shift via API
      try {
        const shiftResponse = await fetch(`/api/shifts?branch_id=${branchId}&status=active`)
        const shiftResult = await shiftResponse.json()
        
        if (shiftResult.success && shiftResult.data) {
          setCurrentShift(shiftResult.data)
        } else {
          setCurrentShift(null)
        }
      } catch (shiftError) {
        console.error("Error fetching shift:", shiftError)
        setCurrentShift(null)
      }

      await fetchSales()
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
        const { data, error } = await supabase
          .from("customers")
          .select("id, cust_nm, cust_tin")
          .eq("branch_id", currentBranchData?.id)
          .order("cust_nm")

        if (error) throw error

        setLoyaltyCustomers(
          (data || []).map((c: any) => ({
            id: c.id,
            name: c.cust_nm || "",
            pin: c.cust_tin || "",
          })),
        )
      } catch (error) {
        console.error("Error fetching loyalty customers:", error)
      }
    }

    if (currentBranchData?.id) {
      fetchLoyaltyCustomers()
    }
  }, [currentBranchData?.id])

  async function fetchSales() {
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) return

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const { data: salesData, error } = await supabase
        .from("sales")
        .select("*")
        .eq("branch_id", branchId)
        .order("sale_date", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching sales:", error)
      } else {
        // Convert numeric string values to actual numbers for proper calculations
        const processedSales = (salesData || []).map((sale: any) => ({
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

  const filteredSales = sales.filter((sale) => {
    // Date filter
    if (filters.date) {
      const saleDate = new Date(sale.sale_date).toISOString().split("T")[0]
      if (saleDate !== filters.date) return false
    }

    // Invoice number filter
    if (filters.invoiceNumber) {
      const invoiceMatch = (sale.invoice_number || sale.receipt_number || "")
        .toLowerCase()
        .includes(filters.invoiceNumber.toLowerCase())
      if (!invoiceMatch) return false
    }

    // Fuel type filter
    if (filters.fuelType && filters.fuelType !== "all") {
      if (sale.fuel_type !== filters.fuelType) return false
    }

    // Nozzle filter
    if (filters.nozzle && filters.nozzle !== "all") {
      if (sale.nozzle_id !== filters.nozzle) return false
    }

    // Loyalty filter
    if (filters.loyalty === "loyalty") {
      if (!sale.is_loyalty_sale) return false
    } else if (filters.loyalty === "non-loyalty") {
      if (sale.is_loyalty_sale) return false
    }

    return true
  })

  const uniqueFuelTypes = Array.from(new Set(sales.map((s) => s.fuel_type)))
  const uniqueNozzles = Array.from(new Set(sales.map((s) => s.nozzle_id)))

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
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      // Find fuel price
      const fuelPrice = fuelPrices.find((p) => p.fuel_type === saleForm.fuel_type)
      if (!fuelPrice) {
        toast.error(`No price configured for ${saleForm.fuel_type}`)
        return
      }

      const selectedNozzle = nozzles.find((n) => n.id === saleForm.nozzle_id)

      const { data: previousSales, error: salesError } = await supabase
        .from("sales")
        .select("quantity")
        .eq("nozzle_id", saleForm.nozzle_id)

      let calculatedMeterReading = Number(selectedNozzle?.initial_meter_reading) || 0
      if (previousSales && previousSales.length > 0) {
        const totalPreviousSales = previousSales.reduce((sum: number, sale: any) => sum + Number(sale.quantity), 0)
        calculatedMeterReading = calculatedMeterReading + totalPreviousSales
      }
      const grossAmount = Number.parseFloat(saleForm.amount)
      const unitPrice = Number.parseFloat(fuelPrice.price)
      
      // Calculate discount with validation
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

      const { data, error } = await supabase
        .from("sales")
        .insert({
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
          invoice_number: `INV-${Date.now()}`,
          meter_reading_after: calculatedMeterReading,
          transmission_status: "pending",
          receipt_number: `RCP-${Date.now()}`,
          is_loyalty_sale: saleForm.is_loyalty_sale,
          loyalty_customer_name: saleForm.is_loyalty_sale ? saleForm.loyalty_customer_name : null,
          loyalty_customer_pin: saleForm.is_loyalty_sale ? saleForm.loyalty_customer_pin : null,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Sale creation error:", error)
        toast.error(`Error recording sale: ${error.message}`)
      } else {
        console.log("[Web Sale] Sale created successfully, calling KRA endpoint...")
        
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
          console.log("[Web Sale] KRA API Response:", JSON.stringify(kraResult, null, 2))
          
          if (kraResult.kra_response) {
            console.log("[Web Sale] KRA Result Code:", kraResult.kra_response.resultCd)
            console.log("[Web Sale] KRA Result Message:", kraResult.kra_response.resultMsg)
          }
        } catch (kraError) {
          console.error("[Web Sale] Error calling KRA endpoint:", kraError)
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
        await fetchSales()
      }
    } catch (error) {
      console.error("[v0] Sale creation error:", error)
      toast.error("Failed to record sale")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCreditNote() {
    if (!selectedSale || !creditNoteForm.reason || !creditNoteForm.refund_amount) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const currentBranch = localStorage.getItem("selectedBranch")
      if (!currentBranch) {
        toast.error("No branch selected")
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const { data, error } = await supabase
        .from("credit_notes")
        .insert({
          sale_id: selectedSale.id,
          branch_id: branchId,
          credit_note_number: `CN-${Date.now()}`,
          reason: creditNoteForm.reason,
          return_quantity: creditNoteForm.return_quantity ? Number.parseFloat(creditNoteForm.return_quantity) : null,
          refund_amount: Number.parseFloat(creditNoteForm.refund_amount),
          approved_by: creditNoteForm.approved_by || null,
          customer_signature: creditNoteForm.customer_signature || null,
          notes: creditNoteForm.notes || null,
          approval_status: "pending",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating credit note:", error)
        toast.error("Failed to create credit note")
      } else {
        toast.success("Credit note created successfully")
        setCreditNoteForm({
          reason: "",
          return_quantity: "",
          refund_amount: "",
          approved_by: "",
          customer_signature: "",
          notes: "",
        })
        setShowCreditNoteDialog(false)
        setSelectedSale(null)
        await fetchSales()
      }
    } catch (error) {
      console.error("Error creating credit note:", error)
      toast.error("Failed to create credit note")
    } finally {
      setLoading(false)
    }
  }

  function openCreditNoteDialog(sale: any) {
    setSelectedSale(sale)
    setCreditNoteForm({
      reason: "",
      return_quantity: sale.quantity.toString(),
      refund_amount: sale.total_amount.toString(),
      approved_by: "",
      customer_signature: "",
      notes: "",
    })
    setShowCreditNoteDialog(true)
  }

  function viewInvoice(sale: any) {
    toast.info(`Viewing invoice ${sale.invoice_number}`)
    // TODO: Implement invoice viewing/printing functionality
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "transmitted":
        return "default"
      case "pending":
        return "secondary"
      case "flagged":
        return "destructive"
      default:
        return "secondary"
    }
  }

  async function handleStartShift() {
    if (!shiftForm.date || !shiftForm.time) {
      toast.error("Please select date and time")
      return
    }

    setLoading(true)
    try {
      const currentBranch = localStorage.getItem("selectedBranch")

      if (!currentBranch) {
        toast.error("No branch selected. Please select a branch from the header.")
        setLoading(false)
        return
      }

      const branchData = JSON.parse(currentBranch)
      const branchId = branchData.id

      const startTime = new Date(`${shiftForm.date}T${shiftForm.time}`)

      const shiftData = {
        branch_id: branchId,
        start_time: startTime.toISOString(),
        status: "active",
        opening_cash: shiftForm.opening_cash ? Number.parseFloat(shiftForm.opening_cash) : 0,
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
          opening_cash: "",
          closing_cash: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error starting shift:", error)
      toast.error(`Failed to start shift: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleEndShift() {
    if (!currentShift) {
      toast.error("No active shift to end")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentShift.id,
          end_time: new Date().toISOString(),
          status: "completed",
          closing_cash: shiftForm.closing_cash ? Number.parseFloat(shiftForm.closing_cash) : 0,
          notes: shiftForm.notes || null,
        })
      })
      
      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error("Error ending shift:", result.error)
        toast.error("Failed to end shift")
      } else {
        toast.success("Shift ended successfully")
        setCurrentShift(null)
        setShowShiftDialog(false)
        setShiftForm({
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().slice(0, 5),
          opening_cash: "",
          closing_cash: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error ending shift:", error)
      toast.error("Failed to end shift")
    } finally {
      setLoading(false)
    }
  }

  function openShiftDialog(action: "start" | "end") {
    setShiftAction(action)
    setShowShiftDialog(true)
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
          <h2 className="text-2xl font-bold text-slate-900">Sales</h2>
          <p className="text-slate-600">Record fuel sales and manage transactions</p>
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
              <DropdownMenuItem onClick={() => setShiftManagementOpen(true)} disabled={!currentShift}>
                End Shift (Excel Upload)
              </DropdownMenuItem>
              <DropdownMenuItem>Configure Automatic Shifts</DropdownMenuItem>
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
          {/* Sales Performance Metrics */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
            {/* Sales by Fuel Type */}
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
                          <text
                            x={x}
                            y={y}
                            fill="#000000"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize="11"
                            fontWeight="500"
                          >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        )
                      }}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(() => {
                        const FUEL_COLORS: any = {
                          Diesel: "#FFFF00",
                          Petrol: "#FF0000",
                          Unleaded: "#FF0000",
                          Super: "#10B981",
                        }
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

            {/* Payment Methods */}
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
                          <text
                            x={x}
                            y={y}
                            fill="#000000"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize="11"
                            fontWeight="500"
                          >
                            {`${displayName} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        )
                      }}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(() => {
                        const PAYMENT_COLORS: any = {
                          Cash: "#3A7085",
                          "Mobile Money": "#008C51",
                          Card: "#F59E0B",
                          Credit: "#EF4444",
                        }
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

            {/* Loyalty Program */}
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
                        const loyaltyTotal = sales
                          .filter((s) => s.is_loyalty_sale)
                          .reduce((sum, s) => sum + s.total_amount, 0)
                        const nonLoyaltyTotal = sales
                          .filter((s) => !s.is_loyalty_sale)
                          .reduce((sum, s) => sum + s.total_amount, 0)
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
                          <text
                            x={x}
                            y={y}
                            fill="#000000"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize="11"
                            fontWeight="500"
                          >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        )
                      }}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#C8A2C8" />
                      {/* CHANGE: Changed non-loyalty color from gray to sky blue */}
                      <Cell fill="#87CEEB" />
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ color: "#000" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue vs VAT */}
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
                      const vat = totalRevenue * 0.16 // Assuming 16% VAT
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

          {/* Daily Sales Trend (moved below metrics) */}
          <Card className="rounded-2xl md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-black">Daily Sales Trend</CardTitle>
              <CardDescription className="text-xs text-black/70">Sales per product over 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={(() => {
                    // Get last 7 days
                    const days = []
                    for (let i = 6; i >= 0; i--) {
                      const date = new Date()
                      date.setDate(date.getDate() - i)
                      const dateStr = date.toISOString().split("T")[0]

                      // Calculate sales per fuel type for this day
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
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#000" }} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ color: "#000" }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  {[...new Set(sales.map((s) => s.fuel_type))].map((fuelType) => {
                    const FUEL_COLORS: any = {
                      Diesel: "#FFFF00", // Pure Yellow
                      Petrol: "#FF0000", // Pure Red
                      Unleaded: "#FF0000", // Pure Red
                      Super: "#10B981", // Green
                    }
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

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>Latest fuel sales transactions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center ml-auto">
              <div className="flex items-center gap-2">
                <Label htmlFor="date-filter" className="text-sm whitespace-nowrap">
                  Date:
                </Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-40 h-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="invoice-filter" className="text-sm whitespace-nowrap">
                  Invoice:
                </Label>
                <Input
                  id="invoice-filter"
                  type="text"
                  placeholder="Search..."
                  value={filters.invoiceNumber}
                  onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                  className="w-32 h-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="fuel-filter" className="text-sm whitespace-nowrap">
                  Fuel:
                </Label>
                <Select value={filters.fuelType} onValueChange={(value) => setFilters({ ...filters, fuelType: value })}>
                  <SelectTrigger id="fuel-filter" className="w-32 h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {uniqueFuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="nozzle-filter" className="text-sm whitespace-nowrap">
                  Nozzle:
                </Label>
                <Select value={filters.nozzle} onValueChange={(value) => setFilters({ ...filters, nozzle: value })}>
                  <SelectTrigger id="nozzle-filter" className="w-32 h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {uniqueNozzles.map((nozzleId) => {
                      const nozzle = nozzles.find((n) => n.id === nozzleId)
                      const dispenser = nozzle ? dispensers.find((d) => d.id === nozzle.dispenser_id) : null
                      return (
                        <SelectItem key={nozzleId} value={nozzleId}>
                          {dispenser && nozzle ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : "Unknown"}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="loyalty-filter" className="text-sm whitespace-nowrap">
                  Loyalty:
                </Label>
                <Select value={filters.loyalty} onValueChange={(value) => setFilters({ ...filters, loyalty: value })}>
                  <SelectTrigger id="loyalty-filter" className="w-32 h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="loyalty">Loyalty Only</SelectItem>
                    <SelectItem value="non-loyalty">Non-Loyalty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ date: "", invoiceNumber: "", fuelType: "", nozzle: "", loyalty: "all" })}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredSales.length === 0 ? (
              <p className="text-sm text-slate-500">
                {sales.length === 0 ? "No sales recorded yet" : "No sales match the current filters"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell className="text-left p-2">Date</TableCell>
                      <TableCell className="text-left p-2">Invoice No.</TableCell>
                      <TableCell className="text-left p-2">Nozzle</TableCell>
                      <TableCell className="text-left p-2">Fuel Type</TableCell>
                      <TableCell className="text-right p-2">Quantity (L)</TableCell>
                      <TableCell className="text-right p-2">Unit Price</TableCell>
                      <TableCell className="text-right p-2">Total</TableCell>
                      <TableCell className="text-center p-2">Payment</TableCell>
                      <TableCell className="text-center p-2">Loyalty</TableCell>
                      <TableCell className="text-right p-2">Meter Reading</TableCell>
                      <TableCell className="text-center p-2">Status</TableCell>
                      <TableCell className="text-center p-2">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const nozzle = nozzles.find((n) => n.id === sale.nozzle_id)
                      const dispenser = nozzle ? dispensers.find((d) => d.id === nozzle.dispenser_id) : null

                      return (
                        <TableRow key={sale.id} className="hover:bg-slate-50">
                          <TableCell className="p-2">
                            {new Date(sale.sale_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="p-2 text-sm font-mono">
                            {sale.invoice_number || sale.receipt_number}
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            {dispenser && nozzle ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}` : "-"}
                          </TableCell>
                          <TableCell className="p-2">{sale.fuel_type}</TableCell>
                          <TableCell className="p-2 text-right">{Number(sale.quantity).toFixed(2)}</TableCell>
                          <TableCell className="p-2 text-right">{formatCurrency(sale.unit_price)}</TableCell>
                          <TableCell className="p-2 text-right font-medium">
                            {formatCurrency(sale.total_amount)}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <Badge variant="outline" className="capitalize">
                              {(() => {
                                const m = (sale.payment_method || "cash").toLowerCase()
                                if (m === "mpesa" || m === "m-pesa" || m === "mobile_money") return "Mobile Money"
                                if (m === "card") return "Card"
                                if (m === "credit") return "Credit"
                                return "Cash"
                              })()}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            {sale.is_loyalty_sale && (
                              <div className="flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                  <path d="M12 4.354a4 4 0 110 5.292M15.465 5.464A5.973 5.973 0 0112 4c-3.314 0-6 2.686-6 6 0 1.369.465 2.628 1.243 3.636l-1.06 1.06a7.966 7.966 0 01-1.383-4.696c0-4.418 3.582-8 8-8 1.823 0 3.5.611 4.85 1.636l-1.185 1.185z" />
                                </svg>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            {sale.meter_reading_after ? Number(sale.meter_reading_after).toFixed(2) : "-"}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <Badge variant={getStatusBadgeVariant(sale.transmission_status || "pending")}>
                              {(sale.transmission_status || "pending").charAt(0).toUpperCase() +
                                (sale.transmission_status || "pending").slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => viewInvoice(sale)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openCreditNoteDialog(sale)}>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Generate Credit Note
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Record Sale Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Fuel Sale</DialogTitle>
            <DialogDescription>Enter the details of the fuel sale transaction</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nozzle">Nozzle</Label>
                <Select
                  value={saleForm.nozzle_id}
                  onValueChange={(value) => {
                    const nozzle = nozzles.find((n) => n.id === value)
                    setSaleForm({ ...saleForm, nozzle_id: value, fuel_type: nozzle?.fuel_type || "" })
                  }}
                >
                  <SelectTrigger id="nozzle">
                    <SelectValue placeholder="Select nozzle" />
                  </SelectTrigger>
                  <SelectContent>
                    {nozzles.map((nozzle) => {
                      const dispenser = dispensers.find((d) => d.id === nozzle.dispenser_id)
                      return (
                        <SelectItem key={nozzle.id} value={nozzle.id}>
                          {dispenser
                            ? `D${dispenser.dispenser_number}N${nozzle.nozzle_number}`
                            : `Nozzle ${nozzle.nozzle_number}`}{" "}
                          - {nozzle.fuel_type}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type_display">Fuel Type</Label>
                <Input id="fuel_type_display" value={saleForm.fuel_type} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Sale Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleForm.amount}
                  onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })}
                />
                {saleForm.amount && saleForm.fuel_type && (
                  <p className="text-xs text-muted-foreground">
                    ≈{" "}
                    {(
                      Number.parseFloat(saleForm.amount) /
                      (fuelPrices.find((p) => p.fuel_type === saleForm.fuel_type)?.price || 1)
                    ).toFixed(2)}{" "}
                    liters
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={saleForm.payment_method}
                  onValueChange={(value) => setSaleForm({ ...saleForm, payment_method: value })}
                >
                  <SelectTrigger id="payment_method">
                    <SelectValue />
                  </SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name (Optional)</Label>
                <Input
                  id="customer_name"
                  placeholder="Enter customer name"
                  value={saleForm.customer_name}
                  onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_pin">PIN/TIN Number (Optional)</Label>
                <Input
                  id="customer_pin"
                  placeholder="Enter PIN or TIN"
                  value={saleForm.customer_pin}
                  onChange={(e) => setSaleForm({ ...saleForm, customer_pin: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type (Optional)</Label>
                <Select
                  value={saleForm.discount_type}
                  onValueChange={(value: "fixed" | "percentage") => setSaleForm({ ...saleForm, discount_type: value })}
                >
                  <SelectTrigger id="discount_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (KES)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount {saleForm.discount_type === "percentage" ? "(%)" : "(KES)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  placeholder={saleForm.discount_type === "percentage" ? "0" : "0.00"}
                  value={saleForm.discount_value}
                  onChange={(e) => setSaleForm({ ...saleForm, discount_value: e.target.value })}
                />
                {saleForm.amount && saleForm.discount_value && Number.parseFloat(saleForm.discount_value) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Net Amount: KES{" "}
                    {(
                      Number.parseFloat(saleForm.amount) -
                      (saleForm.discount_type === "percentage"
                        ? (Number.parseFloat(saleForm.amount) * Number.parseFloat(saleForm.discount_value)) / 100
                        : Number.parseFloat(saleForm.discount_value))
                    ).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_loyalty_sale"
                  checked={saleForm.is_loyalty_sale}
                  onChange={(e) => setSaleForm({ ...saleForm, is_loyalty_sale: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_loyalty_sale" className="text-sm font-medium flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                    <path d="M12 4.354a4 4 0 110 5.292M15.465 5.464A5.973 5.973 0 0112 4c-3.314 0-6 2.686-6 6 0 1.369.465 2.628 1.243 3.636l-1.06 1.06a7.966 7.966 0 01-1.383-4.696c0-4.418 3.582-8 8-8 1.823 0 3.5.611 4.85 1.636l-1.185 1.185z" />
                  </svg>
                  Loyalty Customer Transaction
                </Label>
              </div>
              {saleForm.is_loyalty_sale && (
                <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="loyalty_customer_name">Loyalty Customer Name *</Label>
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerSearchOpen}
                          className="w-full justify-between bg-transparent"
                        >
                          {saleForm.loyalty_customer_name || "Select customer..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search customer..." />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
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
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      saleForm.loyalty_customer_name === customer.name ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{customer.name}</span>
                                    <span className="text-xs text-muted-foreground">{customer.pin}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loyalty_customer_pin">Loyalty Customer PIN *</Label>
                    <Input
                      id="loyalty_customer_pin"
                      placeholder="Auto-filled from customer"
                      value={saleForm.loyalty_customer_pin}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2 text-sm text-green-700 bg-green-100 p-2 rounded">
                    Points will be calculated at 1 point per KES 100 spent
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number (Optional)</Label>
              <Input
                id="vehicle_number"
                placeholder="Enter vehicle registration"
                value={saleForm.vehicle_number}
                onChange={(e) => setSaleForm({ ...saleForm, vehicle_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSale} disabled={loading}>
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Note Dialog */}
      <Dialog open={showCreditNoteDialog} onOpenChange={setShowCreditNoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Credit Note</DialogTitle>
            <DialogDescription>
              Create a credit note for invoice {selectedSale?.invoice_number || selectedSale?.receipt_number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Credit Note *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for issuing credit note"
                value={creditNoteForm.reason}
                onChange={(e) => setCreditNoteForm({ ...creditNoteForm, reason: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="return_quantity">Return Quantity (Liters)</Label>
                <Input
                  id="return_quantity"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={creditNoteForm.return_quantity}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, return_quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund_amount">Refund Amount (KES) *</Label>
                <Input
                  id="refund_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={creditNoteForm.refund_amount}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, refund_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approved_by">Approved By</Label>
                <Input
                  id="approved_by"
                  placeholder="Manager/Supervisor name"
                  value={creditNoteForm.approved_by}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, approved_by: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_signature">Customer Signature</Label>
                <Input
                  id="customer_signature"
                  placeholder="Customer name/signature"
                  value={creditNoteForm.customer_signature}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, customer_signature: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cn_notes">Additional Notes</Label>
              <Textarea
                id="cn_notes"
                placeholder="Any additional information"
                value={creditNoteForm.notes}
                onChange={(e) => setCreditNoteForm({ ...creditNoteForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCreditNote} disabled={loading}>
              Generate Credit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Management Dialog */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shiftAction === "start" ? "Start New Shift" : "End Current Shift"}</DialogTitle>
            <DialogDescription>
              {shiftAction === "start" ? "Enter the shift start details" : "Enter the shift closing details"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {shiftAction === "start" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={shiftForm.date}
                      onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={shiftForm.time}
                      onChange={(e) => setShiftForm({ ...shiftForm, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opening_cash">Opening Cash (Optional)</Label>
                  <Input
                    id="opening_cash"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={shiftForm.opening_cash}
                    onChange={(e) => setShiftForm({ ...shiftForm, opening_cash: e.target.value })}
                  />
                </div>
              </>
            )}
            {shiftAction === "end" && (
              <div className="space-y-2">
                <Label htmlFor="closing_cash">Closing Cash (Optional)</Label>
                <Input
                  id="closing_cash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={shiftForm.closing_cash}
                  onChange={(e) => setShiftForm({ ...shiftForm, closing_cash: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this shift"
                value={shiftForm.notes}
                onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShiftDialog(false)}>
              Cancel
            </Button>
            <Button onClick={shiftAction === "start" ? handleStartShift : handleEndShift} disabled={loading}>
              {shiftAction === "start" ? "Start Shift" : "End Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShiftManagementDialog
        open={shiftManagementOpen}
        onOpenChange={setShiftManagementOpen}
        branchName={currentBranchData?.name}
        branchId={currentBranchData?.id}
      />
    </div>
  )
}
