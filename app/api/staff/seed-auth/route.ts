import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Supabase credentials not configured" }, { status: 500 })
    }

    // Staff members to create auth accounts for
    const staffMembers = [
      { username: "jmwangi", email: "jmwangi@flow360.com", fullName: "John Mwangi" },
      { username: "james.director", email: "director1@flow360.com", fullName: "James Kamau" },
      { username: "sarah.director", email: "director2@flow360.com", fullName: "Sarah Wanjiru" },
      { username: "john.manager", email: "manager1@flow360.com", fullName: "John Ochieng" },
      { username: "mary.manager", email: "manager2@flow360.com", fullName: "Mary Akinyi" },
      { username: "peter.supervisor", email: "supervisor1@flow360.com", fullName: "Peter Njoroge" },
      { username: "jane.supervisor", email: "supervisor2@flow360.com", fullName: "Jane Wambui" },
      { username: "david.cashier", email: "cashier1@flow360.com", fullName: "David Otieno" },
      { username: "lucy.cashier", email: "cashier2@flow360.com", fullName: "Lucy Chebet" },
    ]

    const results = []
    const defaultPassword = "flow360"

    for (const staff of staffMembers) {
      try {
        // Create auth account using Supabase Admin API
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
          body: JSON.stringify({
            email: staff.email,
            password: defaultPassword,
            email_confirm: true,
            user_metadata: {
              full_name: staff.fullName,
              username: staff.username,
            },
          }),
        })

        const authData = await authResponse.json()

        if (authResponse.ok && authData.id) {
          // Update users table
          await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify({
              id: authData.id,
              email: staff.email,
              username: staff.username,
            }),
          })

          // Update staff table with user_id
          await fetch(`${supabaseUrl}/rest/v1/staff?username=eq.${staff.username}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
            body: JSON.stringify({
              user_id: authData.id,
            }),
          })

          results.push({ username: staff.username, success: true })
        } else {
          results.push({ username: staff.username, success: false, error: authData.msg || "Unknown error" })
        }
      } catch (error) {
        results.push({ username: staff.username, success: false, error: String(error) })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      message: `Successfully created ${successCount}/${totalCount} staff authentication accounts. All staff can now log in with their username/email and password: flow360`,
      results,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: `Error: ${error}` }, { status: 500 })
  }
}
