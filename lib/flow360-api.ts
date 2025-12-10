// Flow360 API Client Library
// Centralized API configuration and helper functions

const FLOW360_BASE_URL = "http://147.93.155.29:8000"
const FLOW360_AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxMDY3NjgyLCJpYXQiOjE3NjEwNjQwODIsImp0aSI6ImZiMTA2ZDI2YmIwMDQxNTU5NjU0NWViY2U0ZDhkNjgwIiwidXNlcl9pZCI6IjQifQ.uUI2bDV8WA00a9_CIr5DPf7njaO929MZnYbpqIhi3IY"
const ORGANIZATION_ID = "12042062"

export const flow360Config = {
  baseUrl: FLOW360_BASE_URL,
  authToken: FLOW360_AUTH_TOKEN,
  organizationId: ORGANIZATION_ID,
}

export interface Flow360Station {
  id: number
  name: string
  city: string
  county: string
  location: string
  organization: number
}

export interface Flow360Sale {
  id: number
  nozzle: number
  shift: number
  amount: number
  quantity: number
  unit_price: number
  created_at: string
}

export interface Flow360Shift {
  id: number
  station: number
  opened_by: number
  closed_by?: number
  opening_time: string
  closing_time?: string
  status: "open" | "closed"
}

export interface Flow360FuelPrice {
  id: number
  station: number
  fuel_type: string
  price: number
  effective_date: string
}

export interface Flow360Dispenser {
  id: number
  station: number
  dispenser_name: string
  location: string
}

export interface Flow360Nozzle {
  id: number
  dispenser: number
  nozzle_number: string
  fuel_type: string
}

export async function flow360Request(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${FLOW360_BASE_URL}${endpoint}`

  console.log("[v0] Flow360 API Request:", url)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${FLOW360_AUTH_TOKEN}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    return response
  } catch (error) {
    console.error("[v0] Flow360 API Request Error:", error)
    throw error
  }
}
