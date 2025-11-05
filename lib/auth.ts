import NextAuth, { type User, type Session } from "next-auth"
import type { JWT } from "next-auth/jwt"

export type UserRole = "Admin" | "Editor" | "Viewer"

export interface ExtendedUser extends User {
  role: UserRole
  accessToken?: string
}

export interface ExtendedSession extends Session {
  user: ExtendedUser
  accessToken?: string
}

export interface ExtendedJWT extends JWT {
  role?: UserRole
  accessToken?: string
  refreshToken?: string
  accessTokenExpires?: number
}

// Extract roles from various claim formats
export function extractRolesFromClaims(claims: any): UserRole {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || []

  // Check if user email is in admin list
  if (claims.email && adminEmails.includes(claims.email)) {
    return "Admin"
  }

  // Try different claim formats
  const roleClaim = claims.role || claims.roles?.[0] || claims.permissions?.[0] || claims.realm_access?.roles?.[0]

  if (roleClaim) {
    const roleStr = String(roleClaim).toLowerCase()
    if (roleStr.includes("admin")) return "Admin"
    if (roleStr.includes("editor")) return "Editor"
    if (roleStr.includes("viewer")) return "Viewer"
  }

  return "Viewer" // Default role
}

// Refresh access token
async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    const url = `${process.env.OIDC_ISSUER}/connect/token`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.OIDC_CLIENT_ID!,
        client_secret: process.env.OIDC_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "development-secret-please-change-in-production-min-32-chars"

const oidcIssuer = process.env.OIDC_ISSUER || "https://example.com"
const oidcClientId = process.env.OIDC_CLIENT_ID || "demo-client-id"
const oidcClientSecret = process.env.OIDC_CLIENT_SECRET || "demo-client-secret"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  providers: [
    {
      id: "openiddict",
      name: "OpenIddict",
      type: "oauth",
      issuer: oidcIssuer,
      wellKnown: process.env.OIDC_WELLKNOWN || `${oidcIssuer}/.well-known/openid-configuration`,
      authorization: {
        params: {
          scope: process.env.OIDC_SCOPE || "openid profile email offline_access",
        },
      },
      clientId: oidcClientId,
      clientSecret: oidcClientSecret,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        const role = extractRolesFromClaims(profile)
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          role,
        } as ExtendedJWT
      }

      // Return previous token if the access token has not expired yet
      const extToken = token as ExtendedJWT
      if (extToken.accessTokenExpires && Date.now() < extToken.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token as ExtendedJWT)
    },
    async session({ session, token }) {
      const extToken = token as ExtendedJWT
      if (session.user) {
        ;(session as ExtendedSession).user.role = extToken.role || "Viewer"
        ;(session as ExtendedSession).accessToken = extToken.accessToken
      }
      return session
    },
  },
  // pages: {
  //   signIn: "/api/auth/signin",
  //   error: "/api/auth/error",
  // },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
})

export function hasRole(user: ExtendedUser | null, requiredRole: UserRole): boolean {
  if (!user) return false

  const roleHierarchy: Record<UserRole, number> = {
    Admin: 3,
    Editor: 2,
    Viewer: 1,
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}
