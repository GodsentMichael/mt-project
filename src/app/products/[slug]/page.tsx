"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw, Plus, Minus, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/lib/store/cart-store"
import { useWishlistStore } from "@/lib/store/wishlist-store-new"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  categoryId: {
    _id: string
    name: string
    slug: string
  }
  stock: number
  featured: boolean
  status: string
  createdAt: string
}

interface SimilarProduct {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
}

export default function ProductDetailsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { toast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  
  const { addItem: addToCart } = useCartStore()
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore()

  useEffect(() => {
    fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch product')
      }
      
      const productData = await response.json()
      setProduct(productData)
      
      // Fetch similar products
      if (productData.categoryId) {
        const similarResponse = await fetch(`/api/products?category=${productData.categoryId.slug}&limit=4`)
        if (similarResponse.ok) {
          const similarData = await similarResponse.json()
          setSimilarProducts(similarData.products.filter((p: SimilarProduct) => p._id !== productData._id))
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
  }

  const calculateDiscount = () => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return 0
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
  }

  const handleAddToCart = () => {
    if (!product) return
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
      })
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      variant: "success",
    })
  }

  const handleToggleWishlist = () => {
    if (!product) return
    
    if (isInWishlist(product._id)) {
      toast({
        title: "Already in wishlist",
        description: `${product.name} is already in your wishlist`,
        variant: "warning",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-xl"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  const discount = calculateDiscount()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-brand-600 transition-colors">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.categoryId.slug}`} className="hover:text-brand-600 transition-colors">
              {product.categoryId.name}
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 -ml-4">
          <Link href="/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative">
              <div 
                className={`aspect-square relative overflow-hidden rounded-2xl bg-white shadow-lg cursor-zoom-in transition-transform duration-300 ${isZoomed ? 'scale-105' : ''}`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src={product.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
                      -{discount}%
                    </Badge>
                  </div>
                )}
                
                {/* Stock Status */}
                <div className="absolute top-4 right-4">
                  <Badge variant={product.stock > 0 ? "default" : "destructive"} className="px-3 py-1">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-brand-500 ring-offset-2' 
                        : 'hover:opacity-75'
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Category */}
            <div>
              <Link 
                href={`/products?category=${product.categoryId.slug}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                {product.categoryId.name}
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mt-2 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8/5 • 124 reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  You save {formatPrice((product.comparePrice || 0) - product.price)} ({discount}% off)
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">Quantity</label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-center min-w-[60px] font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 px-6 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className="px-4 py-3 rounded-xl border-gray-300 hover:border-brand-500 transition-all duration-200 hover:scale-105"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  className="px-4 py-3 rounded-xl border-gray-300 hover:border-brand-500 transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over ₦25,000</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">SSL Encrypted</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Similar Products</h2>
              <Link 
                href={`/products?category=${product.categoryId.slug}`}
                className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                View all in {product.categoryId.name}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Card key={similarProduct._id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <Link href={`/products/${similarProduct.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={similarProduct.images[0] || "/placeholder.svg"}
                          alt={similarProduct.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {similarProduct.comparePrice && similarProduct.comparePrice > similarProduct.price && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-red-500 text-white text-xs">
                              -{Math.round(((similarProduct.comparePrice - similarProduct.price) / similarProduct.comparePrice) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {similarProduct.name}
                        </h3>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(similarProduct.price)}
                          </span>
                          {similarProduct.comparePrice && similarProduct.comparePrice > similarProduct.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(similarProduct.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
