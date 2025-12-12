import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import { User } from '../types'
import { api } from '../api/client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
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
        if (userData.role === 'cashier' || userData.role === 'supervisor') {
          setUser(userData)
        }
      }
    } catch (error) {
      console.log('No stored user')
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const response = await api.post<{ user: User; success: boolean }>('/api/auth/signin', {
        email,
        password,
      })

      if (!response.success || !response.user) {
        throw new Error('Invalid credentials')
      }

      const userData = response.user
      
      if (userData.role !== 'cashier' && userData.role !== 'supervisor') {
        throw new Error('Only cashiers and supervisors can use this app')
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
        login,
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
