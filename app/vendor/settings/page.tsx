"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { toast } from "sonner"
import { Save, Palette, Globe, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface VendorSettings {
  id: string
  name: string
  display_name: string | null
  logo_url: string | null
  primary_color: string | null
  custom_domain: string | null
}

export default function VendorSettingsPage() {
  const [settings, setSettings] = useState<VendorSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/vendor/settings', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSettings(data.vendor)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/vendor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          display_name: settings.display_name,
          logo_url: settings.logo_url,
          primary_color: settings.primary_color,
          custom_domain: settings.custom_domain,
        }),
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load vendor settings</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
      />
      <div className="flex-1 flex flex-col w-full">
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">White-Label Settings</h1>
            <p className="text-muted-foreground">Customize your branding and domain settings</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Domain Settings
                </CardTitle>
                <CardDescription>
                  Configure your custom domain to access the system with your own branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    placeholder="e.g., Leadway Petroleum"
                    value={settings.display_name || ''}
                    onChange={(e) => setSettings({ ...settings, display_name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will appear on the login page and header
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_domain">Custom Domain</Label>
                  <Input
                    id="custom_domain"
                    placeholder="e.g., fms.leadwaypetroleum.net"
                    value={settings.custom_domain || ''}
                    onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Point your domain to our servers and enter it here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding
                </CardTitle>
                <CardDescription>
                  Customize your logo and brand colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    placeholder="https://example.com/logo.png"
                    value={settings.logo_url || ''}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your company logo (recommended: 64x64 or 128x128 pixels)
                  </p>
                </div>

                {settings.logo_url && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Image
                      src={settings.logo_url}
                      alt="Logo preview"
                      width={64}
                      height={64}
                      className="rounded-lg"
                      unoptimized
                    />
                    <span className="text-sm text-muted-foreground">Logo Preview</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color || '#3b82f6'}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primary_color || '#3b82f6'}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This color will be used for headings and accent elements
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how your login page will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl p-8 bg-gradient-to-br from-blue-100 to-blue-50 flex justify-center">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
                  <div className="flex flex-col items-center gap-4">
                    {settings.logo_url ? (
                      <Image
                        src={settings.logo_url}
                        alt="Logo"
                        width={64}
                        height={64}
                        className="rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <h2 
                      className="text-2xl font-extrabold"
                      style={{ color: settings.primary_color || '#3b82f6' }}
                    >
                      {settings.display_name || settings.name || 'Your Company'}
                    </h2>
                    <p className="text-sm text-muted-foreground">Sign in to your account</p>
                    <div className="w-full space-y-3">
                      <div className="h-10 bg-muted rounded-lg" />
                      <div className="h-10 bg-muted rounded-lg" />
                      <div 
                        className="h-10 rounded-lg"
                        style={{ backgroundColor: settings.primary_color || '#3b82f6' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
