"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface VendorTheme {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  companyName: string
}

const defaultTheme: VendorTheme = {
  logoUrl: '/flow360-logo.png',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  companyName: 'Flow360',
}

interface ThemeContextType {
  theme: VendorTheme
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  isLoading: true,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<VendorTheme>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTheme() {
      try {
        const domain = typeof window !== 'undefined' ? window.location.hostname : ''
        const response = await fetch(`/api/theme?domain=${encodeURIComponent(domain)}`, { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.theme) {
            setTheme(data.theme)
            if (typeof window !== 'undefined') {
              document.documentElement.style.setProperty('--vendor-primary', data.theme.primaryColor)
              document.documentElement.style.setProperty('--vendor-secondary', data.theme.secondaryColor)
            }
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

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
