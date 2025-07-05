import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample category data
const sampleCategories = [
  {
    _id: "1",
    name: "Women's Fashion",
    slug: "womens-fashion",
    image: "/placeholder.svg?height=200&width=300",
    description: "Latest trends in women's clothing"
  },
  {
    _id: "2", 
    name: "Men's Fashion",
    slug: "mens-fashion",
    image: "/placeholder.svg?height=200&width=300",
    description: "Stylish men's apparel and accessories"
  },
  {
    _id: "3",
    name: "Shoes & Footwear",
    slug: "shoes-footwear",
    image: "/placeholder.svg?height=200&width=300",
    description: "Comfortable and fashionable footwear"
  },
  {
    _id: "4",
    name: "Accessories",
    slug: "accessories", 
    image: "/placeholder.svg?height=200&width=300",
    description: "Complete your look with perfect accessories"
  },
  {
    _id: "5",
    name: "Sports & Active",
    slug: "sports-active",
    image: "/placeholder.svg?height=200&width=300",
    description: "Athletic wear and sports equipment"
  },
  {
    _id: "6",
    name: "Bags & Luggage",
    slug: "bags-luggage",
    image: "/placeholder.svg?height=200&width=300",
    description: "Stylish bags for every occasion"
  }
]

export function CategoryGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated collections designed to meet your style needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sampleCategories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg?height=200&width=300"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-heading font-bold mb-2">{category.name}</h3>
                <p className="text-sm text-white/90 mb-4">{category.description}</p>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="self-start bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/products">
              View All Categories
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
