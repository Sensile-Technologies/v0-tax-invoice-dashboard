import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getSessionUser(): Promise<{ id: string; email: string; role?: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    return session || null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const allowedRoles = ["Admin", "Director", "Manager"]
    if (session.role && !allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden. Only Admin, Director, or Manager can convert leads." },
        { status: 403 }
      )
    }

    const { lead_id, password } = await request.json()

    if (!lead_id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      const leadResult = await client.query(
        `SELECT id, stage, company_name, contact_name, contact_email, contact_phone, kra_pin, address, county
         FROM leads WHERE id = $1`,
        [lead_id]
      )

      if (leadResult.rows.length === 0) {
        await client.query("ROLLBACK")
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        )
      }

      const lead = leadResult.rows[0]

      if (lead.stage !== 'onboarding') {
        await client.query("ROLLBACK")
        return NextResponse.json(
          { 
            error: `Lead must be in "onboarding" stage to convert. Current stage: "${lead.stage}"`,
            current_stage: lead.stage
          },
          { status: 400 }
        )
      }

      if (!lead.contact_email) {
        await client.query("ROLLBACK")
        return NextResponse.json(
          { error: "Lead must have a contact email to create an account" },
          { status: 400 }
        )
      }

      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [lead.contact_email]
      )

      if (existingUser.rows.length > 0) {
        await client.query("ROLLBACK")
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        )
      }

      const defaultPassword = password || "flow360"
      const passwordHash = await bcrypt.hash(defaultPassword, 10)
      const userId = crypto.randomUUID()
      const vendorId = crypto.randomUUID()
      const branchId = crypto.randomUUID()
      const staffId = crypto.randomUUID()

      await client.query(
        `INSERT INTO users (id, email, username, phone_number, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, lead.contact_email, lead.contact_name || lead.contact_email.split('@')[0], lead.contact_phone, passwordHash]
      )

      await client.query(
        `INSERT INTO vendors (id, name, email, phone, address, kra_pin, status, billing_email, subscription_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, 'active', NOW(), NOW())`,
        [
          vendorId,
          lead.company_name,
          lead.contact_email,
          lead.contact_phone,
          lead.address,
          lead.kra_pin,
          lead.contact_email
        ]
      )

      const isHeadquarters = lead.company_name && (
        lead.company_name.toLowerCase().includes('headquarters') || 
        lead.company_name.toLowerCase().includes('head office') ||
        lead.company_name.toLowerCase() === 'hq'
      )
      const bhfId = isHeadquarters ? "00" : "01"

      await client.query(
        `INSERT INTO branches (id, user_id, vendor_id, name, bhf_id, trading_name, kra_pin, address, county, email, phone, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW(), NOW())`,
        [
          branchId,
          userId,
          vendorId,
          lead.company_name,
          bhfId,
          lead.company_name,
          lead.kra_pin,
          lead.address,
          lead.county,
          lead.contact_email,
          lead.contact_phone
        ]
      )

      await client.query(
        `INSERT INTO staff (id, user_id, branch_id, full_name, username, email, phone_number, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Director', 'active', NOW(), NOW())`,
        [
          staffId,
          userId,
          branchId,
          lead.contact_name || lead.contact_email.split('@')[0],
          lead.contact_name || lead.contact_email.split('@')[0],
          lead.contact_email,
          lead.contact_phone
        ]
      )

      await client.query(
        `UPDATE leads 
         SET stage = 'signed_up', updated_at = NOW() 
         WHERE id = $1`,
        [lead_id]
      )

      await client.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Account created successfully. Default password is 'flow360' - please advise the user to change it on first login.",
        data: {
          user_id: userId,
          vendor_id: vendorId,
          branch_id: branchId,
          staff_id: staffId,
          email: lead.contact_email,
          company_name: lead.company_name
        }
      })
    } catch (txError) {
      await client.query("ROLLBACK")
      throw txError
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[API] Lead conversion error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to convert lead to account" },
      { status: 500 }
    )
  }
}
