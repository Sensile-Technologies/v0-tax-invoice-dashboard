import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { email, password, data } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: "Email and password are required" } },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: { message: "User with this email already exists" } },
          { status: 400 }
        )
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const id = crypto.randomUUID()

      await client.query(
        `INSERT INTO users (id, email, username, phone_number, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [id, email, data?.username || null, data?.phone || null, passwordHash]
      )

      return NextResponse.json({
        user: { id, email, username: data?.username },
        message: "User created successfully"
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[API] Sign up error:", error)
    return NextResponse.json(
      { error: { message: "Failed to create user" } },
      { status: 500 }
    )
  }
}
