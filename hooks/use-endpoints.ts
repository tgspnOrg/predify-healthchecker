"use client"

import { useState, useEffect } from "react"
import type { HealthEndpoint } from "@/lib/types"
import {
  getEndpoints,
  addEndpoint as addEndpointToStorage,
  updateEndpoint as updateEndpointInStorage,
  deleteEndpoint as deleteEndpointFromStorage,
} from "@/lib/storage"

export function useEndpoints() {
  const [endpoints, setEndpoints] = useState<HealthEndpoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEndpoints = () => {
      const data = getEndpoints()
      setEndpoints(data)
      setLoading(false)
    }

    loadEndpoints()

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "health_monitor_endpoints") {
        loadEndpoints()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const addEndpoint = (endpoint: HealthEndpoint) => {
    addEndpointToStorage(endpoint)
    setEndpoints(getEndpoints())
  }

  const updateEndpoint = (id: string, updates: Partial<HealthEndpoint>) => {
    updateEndpointInStorage(id, updates)
    setEndpoints(getEndpoints())
  }

  const deleteEndpoint = (id: string) => {
    deleteEndpointFromStorage(id)
    setEndpoints(getEndpoints())
  }

  return {
    endpoints,
    loading,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
  }
}
