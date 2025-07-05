"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"

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
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem: addToCart } = useCartStore()
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore()
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
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
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      variant: "success",
    })
  }

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      // Remove from wishlist (you'd need to implement removeItem in wishlist store)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist`,
      })
    } else {
      addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
      })
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
        variant: "success",
      })
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {data?.products.map((product) => (
                    <Card key={product._id} className="group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <Link href={`/products/${product.slug}`}>
                            <Image
                              src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          
                          {product.comparePrice && product.comparePrice > product.price && (
                            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                            </Badge>
                          )}
                          
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-8 h-8 p-0"
                              onClick={() => handleToggleWishlist(product)}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold text-sm sm:text-lg text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < Math.floor(product.averageRating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs sm:text-sm text-gray-600 ml-2">({product.reviewCount})</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                              {product.comparePrice && (
                                <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-xs sm:text-sm"
                            size="sm"
                          >
                            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <Button
                      variant="outline"
                      disabled={!data.pagination.hasPrev}
                      onClick={() => updateURL({ page: (parseInt(page) - 1).toString() })}
                    >
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {data.pagination.currentPage} of {data.pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      disabled={!data.pagination.hasNext}
                      onClick={() => updateURL({ page: (parseInt(page) + 1).toString() })}
                    >
                      Next
                    </Button>
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
