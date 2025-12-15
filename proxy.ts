import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const publicPaths = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/callback",
    "/api/",
  ]
  
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  )
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  const token = request.cookies.get("sb-access-token")?.value
  
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
