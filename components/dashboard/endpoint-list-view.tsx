"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, ExternalLink, Pencil, Trash2, Activity, AlertTriangle, History } from "lucide-react"
import type { HealthEndpoint } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EndpointListViewProps {
  endpoints: HealthEndpoint[]
  onEdit: (endpoint: HealthEndpoint) => void
  onDelete: (id: string) => void
  onViewHistory: (endpoint: HealthEndpoint) => void
}

export function EndpointListView({ endpoints, onEdit, onDelete, onViewHistory }: EndpointListViewProps) {
  const statusVariants = {
    Healthy: "default",
    Degraded: "secondary",
    Unhealthy: "destructive",
    Unknown: "outline",
  } as const

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Latency</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints.map((endpoint) => {
            const status = endpoint.lastCheck?.status || "Unknown"
            const isUnhealthy = status === "Unhealthy"
            const isDegraded = status === "Degraded"

            return (
              <TableRow
                key={endpoint.id}
                className={cn(
                  "transition-colors",
                  isUnhealthy && "bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500",
                  isDegraded && "bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-500",
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[status]}>{status}</Badge>
                    {isUnhealthy && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{endpoint.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{endpoint.url}</TableCell>
                <TableCell>
                  <Badge variant="outline">{endpoint.environment}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {endpoint.format}
                  </Badge>
                </TableCell>
                <TableCell>
                  {endpoint.lastCheck?.latency !== undefined ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Activity className="h-3 w-3" />
                      {endpoint.lastCheck.latency}ms
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewHistory(endpoint)}>
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </DropdownMenuItem>
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
