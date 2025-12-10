export async function POST(request: Request) {
  try {
    const { email, username, password, fullName, phoneNumber, role, branchId } = await request.json()

    // Validate required fields
    if (!email || !username || !password || !fullName || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create auth user using Supabase Auth API
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          full_name: fullName,
          phone_number: phoneNumber,
        },
      }),
    })

    if (!authResponse.ok) {
      const error = await authResponse.json()
      return Response.json({ error: error.msg || "Failed to create auth user" }, { status: authResponse.status })
    }

    const authUser = await authResponse.json()

    // Insert into users table
    const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: authUser.id,
        email,
        username,
        phone_number: phoneNumber,
      }),
    })

    // Insert into staff table
    const staffResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: authUser.id,
        username,
        email,
        full_name: fullName,
        phone_number: phoneNumber,
        role,
        branch_id: branchId,
        status: "active",
      }),
    })

    if (!staffResponse.ok) {
      const error = await staffResponse.json()
      return Response.json(
        { error: error.message || "Failed to create staff record" },
        { status: staffResponse.status },
      )
    }

    const staff = await staffResponse.json()

    return Response.json({
      success: true,
      message: "Staff member created successfully",
      staff: staff[0],
    })
  } catch (error) {
    console.error("Error creating staff:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
