export async function signUp(email: string, password: string, metadata: { username?: string; phone?: string }) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const isEmail = identifier.includes("@")

  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: isEmail ? identifier : undefined,
      username: isEmail ? undefined : identifier,
      password,
    }),
  })

  const data = await response.json()

  if (data.access_token) {
    document.cookie = `sb-access-token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`
    document.cookie = `sb-refresh-token=${data.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}`
    if (data.user) {
      localStorage.setItem("currentUser", JSON.stringify(data.user))
    }
  }

  return { data, error: data.error || null }
}

export async function signOut() {
  document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  localStorage.removeItem("currentUser")
  localStorage.removeItem("selectedBranch")
  return { error: null }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export async function signInWithGoogle() {
  throw new Error("Google sign-in is not available with local authentication")
}

export async function getCurrentUserRole(): Promise<string | null> {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sb-access-token="))
    ?.split("=")[1]

  if (!accessToken) {
    return null
  }

  return null
}
