import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/api/auth/signin",
    error: "/api/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicRoute = nextUrl.pathname.startsWith("/public") || nextUrl.pathname.startsWith("/api/health/public")

      if (isPublicRoute) {
        return true
      }

      return isLoggedIn
    },
  },
  providers: [],
} satisfies NextAuthConfig
