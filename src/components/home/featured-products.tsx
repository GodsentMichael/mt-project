import Link from "next/link"
import Image from "next/image"
import { Star, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import connectDB from "@/lib/db"
import Product from "@/lib/models/Product"

async function getFeaturedProducts() {
  await connectDB()

  return Product.find({ featured: true, status: "ACTIVE" })
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean()
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products that our customers love most
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={(product._id as string).toString()}
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
                    <Button size="sm" variant="secondary" className="w-8 h-8 p-0 rounded-full">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.categoryId?.name}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/products/${product.slug}`} className="hover:text-brand-600 transition-colors">
                      {product.name}
                    </Link>
                  </h3>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.averageRating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({product.reviewCount || 0})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">${product.comparePrice.toFixed(2)}</span>
                      )}
                    </div>
                    <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
