import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("user_session")
  if (!sessionCookie) return null
  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')

    if (!branchId) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    const result = await client.query(
      `SELECT whatsapp_directors FROM branches WHERE id = $1`,
      [branchId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 })
    }

    let directors: string[] = []
    try {
      const raw = result.rows[0].whatsapp_directors
      directors = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []
    } catch {
      directors = []
    }

    return NextResponse.json({ success: true, directors })

  } catch (error) {
    console.error("Error fetching branch WhatsApp directors:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch directors" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { branch_id, directors } = body

    if (!branch_id) {
      return NextResponse.json({ success: false, error: "branch_id is required" }, { status: 400 })
    }

    if (!Array.isArray(directors)) {
      return NextResponse.json({ success: false, error: "directors must be an array" }, { status: 400 })
    }

    const validDirectors = directors.filter((d: string) => 
      typeof d === 'string' && d.match(/^\+?[0-9]{10,15}$/)
    )

    await client.query(
      `UPDATE branches SET whatsapp_directors = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(validDirectors), branch_id]
    )

    return NextResponse.json({ success: true, directors: validDirectors })

  } catch (error) {
    console.error("Error updating branch WhatsApp directors:", error)
    return NextResponse.json({ success: false, error: "Failed to update directors" }, { status: 500 })
  } finally {
    client.release()
  }
}
