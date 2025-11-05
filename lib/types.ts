export type HealthCheckFormat = "HealthJson" | "OkText"
export type HealthStatus = "Healthy" | "Degraded" | "Unhealthy" | "Unknown"
export type Environment = "Production" | "Staging" | "Development" | "QA"

export interface HealthDependency {
  name: string
  status: HealthStatus
  description?: string
}

export interface HealthCheckResult {
  status: HealthStatus
  latency: number
  timestamp: number
  dependencies?: HealthDependency[]
  error?: string
}

export interface HealthEndpoint {
  id: string
  name: string
  url: string
  format: HealthCheckFormat
  environment: Environment
  group?: string
  description?: string
  checkInterval: number
  timeout: number
  headers?: Record<string, string>
  publicVisible: boolean
  webhookUrl?: string
  createdAt: number
  updatedAt: number
  lastCheck?: HealthCheckResult
}

export interface CheckHistory {
  endpointId: string
  timestamp: number
  status: HealthStatus
  latency: number
  error?: string
}

export interface AppSettings {
  autoRefreshInterval: number
  notificationsEnabled: boolean
  soundEnabled: boolean
  historyRetentionDays: number
  theme: "light" | "dark" | "system"
}
