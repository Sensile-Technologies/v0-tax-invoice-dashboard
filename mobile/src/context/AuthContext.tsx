import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import { User } from '../types'
import { api } from '../api/client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  loginWithCode: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const storedUser = await SecureStore.getItemAsync('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (['cashier', 'supervisor', 'manager', 'vendor', 'merchant'].includes(userData.role)) {
          setUser(userData)
        }
      }
    } catch (error) {
      console.log('No stored user')
    } finally {
      setIsLoading(false)
    }
  }

  async function loginWithCode(code: string) {
    setIsLoading(true)
    try {
      const response = await api.post<{ 
        success?: boolean
        user: User
        access_token?: string
        error?: { message: string } 
      }>('/api/auth/mobile-signin', {
        attendant_code: code,
      })

      if (response.error || !response.user) {
        throw new Error(response.error?.message || 'Invalid code')
      }

      const userData = response.user
      
      if (response.access_token) {
        await api.setToken(response.access_token)
      }
      
      if (!['cashier', 'supervisor', 'manager', 'vendor', 'merchant'].includes(userData.role)) {
        throw new Error('Access denied for this role')
      }

      setUser(userData)
      await SecureStore.setItemAsync('user', JSON.stringify(userData))
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    setUser(null)
    await SecureStore.deleteItemAsync('user')
    await api.clearToken()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginWithCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
