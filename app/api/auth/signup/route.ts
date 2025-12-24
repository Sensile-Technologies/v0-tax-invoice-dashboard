import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { email, password, data, branch, lead_id } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: "Email and password are required" } },
        { status: 400 }
      )
    }

    // Require lead_id for new vendor/branch signups
    if (branch && !lead_id) {
      return NextResponse.json(
        { 
          error: { 
            message: "Account creation requires approval through the sales process. Please contact our sales team to get started.",
            code: "SALES_PROCESS_REQUIRED"
          } 
        },
        { status: 403 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Validate lead if provided (required for branch creation)
      if (lead_id) {
        const leadResult = await client.query(
          "SELECT id, stage, company_name, contact_email, contact_phone, kra_pin FROM leads WHERE id = $1",
          [lead_id]
        )

        if (leadResult.rows.length === 0) {
          await client.query("ROLLBACK")
          return NextResponse.json(
            { error: { message: "Invalid lead reference. Please contact sales." } },
            { status: 400 }
          )
        }

        const lead = leadResult.rows[0]
        if (lead.stage !== 'onboarding') {
          await client.query("ROLLBACK")
          return NextResponse.json(
            { 
              error: { 
                message: `This lead is in "${lead.stage}" stage. Only leads in "onboarding" stage can create accounts. Please contact sales to progress your application.`,
                code: "LEAD_NOT_IN_ONBOARDING"
              } 
            },
            { status: 403 }
          )
        }
      }

      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      )

      if (existingUser.rows.length > 0) {
        await client.query("ROLLBACK")
        return NextResponse.json(
          { error: { message: "User with this email already exists" } },
          { status: 400 }
        )
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const userId = crypto.randomUUID()

      await client.query(
        `INSERT INTO users (id, email, username, phone_number, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, email, data?.username || null, data?.phone || null, passwordHash]
      )

      let createdBranch = null
      let createdVendor = null

      if (branch) {
        const branchId = crypto.randomUUID()
        const vendorId = crypto.randomUUID()
        
        const isHeadquarters = branch.name && (
          branch.name.toLowerCase().includes('headquarters') || 
          branch.name.toLowerCase().includes('head office') ||
          branch.name.toLowerCase() === 'hq'
        )
        const bhfId = isHeadquarters ? "00" : "01"

        // Create vendor for this user with all relevant fields
        const vendorResult = await client.query(
          `INSERT INTO vendors (id, name, email, phone, address, kra_pin, status, billing_email, billing_address, subscription_status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           RETURNING *`,
          [
            vendorId, 
            branch.trading_name || branch.name, 
            email, 
            branch.phone || null, 
            branch.address || null, 
            branch.kra_pin || null,
            'active',
            email,
            branch.address || null,
            'active'
          ]
        )
        createdVendor = vendorResult.rows[0]

        const branchResult = await client.query(
          `INSERT INTO branches (id, user_id, vendor_id, name, bhf_id, trading_name, kra_pin, location, address, county, local_tax_office, manager, email, phone, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', NOW(), NOW())
           RETURNING *`,
          [
            branchId,
            userId,
            vendorId,
            branch.name,
            bhfId,
            branch.trading_name || null,
            branch.kra_pin || null,
            branch.location || null,
            branch.address || null,
            branch.county || null,
            branch.local_tax_office || null,
            branch.manager || null,
            branch.email || null,
            branch.phone || null,
          ]
        )
        createdBranch = branchResult.rows[0]

        const staffId = crypto.randomUUID()
        await client.query(
          `INSERT INTO staff (id, user_id, branch_id, full_name, username, email, phone_number, role, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'Director', 'active', NOW(), NOW())`,
          [
            staffId,
            userId,
            branchId,
            data?.username || email.split('@')[0],
            data?.username || email.split('@')[0],
            email,
            data?.phone || null,
          ]
        )
      }

      // Update lead to 'signed_up' stage if lead_id was provided
      if (lead_id) {
        await client.query(
          `UPDATE leads 
           SET stage = 'signed_up', updated_at = NOW() 
           WHERE id = $1`,
          [lead_id]
        )
      }

      await client.query("COMMIT")

      return NextResponse.json({
        user: { id: userId, email, username: data?.username },
        branch: createdBranch,
        message: "User created successfully"
      })
    } catch (txError) {
      await client.query("ROLLBACK")
      throw txError
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[API] Sign up error:", error)
    return NextResponse.json(
      { error: { message: error?.message || "Failed to create user", details: error?.toString() } },
      { status: 500 }
    )
  }
}
