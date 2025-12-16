"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request')
  const [identifier, setIdentifier] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to request reset')
      
      setRequestSubmitted(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: resetCode, newPassword })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      
      setStep('success')
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
          <CardTitle className="text-2xl sm:text-3xl text-center font-bold text-primary">
            {step === 'success' ? 'Password Reset' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            {step === 'request' && !requestSubmitted && "Enter your email or username to request a reset code"}
            {step === 'request' && requestSubmitted && "Contact your administrator to get your reset code"}
            {step === 'reset' && "Enter your reset code and new password"}
            {step === 'success' && "Your password has been successfully reset"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {step === 'success' ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-center text-muted-foreground">
                You can now sign in with your new password.
              </p>
              <Link href="/auth/login">
                <Button className="w-full rounded-xl h-11 sm:h-10">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : step === 'request' && !requestSubmitted ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm">Email or Username</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="rounded-xl h-11 sm:h-10 text-base sm:text-sm"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
              {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
              <Button type="submit" className="w-full rounded-xl h-11 sm:h-10 text-base sm:text-sm" disabled={isLoading}>
                {isLoading ? "Requesting..." : "Request Reset Code"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('reset')}
                  className="text-sm text-primary hover:underline"
                >
                  Already have a reset code?
                </button>
              </div>
            </form>
          ) : step === 'request' && requestSubmitted ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                <p className="font-medium mb-2">Reset request submitted</p>
                <p>Please contact your branch administrator or vendor to receive your reset code. Once you have the code, click the button below.</p>
              </div>
              <Button 
                onClick={() => setStep('reset')} 
                className="w-full rounded-xl h-11 sm:h-10 text-base sm:text-sm"
              >
                I have a reset code
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-identifier" className="text-sm">Email or Username</Label>
                <Input
                  id="reset-identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="rounded-xl h-11 sm:h-10 text-base sm:text-sm"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetCode" className="text-sm">Reset Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter 8-character reset code"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                  className="rounded-xl h-11 sm:h-10 text-base sm:text-sm font-mono tracking-wider"
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
              {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
              <Button type="submit" className="w-full rounded-xl h-11 sm:h-10 text-base sm:text-sm" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {step !== 'success' && (
            <div className="mt-5 sm:mt-6 text-center">
              <Link href="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
