export interface User {
  id: string
  email: string
  username?: string
  name?: string
  role: 'cashier' | 'supervisor' | 'admin' | 'sales' | 'vendor' | 'merchant'
  branch_id?: string
  branch_name?: string
  bhf_id?: string
  vendor_id?: string
  vendor_name?: string
  staff_id?: string
}

export interface AuthResponse {
  user: User
  token?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  category?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  kra_pin?: string
}

export interface InvoiceLineItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount?: number
  total: number
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id?: string
  customer_name?: string
  branch_id: string
  items: InvoiceLineItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'pending' | 'paid' | 'cancelled'
  created_at: string
  created_by: string
}

export interface DailySales {
  total_sales: number
  total_invoices: number
  pending_invoices: number
  paid_invoices: number
}
