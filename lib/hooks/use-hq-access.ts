"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface HQAccessState {
  isChecking: boolean
  hasAccess: boolean
  user: any | null
}

export function useHQAccess(): HQAccessState {
  const router = useRouter()
  const [state, setState] = useState<HQAccessState>({
    isChecking: true,
    hasAccess: false,
    user: null
  })

  useEffect(() => {
    const checkAccess = async () => {
      const restrictedRoles = ['supervisor', 'manager', 'cashier']

      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' })
        if (!response.ok) {
          router.replace('/auth/login')
          setState({ isChecking: false, hasAccess: false, user: null })
          return
        }

        const data = await response.json()
        if (!data.success || !data.user) {
          router.replace('/auth/login')
          setState({ isChecking: false, hasAccess: false, user: null })
          return
        }

        const serverRole = (data.user.role || '').toLowerCase()
        if (restrictedRoles.includes(serverRole)) {
          const branchId = data.user.branch_id
          router.replace(branchId ? `/sales/summary?branch=${branchId}` : '/sales/summary')
          setState({ isChecking: false, hasAccess: false, user: data.user })
          return
        }

        setState({ isChecking: false, hasAccess: true, user: data.user })
      } catch (error) {
        console.error('Error checking HQ access:', error)
        router.replace('/auth/login')
        setState({ isChecking: false, hasAccess: false, user: null })
      }
    }

    checkAccess()
  }, [router])

  return state
}
