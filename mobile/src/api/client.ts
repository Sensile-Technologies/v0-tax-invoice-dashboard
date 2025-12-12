import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ceaad22e-7426-4b1f-a645-d2bab46d41d2-00-2750hh3y918g9.janeway.replit.dev'

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

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error ${response.status}`)
    }

    return response.json()
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
