// Staff authentication and user creation utilities

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface StaffData {
  name: string
  username: string
  email: string
  phone: string
  role: string
  password: string
  staffId?: string
}

export async function createStaffWithAuth(staffData: StaffData) {
  try {
    // Step 1: Create auth user using service role key
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        email: staffData.email,
        password: staffData.password,
        email_confirm: true,
        user_metadata: {
          username: staffData.username,
          phone: staffData.phone,
          role: staffData.role,
        },
      }),
    })

    const authData = await authResponse.json()

    if (authData.error) {
      throw new Error(authData.error.message)
    }

    const authUserId = authData.id

    // Step 2: Create entry in users table
    await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id: authUserId,
        email: staffData.email,
        username: staffData.username,
        phone_number: staffData.phone,
      }),
    })

    // Step 3: Create staff record
    const staffResponse = await fetch(`${supabaseUrl}/rest/v1/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        auth_user_id: authUserId,
        staff_id: staffData.staffId,
        name: staffData.name,
        username: staffData.username,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role,
        status: "active",
      }),
    })

    const staffRecord = await staffResponse.json()

    return {
      success: true,
      data: { authUserId, staff: staffRecord },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function resetStaffPassword(email: string) {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${email}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        password: "flow360",
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function updateStaffPassword(currentPassword: string, newPassword: string) {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sb-access-token="))
    ?.split("=")[1]

  if (!accessToken) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}
