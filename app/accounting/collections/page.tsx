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
import { Plus, Pencil, Trash2, Loader2, Receipt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExpenseAccount {
  id: string
  account_name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CollectionsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ExpenseAccount | null>(null)
  const [formData, setFormData] = useState({ account_name: "", description: "" })
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

  useEffect(() => {
    fetchAccounts()
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
                <p className="text-muted-foreground">Manage expense accounts and payment collections</p>
              </div>
            </div>

            <Tabs defaultValue="expense-accounts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="expense-accounts">Expense Accounts</TabsTrigger>
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
                      These accounts will appear in the expense dropdown during shift end
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : accounts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No expense accounts created yet.</p>
                        <p className="text-sm">Click "Create Account" to add your first expense type.</p>
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
                              <TableCell className="text-right">
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
