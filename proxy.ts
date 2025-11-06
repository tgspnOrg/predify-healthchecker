import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  const publicRoutes = ["/public", "/api/health/public", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for session cookie (NextAuth sets this)
  const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token")

  if (!sessionToken) {
    // Redirect to sign in page
    const signInUrl = new URL("/api/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}
