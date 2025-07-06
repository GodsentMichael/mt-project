"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useWishlistStore } from "@/lib/store/wishlist-store-new"
import { toast } from "sonner"

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

export function useWishlist() {
  const { data: session } = useSession()
  const { items, addItem, removeItem, clearWishlist } = useWishlistStore()
  const [serverWishlist, setServerWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch wishlist from server when user is authenticated
  useEffect(() => {
    if (session) {
      fetchWishlist()
    } else {
      setServerWishlist([])
      clearWishlist()
    }
  }, [session])

  // Listen for wishlist updates from other components
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (session) {
        fetchWishlist()
      }
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
  }, [session])

  const fetchWishlist = async () => {
    if (!session) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/wishlist')
      if (response.ok) {
        const data = await response.json()
        setServerWishlist(data)
        
        // Sync with local store
        clearWishlist()
        data.forEach((item: WishlistItem) => {
          addItem({
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.discountPrice || item.productId.price,
            image: item.productId.images[0] || "/placeholder.svg",
            slug: item.productId.slug
          })
        })
        
        // Force update local storage
        localStorage.setItem('mctaylor-wishlist-storage', JSON.stringify({
          state: {
            items: data.map((item: WishlistItem) => ({
              id: item.productId._id,
              name: item.productId.name,
              price: item.productId.discountPrice || item.productId.price,
              image: item.productId.images[0] || "/placeholder.svg",
              slug: item.productId.slug
            }))
          },
          version: 0
        }))
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToWishlist = async (product: {
    id: string
    name: string
    price: number
    image: string
    slug: string
  }) => {
    if (!session) {
      toast.error("Please login to add items to your wishlist")
      return false
    }

    try {
      setIsLoading(true)
      
      // Optimistically add to local store
      addItem(product)

      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product.id })
      })

      if (response.ok) {
        toast.success("Added to wishlist")
        
        // Update server wishlist state immediately
        const newItem = {
          _id: Math.random().toString(), // Temporary ID
          productId: {
            _id: product.id,
            name: product.name,
            images: [product.image],
            price: product.price,
            discountPrice: undefined,
            slug: product.slug
          },
          createdAt: new Date().toISOString()
        }
        setServerWishlist(prev => [...prev, newItem])
        
        // Also sync with local store
        addItem(product)
        
        // Refresh from server to get correct data
        await fetchWishlist()
        
        // Notify other components
        window.dispatchEvent(new Event('wishlistUpdated'))
        return true
      } else {
        const errorData = await response.json()
        if (errorData.error === "Product already in wishlist") {
          toast.error("Product is already in your wishlist")
        } else {
          toast.error("Failed to add to wishlist")
        }
        // Revert optimistic update
        removeItem(product.id)
        return false
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error("Failed to add to wishlist")
      // Revert optimistic update
      removeItem(product.id)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFromWishlist = async (productId: string) => {
    if (!session) {
      toast.error("Please login to modify your wishlist")
      return false
    }

    console.log('🗑️ Deleting from wishlist:', productId)
    
    try {
      setIsLoading(true)
      
      // Optimistically remove from both stores
      removeItem(productId)
      setServerWishlist(prev => {
        const updated = prev.filter(item => item.productId._id !== productId)
        console.log('Optimistically updated server wishlist:', updated)
        return updated
      })

      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method: 'DELETE'
      })

      console.log('Delete response status:', response.status)

      if (response.ok) {
        toast.success("Removed from wishlist")
        
        // Force clear from local storage
        const currentStore = JSON.parse(localStorage.getItem('mctaylor-wishlist-storage') || '{"state":{"items":[]},"version":0}')
        const updatedItems = currentStore.state.items.filter((item: any) => item.id !== productId)
        
        localStorage.setItem('mctaylor-wishlist-storage', JSON.stringify({
          state: {
            items: updatedItems
          },
          version: currentStore.version || 0
        }))
        
        console.log('Updated local storage, remaining items:', updatedItems)
        console.log('Dispatching wishlistUpdated event')
        
        // Notify other components
        window.dispatchEvent(new Event('wishlistUpdated'))
        
        // Refresh from server to ensure consistency
        await fetchWishlist()
        return true
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        toast.error("Failed to remove from wishlist")
        
        // Revert optimistic updates
        await fetchWishlist()
        return false
      }
    } catch (error) {
      console.error('Error deleting from wishlist:', error)
      toast.error("Failed to remove from wishlist")
      
      // Revert optimistic updates
      await fetchWishlist()
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    return await deleteFromWishlist(productId)
  }

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId)
  }

  const toggleWishlist = async (product: {
    id: string
    name: string
    price: number
    image: string
    slug: string
  }) => {
    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id)
    } else {
      return await addToWishlist(product)
    }
  }

  return {
    items,
    serverWishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    deleteFromWishlist,
    toggleWishlist,
    isInWishlist,
    refetch: fetchWishlist
  }
}
