"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2 } from "lucide-react"
import { useHQAccess } from "@/lib/hooks/use-hq-access"

const roles = [
  {
    id: 1,
    role: "Director",
    permissions: "Full system access, financial approvals, user management, strategic reporting",
  },
  {
    id: 2,
    role: "Manager",
    permissions: "Branch operations, staff supervision, inventory management, sales reporting",
  },
  {
    id: 3,
    role: "Supervisor",
    permissions: "Daily operations, stock monitoring, customer management, basic reporting",
  },
  {
    id: 4,
    role: "Cashier",
    permissions: "Sales transactions, customer invoicing, basic inventory view, receipt generation",
  },
]

export default function RolesPage() {
  const { isChecking, hasAccess } = useHQAccess()

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardHeader currentBranch="hq" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white">Roles & Permissions</h1>
            <p className="mt-1 text-white/80 text-pretty">Define user access levels and permissions</p>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search roles..." className="pl-10 rounded-xl" />
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Role</TableHead>
                    <TableHead>Permissions & Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-semibold">{role.role}</TableCell>
                      <TableCell>{role.permissions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t px-8 py-4 text-center text-sm text-muted-foreground">
        Powered by Sensile Technologies East Africa Ltd
      </footer>
    </div>
  )
}
