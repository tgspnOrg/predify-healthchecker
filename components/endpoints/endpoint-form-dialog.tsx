"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { HealthEndpoint, HealthCheckFormat, Environment } from "@/lib/types"

interface EndpointFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (endpoint: HealthEndpoint) => void
  endpoint?: HealthEndpoint
}

export function EndpointFormDialog({ open, onOpenChange, onSave, endpoint }: EndpointFormDialogProps) {
  const [formData, setFormData] = useState<Partial<HealthEndpoint>>({
    name: "",
    url: "",
    format: "HealthJson",
    environment: "Production",
    checkInterval: 60,
    timeout: 10000,
    publicVisible: false,
    headers: {},
  })

  const [headerKey, setHeaderKey] = useState("")
  const [headerValue, setHeaderValue] = useState("")

  useEffect(() => {
    if (open) {
      if (endpoint) {
        setFormData({
          name: endpoint.name,
          url: endpoint.url,
          format: endpoint.format,
          environment: endpoint.environment,
          group: endpoint.group,
          description: endpoint.description,
          checkInterval: endpoint.checkInterval,
          timeout: endpoint.timeout,
          headers: endpoint.headers || {},
          publicVisible: endpoint.publicVisible,
          webhookUrl: endpoint.webhookUrl,
        })
      } else {
        setFormData({
          name: "",
          url: "",
          format: "HealthJson",
          environment: "Production",
          checkInterval: 60,
          timeout: 10000,
          publicVisible: false,
          headers: {},
        })
      }
    }
  }, [endpoint, open])

  const handleSave = () => {
    if (!formData.name || !formData.url) return

    const newEndpoint: HealthEndpoint = {
      id: endpoint?.id || crypto.randomUUID(),
      name: formData.name,
      url: formData.url,
      format: formData.format as HealthCheckFormat,
      environment: formData.environment as Environment,
      group: formData.group,
      description: formData.description,
      checkInterval: formData.checkInterval || 60,
      timeout: formData.timeout || 10000,
      headers: formData.headers || {},
      publicVisible: formData.publicVisible || false,
      webhookUrl: formData.webhookUrl,
      createdAt: endpoint?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    onSave(newEndpoint)
    onOpenChange(false)
  }

  const addHeader = () => {
    if (headerKey && headerValue) {
      setFormData({
        ...formData,
        headers: {
          ...formData.headers,
          [headerKey]: headerValue,
        },
      })
      setHeaderKey("")
      setHeaderValue("")
    }
  }

  const removeHeader = (key: string) => {
    const newHeaders = { ...formData.headers }
    delete newHeaders[key]
    setFormData({ ...formData, headers: newHeaders })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{endpoint ? "Edit Endpoint" : "Add New Endpoint"}</DialogTitle>
          <DialogDescription>Configure your health check endpoint settings</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My API"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://api.example.com/health"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value as HealthCheckFormat })}
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HealthJson">HealthJson</SelectItem>
                    <SelectItem value="OkText">OkText</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) => setFormData({ ...formData, environment: value as Environment })}
                >
                  <SelectTrigger id="environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Staging">Staging</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group (optional)</Label>
              <Input
                id="group"
                placeholder="Backend Services"
                value={formData.group || ""}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Main API health check"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInterval">Check Interval (seconds)</Label>
                <Input
                  id="checkInterval"
                  type="number"
                  min="10"
                  value={formData.checkInterval}
                  onChange={(e) => setFormData({ ...formData, checkInterval: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1000"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.slack.com/..."
                value={formData.webhookUrl || ""}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Receive notifications when status changes</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publicVisible">Public Visibility</Label>
                <p className="text-xs text-muted-foreground">Show on public status page</p>
              </div>
              <Switch
                id="publicVisible"
                checked={formData.publicVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, publicVisible: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="headers" className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Headers</Label>
              <div className="flex gap-2">
                <Input placeholder="Header name" value={headerKey} onChange={(e) => setHeaderKey(e.target.value)} />
                <Input
                  placeholder="Header value"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                />
                <Button type="button" onClick={addHeader}>
                  Add
                </Button>
              </div>
            </div>

            {formData.headers && Object.keys(formData.headers).length > 0 && (
              <div className="space-y-2">
                <Label>Current Headers</Label>
                <div className="space-y-2">
                  {Object.entries(formData.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeHeader(key)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.url}>
            {endpoint ? "Save Changes" : "Add Endpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
