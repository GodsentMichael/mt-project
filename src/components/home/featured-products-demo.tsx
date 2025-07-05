import Link from "next/link"
import Image from "next/image"
import { Star, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample product data for demonstration
const sampleProducts = [
  {
    _id: "1",
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-t-shirt",
    price: 2500,
    comparePrice: 3000,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.5,
    reviewCount: 128
  },
  {
    _id: "2", 
    name: "Designer Denim Jacket",
    slug: "designer-denim-jacket",
    price: 8500,
    comparePrice: 10000,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.8,
    reviewCount: 89
  },
  {
    _id: "3",
    name: "Casual Summer Dress",
    slug: "casual-summer-dress", 
    price: 4500,
    comparePrice: null,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.7,
    reviewCount: 156
  },
  {
    _id: "4",
    name: "Classic Sneakers",
    slug: "classic-sneakers",
    price: 6500,
    comparePrice: 8000,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.6,
    reviewCount: 203
  },
  {
    _id: "5",
    name: "Elegant Handbag",
    slug: "elegant-handbag",
    price: 12500,
    comparePrice: null,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.9,
    reviewCount: 67
  },
  {
    _id: "6",
    name: "Sports Polo Shirt",
    slug: "sports-polo-shirt",
    price: 3500,
    comparePrice: 4200,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.4,
    reviewCount: 94
  },
  {
    _id: "7",
    name: "Vintage Leather Boots",
    slug: "vintage-leather-boots",
    price: 15000,
    comparePrice: null,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.8,
    reviewCount: 112
  },
  {
    _id: "8",
    name: "Silk Scarf",
    slug: "silk-scarf",
    price: 2800,
    comparePrice: 3500,
    images: ["/placeholder.svg?height=300&width=300"],
    averageRating: 4.6,
    reviewCount: 76
  }
]

export function FeaturedProducts() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price)
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sampleProducts.map((product) => (
            <Card
              key={product._id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.comparePrice && product.comparePrice > product.price && (
                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </Badge>
                  )}
                  
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.averageRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button asChild className="flex-1 bg-brand-600 hover:bg-brand-700">
                      <Link href={`/products/${product.slug}`}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
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
