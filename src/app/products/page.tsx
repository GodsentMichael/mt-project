"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star, Heart, ShoppingCart, Search, Filter, Loader2 } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useWishlistStore } from "@/lib/store/wishlist-store-new"
import { toast } from "sonner"
import { SimplePagination } from "@/components/ui/pagination"

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  averageRating: number
  reviewCount: number
  categoryId: {
    name: string
    slug: string
  }
}

interface Category {
  _id: string
  name: string
  slug: string
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  categories: Category[]
  filters: {
    category: string
    search: string
    minPrice: string
    maxPrice: string
    sortBy: string
    sortOrder: string
  }
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  )
}

function ProductsPageContent() {
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem: addToCart } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const category = searchParams.get('category') || 'all'
  const page = searchParams.get('page') || '1'
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (searchTerm) params.set('search', searchTerm)
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
      if (priceRange[1] < 50000) params.set('maxPrice', priceRange[1].toString())
      params.set('page', page)
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const response = await fetch(`/api/products?${params.toString()}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [category, page, sortBy, sortOrder])

  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset page when filters change
    if (Object.keys(newParams).some(key => key !== 'page')) {
      params.set('page', '1')
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryChange = (newCategory: string) => {
    updateURL({ category: newCategory })
  }

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-')
    updateURL({ sortBy: newSortBy, sortOrder: newSortOrder })
  }

  const handleSearch = () => {
    updateURL({ search: searchTerm })
    fetchProducts()
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
    })
    toast.success(`${product.name} has been added to your cart`)
  }

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
      toast.success(`${product.name} has been removed from your wishlist`)
    } else {
      addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
      })
      toast.success(`${product.name} has been added to your wishlist`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            {category === 'all' ? 'All Products' : 
             data?.categories.find(c => c.slug === category)?.name || 'Products'}
          </h1>
          <p className="text-gray-600">
            {data?.pagination.totalCount || 0} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    category === 'all' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
                {data?.categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      category === cat.slug ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <Button 
                  onClick={fetchProducts}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Apply Price Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} className="bg-brand-500 hover:bg-brand-600">
                    Search
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                  {data?.products.map((product) => (
                    <Card key={product._id} className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <Link href={`/products/${product.slug}`}>
                            <div className="aspect-square relative">
                              <Image
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              />
                            </div>
                          </Link>
                          
                          {product.comparePrice && product.comparePrice > product.price && (
                            <Badge className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 md:top-3 md:left-3 bg-red-500 hover:bg-red-600 text-[10px] sm:text-xs px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1">
                              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                            </Badge>
                          )}
                          
                          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 p-0 bg-white/80 hover:bg-white"
                              onClick={() => handleToggleWishlist(product)}
                            >
                              <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-1.5 sm:p-2 md:p-3 lg:p-4 flex flex-col flex-1">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-900 mb-1 sm:mb-1.5 md:mb-2 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight min-h-[1.75rem] sm:min-h-[2rem] md:min-h-[2.25rem]">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center mb-1.5 sm:mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${
                                  i < Math.floor(product.averageRating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-[9px] sm:text-xs text-gray-600 ml-1">({product.reviewCount || 0})</span>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex flex-col gap-0.5 mb-2 sm:mb-3">
                              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 truncate">{formatPrice(product.price)}</span>
                              {product.comparePrice && (
                                <span className="text-[10px] sm:text-xs text-gray-500 line-through truncate">{formatPrice(product.comparePrice)}</span>
                              )}
                            </div>
                            
                            <Button 
                              onClick={() => handleAddToCart(product)}
                              className="w-full bg-brand-500 hover:bg-brand-600 text-[10px] sm:text-xs md:text-sm py-1 sm:py-1.5 md:py-2"
                              size="sm"
                            >
                              <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1" />
                              <span className="hidden sm:inline">Add to Cart</span>
                              <span className="sm:hidden">Add</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <SimplePagination
                      currentPage={data.pagination.currentPage}
                      totalPages={data.pagination.totalPages}
                      onPageChange={(page) => updateURL({ page: page.toString() })}
                    />
                  </div>
                )}

                {data?.products.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('')
                        setPriceRange([0, 50000])
                        updateURL({ category: 'all', search: '', minPrice: '', maxPrice: '' })
                      }}
                      variant="outline"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
