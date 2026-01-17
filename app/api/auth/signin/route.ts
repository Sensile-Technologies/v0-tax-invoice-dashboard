import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { logActivity, getClientInfo } from "@/lib/activity-logger"

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
      const identifier = email || username

      if (identifier && identifier.includes("@")) {
        const salesResult = await client.query(
          "SELECT id, name, email, phone, is_active FROM sales_people WHERE email = $1 AND is_active = true",
          [identifier]
        )
        const salesPerson = salesResult.rows[0]

        if (salesPerson && salesPerson.phone) {
          const phoneDigits = salesPerson.phone.replace(/\D/g, '')
          const passwordDigits = password.replace(/\D/g, '')
          
          if (phoneDigits.length >= 9 && passwordDigits.length >= 9 && phoneDigits === passwordDigits) {
            const token = crypto.randomUUID()
            const refreshToken = crypto.randomUUID()
            const response = NextResponse.json({
              access_token: token,
              refresh_token: refreshToken,
              user: {
                id: salesPerson.id,
                email: salesPerson.email,
                username: salesPerson.name,
                role: 'sales',
                sales_person_id: salesPerson.id,
                sales_person_name: salesPerson.name
              }
            })
            response.cookies.set('sb-access-token', token, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
              sameSite: 'none',
              secure: true,
              httpOnly: false
            })
            response.cookies.set('sb-refresh-token', refreshToken, {
              path: '/',
              maxAge: 60 * 60 * 24 * 30,
              sameSite: 'none',
              secure: true,
              httpOnly: false
            })
            return response
          }
        }
      }

      if (email) {
        const result = await client.query(
          `SELECT u.id, u.email, u.username, u.password_hash, 
           COALESCE(s.role, u.role) as role,
           COALESCE(v.id, b.vendor_id) as vendor_id, 
           COALESCE(v.name, sv.name) as vendor_name,
           COALESCE(s.branch_id, vb.id) as branch_id, 
           COALESCE(b.name, vb.name) as branch_name,
           COALESCE(b.bhf_id, vb.bhf_id) as bhf_id
           FROM users u 
           LEFT JOIN vendors v ON v.email = u.email 
           LEFT JOIN staff s ON s.user_id = u.id
           LEFT JOIN branches b ON b.id = s.branch_id
           LEFT JOIN vendors sv ON sv.id = b.vendor_id
           LEFT JOIN branches vb ON vb.vendor_id = v.id AND vb.is_main = true
           WHERE u.email = $1`,
          [email]
        )
        user = result.rows[0]
      } else {
        const result = await client.query(
          `SELECT u.id, u.email, u.username, u.password_hash, 
           COALESCE(s.role, u.role) as role,
           COALESCE(v.id, b.vendor_id) as vendor_id, 
           COALESCE(v.name, sv.name) as vendor_name,
           COALESCE(s.branch_id, vb.id) as branch_id, 
           COALESCE(b.name, vb.name) as branch_name,
           COALESCE(b.bhf_id, vb.bhf_id) as bhf_id
           FROM users u 
           LEFT JOIN vendors v ON v.email = u.email 
           LEFT JOIN staff s ON s.user_id = u.id
           LEFT JOIN branches b ON b.id = s.branch_id
           LEFT JOIN vendors sv ON sv.id = b.vendor_id
           LEFT JOIN branches vb ON vb.vendor_id = v.id AND vb.is_main = true
           WHERE u.username = $1`,
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

      // Block cashiers from web dashboard - they can only use the mobile APK
      if (user.role && user.role.toLowerCase() === 'cashier') {
        return NextResponse.json(
          { error: { message: "Cashiers can only access the system through the mobile app. Please use the Flow360 mobile application." } },
          { status: 403 }
        )
      }

      // Check if vendor's branch has been activated (device_token configured)
      // Only applies to vendors, not admin or sales users
      if (user.vendor_id && user.branch_id) {
        const branchResult = await client.query(
          "SELECT device_token FROM branches WHERE id = $1",
          [user.branch_id]
        )
        const branch = branchResult.rows[0]
        
        if (!branch || !branch.device_token) {
          return NextResponse.json(
            { error: { message: "Your account is pending activation. Please contact admin to complete your onboarding." } },
            { status: 403 }
          )
        }
      }

      const token = crypto.randomUUID()
      const refreshToken = crypto.randomUUID()

      const response = NextResponse.json({
        access_token: token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role || 'vendor',
          vendor_id: user.vendor_id,
          vendor_name: user.vendor_name,
          branch_id: user.branch_id,
          branch_name: user.branch_name,
          bhf_id: user.bhf_id
        }
      })
      
      response.cookies.set('sb-access-token', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'none',
        secure: true,
        httpOnly: false
      })
      response.cookies.set('sb-refresh-token', refreshToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'none',
        secure: true,
        httpOnly: false
      })
      response.cookies.set('user_session', JSON.stringify({
        id: user.id,
        email: user.email,
        vendor_id: user.vendor_id,
        branch_id: user.branch_id,
        role: user.role || 'vendor'
      }), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'none',
        secure: true,
        httpOnly: true
      })
      
      const clientInfo = getClientInfo(request)
      logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.username,
        branchId: user.branch_id,
        branchName: user.branch_name,
        vendorId: user.vendor_id,
        action: 'LOGIN',
        resourceType: 'auth',
        details: { role: user.role || 'vendor' },
        ...clientInfo
      })
      
      return response
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
