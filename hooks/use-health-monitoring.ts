"use client"

import { useEffect, useCallback } from "react"
import { performHealthCheck } from "@/lib/health-checker"
import { addHistoryEntry } from "@/lib/storage"
import type { HealthEndpoint } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function useHealthMonitoring(
  endpoints: HealthEndpoint[],
  updateEndpoint: (id: string, updates: Partial<HealthEndpoint>) => void,
  enabled = true,
  interval = 60,
) {
  const { toast } = useToast()

  const checkEndpoint = useCallback(
    async (endpoint: HealthEndpoint) => {
      const result = await performHealthCheck(endpoint.url, endpoint.format, endpoint.timeout, endpoint.headers)

      // Update endpoint with last check result
      updateEndpoint(endpoint.id, { lastCheck: result })

      // Save to history
      addHistoryEntry({
        endpointId: endpoint.id,
        timestamp: result.timestamp,
        status: result.status,
        latency: result.latency,
        error: result.error,
      })

      // Show notification if status changed to unhealthy
      if (endpoint.lastCheck && endpoint.lastCheck.status === "Healthy" && result.status === "Unhealthy") {
        toast({
          title: "Health Check Failed",
          description: `${endpoint.name} is now unhealthy`,
          variant: "destructive",
        })
      }

      return result
    },
    [updateEndpoint, toast],
  )

  const checkAllEndpoints = useCallback(async () => {
    if (!enabled || endpoints.length === 0) return

    console.log("[v0] Checking all endpoints:", endpoints.length)

    for (const endpoint of endpoints) {
      await checkEndpoint(endpoint)
    }
  }, [endpoints, enabled, checkEndpoint])

  // Initial check
  useEffect(() => {
    if (enabled && endpoints.length > 0) {
      checkAllEndpoints()
    }
  }, []) // Only run once on mount

  // Periodic checks
  useEffect(() => {
    if (!enabled || endpoints.length === 0) return

    const intervalMs = interval * 1000
    console.log("[v0] Setting up monitoring interval:", intervalMs, "ms")

    const intervalId = setInterval(() => {
      checkAllEndpoints()
    }, intervalMs)

    return () => {
      console.log("[v0] Cleaning up monitoring interval")
      clearInterval(intervalId)
    }
  }, [enabled, interval, checkAllEndpoints])

  return {
    checkEndpoint,
    checkAllEndpoints,
  }
}
