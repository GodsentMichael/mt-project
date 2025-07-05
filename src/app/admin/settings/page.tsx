"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Settings, Mail, Store, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState<Settings>({
    storeName: "",
    storeDescription: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "NGN",
    taxRate: 0,
    shippingRate: 0,
    freeShippingThreshold: 100,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings({ ...settings, ...data })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your store configuration</p>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading settings...</div>
            ) : (
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">
                    <Store className="w-4 h-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="shipping">
                    <Mail className="w-4 h-4 mr-2" />
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>Store Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Store Name</label>
                        <Input
                          value={settings.storeName}
                          onChange={(e) => handleInputChange('storeName', e.target.value)}
                          placeholder="McTaylor Shop"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Store Description</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          rows={3}
                          value={settings.storeDescription}
                          onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                          placeholder="Your fashion destination..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Store Email</label>
                          <Input
                            type="email"
                            value={settings.storeEmail}
                            onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                            placeholder="contact@mctaylor.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Store Phone</label>
                          <Input
                            value={settings.storePhone}
                            onChange={(e) => handleInputChange('storePhone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Store Address</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          rows={2}
                          value={settings.storeAddress}
                          onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                          placeholder="123 Fashion St, Style City, SC 12345"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Currency</label>
                        <select
                          value={settings.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="NGN">NGN - Naira</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shipping">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping & Tax Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Tax Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings.taxRate}
                          onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                          placeholder="8.25"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Default Shipping Rate (₦)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings.shippingRate}
                          onChange={(e) => handleInputChange('shippingRate', parseFloat(e.target.value) || 0)}
                          placeholder="9.99"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Free Shipping Threshold (₦)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settings.freeShippingThreshold}
                          onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                          placeholder="100.00"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Orders above this amount qualify for free shipping
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allowRegistration"
                          checked={settings.allowRegistration}
                          onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor="allowRegistration" className="text-sm font-medium">
                          Allow new user registration
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="requireEmailVerification"
                          checked={settings.requireEmailVerification}
                          onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor="requireEmailVerification" className="text-sm font-medium">
                          Require email verification for new accounts
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor="maintenanceMode" className="text-sm font-medium">
                          Enable maintenance mode
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">
                        When enabled, the store will be temporarily unavailable to customers
                      </p>

                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          These actions cannot be undone. Please be careful.
                        </p>
                        <Button variant="destructive" disabled>
                          Reset All Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
