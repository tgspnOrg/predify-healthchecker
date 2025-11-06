import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { HealthCheckFormat, HealthCheckResult, HealthStatus, HealthDependency } from "@/lib/types"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { url, format, timeout = 10000, headers } = body

    if (!url || !format) {
      return NextResponse.json({ error: "Missing required fields: url, format" }, { status: 400 })
    }

    const result = await performHealthCheckServerSide(url, format, timeout, headers)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] Health check API error:", error)
    return NextResponse.json(
      {
        status: "Unhealthy",
        latency: 0,
        timestamp: Date.now(),
        error: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function performHealthCheckServerSide(
  url: string,
  format: HealthCheckFormat,
  timeout: number,
  headers?: Record<string, string>,
): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    console.log("[v0] Health check request:", { url, format, timeout })

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const latency = Date.now() - startTime

    console.log("[v0] Health check response:", {
      url,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    })

    if (!response.ok) {
      return {
        status: "Unhealthy",
        latency,
        timestamp: Date.now(),
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    if (format === "OkText") {
      const text = await response.text()
      const isHealthy = text.trim().toLowerCase() === "ok"

      return {
        status: isHealthy ? "Healthy" : "Unhealthy",
        latency,
        timestamp: Date.now(),
        error: isHealthy ? undefined : `Expected "ok", got "${text}"`,
      }
    }

    // HealthJson format
    let data: any
    try {
      const text = await response.text()
      console.log("[v0] Response text length:", text.length)

      // Check if response is empty
      if (!text || text.trim().length === 0) {
        return {
          status: "Unhealthy",
          latency,
          timestamp: Date.now(),
          error: "Empty response body (expected JSON)",
        }
      }

      // Try to parse JSON
      data = JSON.parse(text)
      console.log("[v0] Parsed JSON successfully:", data)
    } catch (parseError: any) {
      console.error("[v0] JSON parse error:", parseError.message)
      return {
        status: "Unhealthy",
        latency,
        timestamp: Date.now(),
        error: `Invalid JSON response: ${parseError.message}`,
      }
    }

    // Parse status
    let status: HealthStatus = "Unknown"
    if (data.status) {
      const statusStr = data.status.toLowerCase()
      if (statusStr === "healthy") status = "Healthy"
      else if (statusStr === "degraded") status = "Degraded"
      else if (statusStr === "unhealthy") status = "Unhealthy"
    }

    // Parse dependencies from "health" array
    let dependencies: HealthDependency[] | undefined
    if (data.health && Array.isArray(data.health)) {
      dependencies = data.health.map((dep: any) => ({
        name: dep.dependency || "Unknown",
        status: parseHealthStatus(dep.status),
        description: dep.message,
      }))

      const hasUnhealthy = dependencies.some((d) => d.status === "Unhealthy")
      const hasDegraded = dependencies.some((d) => d.status === "Degraded")

      if (hasUnhealthy) {
        status = "Unhealthy"
      } else if (hasDegraded && status === "Healthy") {
        status = "Degraded"
      }
    }

    return {
      status,
      latency,
      timestamp: Date.now(),
      dependencies,
    }
  } catch (error: any) {
    const latency = Date.now() - startTime

    console.error("[v0] Health check error:", {
      url,
      error: error.message,
      name: error.name,
    })

    if (error.name === "AbortError") {
      return {
        status: "Unhealthy",
        latency,
        timestamp: Date.now(),
        error: `Timeout after ${timeout}ms`,
      }
    }

    return {
      status: "Unhealthy",
      latency,
      timestamp: Date.now(),
      error: error.message || "Network error",
    }
  }
}

function parseHealthStatus(status: any): HealthStatus {
  if (!status) return "Unknown"
  const statusStr = String(status).toLowerCase()
  if (statusStr === "healthy") return "Healthy"
  if (statusStr === "degraded") return "Degraded"
  if (statusStr === "unhealthy") return "Unhealthy"
  return "Unknown"
}
