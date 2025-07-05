"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PopulatedOrder = {
  _id: string
  orderNumber: string
  userId?: { name?: string; email?: string }
  status: string
  total: number
}

async function fetchRecentOrders(): Promise<PopulatedOrder[]> {
  const response = await fetch('/api/admin/orders?limit=5')
  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  const data = await response.json()
  return data.orders || []
}

export function RecentOrders() {
  const [orders, setOrders] = useState<PopulatedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentOrders()
      .then((data) => {
        setOrders(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((err) => {
        console.error("Error fetching recent orders:", err)
        setError("Failed to load recent orders")
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div>Loading recent orders...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(orders) && orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.userId?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{order.status}</Badge>
                <span className="font-medium">₦{order.total.toFixed(2)}</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/orders/${order._id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
          {(!Array.isArray(orders) || orders.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
