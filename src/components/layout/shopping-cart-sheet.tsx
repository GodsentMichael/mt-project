"use client"

import { ShoppingCart, Plus, Minus, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cart-store"

export function ShoppingCartSheet() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative p-2 hover:bg-muted rounded-full transition-colors">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 text-[10px] sm:text-xs bg-brand-500 hover:bg-brand-600 min-w-[16px] sm:min-w-[20px]">
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({totalItems} items)</SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout when ready.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">Add some items to get started!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto py-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size || 'default'}-${item.color || 'default'}`} className="flex items-center space-x-4 border-b pb-4">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span> • </span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-sm">{formatPrice(item.price)}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id, item.size, item.color)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
