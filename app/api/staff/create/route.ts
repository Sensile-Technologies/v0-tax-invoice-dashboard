import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { email, username, password, fullName, phoneNumber, role, branchId } = await request.json()

    if (!email || !username || !password || !fullName || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        [email, username]
      )

      if (existingUser.rows.length > 0) {
        return Response.json({ error: "User with this email or username already exists" }, { status: 400 })
      }

      const userId = crypto.randomUUID()
      const passwordHash = await bcrypt.hash(password, 10)

      await client.query(
        `INSERT INTO users (id, email, username, phone_number, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, email, username, phoneNumber || null, passwordHash]
      )

      const staffId = crypto.randomUUID()
      
      // Get vendor_id from branch if branch is provided
      let vendorId = null
      if (branchId) {
        const branchResult = await client.query(
          `SELECT vendor_id FROM branches WHERE id = $1`,
          [branchId]
        )
        if (branchResult.rows.length > 0) {
          vendorId = branchResult.rows[0].vendor_id
        }
      }
      
      const staffResult = await client.query(
        `INSERT INTO staff (id, user_id, username, email, full_name, phone_number, role, branch_id, vendor_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', NOW(), NOW())
         RETURNING *`,
        [staffId, userId, username, email, fullName, phoneNumber || null, role, branchId || null, vendorId]
      )

      return Response.json({
        success: true,
        message: "Staff member created successfully",
        staff: staffResult.rows[0],
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating staff:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
