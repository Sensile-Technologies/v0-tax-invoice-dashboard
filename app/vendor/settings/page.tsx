"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { toast } from "sonner"
import { Save, Palette, Globe, Image as ImageIcon, Upload, X } from "lucide-react"
import Image from "next/image"

interface VendorSettings {
  id: string
  name: string
  display_name: string | null
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  custom_domain: string | null
}

export default function VendorSettingsPage() {
  const [settings, setSettings] = useState<VendorSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, GIF, WebP, or SVG image')
      return
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 2MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/vendor/upload-logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => prev ? { ...prev, logo_url: data.logo_url } : null)
        toast.success('Logo uploaded successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to upload logo')
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    setSettings(prev => prev ? { ...prev, logo_url: null } : null)
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
          secondary_color: settings.secondary_color,
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
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {settings.logo_url ? (
                      <div className="relative">
                        <Image
                          src={settings.logo_url}
                          alt="Logo preview"
                          width={64}
                          height={64}
                          className="rounded-lg border"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, GIF, WebP or SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

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
                    Used for headings, buttons, and accent elements
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color || '#1e40af'}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.secondary_color || '#1e40af'}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      placeholder="#1e40af"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for secondary buttons and highlights
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
              <div 
                className="border rounded-xl p-8 flex justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${settings.primary_color || '#3b82f6'}20 0%, ${settings.secondary_color || '#1e40af'}20 100%)`
                }}
              >
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
                      <div 
                        className="h-10 rounded-lg border-2"
                        style={{ 
                          borderColor: settings.secondary_color || '#1e40af',
                          color: settings.secondary_color || '#1e40af'
                        }}
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
