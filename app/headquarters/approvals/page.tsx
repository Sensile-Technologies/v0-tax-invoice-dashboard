"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Search } from "lucide-react"

export default function ApprovalsPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardHeader currentBranch="hq" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white">Approval Configuration</h1>
            <p className="mt-1 text-white/80 text-pretty">Configure approval workflows and limits</p>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search configurations..." className="pl-10 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Purchase Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="purchase-approval">Require approval for purchases</Label>
                <Switch id="purchase-approval" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-limit">Auto-approval limit (KES)</Label>
                <Input id="purchase-limit" type="number" defaultValue="50000" className="rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Discount Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="discount-approval">Require approval for discounts</Label>
                <Switch id="discount-approval" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-limit">Auto-approval limit (%)</Label>
                <Input id="discount-limit" type="number" defaultValue="10" className="rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Credit Note Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="credit-approval">Require approval for credit notes</Label>
                <Switch id="credit-approval" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit-limit">Auto-approval limit (KES)</Label>
                <Input id="credit-limit" type="number" defaultValue="20000" className="rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Button className="rounded-xl w-fit">Save Configuration</Button>
        </div>
      </main>

      <footer className="border-t px-8 py-4 text-center text-sm text-muted-foreground">
        Powered by Sensile Technologies East Africa Ltd
      </footer>
    </div>
  )
}
