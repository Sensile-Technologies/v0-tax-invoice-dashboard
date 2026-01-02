import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function POST(request: Request) {
  try {
    const { attendant_code } = await request.json()

    if (!attendant_code) {
      return NextResponse.json(
        { error: { message: "Attendant code is required" } },
        { status: 400 }
      )
    }

    const code = attendant_code.trim()

    if (!/^\d{4}$/.test(code)) {
      return NextResponse.json(
        { error: { message: "Invalid code format. Enter 4 digits." } },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      // Find staff member with this code (globally unique)
      const result = await client.query(`
        SELECT s.id, s.user_id, s.username, s.full_name, s.email, s.phone_number, 
               s.role, s.branch_id, s.status, 
               COALESCE(s.failed_code_attempts, 0) as failed_code_attempts, 
               s.locked_until,
               b.name as branch_name, b.bhf_id, b.device_token,
               v.id as vendor_id, v.name as vendor_name
        FROM staff s
        LEFT JOIN branches b ON b.id = s.branch_id
        LEFT JOIN vendors v ON v.id = b.vendor_id
        WHERE s.attendant_code = $1
          AND s.status = 'active'
          AND s.role IN ('Cashier', 'Supervisor', 'Manager', 'cashier', 'supervisor', 'manager')
      `, [code])

      // If no match found
      if (!result.rows || result.rows.length === 0) {
        // Add a small delay to slow down brute-force attempts
        await new Promise(resolve => setTimeout(resolve, 500))
        return NextResponse.json(
          { error: { message: "Invalid attendant code" } },
          { status: 401 }
        )
      }

      const staff = result.rows[0]

      // Check if account is locked
      if (staff.locked_until && new Date(staff.locked_until) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(staff.locked_until).getTime() - Date.now()) / 60000)
        
        // Increment failed attempts even when locked
        await client.query(
          `UPDATE staff SET failed_code_attempts = COALESCE(failed_code_attempts, 0) + 1 WHERE id = $1`,
          [staff.id]
        )
        
        return NextResponse.json(
          { error: { message: `Account locked. Try again in ${remainingMinutes} minute(s).` } },
          { status: 423 }
        )
      }

      // Check failed attempts threshold - lock if exceeded
      if (staff.failed_code_attempts >= MAX_ATTEMPTS) {
        await client.query(
          `UPDATE staff SET locked_until = NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes', failed_code_attempts = COALESCE(failed_code_attempts, 0) + 1 WHERE id = $1`,
          [staff.id]
        )
        return NextResponse.json(
          { error: { message: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` } },
          { status: 423 }
        )
      }

      // Check if branch is activated
      if (!staff.device_token) {
        return NextResponse.json(
          { error: { message: "Branch not yet activated. Contact admin." } },
          { status: 403 }
        )
      }

      // Successful login - reset failed attempts and clear lockout
      await client.query(
        `UPDATE staff SET failed_code_attempts = 0, locked_until = NULL WHERE id = $1`,
        [staff.id]
      )

      const token = crypto.randomUUID()

      return NextResponse.json({
        success: true,
        access_token: token,
        user: {
          id: staff.user_id || staff.id,
          staff_id: staff.id,
          email: staff.email,
          username: staff.username || staff.full_name,
          full_name: staff.full_name,
          role: staff.role.toLowerCase(),
          vendor_id: staff.vendor_id,
          vendor_name: staff.vendor_name,
          branch_id: staff.branch_id,
          branch_name: staff.branch_name,
          bhf_id: staff.bhf_id
        }
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[API] Mobile sign in error:", error)
    return NextResponse.json(
      { error: { message: "Failed to sign in" } },
      { status: 500 }
    )
  }
}
