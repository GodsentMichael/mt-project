"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Order {
  _id: string
  orderNumber: string
  userId: {
    _id: string
    name: string
    email: string
  } | null
  items: Array<{
    productId: {
      name: string
      price: number
      images: string[]
    } | null
    quantity: number
    price: number
  }>
  total: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus?: string
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  subtotal?: number
  tax?: number
  shipping?: number
  discount?: number
  notes?: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewModal, setViewModal] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null
  })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchOrders()
  }, [session, status, router, currentPage, searchTerm])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast.success("Order status updated successfully")
      fetchOrders()
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const handleDeleteOrder = async () => {
    if (!deleteModal.order) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/orders/${deleteModal.order._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      toast.success("Order deleted successfully")
      setOrders(orders.filter(o => o._id !== deleteModal.order!._id))
      setDeleteModal({ open: false, order: null })
    } catch (error) {
      toast.error("Failed to delete order")
    } finally {
      setDeleting(false)
    }
  }

  const openViewModal = (order: Order) => {
    setViewModal({ open: true, order })
  }

  const openDeleteModal = (order: Order) => {
    setDeleteModal({ open: true, order })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price)
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
        <main className="flex-1 p-6 min-[1280px]:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-2">Manage customer orders</p>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search orders by order number, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Order List</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-3 font-medium">Order</th>
                          <th className="text-left pb-3 font-medium">Customer</th>
                          <th className="text-left pb-3 font-medium">Total</th>
                          <th className="text-left pb-3 font-medium">Status</th>
                          <th className="text-left pb-3 font-medium">Date</th>
                          <th className="text-left pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className="border-b">
                            <td className="py-4">
                              <div className="font-medium">{order.orderNumber}</div>
                              <div className="text-sm text-gray-500">
                                {order.items.length} item(s)
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="font-medium">
                                {order.userId?.name || 'Deleted User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.userId?.email || 'No email available'}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="font-medium">
                                ₦{(order.total || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-4">
                              <div className="text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openViewModal(order)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteModal(order)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Order Modal */}
            {viewModal.order && (
              <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal({ open, order: viewModal.order })}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Order Number:</strong> {viewModal.order.orderNumber}
                        </div>
                        <div>
                          <strong>Status:</strong> 
                          <Badge 
                            className="ml-2" 
                            variant={
                              viewModal.order.status === 'DELIVERED' ? 'default' :
                              viewModal.order.status === 'CANCELLED' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {viewModal.order.status}
                          </Badge>
                        </div>
                        <div>
                          <strong>Customer Name:</strong> {viewModal.order.userId?.name || 'Deleted User'}
                        </div>
                        <div>
                          <strong>Customer Email:</strong> {viewModal.order.userId?.email || 'No email available'}
                        </div>
                        <div>
                          <strong>Total Amount:</strong> ₦{viewModal.order.total.toLocaleString()}
                        </div>
                        <div>
                          <strong>Order Date:</strong> {new Date(viewModal.order.createdAt).toLocaleDateString()}
                        </div>
                        {viewModal.order.trackingNumber && (
                          <div className="col-span-2">
                            <strong>Tracking Number:</strong> {viewModal.order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-6">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {viewModal.order.shippingAddress.firstName} {viewModal.order.shippingAddress.lastName}
                          </div>
                          {viewModal.order.shippingAddress.company && (
                            <div className="text-sm text-gray-600">{viewModal.order.shippingAddress.company}</div>
                          )}
                          <div className="text-sm">{viewModal.order.shippingAddress.address1}</div>
                          {viewModal.order.shippingAddress.address2 && (
                            <div className="text-sm">{viewModal.order.shippingAddress.address2}</div>
                          )}
                          <div className="text-sm">
                            {viewModal.order.shippingAddress.city}, {viewModal.order.shippingAddress.state} {viewModal.order.shippingAddress.postalCode}
                          </div>
                          <div className="text-sm">{viewModal.order.shippingAddress.country}</div>
                          {viewModal.order.shippingAddress.phone && (
                            <div className="text-sm font-medium">Phone: {viewModal.order.shippingAddress.phone}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Billing Address (if different) */}
                    {viewModal.order.billingAddress && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Billing Address</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {viewModal.order.billingAddress.firstName} {viewModal.order.billingAddress.lastName}
                            </div>
                            {viewModal.order.billingAddress.company && (
                              <div className="text-sm text-gray-600">{viewModal.order.billingAddress.company}</div>
                            )}
                            <div className="text-sm">{viewModal.order.billingAddress.address1}</div>
                            {viewModal.order.billingAddress.address2 && (
                              <div className="text-sm">{viewModal.order.billingAddress.address2}</div>
                            )}
                            <div className="text-sm">
                              {viewModal.order.billingAddress.city}, {viewModal.order.billingAddress.state} {viewModal.order.billingAddress.postalCode}
                            </div>
                            <div className="text-sm">{viewModal.order.billingAddress.country}</div>
                            {viewModal.order.billingAddress.phone && (
                              <div className="text-sm font-medium">Phone: {viewModal.order.billingAddress.phone}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {viewModal.order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-3 px-4 bg-white border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">
                                {item.productId?.name || 'Deleted Product'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Quantity: {item.quantity} × ₦{item.price.toLocaleString()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order Summary */}
                      <div className="mt-4 border-t pt-4 space-y-2">
                        {viewModal.order.subtotal && (
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>₦{viewModal.order.subtotal.toLocaleString()}</span>
                          </div>
                        )}
                        {viewModal.order.shipping && viewModal.order.shipping > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span>₦{viewModal.order.shipping.toLocaleString()}</span>
                          </div>
                        )}
                        {viewModal.order.tax && viewModal.order.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>VAT:</span>
                            <span>₦{viewModal.order.tax.toLocaleString()}</span>
                          </div>
                        )}
                        {viewModal.order.discount && viewModal.order.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-₦{viewModal.order.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>₦{viewModal.order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {viewModal.order.notes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Order Notes</h3>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{viewModal.order.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setViewModal({ open: false, order: null })}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Delete Order Confirmation Modal */}
            {deleteModal.order && (
              <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, order: deleteModal.order })}>
                <DialogContent className="max-w-sm p-6">
                  <DialogHeader>
                    <DialogTitle>Confirm Delete Order</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Are you sure you want to delete order{" "}
                    <strong>{deleteModal.order.orderNumber}</strong>? This action cannot be undone.
                  </DialogDescription>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteModal({ open: false, order: null })}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteOrder}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete Order"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
