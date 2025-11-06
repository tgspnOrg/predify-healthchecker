import type { HealthCheckFormat, HealthCheckResult, HealthStatus, HealthDependency } from "./types"

export async function performHealthCheck(
  url: string,
  format: HealthCheckFormat,
  timeout = 10000,
  headers?: Record<string, string>,
): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

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
    const data = await response.json()

    // Parse status
    let status: HealthStatus = "Unknown"
    if (data.status) {
      const statusStr = data.status.toLowerCase()
      if (statusStr === "healthy") status = "Healthy"
      else if (statusStr === "degraded") status = "Degraded"
      else if (statusStr === "unhealthy") status = "Unhealthy"
    }

    // Parse dependencies
    let dependencies: HealthDependency[] | undefined
    if (data.dependencies && Array.isArray(data.dependencies)) {
      dependencies = data.dependencies.map((dep: any) => ({
        name: dep.name || "Unknown",
        status: parseHealthStatus(dep.status),
        description: dep.description,
      }))
    }

    return {
      status,
      latency,
      timestamp: Date.now(),
      dependencies,
    }
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
