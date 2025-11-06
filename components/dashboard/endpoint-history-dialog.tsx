"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Activity, Clock, AlertCircle, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react"
import type { HealthEndpoint, CheckHistory } from "@/lib/types"
import { getEndpointHistory } from "@/lib/storage"

interface EndpointHistoryDialogProps {
  endpoint: HealthEndpoint | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EndpointHistoryDialog({ endpoint, open, onOpenChange }: EndpointHistoryDialogProps) {
  const [history, setHistory] = useState<CheckHistory[]>([])

  useEffect(() => {
    if (endpoint && open) {
      const endpointHistory = getEndpointHistory(endpoint.id, 100) // Last 100 checks
      setHistory(endpointHistory)
    }
  }, [endpoint, open])

  if (!endpoint) return null

  const statusVariants = {
    Healthy: "default",
    Degraded: "secondary",
    Unhealthy: "destructive",
    Unknown: "outline",
  } as const

  const statusIcons = {
    Healthy: CheckCircle2,
    Degraded: AlertTriangle,
    Unhealthy: AlertCircle,
    Unknown: HelpCircle,
  }

  // Prepare chart data
  const chartData = history.slice(-50).map((entry) => ({
    timestamp: new Date(entry.timestamp).toLocaleTimeString(),
    latency: entry.latency,
    status: entry.status,
  }))

  // Calculate statistics
  const totalChecks = history.length
  const healthyCount = history.filter((h) => h.status === "Healthy").length
  const degradedCount = history.filter((h) => h.status === "Degraded").length
  const unhealthyCount = history.filter((h) => h.status === "Unhealthy").length
  const avgLatency =
    history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.latency, 0) / history.length) : 0
  const uptime = totalChecks > 0 ? ((healthyCount / totalChecks) * 100).toFixed(2) : "0.00"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health History: {endpoint.name}
          </DialogTitle>
          <DialogDescription>{endpoint.url}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Checks</CardDescription>
                  <CardTitle className="text-2xl">{totalChecks}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Uptime</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{uptime}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Latency</CardDescription>
                  <CardTitle className="text-2xl">{avgLatency}ms</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Failed Checks</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{unhealthyCount}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{healthyCount}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalChecks > 0 ? ((healthyCount / totalChecks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Degraded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{degradedCount}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalChecks > 0 ? ((degradedCount / totalChecks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{unhealthyCount}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalChecks > 0 ? ((unhealthyCount / totalChecks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latency Over Time</CardTitle>
                <CardDescription>Last 50 health checks</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="latency"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No history data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length > 0 ? (
                    history
                      .slice()
                      .reverse()
                      .map((entry, index) => {
                        const StatusIcon = statusIcons[entry.status]
                        return (
                          <TableRow key={index}>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {new Date(entry.timestamp).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariants[entry.status]} className="flex items-center gap-1 w-fit">
                                <StatusIcon className="h-3 w-3" />
                                {entry.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {entry.latency}ms
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                              {entry.error || "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No history logs available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
