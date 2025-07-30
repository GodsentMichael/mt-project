"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Tag, Star, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  _id: string
  name: string
  slug: string
  image?: string
  description?: string
}

// Icon mapping for categories without images
const categoryIcons = {
  "women's fashion": Star,
  "men's fashion": TrendingUp,
  "wedding & corsets": Users,
  "accessories": Tag,
  "shoes": Tag,
  "bags": Tag,
  "jewelry": Star,
  "beauty": Star,
} as const

// Color mapping for categories
const categoryColors = [
  "from-pink-500 to-rose-500",
  "from-blue-500 to-indigo-500", 
  "from-green-500 to-emerald-500",
  "from-purple-500 to-violet-500",
  "from-orange-500 to-amber-500",
  "from-red-500 to-pink-500",
  "from-teal-500 to-cyan-500",
  "from-gray-500 to-slate-500",
]

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.slice(0, 6)) // Limit to 6 categories
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    const IconComponent = categoryIcons[name as keyof typeof categoryIcons] || Tag
    return IconComponent
  }

  const getColorForCategory = (index: number) => {
    return categoryColors[index % categoryColors.length]
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for in our organized categories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex-1 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600">Find exactly what you're looking for in our organized categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const IconComponent = getIconForCategory(category.name)
            const gradientColor = getColorForCategory(index)
            
            return (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group h-full"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className={`flex-1 relative bg-gradient-to-br ${gradientColor} flex items-center justify-center p-3 sm:p-4 md:p-6`}>
                      <div className="text-center text-white w-full h-full flex flex-col justify-center items-center">
                        <div className="mx-auto mb-2 sm:mb-3 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                        <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-1 sm:mb-2 leading-tight text-center px-1">
                          {category.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs opacity-90 line-clamp-2 leading-relaxed text-center px-2 max-w-full">
                          {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                        </p>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 bg-white/10 rounded-full opacity-50"></div>
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-3 h-3 sm:w-4 sm:h-4 bg-white/10 rounded-full opacity-30"></div>
                      <div className="absolute top-1/2 left-3 sm:left-4 w-2 h-2 sm:w-3 sm:h-3 bg-white/10 rounded-full opacity-40 transform -translate-y-1/2"></div>
                    </div>
                    
                    <div className="p-2 sm:p-3 bg-white flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-colors text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                      >
                        <span className="font-medium">Shop Now</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        {categories.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            <p>No categories available at the moment.</p>
          </div>
        )}
        
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
