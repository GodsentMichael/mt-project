"use client"

import { useSession, signOut } from "next-auth/react"
import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

export function AdminHeader() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState({
    orders: 0,
    products: 0,
    customers: 0,
    newsletters: 0,
    reviews: 0,
  })

  useEffect(() => {
    // Fetch notifications count from API
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 lg:ml-64">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="search" placeholder="Search..." className="pl-10 pr-4 w-full" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {Object.values(notifications).reduce((a, b) => a + b, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {Object.values(notifications).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => (window.location.href = "/admin/orders")}>
                Orders ({notifications.orders})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (window.location.href = "/admin/products")}>
                Products ({notifications.products})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (window.location.href = "/admin/customers")}>
                Customers ({notifications.customers})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (window.location.href = "/admin/newsletters")}>
                Newsletters ({notifications.newsletters})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (window.location.href = "/admin/reviews")}>
                Reviews ({notifications.reviews})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
