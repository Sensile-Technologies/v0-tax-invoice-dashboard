"use client"

import type React from "react"

import { signIn } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error, mustChangePassword } = await signIn(identifier, password)
      if (error) throw new Error(error.message || "Login failed")

      if (data.access_token) {
        // Check if user must change password
        if (mustChangePassword) {
          setPendingUser(data.user)
          setShowPasswordChange(true)
          setIsLoading(false)
          return
        }

        redirectUser(data.user)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const redirectUser = (user: any) => {
    if (user?.role === "admin") {
      window.location.href = "/admin"
    } else if (user?.role === "sales") {
      window.location.href = "/admin/sales"
    } else {
      const role = (user?.role || '').toLowerCase()
      if (role === 'director' || role === 'vendor') {
        localStorage.removeItem("selectedBranch")
        window.location.href = "/headquarters"
      } else {
        window.location.href = "/sales/summary"
      }
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pendingUser?.id,
          newPassword: newPassword
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        localStorage.removeItem("must_change_password")
        setShowPasswordChange(false)
        redirectUser(pendingUser)
      } else {
        setPasswordError(result.error || "Failed to change password")
      }
    } catch (error) {
      setPasswordError("Failed to change password. Please try again.")
    } finally {
      setPasswordLoading(false)
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
          <CardTitle className="text-3xl sm:text-[50px] text-center font-extrabold text-primary">flow360<sup className="text-xs sm:text-sm relative -top-3 sm:-top-5">™</sup></CardTitle>
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

      <Dialog open={showPasswordChange} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Change Your Password</DialogTitle>
            <DialogDescription>
              Your password has been reset. Please create a new password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl"
                minLength={6}
              />
            </div>
            {passwordError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{passwordError}</div>
            )}
            <Button type="submit" className="w-full rounded-xl" disabled={passwordLoading}>
              {passwordLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
