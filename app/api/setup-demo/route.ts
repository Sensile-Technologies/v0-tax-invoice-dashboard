import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Step 1: Create the user account via Supabase Auth API
    const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        email: "muenis@sensile.com",
        password: "Pauline@123",
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          username: "muenis",
          phone_number: "+254700000000",
        },
      }),
    })

    const signUpData = await signUpResponse.json()

    if (!signUpResponse.ok) {
      // Check if user already exists
      if (signUpData.msg?.includes("already registered")) {
        return NextResponse.json({
          message: "Demo account already exists. You can login with: muenis@sensile.com / Pauline@123",
          exists: true,
        })
      }
      throw new Error(signUpData.msg || "Failed to create user account")
    }

    const userId = signUpData.user?.id

    if (!userId) {
      throw new Error("User ID not returned from signup")
    }

    // Step 2: Insert user profile into public.users table
    const insertUserResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id: userId,
        email: "muenis@sensile.com",
        username: "muenis",
        phone_number: "+254700000000",
      }),
    })

    if (!insertUserResponse.ok) {
      console.error("Failed to insert user profile")
    }

    // Step 3: Create 5 branches
    const branches = [
      {
        name: "Nairobi Branch",
        location: "Nairobi, Kenya - Westlands, ABC Place",
        manager: "John Kamau",
        phone: "+254722111222",
        email: "nairobi@flow360.com",
        status: "active",
        user_id: userId,
      },
      {
        name: "Mombasa Branch",
        location: "Mombasa, Kenya - Nyali, Mombasa Road",
        manager: "Sarah Wanjiku",
        phone: "+254733222333",
        email: "mombasa@flow360.com",
        status: "active",
        user_id: userId,
      },
      {
        name: "Kisumu Branch",
        location: "Kisumu, Kenya - Milimani, Oginga Odinga Street",
        manager: "David Omondi",
        phone: "+254744333444",
        email: "kisumu@flow360.com",
        status: "active",
        user_id: userId,
      },
      {
        name: "Nakuru Branch",
        location: "Nakuru, Kenya - CBD, Kenyatta Avenue",
        manager: "Grace Njeri",
        phone: "+254755444555",
        email: "nakuru@flow360.com",
        status: "active",
        user_id: userId,
      },
      {
        name: "Eldoret Branch",
        location: "Eldoret, Kenya - Pioneer, Uganda Road",
        manager: "Peter Kipchoge",
        phone: "+254766555666",
        email: "eldoret@flow360.com",
        status: "active",
        user_id: userId,
      },
    ]

    const insertBranchesResponse = await fetch(`${supabaseUrl}/rest/v1/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(branches),
    })

    if (!insertBranchesResponse.ok) {
      const errorData = await insertBranchesResponse.json()
      console.error("Failed to insert branches:", errorData)
    }

    return NextResponse.json({
      success: true,
      message: "Demo account created successfully!",
      credentials: {
        email: "muenis@sensile.com",
        password: "Pauline@123",
      },
      branches: branches.map((b) => b.name),
    })
  } catch (error) {
    console.error("Setup demo error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to setup demo account" },
      { status: 500 },
    )
  }
}
