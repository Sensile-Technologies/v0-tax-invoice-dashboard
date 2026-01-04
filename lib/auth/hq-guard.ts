import { cookies } from 'next/headers'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface SessionInfo {
  userId: string | null
  role: string | null
  vendorId: string | null
  branchId: string | null
  isHQAuthorized: boolean
}

export async function checkHQAuthorization(): Promise<SessionInfo> {
  const result: SessionInfo = {
    userId: null,
    role: null,
    vendorId: null,
    branchId: null,
    isHQAuthorized: false
  }

  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) {
      return result
    }

    const session = JSON.parse(sessionCookie.value)
    if (!session.id) {
      return result
    }

    result.userId = session.id

    const queryResult = await pool.query(
      `SELECT u.id, 
       COALESCE(s.role, u.role) as role,
       COALESCE(v.id, b.vendor_id) as vendor_id, 
       s.branch_id
       FROM users u 
       LEFT JOIN vendors v ON v.email = u.email 
       LEFT JOIN staff s ON s.user_id = u.id
       LEFT JOIN branches b ON b.id = s.branch_id
       WHERE u.id = $1`,
      [session.id]
    )

    if (queryResult.rows.length === 0) {
      return result
    }

    const user = queryResult.rows[0]
    result.role = user.role
    result.vendorId = user.vendor_id
    result.branchId = user.branch_id

    const restrictedRoles = ['supervisor', 'manager', 'cashier']
    const normalizedRole = (user.role || '').toLowerCase()
    
    result.isHQAuthorized = !restrictedRoles.includes(normalizedRole)

    return result
  } catch (error) {
    console.error('Error checking HQ authorization:', error)
    return result
  }
}
