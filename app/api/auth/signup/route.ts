import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { email, password, data, branch } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: "Email and password are required" } },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Validate against sign up requests list (leads table)
      // Check if KRA PIN matches any entry in the leads table
      if (branch?.kra_pin) {
        const normalizedPin = branch.kra_pin.trim().toUpperCase()

        // Check if there's a matching lead in the sign up requests (active pipeline stages only)
        // Exclude leads that have already signed up or are pending activation
        const matchingLead = await client.query(
          `SELECT id, company_name, stage FROM leads 
           WHERE UPPER(TRIM(kra_pin)) = $1 
           AND stage NOT IN ('signed_up', 'pending_activation')
           LIMIT 1`,
          [normalizedPin]
        )

        if (matchingLead.rows.length === 0) {
          await client.query("ROLLBACK")
          return NextResponse.json(
            { error: { message: "Your details are not in our approved sign up list. Please contact admin to request access." } },
            { status: 403 }
          )
        }
      } else if (branch) {
        // Branch signup requires KRA PIN for validation
        await client.query("ROLLBACK")
        return NextResponse.json(
          { error: { message: "KRA PIN is required for sign up." } },
          { status: 400 }
        )
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

        // Update matching lead to pending_activation stage (moves out of sales pipeline)
        // Lead will now appear in admin onboarding requests for device_token configuration
        if (branch?.kra_pin) {
          const normalizedPin = branch.kra_pin.trim().toUpperCase()

          await client.query(
            `UPDATE leads 
             SET stage = 'pending_activation', updated_at = NOW() 
             WHERE UPPER(TRIM(kra_pin)) = $1 
             AND stage NOT IN ('signed_up', 'pending_activation')`,
            [normalizedPin]
          )
        }
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
