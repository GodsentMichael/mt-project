"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Settings {
  storeName: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  taxRate: number
  shippingRate: number
  freeShippingThreshold: number
  allowRegistration: boolean
  maintenanceMode: boolean
  requireEmailVerification: boolean
}

interface SettingsContextType {
  settings: Settings
  loading: boolean
  refreshSettings: () => Promise<void>
}

const defaultSettings: Settings = {
  storeName: "McTaylor Shop",
  storeDescription: "Your fashion destination for the latest trends",
  storeEmail: "contact@mctaylor.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Fashion St, Style City, SC 12345",
  currency: "NGN",
  taxRate: 0,
  shippingRate: 1500,
  freeShippingThreshold: 25000,
  allowRegistration: true,
  maintenanceMode: false,
  requireEmailVerification: false,
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
})

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
