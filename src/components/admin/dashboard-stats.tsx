"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

interface Stats {
  revenue: number
  orders: number
  products: number
  users: number
}

async function fetchStats(): Promise<Stats> {
  const response = await fetch('/api/admin/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, products: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
      .then((data) => {
        setStats(data || { revenue: 0, orders: 0, products: 0, users: 0 })
        setError(null)
      })
      .catch((err) => {
        console.error("Error fetching stats:", err)
        setError("Failed to load statistics")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-red-500 text-center">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₦${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: stats.orders.toLocaleString(),
      icon: ShoppingCart,
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      title: "Products",
      value: stats.products.toLocaleString(),
      icon: Package,
      change: "+2.1%",
      changeType: "positive" as const,
    },
    {
      title: "Customers",
      value: stats.users.toLocaleString(),
      icon: Users,
      change: "+15.3%",
      changeType: "positive" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
