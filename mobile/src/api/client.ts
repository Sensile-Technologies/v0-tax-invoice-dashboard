import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://flow360-rji.replit.app'
const REQUEST_TIMEOUT = 30000

class ApiClient {
  private token: string | null = null

  async init() {
    try {
      this.token = await SecureStore.getItemAsync('auth_token')
    } catch (error) {
      console.log('SecureStore not available')
    }
  }

  async setToken(token: string) {
    this.token = token
    try {
      await SecureStore.setItemAsync('auth_token', token)
    } catch (error) {
      console.log('SecureStore not available')
    }
  }

  async clearToken() {
    this.token = null
    try {
      await SecureStore.deleteItemAsync('auth_token')
    } catch (error) {
      console.log('SecureStore not available')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error?.message || errorData.error || errorData.message || errorMessage
        } catch {
          // Response is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const text = await response.text()
      if (!text) {
        return {} as T
      }
      
      try {
        return JSON.parse(text)
      } catch {
        console.warn('Response is not valid JSON:', text.substring(0, 100))
        return {} as T
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.')
      }
      
      if (error.message?.includes('Network request failed')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
