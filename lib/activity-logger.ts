import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface ActivityLogEntry {
  userId?: string
  userEmail?: string
  userName?: string
  branchId?: string
  branchName?: string
  vendorId?: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO activity_logs 
        (user_id, user_email, user_name, branch_id, branch_name, vendor_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        entry.userId || null,
        entry.userEmail || null,
        entry.userName || null,
        entry.branchId || null,
        entry.branchName || null,
        entry.vendorId || null,
        entry.action,
        entry.resourceType || null,
        entry.resourceId || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress || null,
        entry.userAgent || null
      ]
    )
  } catch (error) {
    console.error("[ActivityLogger] Failed to log activity:", error)
  }
}

export function getClientInfo(request: Request): { ipAddress: string, userAgent: string } {
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return { ipAddress, userAgent }
}
