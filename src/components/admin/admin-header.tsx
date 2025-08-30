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
  type Notification = { 
    link: string; 
    message: string;
    createdAt: string;
    type: string;
  }
  const [notificationList, setNotificationList] = useState<Notification[]>([])

  useEffect(() => {
    // Fetch notifications list from API
    const fetchNotificationsList = async () => {
      try {
        const response = await fetch("/api/admin/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotificationList(data)
        }
      } catch (error) {
        console.error("Failed to fetch notifications list", error)
      }
    }

    fetchNotificationsList()

    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchNotificationsList, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 min-[1280px]:ml-64">
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
                {notificationList.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {notificationList.length > 99 ? "99+" : notificationList.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="text-center">
                Recent Notifications ({notificationList.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notificationList.length > 0 ? (
                  notificationList.slice(0, 10).map((notification, index) => (
                    <DropdownMenuItem key={index} className="p-3 hover:bg-gray-50">
                      <div className="flex flex-col w-full">
                        <a 
                          href={notification.link} 
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {notification.message}
                        </a>
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="p-3 text-center text-gray-500">
                    No new notifications
                  </DropdownMenuItem>
                )}
              </div>
              {notificationList.length > 10 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-3 text-center">
                    <a href="/admin/notifications" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View all notifications
                    </a>
                  </DropdownMenuItem>
                </>
              )}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
