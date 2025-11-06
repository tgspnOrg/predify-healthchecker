"use client"

import { useState, useEffect } from "react"
import type { AppSettings } from "@/lib/types"
import { getSettings, saveSettings as saveSettingsToStorage } from "@/lib/storage"

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings())

  useEffect(() => {
    const loadSettings = () => {
      setSettings(getSettings())
    }

    loadSettings()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "health_monitor_settings") {
        loadSettings()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates }
    saveSettingsToStorage(newSettings)
    setSettings(newSettings)
  }

  return {
    settings,
    updateSettings,
  }
}
