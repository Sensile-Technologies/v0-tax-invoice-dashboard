"use client"

import { useState, useEffect } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Printer, Download, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReportTabs } from "@/components/report-tabs"

interface Customer {
  id: string
  name: string
  customer_number: string
  kra_pin: string
  phone: string
  email: string
  address: string
  branch_id: string
  branch_name: string
}

interface Transaction {
  id: string
  date: string
  invoice_number: string
  fuel_type: string
  quantity: number
  amount: number
  payment_method: string
  branch_name: string
}

interface StatementData {
  customer: {
    id: string
    name: string
    pin: string
    phone: string
    email: string
    address: string
  }
  transactions: Transaction[]
  summary: {
    totalTransactions: number
    totalAmount: number
    totalQuantity: number
    paymentBreakdown: Record<string, number>
    periodStart: string | null
    periodEnd: string | null
  }
}

export default function CustomerStatementPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [statementData, setStatementData] = useState<StatementData | null>(null)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingStatement, setLoadingStatement] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchStatement()
    } else {
      setStatementData(null)
    }
  }, [selectedCustomer, dateFrom, dateTo])

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const response = await fetch('/api/customers/list')
      const data = await response.json()
      if (data.customers) {
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchStatement = async () => {
    if (!selectedCustomer) return

    try {
      setLoadingStatement(true)
      const params = new URLSearchParams({ customer_id: selectedCustomer })
      if (dateFrom) params.append('start_date', dateFrom)
      if (dateTo) params.append('end_date', dateTo)

      const response = await fetch(`/api/customers/statement?${params}`)
      const data = await response.json()
      if (data.success && data.data) {
        setStatementData(data.data)
      }
    } catch (error) {
      console.error('Error fetching statement:', error)
    } finally {
      setLoadingStatement(false)
    }
  }

  const calculateRunningBalance = (transactions: Transaction[]) => {
    let balance = 0
    return transactions.map(t => {
      const isDebit = t.payment_method?.toLowerCase() !== 'credit'
      if (isDebit) {
        balance += parseFloat(String(t.amount)) || 0
      } else {
        balance -= parseFloat(String(t.amount)) || 0
      }
      return { ...t, runningBalance: balance }
    })
  }

  const transactionsWithBalance = statementData ? calculateRunningBalance(statementData.transactions) : []
  const closingBalance = transactionsWithBalance.length > 0 
    ? transactionsWithBalance[transactionsWithBalance.length - 1].runningBalance 
    : 0

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 overflow-auto ml-6 mt-6 mb-6 mr-6">
          <div className="bg-white rounded-tl-3xl shadow-2xl p-8 min-h-full">
            <ReportTabs />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Customer Statement</h1>
                <p className="text-slate-600 mt-1">Account statement for selected customer</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Statement Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Select Customer</label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder={loadingCustomers ? "Loading..." : "Choose customer"} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.kra_pin ? `- ${customer.kra_pin}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">From Date</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">To Date</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {loadingStatement && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Loading statement...</span>
              </div>
            )}

            {!loadingStatement && selectedCustomer && statementData && (
              <>
                <Card className="rounded-2xl mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Customer Name</div>
                        <div className="font-semibold text-navy-900">{statementData.customer.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">PIN Number</div>
                        <div className="font-semibold text-navy-900">{statementData.customer.pin || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Total Transactions</div>
                        <div className="font-semibold text-navy-900">{statementData.summary.totalTransactions}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Total Amount</div>
                        <div className="font-semibold text-blue-600 text-lg">
                          KES {statementData.summary.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionsWithBalance.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No transactions found for this customer in the selected period.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Invoice</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Product</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount (KES)</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance (KES)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactionsWithBalance.map((item, idx) => (
                              <tr key={item.id || idx} className="border-b hover:bg-slate-50">
                                <td className="py-3 px-4">
                                  {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 font-medium">{item.invoice_number || '-'}</td>
                                <td className="py-3 px-4">{item.fuel_type || '-'}</td>
                                <td className="py-3 px-4 text-right">
                                  {parseFloat(String(item.quantity)).toFixed(2)} L
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs ${
                                      item.payment_method?.toLowerCase() === 'cash'
                                        ? "bg-green-100 text-green-700"
                                        : item.payment_method?.toLowerCase() === 'mpesa'
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-orange-100 text-orange-700"
                                    }`}
                                  >
                                    {item.payment_method || 'Unknown'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {parseFloat(String(item.amount)).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold">
                                  {item.runningBalance.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold">
                              <td colSpan={5} className="py-3 px-4 text-right">
                                Total:
                              </td>
                              <td className="py-3 px-4 text-right text-lg text-blue-600">
                                KES {statementData.summary.totalAmount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right text-lg">
                                KES {closingBalance.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!loadingStatement && selectedCustomer && !statementData && (
              <div className="text-center py-12 text-slate-500">
                No statement data found for this customer.
              </div>
            )}

            <footer className="mt-8 pt-6 border-t text-center text-sm text-navy-900 font-medium">
              Powered by Sensile Technologies East Africa Ltd
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
