"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Mail, Download, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NewsletterSubscriber {
  _id: string
  email: string
  status: 'ACTIVE' | 'UNSUBSCRIBED'
  createdAt: string
  unsubscribedAt?: string
}

export default function AdminNewsletterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; subscriber: NewsletterSubscriber | null }>({
    open: false,
    subscriber: null
  })
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchSubscribers()
    fetchStats()
  }, [session, status, router, currentPage, searchTerm, statusFilter])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/newsletter?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers')
      }

      const data = await response.json()
      setSubscribers(data.subscribers)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      toast.error("Failed to load newsletter subscribers")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch newsletter stats:', error)
    }
  }

  const updateSubscriberStatus = async (subscriberId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/newsletter/${subscriberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscriber status')
      }

      toast.success("Subscriber status updated successfully")

      fetchSubscribers()
      fetchStats()
    } catch (error) {
      toast.error("Failed to update subscriber status")
    }
  }

  const handleDeleteSubscriber = async () => {
    if (!deleteModal.subscriber) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/newsletter/${deleteModal.subscriber._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete subscriber')
      }

      toast.success("Subscriber deleted successfully")
      setSubscribers(subscribers.filter(s => s._id !== deleteModal.subscriber!._id))
      setDeleteModal({ open: false, subscriber: null })
      fetchStats()
    } catch (error) {
      toast.error("Failed to delete subscriber")
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (subscriber: NewsletterSubscriber) => {
    setDeleteModal({ open: true, subscriber })
  }

  const exportSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/export')
      if (!response.ok) {
        throw new Error('Failed to export subscribers')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Subscribers exported successfully")
    } catch (error) {
      toast.error("Failed to export subscribers")
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
              <p className="text-gray-600 mt-2">Manage newsletter subscribers</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Mail className="w-8 h-8 text-brand-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.unsubscribed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search subscribers by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="all">All Subscribers</option>
                      <option value="ACTIVE">Active</option>
                      <option value="UNSUBSCRIBED">Unsubscribed</option>
                    </select>
                  </div>
                  <Button onClick={exportSubscribers}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscribers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriber List</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading subscribers...</div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No subscribers found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-3 font-medium">Email</th>
                          <th className="text-left pb-3 font-medium">Status</th>
                          <th className="text-left pb-3 font-medium">Subscribed</th>
                          <th className="text-left pb-3 font-medium">Unsubscribed</th>
                          <th className="text-left pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber._id} className="border-b">
                            <td className="py-4">
                              <div className="font-medium">{subscriber.email}</div>
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  subscriber.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {subscriber.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="text-sm">
                                {new Date(subscriber.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="text-sm">
                                {subscriber.unsubscribedAt
                                  ? new Date(subscriber.unsubscribedAt).toLocaleDateString()
                                  : '-'
                                }
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                {subscriber.status === 'ACTIVE' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSubscriberStatus(subscriber._id, 'UNSUBSCRIBED')}
                                  >
                                    Unsubscribe
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSubscriberStatus(subscriber._id, 'ACTIVE')}
                                  >
                                    Resubscribe
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteModal(subscriber)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
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

            {/* Delete Subscriber Confirmation Dialog */}
            <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open, subscriber: null })}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Subscriber</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the subscriber <strong>{deleteModal.subscriber?.email}</strong>? 
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteModal({ open: false, subscriber: null })}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSubscriber}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Subscriber"}
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
