"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2, Receipt, Landmark, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExpenseAccount {
  id: string
  account_name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface BankingAccount {
  id: string
  account_name: string
  account_number: string | null
  bank_name: string | null
  branch_name: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CollectionsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([])
  const [bankingAccounts, setBankingAccounts] = useState<BankingAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [bankingLoading, setBankingLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBankingDialogOpen, setIsBankingDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ExpenseAccount | null>(null)
  const [editingBankingAccount, setEditingBankingAccount] = useState<BankingAccount | null>(null)
  const [formData, setFormData] = useState({ account_name: "", description: "" })
  const [bankingFormData, setBankingFormData] = useState({ 
    account_name: "", 
    account_number: "", 
    bank_name: "", 
    branch_name: "" 
  })
  const { toast } = useToast()

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/expense-accounts")
      const data = await res.json()
      if (data.success) {
        setAccounts(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch expense accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBankingAccounts = async () => {
    try {
      const res = await fetch("/api/banking-accounts")
      const data = await res.json()
      if (data.success) {
        setBankingAccounts(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch banking accounts:", error)
    } finally {
      setBankingLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
    fetchBankingAccounts()
  }, [])

  const handleOpenDialog = (account?: ExpenseAccount) => {
    if (account) {
      setEditingAccount(account)
      setFormData({ account_name: account.account_name, description: account.description || "" })
    } else {
      setEditingAccount(null)
      setFormData({ account_name: "", description: "" })
    }
    setIsDialogOpen(true)
  }

  const handleOpenBankingDialog = (account?: BankingAccount) => {
    if (account) {
      setEditingBankingAccount(account)
      setBankingFormData({ 
        account_name: account.account_name, 
        account_number: account.account_number || "",
        bank_name: account.bank_name || "",
        branch_name: account.branch_name || ""
      })
    } else {
      setEditingBankingAccount(null)
      setBankingFormData({ account_name: "", account_number: "", bank_name: "", branch_name: "" })
    }
    setIsBankingDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.account_name.trim()) {
      toast({ title: "Error", description: "Account name is required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const method = editingAccount ? "PUT" : "POST"
      const body = editingAccount 
        ? { id: editingAccount.id, ...formData }
        : formData

      const res = await fetch("/api/expense-accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: editingAccount ? "Account updated" : "Account created" })
        setIsDialogOpen(false)
        fetchAccounts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save account", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBankingAccount = async () => {
    if (!bankingFormData.account_name.trim()) {
      toast({ title: "Error", description: "Account name is required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const method = editingBankingAccount ? "PUT" : "POST"
      const body = editingBankingAccount 
        ? { id: editingBankingAccount.id, ...bankingFormData }
        : bankingFormData

      const res = await fetch("/api/banking-accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: editingBankingAccount ? "Account updated" : "Account created" })
        setIsBankingDialogOpen(false)
        fetchBankingAccounts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save banking account", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (account: ExpenseAccount) => {
    try {
      const res = await fetch("/api/expense-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, is_active: !account.is_active })
      })

      const data = await res.json()
      if (data.success) {
        fetchAccounts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update account", variant: "destructive" })
    }
  }

  const handleToggleBankingActive = async (account: BankingAccount) => {
    try {
      const res = await fetch("/api/banking-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, is_active: !account.is_active })
      })

      const data = await res.json()
      if (data.success) {
        fetchBankingAccounts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update banking account", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense account?")) return

    try {
      const res = await fetch(`/api/expense-accounts?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Account deleted" })
        fetchAccounts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete account", variant: "destructive" })
    }
  }

  const handleDeleteBankingAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banking account?")) return

    try {
      const res = await fetch(`/api/banking-accounts?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Banking account deleted" })
        fetchBankingAccounts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete banking account", variant: "destructive" })
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
          <DashboardHeader
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 md:p-6">
            <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Collections</h1>
                  <p className="text-muted-foreground">Manage expense accounts, banking accounts, and payment collections</p>
                </div>
              </div>

              <Tabs defaultValue="expense-accounts" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="expense-accounts">Expense Accounts</TabsTrigger>
                  <TabsTrigger value="banking-accounts">Banking Accounts</TabsTrigger>
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                </TabsList>

                <TabsContent value="expense-accounts" className="space-y-4">
                  <div className="flex justify-end">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingAccount ? "Edit Account" : "Create Expense Account"}</DialogTitle>
                          <DialogDescription>
                            {editingAccount 
                              ? "Update the expense account details" 
                              : "Add a new expense account type for shift expenses"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="account_name">Account Name *</Label>
                            <Input
                              id="account_name"
                              placeholder="e.g., Fuel Purchase, Maintenance, Utilities"
                              value={formData.account_name}
                              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Optional description of this expense type"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingAccount ? "Update" : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Expense Accounts
                      </CardTitle>
                      <CardDescription>
                        Configure expense account types that can be used during shift closure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : accounts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No expense accounts created yet</p>
                          <p className="text-sm mt-1">Create your first expense account to track shift expenses</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accounts.map((account) => (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium">{account.account_name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {account.description || "-"}
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={account.is_active}
                                    onCheckedChange={() => handleToggleActive(account)}
                                  />
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDialog(account)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(account.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="banking-accounts" className="space-y-4">
                  <div className="flex justify-end">
                    <Dialog open={isBankingDialogOpen} onOpenChange={setIsBankingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => handleOpenBankingDialog()}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Banking Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingBankingAccount ? "Edit Banking Account" : "Create Banking Account"}</DialogTitle>
                          <DialogDescription>
                            {editingBankingAccount 
                              ? "Update the banking account details" 
                              : "Add a new banking account for shift banking entries"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="banking_account_name">Account Name *</Label>
                            <Input
                              id="banking_account_name"
                              placeholder="e.g., Main Account, Petty Cash"
                              value={bankingFormData.account_name}
                              onChange={(e) => setBankingFormData({ ...bankingFormData, account_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                              id="account_number"
                              placeholder="Bank account number"
                              value={bankingFormData.account_number}
                              onChange={(e) => setBankingFormData({ ...bankingFormData, account_number: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                              id="bank_name"
                              placeholder="e.g., KCB, Equity Bank"
                              value={bankingFormData.bank_name}
                              onChange={(e) => setBankingFormData({ ...bankingFormData, bank_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch_name">Bank Branch</Label>
                            <Input
                              id="branch_name"
                              placeholder="Bank branch name"
                              value={bankingFormData.branch_name}
                              onChange={(e) => setBankingFormData({ ...bankingFormData, branch_name: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsBankingDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleSaveBankingAccount} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingBankingAccount ? "Update" : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Banking Accounts
                      </CardTitle>
                      <CardDescription>
                        Configure banking accounts for recording banking activity during shift closure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {bankingLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : bankingAccounts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No banking accounts created yet</p>
                          <p className="text-sm mt-1">Create banking accounts to track shift banking activity</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account Name</TableHead>
                              <TableHead>Account Number</TableHead>
                              <TableHead>Bank</TableHead>
                              <TableHead>Branch</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bankingAccounts.map((account) => (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {account.account_name}
                                    {account.is_default && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {account.account_number || "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {account.bank_name || "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {account.branch_name || "-"}
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={account.is_active}
                                    onCheckedChange={() => handleToggleBankingActive(account)}
                                  />
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenBankingDialog(account)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  {account.is_default ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled
                                      title="Cannot delete default account"
                                    >
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteBankingAccount(account.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="collections">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Collections Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Collections management coming soon</p>
                        <p className="text-sm mt-2">This feature will allow you to track incoming payments and collections</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
