import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    if (!password || (!email && !username)) {
      return NextResponse.json(
        { error: { message: "Email/username and password are required" } },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      let user
      if (email) {
        const result = await client.query(
          "SELECT id, email, username, password_hash FROM users WHERE email = $1",
          [email]
        )
        user = result.rows[0]
      } else {
        const result = await client.query(
          "SELECT id, email, username, password_hash FROM users WHERE username = $1",
          [username]
        )
        user = result.rows[0]
      }

      if (!user) {
        return NextResponse.json(
          { error: { message: "Invalid credentials" } },
          { status: 401 }
        )
      }

      if (!user.password_hash) {
        return NextResponse.json(
          { error: { message: "Password not set for this account" } },
          { status: 401 }
        )
      }

      const isValid = await bcrypt.compare(password, user.password_hash)

      if (!isValid) {
        return NextResponse.json(
          { error: { message: "Invalid credentials" } },
          { status: 401 }
        )
      }

      const token = crypto.randomUUID()

      return NextResponse.json({
        access_token: token,
        refresh_token: crypto.randomUUID(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[API] Sign in error:", error)
    return NextResponse.json(
      { error: { message: "Failed to sign in" } },
      { status: 500 }
    )
  }
}
