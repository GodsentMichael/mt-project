"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useWishlistStore } from "@/lib/store/wishlist-store-new"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShoppingCart, Heart } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()
  const { toast } = useToast()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
  }

  const moveToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
    })
    removeItem(item.id)
    toast({
      title: "Moved to cart",
      description: `${item.name} has been added to your cart`,
      variant: "success",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding items you love to your wishlist</p>
            <Button asChild className="bg-brand-500 hover:bg-brand-600">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} in your wishlist</p>
              <Button
                variant="outline"
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link href={`/products/${item.slug}`}>
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          <Image
                            src={item.image || "/placeholder.svg?height=300&width=300"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-white/80"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="p-4">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-brand-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <p className="text-xl font-bold text-gray-900 mb-4">
                        {formatPrice(item.price)}
                      </p>

                      <div className="space-y-2">
                        <Button
                          className="w-full bg-brand-500 hover:bg-brand-600"
                          onClick={() => moveToCart(item)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Move to Cart
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/products/${item.slug}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
