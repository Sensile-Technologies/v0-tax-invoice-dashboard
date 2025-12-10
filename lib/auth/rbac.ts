// Role-Based Access Control utilities

export type Role = "Director" | "Manager" | "Supervisor" | "Cashier"

export interface Permission {
  resource: string
  actions: ("create" | "read" | "update" | "delete")[]
}

// Define permissions for each role
export const rolePermissions: Record<Role, Permission[]> = {
  Director: [
    { resource: "sales", actions: ["create", "read", "update", "delete"] },
    { resource: "purchases", actions: ["create", "read", "update", "delete"] },
    { resource: "inventory", actions: ["create", "read", "update", "delete"] },
    { resource: "payments", actions: ["create", "read", "update", "delete"] },
    { resource: "customers", actions: ["create", "read", "update", "delete"] },
    { resource: "items", actions: ["create", "read", "update", "delete"] },
    { resource: "imports", actions: ["create", "read", "update", "delete"] },
    { resource: "users", actions: ["create", "read", "update", "delete"] },
    { resource: "reports", actions: ["read"] },
    { resource: "branches", actions: ["create", "read", "update", "delete"] },
    { resource: "devices", actions: ["create", "read", "update", "delete"] },
  ],
  Manager: [
    { resource: "sales", actions: ["create", "read", "update"] },
    { resource: "purchases", actions: ["create", "read", "update"] },
    { resource: "inventory", actions: ["create", "read", "update"] },
    { resource: "payments", actions: ["create", "read"] },
    { resource: "customers", actions: ["create", "read", "update"] },
    { resource: "items", actions: ["create", "read", "update"] },
    { resource: "reports", actions: ["read"] },
  ],
  Supervisor: [
    { resource: "sales", actions: ["create", "read"] },
    { resource: "inventory", actions: ["read", "update"] },
    { resource: "customers", actions: ["create", "read", "update"] },
    { resource: "items", actions: ["read"] },
    { resource: "reports", actions: ["read"] },
  ],
  Cashier: [
    { resource: "sales", actions: ["create", "read"] },
    { resource: "customers", actions: ["read"] },
    { resource: "items", actions: ["read"] },
  ],
}

export function hasPermission(role: Role, resource: string, action: "create" | "read" | "update" | "delete"): boolean {
  const permissions = rolePermissions[role]
  const resourcePermission = permissions.find((p) => p.resource === resource)
  return resourcePermission ? resourcePermission.actions.includes(action) : false
}

export function canAccessResource(role: Role, resource: string): boolean {
  return rolePermissions[role].some((p) => p.resource === resource)
}

// Get role description
export const roleDescriptions: Record<Role, string> = {
  Director: "Full system access, financial approvals, user management, strategic reporting",
  Manager: "Branch operations, staff supervision, inventory management, sales reporting",
  Supervisor: "Daily operations, stock monitoring, customer management, basic reporting",
  Cashier: "Sales transactions, customer invoicing, basic inventory view, receipt generation",
}
