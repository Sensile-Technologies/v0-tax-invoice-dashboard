"use client"

import type React from "react"

import { signIn } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await signIn(identifier, password)
      if (error) throw new Error(error.message || "Login failed")

      if (data.access_token) {
        if (data.user?.role === "admin") {
          window.location.href = "/admin"
        } else if (data.user?.role === "sales") {
          window.location.href = "/admin/sales"
        } else {
          // Directors and vendors go to HQ, branch staff go to branch UI
          const role = (data.user?.role || '').toLowerCase()
          if (role === 'director' || role === 'vendor') {
            // Clear any previously selected branch so they start fresh at HQ
            localStorage.removeItem("selectedBranch")
            window.location.href = "/headquarters"
          } else {
            window.location.href = "/sales/summary"
          }
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full relative flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop"
          alt="Ocean background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/30" />
      </div>

      <Card className="w-full max-w-[340px] sm:max-w-md relative z-10 shadow-2xl mx-auto">
        <CardHeader className="space-y-3 sm:space-y-4 pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="flex justify-center">
            <Image src="/flow360-logo.png" alt="Flow360 Logo" width={64} height={64} className="rounded-full sm:w-20 sm:h-20" />
          </div>
          <CardTitle className="text-3xl sm:text-[50px] text-center font-extrabold" style={{ color: '#000435' }}>flow360</CardTitle>
          <p className="text-center text-sm sm:text-base text-muted-foreground">Sign in to your account</p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Email or username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="rounded-xl h-11 sm:h-10 text-base sm:text-sm"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-11 sm:h-10 text-base sm:text-sm"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
            <Button type="submit" className="w-full rounded-xl h-11 sm:h-10 text-base sm:text-sm" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Separator className="my-5 sm:my-6" />

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
