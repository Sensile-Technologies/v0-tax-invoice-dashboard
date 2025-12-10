"use client"

import type React from "react"

import { signUp, signInWithGoogle } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [branchName, setBranchName] = useState("")
  const [branchLocation, setBranchLocation] = useState("")
  const [bhfId, setBhfId] = useState("")
  const [county, setCounty] = useState("")
  const [address, setAddress] = useState("")
  const [managerName, setManagerName] = useState("")
  const [managerEmail, setManagerEmail] = useState("")
  const [managerPhone, setManagerPhone] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleNext = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError(null)
    setStep(2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await signUp(email, password, {
        username,
        phone: phoneNumber,
      })
      if (signUpError) throw new Error(signUpError.message || "Sign up failed")

      const userId = data?.user?.id

      const branchResponse = await fetch("/api/branches/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: branchName,
          location: branchLocation,
          bhf_id: bhfId,
          county,
          address,
          manager: managerName,
          email: managerEmail,
          phone: managerPhone,
          status: "active",
          user_id: userId,
        }),
      })

      if (!branchResponse.ok) {
        const errorData = await branchResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create first branch")
      }

      const branchResult = await branchResponse.json()

      try {
        await fetch("/api/branches/register-backend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId: branchResult.branch?.id,
            name: branchName,
            location: address,
            county,
            city: branchLocation,
          }),
        })
      } catch (backendError) {
        console.log("[v0] Backend registration skipped:", backendError)
      }

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6">
      {/* Ocean background */}
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

      {/* Sign up card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center">
            <Image src="/flow360-logo.png" alt="Flow360 Logo" width={80} height={80} className="rounded-full" />
          </div>
          <CardTitle className="text-3xl text-center font-bold text-primary">Flow360</CardTitle>
          <p className="text-center text-muted-foreground">
            {step === 1 ? "Create your account" : "Setup your first branch"}
          </p>
          <div className="flex justify-center gap-2">
            <div className={`h-2 w-2 rounded-full ${step === 1 ? "bg-primary" : "bg-gray-300"}`} />
            <div className={`h-2 w-2 rounded-full ${step === 2 ? "bg-primary" : "bg-gray-300"}`} />
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 700 000000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
              <Button type="submit" className="w-full rounded-xl">
                Next
              </Button>
            </form>
          ) : (
            /* Added branch details form step */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  type="text"
                  placeholder="Main Branch"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchLocation">Location/City</Label>
                <Input
                  id="branchLocation"
                  type="text"
                  placeholder="Nairobi"
                  required
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bhfId">BHF ID</Label>
                <Input
                  id="bhfId"
                  type="text"
                  placeholder="BHF-12345"
                  required
                  value={bhfId}
                  onChange={(e) => setBhfId(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  type="text"
                  placeholder="Nairobi County"
                  required
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerName">Manager Name</Label>
                <Input
                  id="managerName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerEmail">Manager Email</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  placeholder="manager@example.com"
                  required
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerPhone">Manager Phone</Label>
                <Input
                  id="managerPhone"
                  type="tel"
                  placeholder="+254 700 000000"
                  required
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 rounded-xl" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl bg-transparent"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
