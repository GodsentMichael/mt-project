import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Product from "@/lib/models/Product"
import Category from "@/lib/models/Category"
import Notification from "@/lib/models/Notification"

// GET /api/admin/products - Get all products for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ]
    }

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalCount = await Product.countDocuments(filter)

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      }
    })
  } catch (error) {
    console.error("Error fetching admin products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()
    console.log("Received product data:", data)
    
    // Generate slug from name
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify category exists
    const category = await Category.findById(data.categoryId)
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const product = new Product({
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      comparePrice: data.comparePrice || null,
      categoryId: data.categoryId,
      images: Array.isArray(data.images) ? data.images : [],
      featured: data.featured || false,
      stock: data.stock || 0,
      sku: data.sku,
      status: 'ACTIVE',
    })

    await product.save()

    // Create a notification for the new product
    const notification = new Notification({
      type: "product",
      message: `New product added: ${data.name}`,
      link: `/admin/products`,
    })

    await notification.save()

    // Populate category info for response
    await product.populate('categoryId', 'name slug')

    console.log("Product created successfully:", product)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
