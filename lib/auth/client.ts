const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function signUp(email: string, password: string, metadata: { username?: string; phone?: string }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      email,
      password,
      data: metadata,
    }),
  })

  const data = await response.json()
  return { data, error: data.error || null }
}

export async function signIn(identifier: string, password: string) {
  let email = identifier

  // Check if identifier is a username (not an email)
  if (!identifier.includes("@")) {
    // Look up email by username in the users table
    const usersResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(identifier)}&select=email`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    )

    const users = await usersResponse.json()

    if (users && users.length > 0) {
      email = users[0].email
    } else {
      return {
        data: {},
        error: { message: "Username not found" },
      }
    }
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const data = await response.json()

  if (data.access_token) {
    // Store tokens in cookies
    document.cookie = `sb-access-token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    document.cookie = `sb-refresh-token=${data.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}` // 30 days
  }

  return { data, error: data.error || null }
}

export async function signOut() {
  document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

  const response = await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
    },
  })

  return { error: null }
}

export async function signInWithGoogle() {
  const redirectUrl = `${window.location.origin}/auth/callback`
  const response = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
    },
  })

  window.location.href = response.url
}

export async function getCurrentUserRole(): Promise<string | null> {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sb-access-token="))
    ?.split("=")[1]

  if (!accessToken) {
    return null
  }

  try {
    // Get user from auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()

    if (!userData || !userData.id) {
      return null
    }

    // Get staff record to find role
    const staffResponse = await fetch(`${supabaseUrl}/rest/v1/staff?auth_user_id=eq.${userData.id}&select=role`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const staff = await staffResponse.json()

    if (staff && staff.length > 0) {
      return staff[0].role
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching user role:", error)
    return null
  }
}
