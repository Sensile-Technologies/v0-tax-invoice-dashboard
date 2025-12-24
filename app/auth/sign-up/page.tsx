"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, ArrowRight } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6">
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

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <Image src="/flow360-logo.png" alt="Flow360 Logo" width={80} height={80} className="rounded-full" />
          </div>
          <CardTitle className="text-3xl text-center font-bold text-primary">Flow360</CardTitle>
          <p className="text-center text-muted-foreground">
            Business Management Platform
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Account Creation</h3>
            <p className="text-sm text-blue-700">
              To create a Flow360 account, please contact our sales team. We'll guide you through the onboarding process and set up your account.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-center text-gray-700">Contact Sales</h4>
            
            <a 
              href="tel:+254700000000" 
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-muted-foreground">+254 700 000 000</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
            </a>

            <a 
              href="mailto:sales@flow360.live" 
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-sm text-muted-foreground">sales@flow360.live</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
            </a>
          </div>

          <div className="pt-4 border-t">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Already have an account?
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
