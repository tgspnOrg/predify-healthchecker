"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, ExternalLink, Pencil, Trash2, Activity } from "lucide-react"
import type { HealthEndpoint } from "@/lib/types"

interface EndpointCardProps {
  endpoint: HealthEndpoint
  onEdit: (endpoint: HealthEndpoint) => void
  onDelete: (id: string) => void
}

export function EndpointCard({ endpoint, onEdit, onDelete }: EndpointCardProps) {
  const status = endpoint.lastCheck?.status || "Unknown"
  const latency = endpoint.lastCheck?.latency

  const statusColors = {
    Healthy: "bg-green-500",
    Degraded: "bg-yellow-500",
    Unhealthy: "bg-red-500",
    Unknown: "bg-gray-500",
  }

  const statusVariants = {
    Healthy: "default",
    Degraded: "secondary",
    Unhealthy: "destructive",
    Unknown: "outline",
  } as const

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
            {endpoint.name}
          </CardTitle>
          <CardDescription className="text-xs">{endpoint.url}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(endpoint.url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(endpoint)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(endpoint.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariants[status]}>{status}</Badge>
            <Badge variant="outline">{endpoint.environment}</Badge>
            {endpoint.format === "OkText" && <Badge variant="outline">OkText</Badge>}
          </div>
          {latency !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              {latency}ms
            </div>
          )}
        </div>
        {endpoint.lastCheck?.error && <p className="text-xs text-destructive mt-2">{endpoint.lastCheck.error}</p>}
        {endpoint.description && <p className="text-xs text-muted-foreground mt-2">{endpoint.description}</p>}
      </CardContent>
    </Card>
  )
}
