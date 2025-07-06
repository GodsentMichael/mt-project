"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User, Package, Heart, Settings, MapPin, CreditCard, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useWishlist } from "@/hooks/use-wishlist"
import Image from "next/image"
import Link from "next/link"

interface Order {
  _id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    productId: {
      name: string
      images: string[]
    }
    quantity: number
    price: number
  }>
}

interface WishlistItem {
  _id: string
  productId: {
    _id: string
    name: string
    images: string[]
    price: number
    discountPrice?: number
    slug: string
  }
  createdAt: string
}

export default function MyAccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { serverWishlist, deleteFromWishlist, isLoading: wishlistLoading } = useWishlist()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin?callbackUrl=/account")
      return
    }

    // Fetch user orders
    Promise.all([
      fetch('/api/user/orders').then(res => res.ok ? res.json() : [])
    ]).then(([ordersData]) => {
      setOrders(ordersData)
    }).catch(console.error).finally(() => setLoading(false))
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  if (!session) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "PROCESSING": return "bg-blue-100 text-blue-800"
      case "SHIPPED": return "bg-purple-100 text-purple-800"
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback>
                {session.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serverWishlist.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₦{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg mb-4 last:mb-0">
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{order.total.toFixed(2)}</p>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{order.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <img 
                              src={item.productId.images[0] || '/placeholder.svg'} 
                              alt={item.productId.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-sm">{item.productId.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} × ₦{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found</p>
                      <Button className="mt-4" onClick={() => router.push('/products')}>
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                        <div className="w-full h-48 bg-gray-200"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serverWishlist.map((item: WishlistItem) => (
                      <div key={item._id} className="border rounded-lg overflow-hidden group">
                        <Link href={`/products/${item.productId.slug}`}>
                          <div className="relative">
                            <Image 
                              src={item.productId.images[0] || '/placeholder.svg'} 
                              alt={item.productId.name}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <div className="p-4">
                          <Link href={`/products/${item.productId.slug}`}>
                            <h3 className="font-medium mb-2 hover:text-brand-600 transition-colors line-clamp-2">
                              {item.productId.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <div>
                              {item.productId.discountPrice ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-brand-600">
                                    ₦{item.productId.discountPrice.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    ₦{item.productId.price.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold">₦{item.productId.price.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteFromWishlist(item.productId._id)}
                                disabled={wishlistLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                asChild
                              >
                                <Link href={`/products/${item.productId.slug}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {serverWishlist.length === 0 && !wishlistLoading && (
                      <div className="col-span-full text-center py-8">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Your wishlist is empty</p>
                        <Button className="mt-4" asChild>
                          <Link href="/products">
                            Discover Products
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{session.user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{session.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-gray-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Type</label>
                    <p className="mt-1 text-gray-900">{session.user?.role || 'Customer'}</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  )
}
