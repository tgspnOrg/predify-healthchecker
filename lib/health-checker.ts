import type { HealthCheckFormat, HealthCheckResult, HealthStatus } from "./types"

export async function performHealthCheck(
  url: string,
  format: HealthCheckFormat,
  timeout = 10000,
  headers?: Record<string, string>,
): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    const response = await fetch("/api/health/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        format,
        timeout,
        headers,
      }),
    })

    clearTimeout(timeout)
    const latency = Date.now() - startTime

    if (!response.ok) {
      const error = await response.json()
      return {
        status: "Unhealthy",
        latency,
        timestamp: Date.now(),
        error: error.error || `API error: ${response.status}`,
      }
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    const latency = Date.now() - startTime

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
      error: error.message || "Failed to check endpoint",
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
