import type { HealthEndpoint, CheckHistory, AppSettings } from "./types"

const STORAGE_KEYS = {
  ENDPOINTS: "health_monitor_endpoints",
  HISTORY: "health_monitor_history",
  SETTINGS: "health_monitor_settings",
}

// Endpoints Storage
export function getEndpoints(): HealthEndpoint[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.ENDPOINTS)
  return data ? JSON.parse(data) : []
}

export function saveEndpoints(endpoints: HealthEndpoint[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.ENDPOINTS, JSON.stringify(endpoints))
}

export function addEndpoint(endpoint: HealthEndpoint): void {
  const endpoints = getEndpoints()
  endpoints.push(endpoint)
  saveEndpoints(endpoints)
}

export function updateEndpoint(id: string, updates: Partial<HealthEndpoint>): void {
  const endpoints = getEndpoints()
  const index = endpoints.findIndex((e) => e.id === id)
  if (index !== -1) {
    endpoints[index] = { ...endpoints[index], ...updates, updatedAt: Date.now() }
    saveEndpoints(endpoints)
  }
}

export function deleteEndpoint(id: string): void {
  const endpoints = getEndpoints()
  saveEndpoints(endpoints.filter((e) => e.id !== id))
}

// History Storage
export function getHistory(): CheckHistory[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
  return data ? JSON.parse(data) : []
}

export function saveHistory(history: CheckHistory[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

export function addHistoryEntry(entry: CheckHistory): void {
  const history = getHistory()
  history.push(entry)

  // Keep only last 1000 entries
  if (history.length > 1000) {
    history.splice(0, history.length - 1000)
  }

  saveHistory(history)
}

export function getEndpointHistory(endpointId: string, limit?: number): CheckHistory[] {
  const history = getHistory()
  const filtered = history.filter((h) => h.endpointId === endpointId)
  return limit ? filtered.slice(-limit) : filtered
}

export function clearOldHistory(days: number): void {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const history = getHistory()
  saveHistory(history.filter((h) => h.timestamp > cutoff))
}

// Settings Storage
export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return {
      autoRefreshInterval: 60,
      notificationsEnabled: true,
      soundEnabled: false,
      historyRetentionDays: 30,
      theme: "system",
    }
  }

  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return data
    ? JSON.parse(data)
    : {
        autoRefreshInterval: 60,
        notificationsEnabled: true,
        soundEnabled: false,
        historyRetentionDays: 30,
        theme: "system",
      }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}
