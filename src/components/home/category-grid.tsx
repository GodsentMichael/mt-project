import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import connectDB from "@/lib/db"
import Category from "@/lib/models/Category"

type CategoryType = {
  _id: string | { toString(): string }
  name: string
  slug: string
  image?: string
  description?: string
  // add other fields as needed
}

async function getCategories(): Promise<CategoryType[]> {
  await connectDB()

  const categories = await Category.find({ parentId: null }).sort({ name: 1 }).limit(6).lean()
  return categories.map((cat: any) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    description: cat.description,
  }))
}

export async function CategoryGrid() {
  const categories = await getCategories()

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600">Find exactly what you're looking for in our organized categories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id.toString()}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={category.image || "/placeholder.svg?height=300&width=400"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm opacity-90 mb-4 line-clamp-2">{category.description}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
