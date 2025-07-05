"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  slug?: string
  size?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  getItemKey: (id: string, size?: string, color?: string) => string
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      getItemKey: (id: string, size?: string, color?: string) => 
        `${id}-${size || 'default'}-${color || 'default'}`,

      addItem: (newItem) => {
        const { items } = get()
        const itemKey = get().getItemKey(newItem.id, newItem.size, newItem.color)
        const existingItem = items.find(item => 
          get().getItemKey(item.id, item.size, item.color) === itemKey
        )

        let updatedItems: CartItem[]
        
        if (existingItem) {
          updatedItems = items.map(item =>
            get().getItemKey(item.id, item.size, item.color) === itemKey
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          )
        } else {
          updatedItems = [...items, { ...newItem, quantity: newItem.quantity || 1 }]
        }

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        set({
          items: updatedItems,
          totalItems,
          totalPrice,
        })
      },

      removeItem: (id, size, color) => {
        const { items } = get()
        const itemKey = get().getItemKey(id, size, color)
        const updatedItems = items.filter(item => 
          get().getItemKey(item.id, item.size, item.color) !== itemKey
        )

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        set({
          items: updatedItems,
          totalItems,
          totalPrice,
        })
      },

      updateQuantity: (id, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(id, size, color)
          return
        }

        const { items } = get()
        const itemKey = get().getItemKey(id, size, color)
        const updatedItems = items.map(item =>
          get().getItemKey(item.id, item.size, item.color) === itemKey
            ? { ...item, quantity }
            : item
        )

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        set({
          items: updatedItems,
          totalItems,
          totalPrice,
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        })
      },
    }),
    {
      name: 'mctaylor-cart-storage',
      version: 1,
    }
  )
)

// Legacy compatibility - keeping for existing components
export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

export function useCart() {
  const store = useCartStore()
  return {
    state: {
      items: store.items,
      total: store.totalPrice,
      itemCount: store.totalItems,
    },
    dispatch: () => {}, // Legacy compatibility
  }
}
