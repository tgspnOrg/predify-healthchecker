import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth((req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  const publicRoutes = ["/public", "/api/health/public", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if user is authenticated (next-auth exposes token on req.nextauth?.token)
  if (!req.nextauth?.token) {
    const signInUrl = new URL("/api/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}
