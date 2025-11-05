import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  const publicRoutes = ["/public", "/api/health/public", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  // if (!req.auth) {
  //   const signInUrl = new URL("/api/auth/signin", req.url)
  //   signInUrl.searchParams.set("callbackUrl", pathname)
  //   return NextResponse.redirect(signInUrl)
  // }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}
