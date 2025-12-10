"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function SetupDemoPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffResult, setStaffResult] = useState<any>(null)

  const setupDemo = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/setup-demo", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup demo")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const seedDemoStaff = async () => {
    setStaffLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/staff/seed-demo", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create demo staff")
      }

      setStaffResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setStaffLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-blue-900 to-white p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Setup Demo Account</CardTitle>
            <CardDescription>Create a demo account with 5 branches for testing Flow360</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result && !error && (
              <Button onClick={setupDemo} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Demo Account...
                  </>
                ) : (
                  "Create Demo Account"
                )}
              </Button>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{result.message}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm">Login Credentials:</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>Email:</strong> {result.credentials?.email}
                    </div>
                    <div>
                      <strong>Password:</strong> {result.credentials?.password}
                    </div>
                  </div>
                </div>

                {result.branches && (
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-sm">Branches Created:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.branches.map((branch: string, index: number) => (
                        <li key={index}>{branch}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => (window.location.href = "/auth/login")} className="w-full">
                  Go to Login
                </Button>
              </div>
            )}

            {error && (
              <div className="space-y-4">
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
                <Button onClick={setupDemo} variant="outline" className="w-full bg-transparent">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Demo Staff</CardTitle>
            <CardDescription>Create 8 demo staff members (2 per role) with authentication accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!staffResult && (
              <Button onClick={seedDemoStaff} disabled={staffLoading} className="w-full">
                {staffLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Demo Staff...
                  </>
                ) : (
                  "Create Demo Staff"
                )}
              </Button>
            )}

            {staffResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{staffResult.message}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm">Demo Staff Accounts:</h3>
                  <div className="text-sm space-y-2">
                    <p>
                      All staff accounts use password: <strong>flow360</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>
                        <strong>Directors:</strong> james.director, sarah.director
                      </li>
                      <li>
                        <strong>Managers:</strong> john.manager, mary.manager
                      </li>
                      <li>
                        <strong>Supervisors:</strong> peter.supervisor, jane.supervisor
                      </li>
                      <li>
                        <strong>Cashiers:</strong> david.cashier, lucy.cashier
                      </li>
                    </ul>
                  </div>
                </div>

                {staffResult.errors && staffResult.errors.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-sm text-orange-800">Some accounts already exist:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {staffResult.errors.map((err: any, index: number) => (
                        <li key={index}>
                          {err.staff}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
