"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cart-store"
import { useWishlist } from "@/hooks/use-wishlist"
import { toast } from "sonner"

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  averageRating: number
  reviewCount: number
  featured: boolean
  categoryId?: {
    _id: string
    name: string
    slug: string
  }
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem: addToCart } = useCartStore()
  const { toggleWishlist, isInWishlist, isLoading: wishlistLoading, serverWishlist } = useWishlist()

  useEffect(() => {
    fetchFeaturedProducts()
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      // Force re-render to update heart states
      setProducts(prev => [...prev])
    }
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=8')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      slug: product.slug
    })
    toast.success("Added to cart")
  }

  const handleWishlistToggle = async (product: Product) => {
    await toggleWishlist({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      slug: product.slug
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium products that our customers love most
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-1.5 sm:p-2 md:p-3 space-y-1.5 sm:space-y-2 flex-1">
                    <div className="h-2 sm:h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-1.5 sm:h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 sm:h-3 md:h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 sm:h-6 md:h-8 bg-gray-200 rounded mt-auto"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products that our customers love most
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {products.map((product) => (
            <Card
              key={product._id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full flex flex-col"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="aspect-square relative">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 hover:bg-red-600 text-[10px] sm:text-xs px-1 py-0.5 sm:px-1.5 sm:py-0.5">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </Badge>
                    )}
                    
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 p-0 bg-white/80 hover:bg-white"
                        disabled={wishlistLoading}
                        onClick={(e) => {
                          e.preventDefault()
                          handleWishlistToggle(product)
                        }}
                      >
                        <Heart 
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${
                            serverWishlist.some(item => item.productId._id === product._id)
                              ? "fill-red-500 text-red-500" 
                              : "text-gray-600"
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>
                </Link>
                
                <div className="p-1.5 sm:p-2 md:p-3 flex flex-col flex-1">
                  {product.categoryId && (
                    <div className="mb-1 sm:mb-1.5">
                      <Badge variant="outline" className="text-[9px] sm:text-xs px-1 py-0.5">
                        {product.categoryId.name}
                      </Badge>
                    </div>
                  )}
                  
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm text-gray-900 mb-1 sm:mb-1.5 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight min-h-[1.75rem] sm:min-h-[2rem] md:min-h-[2.25rem]">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center mb-1.5 sm:mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${
                            i < Math.floor(product.averageRating || 4.5)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] sm:text-xs text-gray-600 ml-1">({product.reviewCount || 0})</span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 truncate">{formatPrice(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-[10px] sm:text-xs text-gray-500 line-through truncate">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-brand-600 hover:bg-brand-700 text-[10px] sm:text-xs px-1 py-1 sm:px-2 sm:py-1.5"
                      onClick={(e) => {
                        e.preventDefault()
                        handleAddToCart(product)
                      }}
                    >
                      <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {products.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            <p>No featured products available at the moment.</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/products">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
