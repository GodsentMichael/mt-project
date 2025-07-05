import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/Product"
import Category from "@/lib/models/Category"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = { status: 'ACTIVE' }

    // Category filter
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    // Build sort object
    const sort: any = {}
    if (sortBy === 'price') {
      sort.price = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'rating') {
      sort.averageRating = sortOrder === 'asc' ? 1 : -1
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalCount = await Product.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limit)

    // Get categories for filters
    const categories = await Category.find({ parentId: null })
      .select('name slug')
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      categories,
      filters: {
        category: category || 'all',
        search: search || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
