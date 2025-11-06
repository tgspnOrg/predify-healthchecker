"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { AppSettings } from "@/lib/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onUpdate: (updates: Partial<AppSettings>) => void
}

export function SettingsDialog({ open, onOpenChange, settings, onUpdate }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure monitoring and notification preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="autoRefreshInterval">Auto-refresh Interval (seconds)</Label>
            <Input
              id="autoRefreshInterval"
              type="number"
              min="10"
              value={settings.autoRefreshInterval}
              onChange={(e) => onUpdate({ autoRefreshInterval: Number.parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">How often to check all endpoints</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">Show toast notifications for status changes</p>
            </div>
            <Switch
              id="notificationsEnabled"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => onUpdate({ notificationsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="soundEnabled">Enable Sound Alerts</Label>
              <p className="text-xs text-muted-foreground">Play sound when endpoint becomes unhealthy</p>
            </div>
            <Switch
              id="soundEnabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => onUpdate({ soundEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyRetentionDays">History Retention (days)</Label>
            <Input
              id="historyRetentionDays"
              type="number"
              min="1"
              max="365"
              value={settings.historyRetentionDays}
              onChange={(e) => onUpdate({ historyRetentionDays: Number.parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">How long to keep check history</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
