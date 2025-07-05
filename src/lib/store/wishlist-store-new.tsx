"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
}

interface WishlistStore {
  items: WishlistItem[]
  
  // Actions
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get()
        const existingItem = items.find(item => item.id === newItem.id)
        
        if (!existingItem) {
          set({
            items: [...items, newItem]
          })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        set({
          items: items.filter(item => item.id !== id)
        })
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      isInWishlist: (id) => {
        const { items } = get()
        return items.some(item => item.id === id)
      },
    }),
    {
      name: 'mctaylor-wishlist-storage',
      version: 1,
    }
  )
)

// Legacy compatibility - keeping for existing components
export interface WishlistState {
  items: WishlistItem[]
}

export function useWishlist() {
  const store = useWishlistStore()
  return {
    state: {
      items: store.items,
    },
    dispatch: () => {}, // Legacy compatibility
  }
}
