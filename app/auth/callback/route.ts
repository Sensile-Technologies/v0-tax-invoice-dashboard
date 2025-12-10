import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/headquarters"

  if (code) {
    try {
      // Exchange code for session tokens
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ auth_code: code }),
        },
      )

      const data = await response.json()

      if (data.access_token) {
        const redirectResponse = NextResponse.redirect(`${origin}${next}`)
        redirectResponse.cookies.set("sb-access-token", data.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        redirectResponse.cookies.set("sb-refresh-token", data.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
        return redirectResponse
      }
    } catch (error) {
      console.error("[v0] OAuth callback error:", error)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
