"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface VendorTheme {
  logoUrl: string
  primaryColor: string
  companyName: string
}

interface ThemeContextType {
  theme: VendorTheme
  vendorId: string | null
  isLoading: boolean
}

const defaultTheme: VendorTheme = {
  logoUrl: '/flow360-logo.png',
  primaryColor: '#3b82f6',
  companyName: 'Flow360',
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  vendorId: null,
  isLoading: true,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<VendorTheme>(defaultTheme)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTheme() {
      try {
        const domain = window.location.hostname
        const response = await fetch(`/api/theme?domain=${encodeURIComponent(domain)}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.theme) {
            setTheme(data.theme)
          }
          if (data.vendor?.id) {
            setVendorId(data.vendor.id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTheme()
  }, [])

  useEffect(() => {
    if (!isLoading && theme.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
    }
  }, [theme.primaryColor, isLoading])

  return (
    <ThemeContext.Provider value={{ theme, vendorId, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
