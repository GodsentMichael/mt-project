import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Category from "@/lib/models/Category"

export async function GET() {
  try {
    console.log("Categories API called")
    console.log("Environment check:", {
      DATABASE_URL: !!process.env.DATABASE_URL,
      MONGODB_URI: !!process.env.MONGODB_URI
    })
    
    await connectDB()
    console.log("Database connected")
    
    // First try to get all categories
    const allCategories = await Category.find({})
      .select('name slug _id status')
      .lean()
    
    console.log("All categories found:", allCategories.length)
    console.log("All categories data:", allCategories)
    
    // If no categories exist, create default ones
    if (allCategories.length === 0) {
      console.log("No categories found, creating default categories...")
      const defaultCategories = [
        {
          name: "Women's Fashion",
          slug: "womens-fashion",
          description: "Latest trends in women's clothing",
          status: "ACTIVE"
        },
        {
          name: "Men's Fashion",
          slug: "mens-fashion", 
          description: "Stylish men's apparel and accessories",
          status: "ACTIVE"
        },
        {
          name: "Wedding & Corsets",
          slug: "wedding-corsets",
          description: "Comfortable and fashionable corsets",
          status: "ACTIVE"
        },
        {
          name: "Accessories",
          slug: "accessories",
          description: "Complete your look with perfect accessories",
          status: "ACTIVE"
        }
      ]
      
      await Category.insertMany(defaultCategories)
      console.log("Default categories created")
    }
    
    // Then filter for active ones
    const categories = await Category.find({ status: 'ACTIVE' })
      .select('name slug _id')
      .sort({ name: 1 })
      .lean()

    console.log("Active categories found:", categories.length)
    console.log("Active categories data:", categories)

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { name, description, image } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug })
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      status: "ACTIVE",
    })

    await category.save()

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
