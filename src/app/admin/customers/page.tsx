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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Mail, Calendar, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"

interface Customer {
  _id: string
  name: string
  email: string
  image?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  lastLogin?: string
  orderCount: number
  totalSpent: number
}

export default function AdminCustomersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchCustomers()
  }, [session, status, router, currentPage, searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/customers?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }

      const data = await response.json()
      setCustomers(data.customers)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteCustomer = async () => {
    if (!deleteModal.customer) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/customers/${deleteModal.customer._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }

      toast.success("Customer deleted successfully")
      setCustomers(customers.filter(c => c._id !== deleteModal.customer!._id))
      setDeleteModal({ open: false, customer: null })
    } catch (error) {
      toast.error("Failed to delete customer")
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (customer: Customer) => {
    setDeleteModal({ open: true, customer })
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-2">Manage customer accounts</p>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading customers...</div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No customers found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-3 font-medium">Customer</th>
                          <th className="text-left pb-3 font-medium">Role</th>
                          <th className="text-left pb-3 font-medium">Orders</th>
                          <th className="text-left pb-3 font-medium">Total Spent</th>
                          <th className="text-left pb-3 font-medium">Joined</th>
                          <th className="text-left pb-3 font-medium">Last Login</th>
                          <th className="text-left pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer._id} className="border-b">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={customer.image} />
                                  <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-gray-500">{customer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge 
                                variant={customer.role === 'ADMIN' ? 'default' : 'secondary'}
                              >
                                {customer.role}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="font-medium">{customer.orderCount || 0}</div>
                            </td>
                            <td className="py-4">
                              <div className="font-medium">₦{(customer.totalSpent || 0).toFixed(2)}</div>
                            </td>
                            <td className="py-4">
                              <div className="text-sm">
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="text-sm">
                                {customer.lastLogin 
                                  ? new Date(customer.lastLogin).toLocaleDateString()
                                  : 'Never'
                                }
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`mailto:${customer.email}`)}
                                >
                                  <Mail className="w-4 h-4 mr-1" />
                                  Email
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/customers/${customer._id}/edit`)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                {customer.role !== 'ADMIN' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteModal(customer)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
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
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete Customer Confirmation Dialog */}
            <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open, customer: null })}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Customer</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{deleteModal.customer?.name}</strong>? 
                    This action cannot be undone and will permanently remove their account and order history.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteModal({ open: false, customer: null })}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteCustomer}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Customer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
