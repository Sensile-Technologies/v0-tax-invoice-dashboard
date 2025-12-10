"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function SeedStaffAuthPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const seedStaffAuth = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/staff/seed-auth", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to seed staff authentication accounts",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seed Staff Authentication</CardTitle>
          <CardDescription>Create authentication accounts for all staff members in the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>This will create Supabase Auth accounts for:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>jmwangi (Director)</li>
              <li>james.director (Director)</li>
              <li>john.manager (Manager)</li>
              <li>peter.supervisor (Supervisor)</li>
              <li>david.cashier (Cashier)</li>
              <li>And 4 more staff members</li>
            </ul>
            <p className="mt-4 font-semibold">Default password: flow360</p>
          </div>

          <Button onClick={seedStaffAuth} disabled={loading} className="w-full">
            {loading ? "Creating Accounts..." : "Create Auth Accounts"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {result.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
