"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Plus, Settings, RefreshCw } from "lucide-react"
import { useEndpoints } from "@/hooks/use-endpoints"
import { useSettings } from "@/hooks/use-settings"
import { useHealthMonitoring } from "@/hooks/use-health-monitoring"
import { EndpointFormDialog } from "@/components/endpoints/endpoint-form-dialog"
import { EndpointCard } from "@/components/dashboard/endpoint-card"
import { SettingsDialog } from "@/components/dashboard/settings-dialog"
import type { HealthEndpoint } from "@/lib/types"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { endpoints, loading, addEndpoint, updateEndpoint, deleteEndpoint } = useEndpoints()
  const { settings, updateSettings } = useSettings()
  const [showEndpointDialog, setShowEndpointDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<HealthEndpoint | undefined>()

  const { checkAllEndpoints } = useHealthMonitoring(endpoints, updateEndpoint, true, settings.autoRefreshInterval)

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  const healthyCount = endpoints.filter((e) => e.lastCheck?.status === "Healthy").length
  const unhealthyCount = endpoints.filter((e) => e.lastCheck?.status === "Unhealthy").length
  const degradedCount = endpoints.filter((e) => e.lastCheck?.status === "Degraded").length

  const handleSaveEndpoint = (endpoint: HealthEndpoint) => {
    if (editingEndpoint) {
      updateEndpoint(endpoint.id, endpoint)
    } else {
      addEndpoint(endpoint)
    }
    setEditingEndpoint(undefined)
  }

  const handleEditEndpoint = (endpoint: HealthEndpoint) => {
    setEditingEndpoint(endpoint)
    setShowEndpointDialog(true)
  }

  const handleDeleteEndpoint = (id: string) => {
    if (confirm("Are you sure you want to delete this endpoint?")) {
      deleteEndpoint(id)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Monitor Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your application health checks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => checkAllEndpoints()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditingEndpoint(undefined)
              setShowEndpointDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Endpoint
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">
              {endpoints.length === 0 ? "No endpoints configured" : "Active monitoring"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyCount}</div>
            <p className="text-xs text-muted-foreground">
              {healthyCount === endpoints.length && endpoints.length > 0
                ? "All systems operational"
                : "Operating normally"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degraded</CardTitle>
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{degradedCount}</div>
            <p className="text-xs text-muted-foreground">
              {degradedCount > 0 ? "Needs attention" : "No degraded services"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unhealthy</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unhealthyCount}</div>
            <p className="text-xs text-muted-foreground">
              {unhealthyCount > 0 ? "Requires immediate attention" : "No issues detected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {endpoints.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Add your first health check endpoint to start monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Welcome, {session?.user?.name || "User"}! You're logged in as{" "}
              <span className="font-medium">{(session?.user as any)?.role || "Viewer"}</span>.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowEndpointDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Endpoint
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {endpoints.map((endpoint) => (
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              onEdit={handleEditEndpoint}
              onDelete={handleDeleteEndpoint}
            />
          ))}
        </div>
      )}

      <EndpointFormDialog
        open={showEndpointDialog}
        onOpenChange={setShowEndpointDialog}
        onSave={handleSaveEndpoint}
        endpoint={editingEndpoint}
      />

      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        settings={settings}
        onUpdate={updateSettings}
      />
    </div>
  )
}
